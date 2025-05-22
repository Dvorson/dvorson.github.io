// islands/extensions/SlashCommand.ts
import { Extension, type Editor } from "@tiptap/core";
import suggestion, { SuggestionProps } from "@tiptap/suggestion";
import * as React from "preact/compat";
import { h } from "preact";
import tippy, { Instance, Props as TippyProps } from "tippy.js";

import CommandList from "../CommandList.tsx"; // Corrected path

/* ------------------------------------------------------------------ */
/* 1  Command palette items                                           */
/* ------------------------------------------------------------------ */

interface CommandItem {
  title: string;
  command: (opts: { editor: Editor; range: { from: number; to: number } }) => void;
}

export const COMMANDS: CommandItem[] = [
  {
    title: "Heading 1",
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run(),
  },
  {
    title: "Heading 2",
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run(),
  },
  {
    title: "Paragraph",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("paragraph").run(),
  },
  {
    title: "Numbered List",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Bullet List",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Blockquote",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Image",
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .insertContentAt(range, {
          type: "imageUpload",
          attrs: { src: null, progress: 0 },
        })
        .run(),
  },
];

/* ------------------------------------------------------------------ */
/* 2  Suggestion rendering helpers                                    */
/* ------------------------------------------------------------------ */

function SlashRenderer() {
  let popup: Instance<TippyProps> | null = null;

  return {
    onStart: (props: SuggestionProps) => {
      const Component = h(CommandList, {
        items: props.items,
        command: (item: CommandItem) => {
          item.command({ editor: props.editor, range: props.range });
          popup?.hide();
        },
      });

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect as any,
        appendTo: () => document.body,
        content: (() => {
          const container = document.createElement("div");
          (React as any).render(Component, container);
          return container;
        })(),
        showOnCreate: true,
        trigger: "manual",
        interactive: true,
        placement: "bottom-start",
        theme: "light-border",
        arrow: false,
        popperOptions: { strategy: "fixed" },
      })[0];
    },

    onUpdate: (props: SuggestionProps) => {
      if (popup && props.clientRect) {
        popup.setProps({
          getReferenceClientRect: props.clientRect as any,
        });
      }
    },

    onKeyDown: ({ event }: SuggestionProps) => {
      if (event.key === "Escape") {
        popup?.hide();
        return true;
      }
      return false;
    },

    onExit: () => {
      popup?.destroy();
      popup = null;
    },
  };
}

/* ------------------------------------------------------------------ */
/* 3  SlashCommand extension                                          */
/* ------------------------------------------------------------------ */

export default Extension.create({
  name: "slashCommand",
  addProseMirrorPlugins() {
    return [
      suggestion({
        char: "/",
        startOfLine: true,
        items: ({ query }) =>
          COMMANDS.filter((item) =>
            item.title.toLowerCase().startsWith(query.toLowerCase())
          ).slice(0, 10),
        render: SlashRenderer,
      }),
    ];
  },
});
