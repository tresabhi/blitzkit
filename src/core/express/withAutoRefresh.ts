export default function withAutoRefresh(svg: string, refreshAfter: number) {
  return `
    <html>
      <head>
        <script>
          setTimeout(() => {
            window.location.reload();
          }, ${refreshAfter});
        </script>

        <style>
          body {
            margin: 0;
          }
        </style>
      </head>

      <body>
        ${svg}
      </body>
    </html>
  `;
}
