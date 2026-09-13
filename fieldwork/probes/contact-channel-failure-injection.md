# probe — contact channel failure injection

Status: **answered**  
Tests: `contact-is-mediated`

## Verification contract

```yaml
claim: >
  Environmental contact can occur while the observation channel remains unable
  to discriminate two environmental conditions; changing only the channel can
  restore discrimination.
scope: >
  A finite constructed counterexample. It certifies the distinction between
  external difference and observable/discriminable difference, not a universal
  theory of measurement.
claim_type: formal / computational

alternatives:
  A: >
    If the environment differs and the system receives observations from it,
    that contact is sufficient to distinguish the two conditions.
  B: >
    Two different environmental conditions can induce the same observation
    distribution through one channel and different distributions through a
    refined channel.

discriminator: >
  Enumerate the exact observation distributions produced by two fixed world
  conditions under a coarse channel and then under a refined channel, changing
  no world probabilities.
expected_if_A: >
  The coarse channel already yields different observation distributions.
expected_if_B: >
  The coarse distributions are identical while the refined distributions differ.

independent_verifier: >
  Exact finite enumeration with equiprobable latent states; the probabilities
  are rational and checkable by hand.
independence_rationale: >
  The result follows from the predeclared world distributions and channel maps,
  not from semantic interpretation.

result: B
would_change_if_wrong: >
  If the coarse channel discriminated the worlds, this example would fail to
  certify contact without discrimination.
status: answered
```

## Construction

Two environmental conditions generate latent states:

```text
W0: a with 1/2, c with 1/2
W1: b with 1/2, d with 1/2
```

The **coarse** measurement channel is:

```text
g(a)=0
g(b)=0
g(c)=1
g(d)=1
```

Therefore:

```text
P(g=0 | W0) = 1/2    P(g=1 | W0) = 1/2
P(g=0 | W1) = 1/2    P(g=1 | W1) = 1/2
```

The two worlds are physically different and both are in causal contact with the sensor, but the observed distributions are identical.

Now change **only** the channel to a refined sensor:

```text
h(a)=a
h(b)=b
h(c)=c
h(d)=d
```

Then:

```text
support(h | W0) = {a,c}
support(h | W1) = {b,d}
```

The world conditions are perfectly distinguishable.

## What changed

The probe gives a formal certificate for the narrow distinction:

> **contact with an external constraint does not imply that the chosen channel preserves the difference needed to discriminate alternatives.**

Changing the channel can change what the same world is able to tell the learner.

This strengthens `contact-is-mediated` but does not by itself revise the seed or establish that every epistemic failure is a measurement-channel failure.
