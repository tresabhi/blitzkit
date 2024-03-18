export function Analytics() {
  return (
    <>
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
    </>
  );
}
