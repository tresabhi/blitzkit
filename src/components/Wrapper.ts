import Children from './Children.js';

export default function Wrapper(...children: string[]) {
  return `
    <style>
      #wrapper {
        display: flex;
        flex-direction: column;
        padding: 16px;
        gap: 32px;
        width: 640px;
        background: black;
        color: white;
      }
    </style>

    <div id="wrapper">
      ${Children(children)}
    </div>
  `;
}
