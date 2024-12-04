import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField, Button, Typography } from '@mui/material';
import { SystemPrompt } from '../types';

interface SystemPromptDialogProps {
  open: boolean;
  onClose: () => void;
  selectedPromptId: string;
  setSelectedPromptId: (id: string) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  systemPrompts: SystemPrompt[];
  currentPrompt: string;
}

const SystemPromptDialog: React.FC<SystemPromptDialogProps> = ({
  open,
  onClose,
  selectedPromptId,
  setSelectedPromptId,
  customPrompt,
  setCustomPrompt,
  systemPrompts,
  currentPrompt,
}) => {
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
            onChange={(e) => setSelectedPromptId(e.target.value)}
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
              onChange={(e) => setCustomPrompt(e.target.value)}
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
