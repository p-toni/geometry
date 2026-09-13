# round 001 — adversarial falsification wave F

Status: **open**  
Mode: backbone red-team / hostile testing

Wave F is not a blind scout wave. Its purpose is different: take the accepted working backbone and deliberately search for cases that would force a clause to weaken, split, or fail.

The working backbone is visible to these investigators.

## Clauses under attack

### F1 — bounded possibility

> A bounded system cannot realize, observe, or represent every possibility.

Hostile question: are there scientifically important systems for which the relevant possibility space cannot even be prestated, making “every possibility” the wrong frame rather than merely an unattainable totality?

Primary target: evolutionary biology / changing observables / unprestatable phase spaces.

### F2 — accessibility

> Interfaces, constraints, dynamics, and history shape what becomes accessible.

Hostile question: is this taxonomy discriminating, or broad enough to redescribe almost any change in reachability after the fact?

Failure condition: if every mechanism can be assigned to one of the four bins only by stretching their meanings, the clause is classificatory rather than explanatory.

### F3 — indexed equivalence

> Any useful equivalence is indexed by what must be preserved.

Hostile question: can we find a non-arbitrary equivalence relation justified by the system's own formal semantics rather than a downstream task or observer choice?

Primary targets: bisimulation, isomorphism, gauge equivalence.

### F4 — plural structure

> Structure may be represented, enacted, selected, or distributed.

Hostile question: does this enumerate genuinely different mechanisms, or has it become so permissive that any organized phenomenon can be absorbed?

Failure condition: no observable consequence follows from choosing among the categories.

### F5 — access modes

> Prediction, intervention, and control require different forms of access.

Hostile question: identify systems where the distinction collapses under a common sufficient statistic or where one access mode formally entails another under explicit conditions.

### F6 — learning / error channel

> Learning requires that consequential error survive a channel and reach something that can revise.

Hostile question: can a system ordinarily and technically described as learning adapt without receiving an explicit error signal or target mismatch?

Primary target: unsupervised Hebbian / Oja learning.

## Portfolio rule

Wave F should prefer results of the form:

- **failed** — the working clause does not survive;
- **ambiguous** — the discriminator exposes a semantic or operational gap;
- **narrowed** — clause survives only after adding scope/conditions;
- **survived hostile test** — only after a real failure condition was predeclared.

A clean confirmation is not the default success condition.

## First two promoted attacks

1. `learning-without-explicit-error` — attack F6 with Oja-style unsupervised adaptation.
2. `unprestatable-phase-space` — attack F1 and the state-space metaphor with Longo–Montévil–Kauffman.

## Meta-test

Wave F also begins protocol self-evaluation. One paused branch is selected mechanically for a suppression audit, and a baseline-vs-protocol comparison will be run on a fresh research question before round close.
