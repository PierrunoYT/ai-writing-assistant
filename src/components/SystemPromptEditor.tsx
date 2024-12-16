import { useCallback } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setGlobalSystemPromptContent } from '../store/slices/settingsSlice';
import MarkdownEditor from './MarkdownEditor';

interface SystemPromptEditorProps {
  open: boolean;
  onClose: () => void;
}

const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const globalSystemPrompt = useSelector((state: RootState) => state.settings.globalSystemPrompt);

  const handleSave = useCallback((content: string) => {
    dispatch(setGlobalSystemPromptContent(content));
  }, [dispatch]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle>Edit System Prompt</DialogTitle>
      <DialogContent sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pb: 1
      }}>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <MarkdownEditor 
            onChange={handleSave}
            initialValue={globalSystemPrompt || ''}
            useStoreContent={false}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SystemPromptEditor;