import './embed.css';
import './gallery.css';
import { loadManifest } from './graph/loadGraph.js';

function graphHref(path) {
  return `./view.html?graph=${encodeURIComponent(path)}`;
}

function renderCard(entry) {
  const meta =
    entry.kind === 'essay'
      ? `${entry.inquiryCount ?? 0} lenses · ${entry.conceptCount} concepts`
      : entry.kind === 'site'
        ? `${entry.inquiryCount ?? 0} site lenses · ${entry.conceptCount} concepts`
        : 'curated poetic-interaction field';

  return `
    <a class="gallery-card" href="${graphHref(entry.path)}">
      <span class="gallery-card-kind">${entry.kind}</span>
      <span class="gallery-card-title">${entry.title}</span>
      <span class="gallery-card-meta">${meta}</span>
    </a>
  `;
}

async function boot() {
  const root = document.getElementById('gallery');
  if (!root) return;

  try {
    const manifest = await loadManifest();
    const method = manifest.method ?? 'unknown';
    const model = manifest.embeddingModel ? ` · ${manifest.embeddingModel}` : '';
    root.innerHTML = `
      <header class="gallery-header">
        <h1>Constellation graphs</h1>
        <p>Inquiries + concepts per essay. Site lenses across the corpus. Toggle view B for concept mesh. <code>${method}${model}</code></p>
      </header>
      <section class="gallery-grid">
        ${manifest.graphs.map(renderCard).join('')}
      </section>
    `;
  } catch (error) {
    root.innerHTML = `
      <header class="gallery-header">
        <h1>Constellation graphs</h1>
        <p class="gallery-error">Run <code>pnpm constellation:build</code> to generate graph JSON.</p>
        <p class="gallery-error-detail">${error.message}</p>
      </header>
    `;
  }
}

boot();