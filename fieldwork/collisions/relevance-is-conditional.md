# collision — relevance is conditional

Status: **open**

## Independent inputs

- `tishby-pereira-bialek-2000-information-bottleneck` — relevance is defined relative to a downstream variable Y; compression trades retained information about X against predictive information about Y.
- `wilson-kogut-1974-renormalization-group` — relevance is defined by whether perturbations grow or shrink under scale transformation near a fixed point.
- `hoel-et-al-2013-causal-emergence` — a coarse-graining can increase effective causal information by reducing degeneracy under a specified causal measure.

## Why this is a collision rather than an agreement

All three justify discarding detail, but for different reasons. Treating them as one generic “compression finds the important structure” would erase the selection rule.

## New distinction / contradiction

At least three notions of relevance are now live:

1. **task relevance** — preserves information about a chosen target variable;
2. **scale relevance** — survives or grows under a specified transformation flow;
3. **causal relevance** — improves discrimination/effectiveness under a specified intervention-based measure.

The same degree of freedom can be irrelevant under one criterion and essential under another.

## Pressure on the seed

“Compression” cannot serve as a universal bridge from symmetry to prediction/control without naming what licenses the cut. The harder question is now: **relevant to what transformation, task, or intervention?**

## What remains unresolved

Whether there is any higher-order rule for choosing among relevance criteria without simply importing the learner's goal, scale, or measurement convention.

## Candidate discriminating probe

Find or construct one system with two legitimate coarse-grainings: one optimal for a prediction task and another optimal for causal discrimination or scale behavior. Show that no single compression dominates across both questions.
