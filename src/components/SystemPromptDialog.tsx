import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import { SystemPrompt } from '../types';

interface SystemPromptDialogProps {
  open: boolean;
  onClose: () => void;
  selectedPromptId: string;
  customPrompt: string;
  systemPrompts: SystemPrompt[];
  onPromptSelect: (id: string) => void;
  onCustomPromptChange: (prompt: string) => void;
  currentPrompt: string;
}

const SystemPromptDialog = ({
  open,
  onClose,
  selectedPromptId,
  customPrompt,
  systemPrompts,
  onPromptSelect,
  onCustomPromptChange,
  currentPrompt
}: SystemPromptDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>System Prompt</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            select
            fullWidth
            label="Select Prompt Template"
            value={selectedPromptId}
            onChange={(e) => onPromptSelect(e.target.value)}
            SelectProps={{
              native: true,
            }}
          >
            {systemPrompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.name}
              </option>
            ))}
            <option value="custom">Custom Prompt</option>
          </TextField>
          
          {selectedPromptId === 'custom' ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={customPrompt}
              onChange={(e) => onCustomPromptChange(e.target.value)}
              placeholder="Enter custom system prompt..."
            />
          ) : (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {systemPrompts.find(p => p.id === selectedPromptId)?.description}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={currentPrompt}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SystemPromptDialog;
