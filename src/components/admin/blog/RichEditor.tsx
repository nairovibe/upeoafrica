"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube, { isValidYoutubeUrl } from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import {
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
  Underline,
  Undo2,
  Video,
} from "lucide-react";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import {
  Figure,
  Gallery,
  PICK_IMAGES_EVENT,
  Vimeo,
  vimeoEmbedUrl,
  type GalleryImage,
  type PickImagesDetail,
} from "@/components/admin/blog/extensions";
import { LinkDialog, type LinkValue } from "@/components/admin/blog/LinkDialog";
import { MediaPicker, type PickedMedia } from "@/components/admin/blog/MediaPicker";
import { Modal } from "@/components/admin/blog/Modal";
import { cn } from "@/lib/utils";

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
  const [videoOpen, setVideoOpen] = useState(false);
  const onChangeRef = useRef(onChange);

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
      Figure,
      Gallery,
      Vimeo,
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "article-body article-editor min-h-[60vh] px-6 py-8 outline-none sm:px-10",
      },
    },
    onUpdate: ({ editor }) => onChangeRef.current(editor.getHTML()),
  });

  useEffect(() => {
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
    if (current.kind === "request") return current.resolve(items.map((i) => ({ src: i.url, alt: i.alt })));
    if (!items.length) return;
    if (current.kind === "image") {
      const [img] = items;
      editor.chain().focus().insertContent({ type: "figure", attrs: { src: img.url, alt: img.alt, caption: img.caption ?? "" } }).run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent({ type: "gallery", attrs: { images: items.map((i) => ({ src: i.url, alt: i.alt })) } })
        .run();
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
        onVideo={() => setVideoOpen(true)}
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
        details={picker?.kind === "image"}
        onClose={closePicker}
        onPick={onPicked}
      />

      {videoOpen ? (
        <VideoDialog
          onClose={() => setVideoOpen(false)}
          onInsert={(url) => {
            setVideoOpen(false);
            if (!editor) return;
            if (isValidYoutubeUrl(url)) {
              editor.chain().focus().setYoutubeVideo({ src: url }).run();
            } else {
              const src = vimeoEmbedUrl(url);
              if (src) editor.chain().focus().insertContent({ type: "vimeo", attrs: { src } }).run();
            }
          }}
        />
      ) : null}
    </div>
  );
}

function VideoDialog({ onClose, onInsert }: { onClose: () => void; onInsert: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const ok = Boolean(isValidYoutubeUrl(url.trim()) || vimeoEmbedUrl(url.trim()));
  return (
    <Modal
      open
      title="Embed video"
      onClose={onClose}
      footer={<AdminBtn disabled={!ok} onClick={() => onInsert(url.trim())}>Insert</AdminBtn>}
    >
      <Field label="YouTube or Vimeo URL">
        <input
          className={inputClass}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          autoFocus
        />
      </Field>
    </Modal>
  );
}

function Toolbar({
  editor,
  onLink,
  onImage,
  onGallery,
  onVideo,
}: {
  editor: Editor | null;
  onLink: () => void;
  onImage: () => void;
  onGallery: () => void;
  onVideo: () => void;
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
      <Btn label="Video" onClick={onVideo} icon={Video} />
      <Sep />
      <Btn label="Undo" disabled={!s.canUndo} onClick={() => c().undo().run()} icon={Undo2} />
      <Btn label="Redo" disabled={!s.canRedo} onClick={() => c().redo().run()} icon={Redo2} />
    </div>
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
