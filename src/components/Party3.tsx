import { useEffect } from 'react';

export function Party3() {
  useEffect(() => {
    (window as any).msAdsQueue = (window as any).msAdsQueue || [];
  }, []);

  return (
    <>
      {/* analytics */}
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-F901X282X7"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-D8DT6EWVFJ');
          `,
        }}
      />

      {/* adsense */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1289406790225052"
        crossOrigin="anonymous"
      />

      {/* pub center */}
      {/* <script
        async
        src="https://adsdk.microsoft.com/pubcenter/sdk.js?siteId=364477&publisherId=253617120"
        crossOrigin="anonymous"
      /> */}
    </>
  );
}
