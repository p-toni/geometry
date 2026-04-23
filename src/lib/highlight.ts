import { createBundledHighlighter, createSingletonShorthands } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const createHighlighter = createBundledHighlighter({
  langs: {
    typescript: () => import('@shikijs/langs/typescript'),
  },
  themes: {
    'github-light': () => import('@shikijs/themes/github-light'),
  },
  engine: createJavaScriptRegexEngine,
});

const { codeToHtml } = createSingletonShorthands(createHighlighter);

export function highlightTypeScript(code: string) {
  return codeToHtml(code, { lang: 'typescript', theme: 'github-light' });
}
