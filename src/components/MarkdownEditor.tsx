import { useState, useCallback, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface MarkdownEditorProps {
  onChange?: (value: string) => void;
  initialValue?: string;
  useStoreContent?: boolean;
}

const MarkdownEditor = ({ onChange, initialValue = '', useStoreContent = false }: MarkdownEditorProps) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const storeContent = useSelector((state: RootState) => state.markdown.content);
  const [value, setValue] = useState(useStoreContent ? storeContent : initialValue);

  // Update local state when store content changes if useStoreContent is true
  useEffect(() => {
    if (useStoreContent) {
      setValue(storeContent);
    }
  }, [storeContent, useStoreContent]);

  // Update local state when initialValue changes if not using store content
  useEffect(() => {
    if (!useStoreContent) {
      setValue(initialValue);
    }
  }, [initialValue, useStoreContent]);

  const handleChange = useCallback((newValue: string | undefined) => {
    const updatedValue = newValue || '';
    setValue(updatedValue);
    onChange?.(updatedValue);
  }, [onChange]);

  return (
    <Box 
      sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        '& .w-md-editor': {
          flex: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        },
        '& .w-md-editor-text-pre > code, & .w-md-editor-text-input': {
          fontSize: '16px !important',
          lineHeight: '1.5 !important',
        },
        '& .w-md-editor-toolbar': {
          padding: '4px',
          minHeight: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        },
        '& .w-md-editor-toolbar-button': {
          fontSize: '18px !important',
          height: '32px',
          width: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0',
          borderRadius: '4px',
          transition: 'all 0.2s ease-in-out',
          backgroundColor: 'transparent',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            backgroundColor: 'action.hover',
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: 'none',
          },
          '& svg': {
            width: '16px !important',
            height: '16px !important',
            transition: 'transform 0.2s ease',
            color: 'text.primary',
          },
          '&:hover svg': {
            transform: 'scale(1.1)',
            color: 'primary.main',
          }
        },
        '& .w-md-editor-toolbar-icon': {
          fontSize: '14px !important',
          color: 'text.primary'
        },
        '& .w-md-editor-toolbar-divider': {
          height: '16px',
          margin: '0 4px',
          borderRight: '1px solid',
          borderColor: 'divider',
          opacity: 0.5
        },
        '& .w-md-editor-toolbar-group': {
          display: 'flex',
          gap: '2px',
          padding: '2px',
          borderRadius: '4px',
          backgroundColor: 'action.hover',
          '&:not(:last-child)': {
            marginRight: '4px'
          }
        }
      }}
      data-color-mode={themeMode}
    >
      <MDEditor
        value={value}
        onChange={handleChange}
        height="100%"
        preview="live"
        hideToolbar={false}
        enableScroll={true}
      />
    </Box>
  );
};

export default MarkdownEditor;
