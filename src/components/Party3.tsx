export function Party3() {
  return (
    <>
      {/* analytics */}
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-98NTMRHRP9"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-98NTMRHRP9');
          `,
        }}
      />

      {/* adsense */}
      {/* <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1289406790225052"
        crossOrigin="anonymous"
      /> */}

      {/* pub center */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.msAdsQueue = window.msAdsQueue || [];
          `,
        }}
      />
      <script
        async
        src="https://adsdk.microsoft.com/pubcenter/sdk.js?siteId=364477&publisherId=253617120"
        crossOrigin="anonymous"
      />
    </>
  );
}
