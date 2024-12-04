import { useState, useCallback, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface MarkdownEditorProps {
  onChange?: (value: string) => void;
}

const MarkdownEditor = ({ onChange }: MarkdownEditorProps) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const content = useSelector((state: RootState) => state.markdown.content);
  const [value, setValue] = useState(content);

  // Update local state when store content changes
  useEffect(() => {
    setValue(content);
  }, [content]);

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