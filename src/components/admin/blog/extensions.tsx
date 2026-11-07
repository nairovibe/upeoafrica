"use client";

import { Node, mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";
import { EmbedView, FigureView, GalleryView } from "@/components/admin/blog/NodeViews";

export type GalleryImage = { src: string; alt: string; title?: string; caption?: string; id?: string };

function readGallery(el: HTMLElement): GalleryImage[] {
  const figures = Array.from(el.querySelectorAll(":scope > figure"));
  if (figures.length) {
    return figures.flatMap((fig) => {
      const img = fig.querySelector("img");
      const src = img?.getAttribute("src") ?? "";
      if (!src) return [];
      return [{
        id: fig.getAttribute("data-media-id") ?? "",
        src,
        alt: img?.getAttribute("alt") ?? "",
        title: img?.getAttribute("title") ?? "",
        caption: fig.querySelector("figcaption")?.textContent ?? "",
      }];
    });
  }
  return Array.from(el.querySelectorAll("img")).flatMap((img) => {
    const src = img.getAttribute("src") ?? "";
    if (!src) return [];
    return [{ src, alt: img.getAttribute("alt") ?? "", title: img.getAttribute("title") ?? "", caption: "", id: "" }];
  });
}

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
      title: { default: "" },
      caption: { default: "" },
      mediaId: { default: "" },
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
            title: img.getAttribute("title") ?? "",
            caption: el.querySelector("figcaption")?.textContent ?? "",
            mediaId: el.getAttribute("data-media-id") ?? "",
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { src, alt, title, caption, mediaId } = node.attrs as { src: string; alt: string; title: string; caption: string; mediaId: string };
    const imgAttrs: Record<string, string> = { src, alt, loading: "lazy" };
    if (title) imgAttrs.title = title;
    const figureAttrs: Record<string, string> = { "data-figure": "" };
    if (mediaId) figureAttrs["data-media-id"] = mediaId;
    const img = ["img", imgAttrs];
    return caption
      ? ["figure", figureAttrs, img, ["figcaption", {}, caption]]
      : ["figure", figureAttrs, img];
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
        parseHTML: (el) => readGallery(el),
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-gallery]" }, { tag: "figure[data-gallery]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const images = (node.attrs.images ?? []) as GalleryImage[];
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-gallery": "", "data-count": String(images.length) }),
      ...images.map((img) => {
        const imgAttrs: Record<string, string> = { src: img.src, alt: img.alt, loading: "lazy" };
        if (img.title) imgAttrs.title = img.title;
        const figureAttrs: Record<string, string> = {};
        if (img.id) figureAttrs["data-media-id"] = img.id;
        const figure = ["figure", figureAttrs, ["img", imgAttrs]];
        if (img.caption) figure.push(["figcaption", {}, img.caption]);
        return figure;
      }),
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

export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: "" },
      title: { default: "Embedded content" },
      layout: { default: "video" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-embed]",
        getAttrs: (el) => {
          const src = el.querySelector("iframe")?.getAttribute("src");
          if (!src) return false;
          const layout = el.getAttribute("data-layout");
          return {
            src,
            title: el.querySelector("iframe")?.getAttribute("title") ?? "Embedded content",
            layout: layout === "tall" || layout === "compact" || layout === "panel" ? layout : "video",
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { src, title, layout } = node.attrs as { src: string; title: string; layout: string };
    return [
      "div",
      { "data-embed": "", "data-layout": layout || "video" },
      [
        "iframe",
        {
          src,
          title: title || "Embedded content",
          loading: "lazy",
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
          allowfullscreen: "true",
        },
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedView);
  },
});
