export function AdHorizontal() {
  return (
    <>
      <div id="ms-ad-635230699" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.msAdsQueue.push(() => { 
              window.pubCenterSdk.render({ 
                adUnitId: "635230699", 
                elementId: "ms-ad-635230699" 
              }); 
            }); 
          `,
        }}
      />
    </>
  );
}
