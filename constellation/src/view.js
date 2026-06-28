import './embed.css';
import './view.css';
import { loadGraph } from './graph/loadGraph.js';
import { mount } from './mount.js';

function graphPathFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('graph') ?? 'reference';
}

async function boot() {
  const path = graphPathFromQuery();
  const titleEl = document.getElementById('view-title');
  const metaEl = document.getElementById('view-meta');
  const app = document.getElementById('app');

  try {
    const graph = await loadGraph(path);
    if (titleEl) titleEl.textContent = graph.title ?? path;
    if (metaEl) {
      const model = graph.embeddingModel ? ` · ${graph.embeddingModel}` : '';
      const inquiries = graph.meta?.inquiryCount ?? graph.people.length;
      const concepts = graph.meta?.conceptCount ?? Object.keys(graph.topicLabels).length;
      const scope = graph.scope ?? graph.meta?.scope ?? '';
      metaEl.textContent = `${inquiries} inquiries · ${concepts} concepts${scope ? ` · ${scope}` : ''} · ${graph.method ?? 'unknown'}${model}`;
    }
    mount(app, { graph, initialView: 'A' });
  } catch (error) {
    if (titleEl) titleEl.textContent = 'Graph unavailable';
    if (metaEl) metaEl.textContent = error.message;
    if (app) {
      app.innerHTML = `<p class="view-error">Could not load <code>${path}</code>. Run <code>pnpm constellation:build</code>.</p>`;
    }
  }
}

boot();