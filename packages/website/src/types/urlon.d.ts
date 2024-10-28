declare module 'urlon' {
  function stringify(value: any): string;
  function parse(value: string): any;
  export { parse, stringify };
}
