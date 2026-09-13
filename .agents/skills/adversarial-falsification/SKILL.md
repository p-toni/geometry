---
name: adversarial-falsification
description: Stress-test the current working backbone after source-closed reconstruction. Use when the next marginal gain should come from attempted disconfirmation rather than wider supportive search.
---

# Adversarial falsification

## Purpose

A working backbone is not promoted because it survived supportive examples. This mode deliberately searches for cases that would force a clause to fail, narrow, or become ambiguous.

Read:

1. `fieldwork/working-backbone.md`
2. `fieldwork/verification.md`
3. `fieldwork/protocol-evaluation.md`
4. relevant collisions and probes

Do not use this mode for blind scouts. Falsifiers are intentionally allowed to see the claim being tested.

## For each clause

Write before searching:

- exact clause;
- strongest operational interpretation;
- weaker interpretation that would rescue it;
- concrete failure condition;
- domain most likely to violate it;
- what evidence would force `failed`, `narrowed`, `ambiguous`, or `survived`.

Then search in the chosen domain's native vocabulary.

## Outcome discipline

Allowed outcomes:

- `failed` — clause does not survive;
- `narrowed` — survives only with added scope or conditions;
- `ambiguous` — test exposes a semantic or operational gap;
- `bad-discriminator` — experiment could not separate alternatives;
- `unverifiable` — no adequate verifier currently exists;
- `survived-hostile-test` — only when the predeclared failure condition was genuinely at risk.

Do not rewrite definitions after seeing the result merely to preserve the clause.

## Portfolio

After the first source-closed reconstruction, bias the probe portfolio toward disconfirmation. Approximate default:

```text
30% demonstrate / formalize
70% attempt disconfirmation
```

If the last several probes all return clean supportive answers, assume probe difficulty is too low until shown otherwise.

## Coordinate challenge

At least once per major round, test the representation itself:

- are we exploring unknown values in known coordinates?
- is reachability changing?
- are transition rules changing?
- or did later inquiry require a variable or category the earlier representation could not state?

Use `fieldwork/generative-frontier.md`.

## Protocol audit

The protocol receives no immunity.

Periodically:

- reopen one mechanically selected paused branch and audit suppression;
- compare a fresh question under the full protocol versus a simpler research-to-synthesis baseline;
- record search cost as well as epistemic gains;
- preserve failed and ambiguous probes as evidence about the method.

A protocol that mainly generates paperwork, delays justified convergence, or cannot outperform a simpler baseline should be simplified or abandoned.
