export function graphUrl(path) {
  if (path.startsWith('/')) {
    return path.endsWith('.json') ? path : `${path}.json`;
  }
  const normalized = path.endsWith('.json') ? path.slice(0, -5) : path;
  return `/generated/${normalized}.json`;
}

export async function loadGraph(path) {
  const url = graphUrl(path);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load graph ${url}: ${response.status}`);
  }
  return response.json();
}

export async function loadManifest() {
  return loadGraph('manifest');
}