import { createBundledHighlighter, createSingletonShorthands } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const SUPPORTED_LANGS = new Set([
  'typescript',
  'javascript',
  'python',
  'css',
  'html',
  'json',
  'bash',
]);

const createHighlighter = createBundledHighlighter({
  langs: {
    typescript: () => import('@shikijs/langs/typescript'),
    javascript: () => import('@shikijs/langs/javascript'),
    python: () => import('@shikijs/langs/python'),
    css: () => import('@shikijs/langs/css'),
    html: () => import('@shikijs/langs/html'),
    json: () => import('@shikijs/langs/json'),
    bash: () => import('@shikijs/langs/bash'),
  },
  themes: {
    'github-light': () => import('@shikijs/themes/github-light'),
  },
  engine: createJavaScriptRegexEngine,
});

const { codeToHtml } = createSingletonShorthands(createHighlighter);

export function highlight(code: string, lang = 'typescript') {
  const safeLang = SUPPORTED_LANGS.has(lang) ? lang : 'typescript';
  return codeToHtml(code, { lang: safeLang, theme: 'github-light' });
}

// backward-compat
export function highlightTypeScript(code: string) {
  return highlight(code, 'typescript');
}
