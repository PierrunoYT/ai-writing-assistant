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
  Tooltip,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Conversation } from '../types';
import { useSelector } from 'react-redux';

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
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e293b' : '#f8fafc',
      borderRight: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(137, 92, 246, 0.2)' : 'rgba(137, 92, 246, 0.1)'}`,
      position: 'relative'
    }}>
      <Box sx={{ p: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewConversation}
          sx={{ 
            mb: 1,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#8b5cf6' : '#7c3aed',
            '&:hover': {
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#f97316' : '#ea580c'
            }
          }}
        >
          New Conversation
        </Button>
      </Box>
      <List sx={{ 
        flexGrow: 1, 
        overflowY: 'auto',
        width: '100%',
        height: 'calc(100% - 60px)'
      }}>
        {conversations.map((conversation) => (
          <ListItem
            key={conversation.id}
            secondaryAction={
              conversations.length > 1 && (
                <Tooltip title="Delete conversation">
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    sx={{
                      color: (theme) => theme.palette.mode === 'dark' ? '#f97316' : '#ea580c',
                      '&:hover': {
                        color: (theme) => theme.palette.mode === 'dark' ? '#8b5cf6' : '#7c3aed'
                      }
                    }}
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
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(137, 92, 246, 0.1)', // Subtle purple selection
                  '&:hover': {
                    backgroundColor: 'rgba(249, 115, 22, 0.1)' // Subtle orange on hover
                  }
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
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ConversationList;