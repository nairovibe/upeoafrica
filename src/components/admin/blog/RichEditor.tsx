"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import {
  AppWindow,
  Bold,
  Code,
  Heading2,
  Heading3,
  Heading4,
  ImageIcon,
  Images,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  SquareCode,
  Strikethrough,
  Table as TableIcon,
  Underline,
  Undo2,
} from "lucide-react";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { parseEmbed, type EmbedSpec } from "@/lib/embeds";
import {
  Embed,
  Figure,
  Gallery,
  PICK_IMAGES_EVENT,
  Vimeo,
  type GalleryImage,
  type PickImagesDetail,
} from "@/components/admin/blog/extensions";
import { LinkDialog, type LinkValue } from "@/components/admin/blog/LinkDialog";
import { MediaPicker, type PickedMedia } from "@/components/admin/blog/MediaPicker";
import { Modal } from "@/components/admin/blog/Modal";
import { cn } from "@/lib/utils";

const colwidth = {
  default: null as number[] | null,
  parseHTML: (element: HTMLElement) => {
    const raw = element.getAttribute("colwidth");
    if (!raw) return null;
    const nums = raw.split(",").map((n) => Number.parseInt(n, 10)).filter((n) => Number.isFinite(n) && n > 0);
    return nums.length ? nums : null;
  },
  renderHTML: (attributes: { colwidth?: number[] | null }) => (attributes.colwidth?.length ? { colwidth: attributes.colwidth.join(",") } : {}),
};

const SizedCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), colwidth };
  },
});

const SizedHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), colwidth };
  },
});

type PickerState =
  | { kind: "image" }
  | { kind: "gallery" }
  | { kind: "request"; multiple: boolean; resolve: (items: GalleryImage[]) => void }
  | null;

export function RichEditor({
  initialHtml,
  onChange,
  onEditor,
  footer,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
  onEditor?: (editor: Editor) => void;
  footer?: React.ReactNode;
}) {
  const [picker, setPicker] = useState<PickerState>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const onChangeRef = useRef(onChange);
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { target: null, rel: null },
        },
      }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Youtube.configure({ nocookie: true, width: 640, height: 360, modestBranding: true }),
      Placeholder.configure({ placeholder: "Start writing…" }),
      Table.configure({ resizable: true, cellMinWidth: 80 }),
      TableRow,
      SizedHeader,
      SizedCell,
      Figure,
      Gallery,
      Vimeo,
      Embed,
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "article-body article-editor min-h-[60vh] px-6 py-8 outline-none sm:px-10",
      },
      handlePaste: (_view, event) => {
        const text = event.clipboardData?.getData("text/plain") ?? "";
        const html = event.clipboardData?.getData("text/html") ?? "";
        const embed = parseEmbed(text) || parseEmbed(html);
        const ed = editorRef.current;
        if (!embed || !ed) return false;
        ed.chain().focus().insertContent({ type: "embed", attrs: embed }).run();
        return true;
      },
    },
    onUpdate: ({ editor }) => onChangeRef.current(editor.getHTML()),
  });

  useEffect(() => {
    editorRef.current = editor;
    if (editor && onEditor) onEditor(editor);
  }, [editor, onEditor]);

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const onPick = (e: Event) => {
      const { multiple, resolve } = (e as CustomEvent<PickImagesDetail>).detail;
      setPicker({ kind: "request", multiple, resolve });
    };
    dom.addEventListener(PICK_IMAGES_EVENT, onPick);
    return () => dom.removeEventListener(PICK_IMAGES_EVENT, onPick);
  }, [editor]);

  function onPicked(items: PickedMedia[]) {
    const current = picker;
    setPicker(null);
    if (!editor || !current) return;
    const images: GalleryImage[] = items.map((i) => ({ src: i.url, alt: i.alt, title: i.title, caption: i.caption, id: i.id }));
    if (current.kind === "request") return current.resolve(images);
    if (!images.length) return;
    if (current.kind === "image") {
      const [img] = images;
      editor.chain().focus().insertContent({ type: "figure", attrs: { src: img.src, alt: img.alt, title: img.title ?? "", caption: img.caption ?? "", mediaId: img.id ?? "" } }).run();
    } else {
      editor.chain().focus().insertContent({ type: "gallery", attrs: { images } }).run();
    }
  }

  function closePicker() {
    if (picker?.kind === "request") picker.resolve([]);
    setPicker(null);
  }

  function applyLink(value: LinkValue) {
    setLinkOpen(false);
    if (!editor) return;
    const rel = value.newTab || value.nofollow
      ? [value.newTab ? "noopener noreferrer" : "", value.nofollow ? "nofollow" : ""].filter(Boolean).join(" ")
      : null;
    const chain = editor.chain().focus().extendMarkRange("link");
    const attrs = { href: value.href, target: value.newTab ? "_blank" : null, rel };
    if (editor.state.selection.empty && !editor.isActive("link")) {
      chain.insertContent({ type: "text", text: value.href, marks: [{ type: "link", attrs }] }).run();
    } else {
      chain.setLink(attrs).run();
    }
  }

  const currentLink: LinkValue | null = (() => {
    if (!editor || !linkOpen) return null;
    const a = editor.getAttributes("link") as { href?: string; target?: string | null; rel?: string | null };
    if (!a.href) return null;
    return { href: a.href, newTab: a.target === "_blank", nofollow: Boolean(a.rel?.includes("nofollow")) };
  })();

  return (
    <div className="rounded-[5px] border border-line bg-white">
      <Toolbar
        editor={editor}
        onLink={() => setLinkOpen(true)}
        onImage={() => setPicker({ kind: "image" })}
        onGallery={() => setPicker({ kind: "gallery" })}
        onEmbed={() => setEmbedOpen(true)}
      />
      <EditorContent editor={editor} />
      {footer ? <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-2 text-xs text-muted">{footer}</div> : null}

      {linkOpen ? (
        <LinkDialog
          open
          initial={currentLink}
          onClose={() => setLinkOpen(false)}
          onApply={applyLink}
          onRemove={() => {
            setLinkOpen(false);
            editor?.chain().focus().extendMarkRange("link").unsetLink().run();
          }}
        />
      ) : null}

      <MediaPicker
        open={picker !== null}
        title={picker?.kind === "image" ? "Insert image" : "Add gallery images"}
        multiple={picker?.kind === "gallery" || (picker?.kind === "request" && picker.multiple)}
        details
        onClose={closePicker}
        onPick={onPicked}
      />

      {embedOpen ? (
        <EmbedDialog
          onClose={() => setEmbedOpen(false)}
          onInsert={(embed) => {
            setEmbedOpen(false);
            editor?.chain().focus().insertContent({ type: "embed", attrs: embed }).run();
          }}
        />
      ) : null}
    </div>
  );
}

