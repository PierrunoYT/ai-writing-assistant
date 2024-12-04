import { Editor } from '@tiptap/react';
import { Level } from '@tiptap/extension-heading';
import { 
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Divider,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  TextField
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { toggleEditorDisabled } from '../store/slices/documentSlice';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import TitleIcon from '@mui/icons-material/Title';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const HEADING_LEVELS: Level[] = [1, 2, 3, 4, 5, 6];

interface EditorToolbarProps {
  editor: Editor | null;
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  const dispatch = useDispatch();
  const isEditorDisabled = useSelector((state: RootState) => state.document.isEditorDisabled);

  if (!editor) {
    return null;
  }

  const handleFontSizeChange = (event: SelectChangeEvent) => {
    editor.chain().focus().setFontSize(event.target.value).run();
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 1, 
      p: 1, 
      borderBottom: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <ToggleButtonGroup size="small">
        <Tooltip title={isEditorDisabled ? "Enable Editor" : "Disable Editor"}>
          <span>
            <IconButton
              size="small"
              onClick={() => dispatch(toggleEditorDisabled())}
              color={isEditorDisabled ? "primary" : "default"}
            >
              {isEditorDisabled ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Tooltip title="Undo">
          <span>
            <IconButton 
              size="small"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo">
          <span>
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <Select
        size="small"
        value={editor.isActive('heading') ? `h${editor.getAttributes('heading').level}` : 'p'}
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'p') {
            editor.chain().focus().setParagraph().run();
          } else {
            const level = parseInt(value.substring(1)) as Level;
            editor.chain().focus().setHeading({ level }).run();
          }
        }}
        sx={{ minWidth: 80 }}
        disabled={isEditorDisabled}
      >
        <MenuItem value="p">Paragraph</MenuItem>
        {HEADING_LEVELS.map(level => (
          <MenuItem key={level} value={`h${level}`}>
            Heading {level}
          </MenuItem>
        ))}
      </Select>
      <Select
        size="small"
        value={editor.getAttributes('textStyle').fontSize || '16px'}
        onChange={handleFontSizeChange}
        sx={{ minWidth: 80 }}
        disabled={isEditorDisabled}
      >
        {FONT_SIZES.map(size => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))}
      </Select>

      <Divider orientation="vertical" flexItem />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Text Color">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormatColorTextIcon fontSize="small" sx={{ mr: 0.5 }} />
            <input
              type="color"
              value={editor.getAttributes('textStyle').color || '#000000'}
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              style={{
                width: '24px',
                height: '24px',
                padding: 0,
                border: 'none',
                cursor: isEditorDisabled ? 'not-allowed' : 'pointer',
                opacity: isEditorDisabled ? 0.5 : 1
              }}
              disabled={isEditorDisabled}
            />
          </Box>
        </Tooltip>
      </Box>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="small">
        <Tooltip title="Bold">
          <ToggleButton
            value="bold"
            selected={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={isEditorDisabled}
          >
            <FormatBoldIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Italic">
          <ToggleButton
            value="italic"
            selected={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={isEditorDisabled}
          >
            <FormatItalicIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Underline">
          <ToggleButton
            value="underline"
            selected={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={isEditorDisabled}
          >
            <FormatUnderlinedIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="small">
        <Tooltip title="Align Left">
          <ToggleButton
            value="left"
            selected={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            disabled={isEditorDisabled}
          >
            <FormatAlignLeftIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Align Center">
          <ToggleButton
            value="center"
            selected={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            disabled={isEditorDisabled}
          >
            <FormatAlignCenterIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Align Right">
          <ToggleButton
            value="right"
            selected={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            disabled={isEditorDisabled}
          >
            <FormatAlignRightIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ToggleButtonGroup size="small">
        <Tooltip title="Bullet List">
          <ToggleButton
            value="bulletList"
            selected={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={isEditorDisabled}
          >
            <FormatListBulletedIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Numbered List">
          <ToggleButton
            value="orderedList"
            selected={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={isEditorDisabled}
          >
            <FormatListNumberedIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
};

export default EditorToolbar;