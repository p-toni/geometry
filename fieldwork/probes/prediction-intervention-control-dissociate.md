# probe — prediction, intervention, and control dissociate

Status: **answered**  
Tests: working-backbone distinction `Prediction, intervention, and control require different forms of access.`

## Verification contract

```yaml
claim: >
  Prediction, intervention, and control are separable capabilities; possessing
  one does not generally imply possessing the others.
scope: finite deterministic systems with explicitly specified sensors and actuators
claim_type: formal / distinction

alternatives:
  A: The capabilities collapse: access sufficient for one always entails the others.
  B: Small systems exist where the capabilities come apart.

discriminator: >
  Construct finite systems that hold dynamics simple while varying observation and actuation.
expected_if_A: No finite counterexample separates the capabilities.
expected_if_B: At least two constructions exhibit one capability without another.

verification_target: capability separability, not whether physical interfaces must be distinct
independent_verifier: exhaustive enumeration of finite states/actions
independence_rationale: examples are fully specified and mechanically checkable
trusted_base: elementary transition-system definitions

result: answered
status: answered
```

## Construction 1 — prediction without intervention/control

State `x ∈ {0,1}` with dynamics:

```text
x(t+1) = x(t)
```

Sensor exposes `x` perfectly. No actuator exists.

Result:

- next-state prediction is perfect;
- intervention is unavailable;
- control is unavailable.

So prediction does not imply intervention or control.

## Construction 2 — intervention without target control

State `(x,y) ∈ {0,1}²` with:

```text
x(t+1) = u(t)
y(t+1) = y(t)
```

The actuator can set `x` but the target of interest is `y`.

Result:

- intervention on `x` exists;
- arbitrary control of `y` is impossible.

So intervention does not imply control of a chosen target.

## Construction 3 — open-loop control without observing initial state

State `x ∈ {0,1}` with:

```text
x(t+1) = u(t)
```

No sensor exposes the initial `x(0)`. The actuator can set `u ∈ {0,1}`.

Result:

- the initial state cannot be observed or predicted from measurement;
- nevertheless the controller can force `x(1)` to either desired value exactly.

So some control objectives do not require full observability of the prior state.

## Native controls

This formal separation is consistent with two independent mature distinctions:

- causal inference distinguishes passive observation from intervention (`P(Y|X=x)` versus `P(Y|do(X=x))`);
- control theory distinguishes observability and controllability as separate system properties.

## What changed

The original phrase `different forms of access` is too vague. The stronger surviving content is:

> Prediction, intervention, and control are separable capabilities. None should be inferred from another without explicit conditions linking observation, model knowledge, actuation, and target dynamics.

This candidate has both a finite formal certificate and heterogeneous native support. Hold for source-closed reconstruction rather than editing the backbone immediately.
