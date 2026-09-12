# probe — same function, different mechanism

Status: **answered**  
Tests: `explanation-is-level-indexed`

## Verification contract

```yaml
claim: >
  Identical external input/output behavior does not determine a unique internal
  state structure or transition mechanism.
scope: >
  Two deterministic finite-state transducers computing parity of a binary input
  string.
claim_type: formal

alternatives:
  A: >
    If two deterministic machines implement exactly the same parity function on
    every input string, their internal transition structure is thereby fixed up
    to trivial renaming.
  B: >
    Two machines can compute the same external function for every input string
    while having different reachable internal state graphs.

discriminator: >
  Define two explicit machines, prove their outputs agree for every binary input
  string, and compare their reachable-state graphs.
expected_if_A: >
  External equality forces isomorphic reachable internal transition graphs.
expected_if_B: >
  Outputs agree for all strings while one machine has two reachable states and
  the other has four reachable states with a non-isomorphic transition graph.

independent_verifier: >
  Elementary induction on input length plus finite graph inspection.
independence_rationale: >
  The result follows from explicit transition functions, not semantic analogy.

result: B
would_change_if_wrong: >
  If the two machines did not agree on all strings or their reachable graphs were
  isomorphic, the example would not certify level separation.
status: answered
```

## Machine P — minimal parity tracker

Reachable states:

```text
E = even parity
O = odd parity
```

Transitions:

```text
input 0: E→E, O→O
input 1: E→O, O→E
```

Output is `0` in `E`, `1` in `O`.

## Machine R — redundant parity + phase

Reachable states:

```text
E0, E1, O0, O1
```

The first symbol is parity. The second symbol is a phase bit toggled on **every** input.

Transitions:

```text
input 0: E0→E1, E1→E0, O0→O1, O1→O0
input 1: E0→O1, E1→O0, O0→E1, O1→E0
```

Output ignores phase: `0` in `E0/E1`, `1` in `O0/O1`.

Both machines start in `E` / `E0`.

## Verification

Induction invariant after every input prefix:

```text
parity component of R = state of P
```

Base case: both are even.

Inductive step:

- reading `0` leaves parity unchanged in both machines;
- reading `1` flips parity in both machines;
- R additionally flips a phase bit that is invisible at the output.

Therefore the two machines return exactly the same parity output for **every** finite binary string.

But their reachable internal graphs cannot be isomorphic: P has 2 reachable states; R has 4.

## What changed

This formally certifies only:

> **functional equivalence does not identify algorithmic/internal-state structure.**

So a cross-domain claim that two systems “do the same thing” cannot silently promote itself into a shared mechanism claim.

The example does not prove Marr's levels are universally correct, nor that internal differences always matter to the question being asked. It establishes a concrete failure of inference across explanatory levels.

No seed revision is earned.
