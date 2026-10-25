export function GtmSnippet({ id }: { id: string }) {
  const src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  return (
    <>
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});`,
        }}
      />
      <script async src={src} />
    </>
  );
}
