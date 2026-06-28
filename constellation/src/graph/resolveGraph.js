export function resolveGraph(graph) {
  if (!graph?.people?.length) {
    throw new Error('Constellation graph requires at least one inquiry in people[]');
  }

  const PEOPLE = graph.people.map((person) => ({
    ...person,
    topicIds: [...new Set(person.topicIds ?? [])],
  }));

  const TOPIC_LABELS = graph.topicLabels ?? {};
  const EXTRA_EDGES = graph.extraEdges ?? [];

  const allTopicIds = [
    ...new Set([...PEOPLE.flatMap((person) => person.topicIds), ...Object.keys(TOPIC_LABELS)]),
  ];
  const topics = allTopicIds.map((id) => ({
    id,
    label: TOPIC_LABELS[id] || id,
    personIds: PEOPLE.filter((person) => person.topicIds.includes(id)).map(
      (person) => person.id,
    ),
  }));

  const topicOrder = [...topics].sort((a, b) => b.personIds.length - a.personIds.length);

  return { PEOPLE, topics, topicOrder, EXTRA_EDGES, meta: graph.meta ?? null };
}