import React, { useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  IconButton, 
  Box,
  Button,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Conversation } from '../types';
import { useSelector } from 'react-redux';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
}) => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [conversationToRename, setConversationToRename] = useState<{ id: string; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const handleRenameClick = (e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation();
    setConversationToRename({ id: conversation.id, title: conversation.title });
    setNewTitle(conversation.title);
    setRenameDialogOpen(true);
  };

  const handleRenameClose = () => {
    setRenameDialogOpen(false);
    setConversationToRename(null);
    setNewTitle('');
  };

  const handleRenameSubmit = () => {
    if (conversationToRename && newTitle.trim()) {
      onRenameConversation(conversationToRename.id, newTitle.trim());
      handleRenameClose();
    }
  };
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1a1b26' : '#ffffff',
      borderRight: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(137, 92, 246, 0.15)' : 'rgba(0, 0, 0, 0.06)'}`,
      position: 'relative',
      boxShadow: (theme) => theme.palette.mode === 'dark' 
        ? '0 0 15px rgba(0, 0, 0, 0.3)' 
        : '0 0 15px rgba(0, 0, 0, 0.05)',
    }}>
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewConversation}
          sx={{ 
            mb: 1,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#8b5cf6' : '#7c3aed',
            borderRadius: '12px',
            padding: '10px 16px',
            textTransform: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            boxShadow: (theme) => theme.palette.mode === 'dark' 
              ? '0 4px 12px rgba(139, 92, 246, 0.25)' 
              : '0 4px 12px rgba(124, 58, 237, 0.15)',
            '&:hover': {
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#9333ea' : '#6d28d9',
              transform: 'translateY(-1px)',
              boxShadow: (theme) => theme.palette.mode === 'dark' 
                ? '0 6px 16px rgba(139, 92, 246, 0.3)' 
                : '0 6px 16px rgba(124, 58, 237, 0.2)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          New Conversation
        </Button>
      </Box>
      <List sx={{ 
        flexGrow: 1, 
        overflowY: 'auto',
        width: '100%',
        height: 'calc(100% - 60px)',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(139, 92, 246, 0.3)' 
            : 'rgba(124, 58, 237, 0.2)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(139, 92, 246, 0.5)' 
            : 'rgba(124, 58, 237, 0.3)',
        },
      }}>
        {conversations.map((conversation) => (
          <ListItem
            key={conversation.id}
            disablePadding
          >
            <ListItemButton
              selected={conversation.id === activeConversationId}
              onClick={() => onConversationSelect(conversation.id)}
              onDoubleClick={(e) => handleRenameClick(e, conversation)}
              sx={{
                pr: 16,
                mx: 1,
                my: 0.5,
                borderRadius: '10px',
                '&.Mui-selected': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(139, 92, 246, 0.15)'
                    : 'rgba(124, 58, 237, 0.1)',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' 
                      ? 'rgba(139, 92, 246, 0.2)'
                      : 'rgba(124, 58, 237, 0.15)'
                  }
                },
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(139, 92, 246, 0.1)'
                    : 'rgba(124, 58, 237, 0.05)',
                },
                position: 'relative',
                '&::after': {
                  content: '"Double-click to rename"',
                  position: 'absolute',
                  right: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  pointerEvents: 'none',
                },
                '&:hover::after': {
                  opacity: conversation.id === activeConversationId ? 1 : 0,
                }
              }}
            >
              <ListItemText
                primary={
                  <Typography 
                    noWrap 
                    sx={{ 
                      color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b',
                      '&:hover': { 
                        color: (theme) => theme.palette.mode === 'dark' ? '#f97316' : '#ea580c'
                      } 
                    }}
                  >
                    {conversation.title}
                  </Typography>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)',
                      '&:hover': { 
                        color: (theme) => theme.palette.mode === 'dark' ? '#8b5cf6' : '#7c3aed'
                      } 
                    }}
                  >
                    {new Date(conversation.updatedAt).toLocaleString()}
                  </Typography>
                }
              />
            </ListItemButton>
            <Box sx={{ 
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              gap: 1,
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              '.MuiListItem-root:hover &': {
                opacity: 1
              }
            }}>
              <Tooltip title="Edit conversation">
                <IconButton
                  size="small"
                  onClick={(e) => handleRenameClick(e, conversation)}
                  sx={{
                    color: (theme) => theme.palette.mode === 'dark' ? '#8b5cf6' : '#7c3aed',
                    '&:hover': {
                      color: (theme) => theme.palette.mode === 'dark' ? '#f97316' : '#ea580c'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete conversation">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  sx={{
                    color: (theme) => theme.palette.mode === 'dark' ? '#f97316' : '#ea580c',
                    '&:hover': {
                      color: (theme) => theme.palette.mode === 'dark' ? '#8b5cf6' : '#7c3aed'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItem>
        ))}
      </List>
      <Dialog open={renameDialogOpen} onClose={handleRenameClose}>
        <DialogTitle>Rename Conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Title"
            type="text"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleRenameSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameClose}>Cancel</Button>
          <Button 
            onClick={handleRenameSubmit}
            disabled={!newTitle.trim()}
            sx={{
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#8b5cf6' : '#7c3aed',
              color: 'white',
              '&:hover': {
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#f97316' : '#ea580c'
              }
            }}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConversationList;
