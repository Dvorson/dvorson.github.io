// /islands/Editor.tsx – Notion‑like block editor for Fresh + Tiptap
import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import * as React from "preact/compat";

import { EditorContent, useEditor, BubbleMenu, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

// ——— Block helpers ———
import DragHandle from "tiptap-extension-global-drag-handle";
import SlashCommand from "./extensions/SlashCommand.ts";       // ⇢ keeps your current slash logic
import ImageUploadNode from "./extensions/ImageUploadNode.tsx"; // ⇢ shown in §2

/**
 * Preact wrapper around Tiptap. Returns HTML back to the parent via onChange().
 */
export default function Editor({
  initial = "",
  onChange,
}: {
  initial?: string;
  onChange?: (html: string) => void;
}) {
  const editor = useEditor({
    content: initial,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Type / for commands" }),   // 🛈 UI hint
      SlashCommand,                                                    // /‑menu
      DragHandle.configure({                                           // 🛈 Notion‑style handle
        component: ({ selected }) => (
          <div
            class={`group -ml-6 flex h-full items-center select-none ${
              selected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
            } transition`}
          >
            <div
              data-drag-handle
              class="cursor-grab rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              ⋮⋮
            </div>
            <button
              data-add-block
              onClick={() => editor.commands.insertContent("<p></p>")}
              class="ml-1 hidden h-5 w-5 items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 group-hover:flex"
            >
              +
            </button>
          </div>
        ),
      }),
      ImageUploadNode, // ⇢ §2
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none dark:prose-invert",
      },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  return (
    <div class="relative">
      {/* Slash menu anchor */}
      {editor && (
        <FloatingMenu
          editor={editor}
          tippyOptions={{ placement: "bottom-start", duration: 150 }}
          shouldShow={({ state }) => {
            const { $from } = state.selection;
            return (
              $from.parent.content.size === 0 &&
              $from.parent.type.name !== "imageUpload"
            );
          }}
        >
          {/* Re‑use your CommandList component */}
          <CommandList editor={editor} />
        </FloatingMenu>
      )}

      {/* Standard Tiptap contenteditable */}
      <EditorContent editor={editor} />
    </div>
  );
}
