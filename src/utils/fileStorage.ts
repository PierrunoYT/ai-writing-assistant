// Constants
const getDBName = () => {
  // Get hostname without port
  const hostname = window.location.hostname;
  return `chatStorage_${hostname}`;
};

const getLocalStorageKey = (key: string) => {
  const hostname = window.location.hostname;
  return `${key}_${hostname}`;
};

const DB_VERSION = 2; // Incrementing version to handle all stores
const CONVERSATIONS_STORE = 'conversations';
const ACTIVE_CONVERSATION_STORE = 'activeConversation';
const DOCUMENTS_STORE = 'documents';
const VERSION_STORE = 'version';
const STORAGE_VERSION = '1.0';
const LS_CONVERSATIONS_KEY = 'chat_conversations';
const LS_ACTIVE_CONVERSATION_KEY = 'chat_active_conversation';
const LS_DOCUMENTS_KEY = 'documents';

// LocalStorage backup functions
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Failed to save to localStorage (${key}):`, error);
    return false;
  }
};

const loadFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Failed to load from localStorage (${key}):`, error);
    return null;
  }
};

// Initialize database
let dbInstance: IDBDatabase | null = null;

const initDB = async (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(getDBName(), DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;
      
      // Handle version upgrades
      if (oldVersion < 1) {
        // Initial creation of stores
        const conversationsStore = db.createObjectStore(CONVERSATIONS_STORE);
        conversationsStore.put([], 'conversations');
        
        db.createObjectStore(ACTIVE_CONVERSATION_STORE);
        
        const versionStore = db.createObjectStore(VERSION_STORE);
        versionStore.put(STORAGE_VERSION, 'version');
      }
      
      if (oldVersion < 2) {
        // Add documents store in version 2
        const documentsStore = db.createObjectStore(DOCUMENTS_STORE);
        documentsStore.put([], 'documents');
      }
    };
  });
};

// Generic function to perform a transaction
const performTransaction = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest
): Promise<T> => {
  try {
    const db = await initDB();
    
    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`Object store '${storeName}' does not exist`);
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = callback(store);

      transaction.onerror = () => reject(transaction.error);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error(`Error in performTransaction for store '${storeName}':`, error);
    // Fallback to localStorage
    if (storeName === DOCUMENTS_STORE) {
      const documents = loadFromLocalStorage(LS_DOCUMENTS_KEY);
      return documents || [];
    }
    throw error;
  }
};

export const saveConversationsToFile = async (conversations: any[]) => {
  try {
    // Save to IndexedDB
    await performTransaction(
      CONVERSATIONS_STORE,
      'readwrite',
      (store) => store.put(conversations, 'conversations')
    );
    await performTransaction(
      VERSION_STORE,
      'readwrite',
      (store) => store.put(STORAGE_VERSION, 'version')
    );

    // Save to localStorage as backup
    saveToLocalStorage(getLocalStorageKey(LS_CONVERSATIONS_KEY), conversations);

    console.debug('[Storage] Saved conversations:', conversations.length);
  } catch (error) {
    console.error('[Storage] Failed to save conversations:', error);
    throw error;
  }
};

export const saveActiveConversationToFile = async (conversationId: string | null) => {
  try {
    if (conversationId) {
      // Save to IndexedDB
      await performTransaction(
        ACTIVE_CONVERSATION_STORE,
        'readwrite',
        (store) => store.put(conversationId, 'activeId')
      );
      
      // Save to localStorage as backup
      saveToLocalStorage(getLocalStorageKey(LS_ACTIVE_CONVERSATION_KEY), { activeId: conversationId });
      
      console.debug('[Storage] Saved active conversation:', conversationId);
    } else {
      // Remove from IndexedDB
      await performTransaction(
        ACTIVE_CONVERSATION_STORE,
        'readwrite',
        (store) => store.delete('activeId')
      );
      
      // Remove from localStorage
      localStorage.removeItem(getLocalStorageKey(LS_ACTIVE_CONVERSATION_KEY));
      
      console.debug('[Storage] Removed active conversation');
    }
  } catch (error) {
    console.error('[Storage] Failed to save active conversation:', error);
    throw error;
  }
};

