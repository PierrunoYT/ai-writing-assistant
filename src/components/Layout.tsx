import { Box, AppBar, Toolbar, Typography, IconButton, ButtonGroup, Button, Tooltip } from '@mui/material';
import { DRAWER_WIDTH, COLLAPSED_WIDTH } from '../constants';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import { useSelector, useDispatch } from 'react-redux';
import React, { useEffect } from 'react';
import { RootState } from '../store';
import { toggleTheme } from '../store/slices/themeSlice';
import { setMode } from '../store/slices/modeSlice';
import { toggleToolbar } from '../store/slices/settingsSlice';
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

  useEffect(() => {
    // Create a new document if none exists
    if (currentMode === 'document' && !currentDocumentId && documents.length === 0) {
      dispatch(createDocument({ title: 'Untitled Document' }));
    }
  }, [currentMode, currentDocumentId, documents.length]);

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
      transition: 'background-color 0.3s ease'
    }}>
      {showToolbar && (
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
                background: 'linear-gradient(45deg, #4f46e5, #ec4899)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 700,
                ml: { xs: 0, sm: isDrawerOpen ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px` },
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
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                padding: '4px',
                backdropFilter: 'blur(10px)',
                '& .MuiButton-root': {
                  bgcolor: 'transparent',
                  borderColor: 'transparent',
                  color: 'text.secondary',
                  px: 3,
                  py: 1,
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {currentMode === 'document' && (
                <Tooltip title={showToolbar ? "Hide Toolbar" : "Show Toolbar"}>
                  <IconButton onClick={() => dispatch(toggleToolbar())} color="inherit">
                    <ViewHeadlineIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={themeMode === 'dark' ? "Light Mode" : "Dark Mode"}>
                <IconButton onClick={() => dispatch(toggleTheme())} color="inherit">
                  {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
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
          <ChatInterface />
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
          py: 2,
          px: 3,
          bgcolor: 'rgba(255, 255, 255, 0.02)',
          borderTop: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.04)',
          }
        }}
      >
        <Typography 
          variant="body2" 
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            fontWeight: 500,
            letterSpacing: '0.5px',
            opacity: 0.8,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              opacity: 1
            }
          }}
        >
          © {new Date().getFullYear()} AI Writing Assistant
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
