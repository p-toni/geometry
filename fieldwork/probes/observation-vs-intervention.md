# probe — observation vs intervention

Status: **answered**  
Tests: `contact-is-mediated`

## Verification contract

```yaml
claim: >
  Two causal models can generate exactly the same passive observational
  distribution while making different predictions under an intervention.
scope: >
  Two binary structural causal models used only as a finite counterexample to
  identifying repeated observation with discriminating contact.
claim_type: formal / causal

alternatives:
  A: >
    If two models agree exactly on the full observational distribution P(X,Y),
    then passive observation already fixes their prediction under do(X=0).
  B: >
    The models can be observationally identical yet diverge under do(X=0).

discriminator: >
  Enumerate P(X,Y) in both models and then enumerate the interventional
  distribution P(Y | do(X=0)).
expected_if_A: >
  The interventional distributions also coincide.
expected_if_B: >
  Passive distributions coincide but interventional distributions differ.

independent_verifier: >
  Exact enumeration over one fair binary exogenous variable.
independence_rationale: >
  The result is fixed by the structural equations and intervention semantics.

result: B
would_change_if_wrong: >
  If intervention failed to separate the models, the example would not certify
  the distinction between observation and discriminating contact.
status: answered
```

## Model A — direct cause

```text
X ~ Bernoulli(1/2)
Y := X
```

Passive distribution:

```text
P(X=0,Y=0) = 1/2
P(X=1,Y=1) = 1/2
all other pairs = 0
```

Under intervention `do(X=0)`, the structural assignment to X is replaced by `X:=0`, and because `Y:=X`:

```text
P(Y=0 | do(X=0)) = 1
```

## Model B — common cause

```text
U ~ Bernoulli(1/2)
X := U
Y := U
```

Passive distribution is identical:

```text
P(X=0,Y=0) = 1/2
P(X=1,Y=1) = 1/2
all other pairs = 0
```

But under `do(X=0)`, only the equation for X is replaced. Y remains `Y:=U`, so:

```text
P(Y=0 | do(X=0)) = 1/2
P(Y=1 | do(X=0)) = 1/2
```

## Observation

No amount of additional passive data over `(X,Y)` can distinguish these two exact models because they induce the same observational distribution.

Changing the interaction channel by intervening on X produces different distributions and therefore discriminates them.

## What changed

This formally certifies a narrow claim:

> **contact can be real yet non-discriminating; changing the interaction/measurement regime can create information that passive observation cannot.**

So “the world answered” and “the answer distinguished our live alternatives” are separate checks.

The example does not imply intervention is always possible, ethical, or necessary. Nor does it establish that all scientific uncertainty is causal non-identifiability.

No seed revision is earned.