function EmbedDialog({ onClose, onInsert }: { onClose: () => void; onInsert: (embed: EmbedSpec) => void }) {
  const [code, setCode] = useState("");
  const embed = parseEmbed(code);
  return (
    <Modal
      open
      title="Embed"
      onClose={onClose}
      wide
      footer={<AdminBtn disabled={!embed} onClick={() => embed && onInsert(embed)}>Insert</AdminBtn>}
    >
      <Field label="URL or embed code">
        <textarea
          className={inputClass}
          rows={5}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste a YouTube, Vimeo, Maps, Spotify, or Loom link, or the embed code"
          autoFocus
        />
      </Field>
      <div className="mt-4">
        {embed ? (
          <div className="article-body overflow-hidden rounded-[5px] border border-line">
            <div data-embed="" data-layout={embed.layout}>
              <iframe src={embed.src} title={embed.title} className="w-full border-0 bg-ink-900" loading="lazy" allowFullScreen />
            </div>
          </div>
        ) : (
          <p className="rounded-[5px] border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            {code.trim() ? "That paste does not have a preview yet. Use the provider’s embed code or a video link." : "The preview appears here as soon as the paste is recognised."}
          </p>
        )}
      </div>
    </Modal>
  );
}

function Toolbar({
  editor,
  onLink,
  onImage,
  onGallery,
  onEmbed,
}: {
  editor: Editor | null;
  onLink: () => void;
  onImage: () => void;
  onGallery: () => void;
  onEmbed: () => void;
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            p: e.isActive("paragraph"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            h4: e.isActive("heading", { level: 4 }),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            code: e.isActive("code"),
            ul: e.isActive("bulletList"),
            ol: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            codeBlock: e.isActive("codeBlock"),
            link: e.isActive("link"),
            table: e.isActive("table"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  if (!editor || !s) return <div className="h-11 border-b border-line" />;
  const c = () => editor.chain().focus();

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-0.5 rounded-t-[5px] border-b border-line bg-white/95 px-2 py-1.5 backdrop-blur">
      <Btn label="Paragraph" active={s.p} onClick={() => c().setParagraph().run()} icon={Pilcrow} />
      <Btn label="Heading 2" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()} icon={Heading2} />
      <Btn label="Heading 3" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()} icon={Heading3} />
      <Btn label="Heading 4" active={s.h4} onClick={() => c().toggleHeading({ level: 4 }).run()} icon={Heading4} />
      <Sep />
      <Btn label="Bold" active={s.bold} onClick={() => c().toggleBold().run()} icon={Bold} />
      <Btn label="Italic" active={s.italic} onClick={() => c().toggleItalic().run()} icon={Italic} />
      <Btn label="Underline" active={s.underline} onClick={() => c().toggleUnderline().run()} icon={Underline} />
      <Btn label="Strikethrough" active={s.strike} onClick={() => c().toggleStrike().run()} icon={Strikethrough} />
      <Btn label="Inline code" active={s.code} onClick={() => c().toggleCode().run()} icon={Code} />
      <Sep />
      <Btn label="Bullet list" active={s.ul} onClick={() => c().toggleBulletList().run()} icon={List} />
      <Btn label="Numbered list" active={s.ol} onClick={() => c().toggleOrderedList().run()} icon={ListOrdered} />
      <Btn label="Quote" active={s.quote} onClick={() => c().toggleBlockquote().run()} icon={Quote} />
      <Btn label="Divider" onClick={() => c().setHorizontalRule().run()} icon={Minus} />
      <Btn label="Code block" active={s.codeBlock} onClick={() => c().toggleCodeBlock().run()} icon={SquareCode} />
      <Sep />
      <Btn label="Link" active={s.link} onClick={onLink} icon={Link2} />
      <Btn label="Image" onClick={onImage} icon={ImageIcon} />
      <Btn label="Gallery" onClick={onGallery} icon={Images} />
      <Btn label="Embed" onClick={onEmbed} icon={AppWindow} />
      <TableButton editor={editor} />
      <Sep />
      <Btn label="Undo" disabled={!s.canUndo} onClick={() => c().undo().run()} icon={Undo2} />
      <Btn label="Redo" disabled={!s.canRedo} onClick={() => c().redo().run()} icon={Redo2} />
      {s.table ? <TableBar editor={editor} /> : null}
    </div>
  );
}

function TableButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [header, setHeader] = useState(true);
  const clamp = (n: number) => Math.min(10, Math.max(1, n || 1));

  return (
    <div className="relative">
      <Btn label="Table" active={open} onClick={() => setOpen((v) => !v)} icon={TableIcon} />
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1 w-60 rounded-[5px] border border-line bg-white p-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Rows">
              <input className={inputClass} type="number" min={1} max={10} value={rows} onChange={(e) => setRows(clamp(Number(e.target.value)))} />
            </Field>
            <Field label="Columns">
              <input className={inputClass} type="number" min={1} max={10} value={cols} onChange={(e) => setCols(clamp(Number(e.target.value)))} />
            </Field>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-ink-900">
            <input type="checkbox" className="accent-brand-500" checked={header} onChange={(e) => setHeader(e.target.checked)} />
            Header row
          </label>
          <AdminBtn
            className="mt-3 w-full"
            onClick={() => {
              editor.chain().focus().insertTable({ rows, cols, withHeaderRow: header }).run();
              setOpen(false);
            }}
          >
            Insert table
          </AdminBtn>
        </div>
      ) : null}
    </div>
  );
}

function TableBar({ editor }: { editor: Editor }) {
  const run = (command: "addRowBefore" | "addRowAfter" | "deleteRow" | "addColumnBefore" | "addColumnAfter" | "deleteColumn" | "deleteTable") => {
    editor.chain().focus()[command]().run();
  };
  return (
    <div className="flex w-full flex-wrap items-center gap-1 border-t border-line px-1 pt-1">
      <TextBtn label="Row above" onClick={() => run("addRowBefore")} />
      <TextBtn label="Row below" onClick={() => run("addRowAfter")} />
      <TextBtn label="Delete row" onClick={() => run("deleteRow")} />
      <span className="mx-1 h-4 w-px bg-line" aria-hidden />
      <TextBtn label="Column before" onClick={() => run("addColumnBefore")} />
      <TextBtn label="Column after" onClick={() => run("addColumnAfter")} />
      <TextBtn label="Delete column" onClick={() => run("deleteColumn")} />
      <span className="mx-1 h-4 w-px bg-line" aria-hidden />
      <TextBtn label="Delete table" danger onClick={() => run("deleteTable")} />
    </div>
  );
}

function TextBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn("rounded-[5px] px-2 py-1 text-xs font-medium", danger ? "text-red-600 hover:bg-red-50" : "text-ink-900 hover:bg-surface-3")}
    >
      {label}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-line" aria-hidden />;
}

function Btn({
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-[5px] transition-colors disabled:opacity-35",
        active ? "bg-brand-50 text-brand-600" : "text-body hover:bg-surface-3 hover:text-ink-900",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
