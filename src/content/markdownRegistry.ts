const markdownModules = import.meta.glob('/public/content/*.md', {
  query: '?raw',
  import: 'default',
});

export const markdownSources = Object.keys(markdownModules)
  .map((path) => {
    const filename = path.split('/').at(-1) ?? '';
    const value = `/content/${filename}`;
    return {
      label: filename.replace(/\.md$/, ''),
      value,
    };
  })
  .filter((source) => source.label.length > 0)
  .sort((a, b) => a.label.localeCompare(b.label));
