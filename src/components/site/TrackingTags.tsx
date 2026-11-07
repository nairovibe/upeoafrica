import { matchToken, VERIFY } from "@/lib/search-presence";

/** Loads a Meta pixel and a Google tag only when an ID is saved. Tag Manager stays the preferred place for these. */
export function TrackingTags({ pixelId, adsId }: { pixelId?: string | null; adsId?: string | null }) {
  const pixel = matchToken(pixelId, VERIFY.pixel);
  const ads = matchToken(adsId, VERIFY.ads);
  if (!pixel && !ads) return null;
  const adsAccount = ads.split("/")[0];

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
      {ads ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(adsAccount)}`} />
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};window.gtag('js',new Date());window.gtag('config','${adsAccount}');`,
            }}
          />
        </>
      ) : null}
    </>
  );
}
