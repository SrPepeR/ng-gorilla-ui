/** Lets specs import a stylesheet as text: `import css from './tokens.css' with { loader: 'text' }`. */
declare module '*.css' {
  const content: string;
  export default content;
}
