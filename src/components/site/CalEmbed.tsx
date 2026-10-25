export function CalEmbed({ url }: { url: string }) {
  const src = url.includes("embed") ? url : `${url}${url.includes("?") ? "&" : "?"}embed=true`;
  return (
    <iframe
      title="Book a time with Upeo Africa Technologies"
      src={src}
      className="h-[640px] w-full border border-line"
    />
  );
}
