import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  IconButton, 
  Box,
  Button,
  Typography,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Conversation } from '../types';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
}) => {
  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <Box sx={{ p: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewConversation}
          sx={{ mb: 1 }}
        >
          New Conversation
        </Button>
      </Box>
      <List sx={{ maxHeight: '70vh', overflow: 'auto' }}>
        {conversations.map((conversation) => (
          <ListItem
            key={conversation.id}
            secondaryAction={
              conversations.length > 1 && (
                <Tooltip title="Delete conversation">
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )
            }
            disablePadding
          >
            <ListItemButton
              selected={conversation.id === activeConversationId}
              onClick={() => onConversationSelect(conversation.id)}
            >
              <ListItemText
                primary={
                  <Typography noWrap>
                    {conversation.title}
                  </Typography>
                }
                secondary={new Date(conversation.updatedAt).toLocaleString()}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ConversationList;
