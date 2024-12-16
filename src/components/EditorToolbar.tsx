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
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
const HEADING_LEVELS: Level[] = [1, 2, 3, 4, 5, 6];

interface EditorToolbarProps {
  editor: Editor | null;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
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
      flexWrap: 'wrap',
      minHeight: '40px',
      backdropFilter: 'blur(8px)',
      '& .MuiToggleButton-root, & .MuiIconButton-root': {
        borderRadius: '4px',
        transition: 'all 0.2s ease-in-out',
        height: '28px',
        width: '28px',
        padding: '4px',
        '& .MuiSvgIcon-root': {
          fontSize: '18px',
        },
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        '&.Mui-selected': {
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark'
          }
        }
      },
      '& .MuiDivider-root': {
        margin: '0 4px',
        height: '20px'
      },
      '& .MuiSelect-select': {
        height: '28px',
        minWidth: '80px',
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px'
      }
    }}>
      <ToggleButtonGroup size="small">
        <Tooltip title={isEditorDisabled ? "Enable Editor" : "Disable Editor"}>
          <IconButton
            size="small"
            onClick={() => dispatch(toggleEditorDisabled())}
            color={isEditorDisabled ? "primary" : "default"}
            sx={{ 
              height: '28px', 
              width: '28px',
              '&.Mui-disabled': {
                opacity: 0.5
              }
            }}
          >
            {isEditorDisabled ? <LockIcon /> : <LockOpenIcon />}
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Tooltip title="Undo">
          <IconButton 
            size="small"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            sx={{ height: 28, width: 28 }}
          >
            <UndoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Redo">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            sx={{ height: 28, width: 28 }}
          >
            <RedoIcon />
          </IconButton>
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
        sx={{ minWidth: 80, height: 28 }}
        disabled={isEditorDisabled}
      >
        <MenuItem value="p">Paragraph</MenuItem>
        {HEADING_LEVELS.map(level => (
          <MenuItem key={level} value={`h${level}`}>
            H{level}
          </MenuItem>
        ))}
      </Select>

      <Select
        size="small"
        value={editor.getAttributes('textStyle').fontSize || '16px'}
        onChange={handleFontSizeChange}
        sx={{ minWidth: 70, height: 28 }}
        disabled={isEditorDisabled}
      >
        {FONT_SIZES.map(size => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))}
      </Select>

      <Divider orientation="vertical" flexItem />

      <Box sx={{ display: 'flex', alignItems: 'center', height: 28 }}>
        <Tooltip title="Text Color">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 0.5,
            height: 28
          }}>
            <FormatColorTextIcon sx={{ mr: 0.5, fontSize: '18px' }} />
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
            sx={{ height: 28, width: 28 }}
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
            sx={{ height: 28, width: 28 }}
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
            sx={{ height: 28, width: 28 }}
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
            sx={{ height: 28, width: 28 }}
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
            sx={{ height: 28, width: 28 }}
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
            sx={{ height: 28, width: 28 }}
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
            sx={{ height: 28, width: 28 }}
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
            sx={{ height: 28, width: 28 }}
          >
            <FormatListNumberedIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
};

export default EditorToolbar;
