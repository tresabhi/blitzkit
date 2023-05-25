import Children from './Children.js';

export default function Root(...children: string[]) {
  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@100..900');
      @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100..900');
  
      body {
        margin: 0;
      }

      * {
        font-family: 'Roboto Flex', sans-serif;
      }

      #root {
        display: flex;
      }
    </style>

    <div id="root">
      ${Children(children)}
    </div>
  `;
}