export const loadConversationsFromFile = async () => {
  try {
    // Try loading from IndexedDB first
    const version = await performTransaction<string>(
      VERSION_STORE,
      'readonly',
      (store) => store.get('version')
    );

    if (!version) {
      await performTransaction(
        VERSION_STORE,
        'readwrite',
        (store) => store.put(STORAGE_VERSION, 'version')
      );
    } else if (version !== STORAGE_VERSION) {
      console.debug('[Storage] Version mismatch, current:', version, 'expected:', STORAGE_VERSION);
      return [];
    }

    let conversations = await performTransaction<any[]>(
      CONVERSATIONS_STORE,
      'readonly',
      (store) => store.get('conversations')
    );

    // If no conversations in IndexedDB, try loading from localStorage
    if (!conversations) {
      conversations = loadFromLocalStorage(getLocalStorageKey(LS_CONVERSATIONS_KEY));
    }

    // If conversations were found in localStorage, save them to IndexedDB
    if (conversations && !await performTransaction<any[]>(
      CONVERSATIONS_STORE,
      'readonly',
      (store) => store.get('conversations')
    )) {
      await saveConversationsToFile(conversations);
    }

    console.debug('[Storage] Loaded conversations:', conversations?.length ?? 0);
    return conversations || [];
  } catch (error) {
    console.error('[Storage] Failed to load conversations:', error);
    return [];
  }
};

export const loadActiveConversationFromFile = async () => {
  try {
    // Try loading from IndexedDB first
    let activeId = await performTransaction<string>(
      ACTIVE_CONVERSATION_STORE,
      'readonly',
      (store) => store.get('activeId')
    );

    // If no active conversation in IndexedDB, try loading from localStorage
    if (!activeId) {
      const data = loadFromLocalStorage(getLocalStorageKey(LS_ACTIVE_CONVERSATION_KEY));
      if (data && data.activeId) {
        activeId = data.activeId;
        // Save back to IndexedDB if found in localStorage
        await saveActiveConversationToFile(activeId);
      }
    }

    console.debug('[Storage] Loaded active conversation:', activeId);
    return activeId || null;
  } catch (error) {
    console.error('[Storage] Failed to load active conversation:', error);
    return null;
  }
};

// Validate conversation structure
export const isValidConversation = (conversation: any): boolean => {
  return (
    typeof conversation === 'object' &&
    conversation !== null &&
    typeof conversation.id === 'string' &&
    typeof conversation.title === 'string' &&
    Array.isArray(conversation.messages) &&
    typeof conversation.createdAt === 'number' &&
    typeof conversation.updatedAt === 'number' &&
    conversation.messages.every((msg: any) =>
      typeof msg === 'object' &&
      msg !== null &&
      typeof msg.id === 'string' &&
      typeof msg.content === 'string' &&
      ['user', 'assistant', 'system'].includes(msg.role) &&
      typeof msg.timestamp === 'number'
    )
  );
};

export const saveDocumentsToFile = async (documents: any[]) => {
  try {
    // Save to IndexedDB
    await performTransaction(
      DOCUMENTS_STORE,
      'readwrite',
      (store) => store.put(documents, 'documents')
    );
    await performTransaction(
      VERSION_STORE,
      'readwrite',
      (store) => store.put(STORAGE_VERSION, 'version')
    );

    // Save to localStorage as backup
    saveToLocalStorage(getLocalStorageKey(LS_DOCUMENTS_KEY), documents);

    console.debug('[Storage] Saved documents:', documents.length);
  } catch (error) {
    console.error('[Storage] Failed to save documents:', error);
    throw error;
  }
};

export const loadDocumentsFromFile = async () => {
  try {
    // Try loading from IndexedDB first
    let documents = await performTransaction<any[]>(
      DOCUMENTS_STORE,
      'readonly',
      (store) => store.get('documents')
    );

    // If no documents in IndexedDB, try loading from localStorage
    if (!documents) {
      documents = loadFromLocalStorage(getLocalStorageKey(LS_DOCUMENTS_KEY));
    }

    // If documents were found in localStorage, save them to IndexedDB
    if (documents && !await performTransaction<any[]>(
      DOCUMENTS_STORE,
      'readonly',
      (store) => store.get('documents')
    )) {
      await saveDocumentsToFile(documents);
    }

    console.debug('[Storage] Loaded documents:', documents?.length ?? 0);
    return documents || [];
  } catch (error) {
    console.error('[Storage] Failed to load documents:', error);
    return [];
  }
};