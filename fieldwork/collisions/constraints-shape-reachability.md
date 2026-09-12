# collision — constraints shape reachability

Status: **probing**

## Independently formed inputs

- `admissibility-by-construction` — a type discipline can exclude programs whose executions would reach specified invalid states;
- `dissipative-order-boundary-conditions` — boundary conditions and control parameters can change which macroscopic branches are dynamically available;
- `path-dependence-and-lock-in` — earlier events can alter later payoff structure and therefore future accessibility;
- `predictive-equivalence-not-state-similarity` — a representational cut can group states without changing the underlying process.

## Displacement

The current vocabulary risks using **cut / constraint / accessibility** as if they were one operation. They are not.

At least four distinct operations are now live:

1. **epistemic partition** — group distinctions in a representation;
2. **admissibility constraint** — exclude states, programs, or transitions before execution;
3. **dynamical accessibility** — make some states attractors, unstable, costly, or practically unreachable under the dynamics;
4. **historical accessibility** — alter the future transition/payoff landscape through the path already taken.

The same set of labels can therefore describe very different causal roles.

## Discriminating question

Can an epistemic partition and an admissibility constraint be shown to differ even in a tiny finite state system where both use the same “safe/unsafe” vocabulary?

## Candidate probe

`admissibility-changes-reachability`

The probe should hold the underlying state graph fixed and compare (a) merely observing/grouping states with (b) removing an admissible transition. Reachability, not prose interpretation, is the verifier.

## What this does not establish

It does not show that all real-world constraints work like type systems, nor that representational cuts never feed back causally. It only blocks silent equivalence between representing a state space and changing it.
