import Script from "next/script";

import { isAnalyticsHost } from "@lib/utils/analytics";

export interface AnalyticsScriptsProps {
  clarityId?: string;
  gaId?: string;
  hasConsent: boolean;
  hostname?: string;
}

const getBrowserHostname = (): string =>
  typeof window === "undefined" ? "" : window.location.hostname;

const AnalyticsScripts: React.FC<AnalyticsScriptsProps> = ({
  clarityId,
  gaId,
  hasConsent,
  hostname = getBrowserHostname(),
}) => {
  if (!hasConsent || !isAnalyticsHost(hostname)) return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}</Script>
        </>
      )}
      {clarityId && (
        <Script id="clarity-init" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","${clarityId}");
        `}</Script>
      )}
    </>
  );
};

export default AnalyticsScripts;
