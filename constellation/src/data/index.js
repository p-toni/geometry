import { PEOPLE } from './people.js';
import { EXTRA_EDGES } from './extraEdges.js';
import { TOPIC_LABELS } from './topicLabels.js';

const allTopicIds = [...new Set(PEOPLE.flatMap((p) => p.topicIds))];

export const topics = allTopicIds.map((tid) => ({
  id: tid,
  label: TOPIC_LABELS[tid] || tid,
  personIds: PEOPLE.filter((p) => p.topicIds.includes(tid)).map((p) => p.id),
}));

export const topicOrder = [...topics].sort((a, b) => b.personIds.length - a.personIds.length);

export { PEOPLE, EXTRA_EDGES, TOPIC_LABELS };

export function getDefaultGraph() {
  return {
    id: 'reference',
    title: 'Reference · Poetic Interaction',
    method: 'curated',
    people: PEOPLE,
    topicLabels: TOPIC_LABELS,
    extraEdges: EXTRA_EDGES,
  };
}