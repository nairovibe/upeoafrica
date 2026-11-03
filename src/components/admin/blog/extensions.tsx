"use client";

import { Node, mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";
import { FigureView, GalleryView } from "@/components/admin/blog/NodeViews";

export type GalleryImage = { src: string; alt: string };

/** Fired on the editor DOM by the gallery node view; RichEditor answers with the media picker. */
export const PICK_IMAGES_EVENT = "blog:pick-images";

export type PickImagesDetail = { multiple: boolean; resolve: (images: GalleryImage[]) => void };

export const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-figure]",
        getAttrs: (el) => {
          const img = el.querySelector("img");
          if (!img) return false;
          return {
            src: img.getAttribute("src") ?? "",
            alt: img.getAttribute("alt") ?? "",
            caption: el.querySelector("figcaption")?.textContent ?? "",
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { src, alt, caption } = node.attrs as { src: string; alt: string; caption: string };
    const img = ["img", { src, alt, loading: "lazy" }] as const;
    return caption
      ? ["figure", { "data-figure": "" }, img, ["figcaption", {}, caption]]
      : ["figure", { "data-figure": "" }, img];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureView);
  },
});

export const Gallery = Node.create({
  name: "gallery",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      images: {
        default: [] as GalleryImage[],
        parseHTML: (el) =>
          Array.from(el.querySelectorAll("img")).map((img) => ({
            src: img.getAttribute("src") ?? "",
            alt: img.getAttribute("alt") ?? "",
          })),
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "figure[data-gallery]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const images = (node.attrs.images ?? []) as GalleryImage[];
    return [
      "figure",
      mergeAttributes(HTMLAttributes, { "data-gallery": "", "data-count": String(images.length) }),
      ...images.map((img) => ["img", { src: img.src, alt: img.alt, loading: "lazy" }]),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryView);
  },
});

export function vimeoEmbedUrl(url: string) {
  const m = /vimeo\.com\/(?:video\/|channels\/[\w-]+\/|groups\/[\w-]+\/videos\/)?(\d+)(?:\/([a-f0-9]+))?/i.exec(url);
  if (!m) return null;
  return `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}` : ""}`;
}

export const Vimeo = Node.create({
  name: "vimeo",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return { src: { default: "" } };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-vimeo-video]",
        getAttrs: (el) => {
          const src = el.querySelector("iframe")?.getAttribute("src");
          return src ? { src } : false;
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "div",
      { "data-vimeo-video": "" },
      [
        "iframe",
        {
          src: node.attrs.src,
          width: "640",
          height: "360",
          frameborder: "0",
          allow: "autoplay; fullscreen; picture-in-picture",
          allowfullscreen: "true",
          loading: "lazy",
          title: "Vimeo video",
        },
      ],
    ];
  },
});
