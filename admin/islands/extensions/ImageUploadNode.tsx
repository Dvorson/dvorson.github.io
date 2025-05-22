import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import * as React from "preact/compat";

export interface UploadOptions {
  upload: (file: File) => Promise<string>; // returns URL
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageUpload: {
      insertImage: (file: File) => ReturnType;
    };
  }
}

const ImageUploadNode = Node.create<UploadOptions>({
  name: "imageUpload",
  group: "block",
  draggable: true,
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      progress: { default: 0 },
    };
  },
  addCommands() {
    return {
      insertImage:
        (file) =>
        ({ chain }) => {
          // insert placeholder
          const id = crypto.randomUUID();
          chain()
            .insertContent({
              type: this.name,
              attrs: { src: null, progress: 0, id },
            })
            .run();

          // upload asynchronously
          this.options
            .upload(file)
            .then((url) => {
              this.editor.commands.command(({ tr }) => {
                const pos = findNodePosById(tr.doc, id);
                if (pos !== null) {
                  tr.setNodeMarkup(pos, undefined, { src: url, progress: 100 });
                }
                return true;
              });
            })
            .catch(() => {
              /* handle error */
            });

          return true;
        },
    };
  },
  parseHTML() {
    return [{ tag: "figure[data-type='imageUpload']" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(({ node, updateAttributes }) => {
      const fileInput = React.useRef<HTMLInputElement>(null);
      const onFile = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) this.editor.commands.insertImage(file);
      };
      if (node.attrs.src) {
        return <img src={node.attrs.src} class="max-w-full rounded-lg" />;
      }
      return (
        <div
          class="flex h-48 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500"
          onClick={() => fileInput.current?.click()}
        >
          Drop or click to upload
          <input
            type="file"
            accept="image/*"
            ref={fileInput}
            class="hidden"
            onChange={onFile}
          />
          {node.attrs.progress > 0 && (
            <div class="absolute bottom-2 left-2 right-2 h-1 rounded bg-gray-200">
              <div
                class="h-full rounded bg-indigo-500 transition-all"
                style={{ width: `${node.attrs.progress}%` }}
              />
            </div>
          )}
        </div>
      );
    });
  },
});

export default ImageUploadNode;

// Helper
function findNodePosById(doc: any, id: string): number | null {
  let pos: number | null = null;
  doc.descendants((node: any, position: number) => {
    if (node.attrs.id === id) pos = position;
  });
  return pos;
}
