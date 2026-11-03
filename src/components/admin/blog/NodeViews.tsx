"use client";

/* eslint-disable @next/next/no-img-element */
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PICK_IMAGES_EVENT, type GalleryImage, type PickImagesDetail } from "@/components/admin/blog/extensions";

const miniInput =
  "w-full rounded-[5px] border border-line bg-white px-2 py-1.5 text-xs text-ink-900 outline-none focus:border-brand-500";

export function FigureView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const { src, alt, caption } = node.attrs as { src: string; alt: string; caption: string };
  return (
    <NodeViewWrapper
      as="figure"
      data-figure=""
      className={cn("not-prose my-6 rounded-[5px] border p-2", selected ? "border-brand-500" : "border-line")}
    >
      <img src={src} alt={alt} className="w-full rounded-[3px]" draggable={false} data-drag-handle="" />
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]" contentEditable={false}>
        <input
          className={cn(miniInput, !alt.trim() && "border-red-300")}
          placeholder="Alt text (required)"
          value={alt}
          onChange={(e) => updateAttributes({ alt: e.target.value })}
        />
        <input
          className={miniInput}
          placeholder="Caption"
          value={caption}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
        />
        <button
          type="button"
          onClick={deleteNode}
          className="inline-flex items-center justify-center rounded-[5px] border border-line px-2 text-muted hover:text-red-600"
          aria-label="Remove image"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </NodeViewWrapper>
  );
}

export function GalleryView({ node, updateAttributes, deleteNode, selected, editor }: NodeViewProps) {
  const images = (node.attrs.images ?? []) as GalleryImage[];

  function set(next: GalleryImage[]) {
    updateAttributes({ images: next });
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  }

  function add() {
    const detail: PickImagesDetail = {
      multiple: true,
      resolve: (picked) => {
        if (picked.length) set([...images, ...picked]);
      },
    };
    editor.view.dom.dispatchEvent(new CustomEvent(PICK_IMAGES_EVENT, { detail }));
  }

  return (
    <NodeViewWrapper
      as="figure"
      data-gallery=""
      className={cn("not-prose my-6 rounded-[5px] border p-3", selected ? "border-brand-500" : "border-line")}
    >
      <div className="mb-2 flex items-center justify-between" contentEditable={false}>
        <span className="text-xs font-medium text-muted" data-drag-handle="">
          Gallery, {images.length} {images.length === 1 ? "image" : "images"}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 rounded-[5px] border border-line px-2 py-1 text-xs text-ink-900 hover:border-brand-300"
          >
            <ImagePlus className="h-3.5 w-3.5" /> Add
          </button>
          <button
            type="button"
            onClick={deleteNode}
            className="inline-flex items-center rounded-[5px] border border-line px-2 py-1 text-muted hover:text-red-600"
            aria-label="Remove gallery"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" contentEditable={false}>
        {images.map((img, i) => (
          <div key={`${img.src}-${i}`} className="rounded-[5px] border border-line p-1.5">
            <div className="relative">
              <img src={img.src} alt={img.alt} className="aspect-[4/3] w-full rounded-[3px] object-cover" draggable={false} />
              <div className="absolute right-1 top-1 flex gap-0.5">
                <IconBtn label="Move left" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowLeft className="h-3 w-3" />
                </IconBtn>
                <IconBtn label="Move right" onClick={() => move(i, 1)} disabled={i === images.length - 1}>
                  <ArrowRight className="h-3 w-3" />
                </IconBtn>
                <IconBtn label="Remove" onClick={() => set(images.filter((_, k) => k !== i))}>
                  <X className="h-3 w-3" />
                </IconBtn>
              </div>
            </div>
            <input
              className={cn(miniInput, "mt-1.5", !img.alt.trim() && "border-red-300")}
              placeholder="Alt text"
              value={img.alt}
              onChange={(e) => set(images.map((m, k) => (k === i ? { ...m, alt: e.target.value } : m)))}
            />
          </div>
        ))}
      </div>
    </NodeViewWrapper>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-white/90 text-ink-900 shadow-sm hover:text-brand-600 disabled:opacity-40"
    >
      {children}
    </button>
  );
}
