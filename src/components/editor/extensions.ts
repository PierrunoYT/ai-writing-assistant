import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
    };
    textColor: {
      setColor: (color: string) => ReturnType;
    };
    commentMarker: {
      toggleComment: (commentId: string, color?: string) => ReturnType;
      removeComment: (commentId: string) => ReturnType;
    };
  }
}

interface CommentDecorationAttrs {
  commentId: string;
  color?: string;
}

export const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
    };
  },
});

export const TextColor = Extension.create({
  name: 'textColor',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          color: {
            default: null,
            parseHTML: element => element.style.color,
            renderHTML: attributes => {
              if (!attributes.color) {
                return {};
              }
              return {
                style: `color: ${attributes.color}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setColor: (color: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { color })
          .run();
      },
    };
  },
});

export const CommentMarker = Extension.create({
  name: 'commentMarker',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'comment-marker',
      },
    };
  },

  addProseMirrorPlugins() {
    const key = new PluginKey('comment-marker');
    const commentDecorations = new Map<string, DecorationSet>();

    return [
      new Plugin({
        key,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldState) {
            const meta = tr.getMeta(key);
            if (meta?.type === 'addComment') {
              const { from, to, commentId, color } = meta;
              const decoration = Decoration.inline(from, to, {
                class: 'comment-marker',
                style: `background-color: ${color || 'rgba(255, 212, 0, 0.4)'}`,
                'data-comment-id': commentId,
              });
              commentDecorations.set(commentId, DecorationSet.create(tr.doc, [decoration]));
            } else if (meta?.type === 'removeComment') {
              commentDecorations.delete(meta.commentId);
            }

            // Combine all decorations into a single array
            const allDecorations = Array.from(commentDecorations.values())
              .reduce((acc, decorationSet) => {
                return [...acc, ...decorationSet.find()];
              }, [] as any[]);
            
            return DecorationSet.create(tr.doc, allDecorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      toggleComment:
        (commentId: string, color?: string) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            const { from, to } = tr.selection;
            tr.setMeta(new PluginKey('comment-marker'), {
              type: 'addComment',
              from,
              to,
              commentId,
              color,
            });
            return true;
          }
          return false;
        },
      removeComment:
        (commentId: string) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(new PluginKey('comment-marker'), {
              type: 'removeComment',
              commentId,
            });
            return true;
          }
          return false;
        },
    };
  },
});