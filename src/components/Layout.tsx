import { Box, AppBar, Toolbar, Typography, IconButton, ButtonGroup, Button, Tooltip } from '@mui/material';
import { DRAWER_WIDTH, COLLAPSED_WIDTH } from '../constants';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import SettingsIcon from '@mui/icons-material/Settings';
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { RootState } from '../store';
import { toggleTheme } from '../store/slices/themeSlice';
import { setMode } from '../store/slices/modeSlice';
import { toggleToolbar } from '../store/slices/settingsSlice';
import SystemPromptEditor from './SystemPromptEditor';
import {
  updateDocumentContent, 
  addComment, 
  deleteComment,
  createDocument 
} from '../store/slices/documentSlice';
import ChatInterface from './ChatInterface';
import DocumentEditor from './DocumentEditor';
import MarkdownEditor from './MarkdownEditor';
import { Comment } from '../types';

const Layout = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const currentMode = useSelector((state: RootState) => state.mode.currentMode);
  const currentDocumentId = useSelector((state: RootState) => state.document.currentDocumentId);
  const documents = useSelector((state: RootState) => state.document.documents);
  const currentDocument = useSelector((state: RootState) =>
    state.document.documents.find(doc => doc.id === state.document.currentDocumentId)
  );
  const showToolbar = useSelector((state: RootState) => state.settings.showToolbar);
  const isDrawerOpen = useSelector((state: RootState) => state.settings.isDrawerOpen);
  const dispatch = useDispatch();

  const [isSystemPromptDialogOpen, setSystemPromptDialogOpen] = useState(false);
  // Memoize toolbar visibility to prevent unnecessary re-renders
  const toolbarVisible = React.useMemo(() => showToolbar && currentMode === 'document', [showToolbar, currentMode]);

  useEffect(() => {
    // Create a new document if none exists
    if (currentMode === 'document' && !currentDocumentId && documents.length === 0) {
      dispatch(createDocument({ title: 'Untitled Document' }));
    }
  }, [currentMode, currentDocumentId, documents.length, dispatch]);

  const handleAddComment = (comment: Omit<Comment, 'id' | 'timestamp'>) => {
    if (currentDocumentId) {
      dispatch(addComment({ documentId: currentDocumentId, comment }));
    }
  };

  const handleDeleteComment = (id: string) => {
    if (currentDocumentId) {
      dispatch(deleteComment({ documentId: currentDocumentId, commentId: id }));
    }
  };

  const handleDocumentReady = () => {
    // Handle document ready state
    console.log('Document is ready for processing');
  };

  const handleDocumentChange = (content: string) => {
    if (currentDocumentId) {
      dispatch(updateDocumentContent({ id: currentDocumentId, content }));
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      bgcolor: 'background.default',
      transition: 'background-color 0.3s ease',
      position: 'relative'
    }}>
      {showToolbar && (
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            backdropFilter: 'blur(20px)',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
            }
          }}
        >
          <Toolbar 
            sx={{ 
              px: { xs: 2, sm: 4 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                background: 'linear-gradient(45deg, #4f46e5, #ec4899, #4f46e5)',
                backgroundSize: '200% auto',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 800,
                letterSpacing: '0.5px',
                animation: 'gradient 8s linear infinite',
                '@keyframes gradient': {
                  '0%': {
                    backgroundPosition: '0% center',
                  },
                  '100%': {
                    backgroundPosition: '200% center',
                  },
                },
                ml: currentMode === 'chat' 
                  ? (isDrawerOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px`)
                  : 0,
                transition: 'margin-left 0.3s ease'
              }}
            >
              AI Writing Assistant
            </Typography>
            <ButtonGroup 
              variant="contained" 
              size="small" 
              sx={{ 
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '4px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                '& .MuiButton-root': {
                  bgcolor: 'transparent',
                  borderColor: 'transparent',
                  color: 'text.secondary',
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: 'primary.main',
                    transform: 'translateY(-1px)',
                  },
                  '&.active': {
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'translateY(-1px)',
                    },
                  },
                },
              }}
            >
              <Button
                startIcon={<ChatIcon />}
                className={currentMode === 'chat' ? 'active' : ''}
                onClick={() => dispatch(setMode('chat'))}
              >
                Chat
              </Button>
              <Button
                startIcon={<DescriptionIcon />}
                className={currentMode === 'document' ? 'active' : ''}
                onClick={() => dispatch(setMode('document'))}
              >
                Document
              </Button>
              <Button
                startIcon={<EditNoteIcon />}
                className={currentMode === 'markdown' ? 'active' : ''}
                onClick={() => dispatch(setMode('markdown'))}
              >
                Markdown
              </Button>
            </ButtonGroup>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {currentMode === 'document' && (
                <Tooltip title={showToolbar ? "Hide Toolbar" : "Show Toolbar"}>
                  <IconButton onClick={() => dispatch(toggleToolbar())} color="inherit">
                    <ViewHeadlineIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {currentMode === 'chat' && (
                  <Box
                    sx={{
                      backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      padding: '4px',
                      borderRadius: '50px',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    <Tooltip title="System Prompt Settings">
                      <IconButton
                        onClick={() => setSystemPromptDialogOpen(true)}
                        color="inherit"
                        sx={{
                          color: themeMode === 'dark' ? 'text.primary' : 'text.secondary',
                          backgroundColor: 'transparent',
                          '&:hover': {
                            color: 'primary.main',
                            backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                          }
                        }}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                <Box
                    sx={{
                      backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      padding: '4px',
                      borderRadius: '50px',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    <Tooltip title={themeMode === 'dark' ? "Light Mode" : "Dark Mode"}>
                      <IconButton
                        onClick={() => dispatch(toggleTheme())}
                        color="inherit"
                        sx={{
                          color: themeMode === 'dark' ? 'text.primary' : 'text.secondary',
                          backgroundColor: 'transparent',
                          '&:hover': {
                            color: 'primary.main',
                            backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                          }
                        }}
                      >
                        {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
            </Box>
          </Toolbar>
        </AppBar>
      )}
      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          overflow: 'hidden',
          height: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.05), transparent 40%)',
            pointerEvents: 'none',
          }
        }}
      >
        {currentMode === 'chat' ? (
          <ChatInterface setSystemPromptDialogOpen={setSystemPromptDialogOpen} />
        ) : currentMode === 'document' ? (
          <DocumentEditor 
            content={currentDocument?.content ?? ''}
            comments={currentDocument?.comments ?? []}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            onReady={handleDocumentReady}
            onChange={handleDocumentChange}
          />
        ) : (
          <MarkdownEditor 
            onChange={handleDocumentChange}
          />
        )}
      </Box>

      <Box 
        component="footer" 
        sx={{ 
          py: 3,
          px: 3,
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.04) 100%)',
          borderTop: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.06) 100%)',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Typography 
            variant="body2" 
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              fontWeight: 500,
              letterSpacing: '0.5px',
              opacity: 0.8,
              transition: 'all 0.3s ease',
              '&:hover': {
                opacity: 1,
                background: 'linear-gradient(45deg, #4f46e5, #ec4899)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }
            }}
          >
            © {new Date().getFullYear()} AI Writing Assistant. All rights reserved.
          </Typography>
        </Box>
      </Box>

      <SystemPromptEditor
        open={isSystemPromptDialogOpen}
        onClose={() => setSystemPromptDialogOpen(false)}
      />
    </Box>
  );
};

export default Layout;
