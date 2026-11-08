import { matchToken, VERIFY } from "@/lib/search-presence";

/** Loads Meta, Google Analytics, and Google Ads only when an ID is saved. */
export function TrackingTags({
  pixelId,
  adsId,
  gaId,
}: {
  pixelId?: string | null;
  adsId?: string | null;
  gaId?: string | null;
}) {
  const pixel = matchToken(pixelId, VERIFY.pixel);
  const ads = matchToken(adsId, VERIFY.ads);
  const ga = matchToken(gaId, VERIFY.ga).toUpperCase();
  if (!pixel && !ads && !ga) return null;
  const adsAccount = ads.split("/")[0];
  const gtagId = ga || adsAccount;
  const configs = [ga ? `window.gtag('config','${ga}');` : "", adsAccount ? `window.gtag('config','${adsAccount}');` : ""]
    .filter(Boolean)
    .join("");

  return (
    <>
      {pixel ? (
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`,
          }}
        />
      ) : null}
      {gtagId ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagId)}`} />
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};window.gtag('js',new Date());${configs}`,
            }}
          />
        </>
      ) : null}
    </>
  );
}
