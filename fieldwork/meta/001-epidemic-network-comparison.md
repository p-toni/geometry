# meta-test 001 — baseline vs anti-collapse comparison

Status: **first procedural comparison; not externally independent**

Question: **How does contact-network structure change epidemic thresholds and intervention leverage?**

Both procedures used public literature on the same topic. The same model family executed both, so this test cannot establish independent epistemic superiority. It can test whether the procedure changes what gets preserved in the output.

## Evaluation criteria frozen in `protocol-evaluation.md`

1. distinct mechanisms recovered;
2. unsupported universalizations;
3. live rival explanations preserved;
4. explicit failure conditions;
5. discriminating probes proposed;
6. source / inference boundary quality;
7. calibration of uncertainty;
8. useful conclusions per unit of search effort.

## Comparison

| Criterion | Simple baseline | Anti-collapse protocol | First result |
|---|---|---|---|
| Distinct mechanisms | Recovers topology, temporality, adaptation, targeting, but largely in one narrative | Separates degree heterogeneity, finite-size cutoff, disease dynamics, temporal order, adaptive topology, intervention topology | protocol advantage |
| Universalization control | Notes caveats, but still speaks broadly of “network structure” and “threshold” | Explicitly blocks model-free use of both terms | protocol advantage |
| Rival / incompatible accounts | Mostly harmonized into one useful overview | Preserves cases where SIS/SIR, finite/infinite, static/temporal assumptions change the result | protocol advantage |
| Failure conditions | Mostly implicit | Gives a same-static-graph / different-temporal-order discriminator | protocol advantage |
| Probe generation | None required by baseline | Produces a concrete time-ordering probe and control | protocol advantage |
| Source/inference boundary | Good conventional sourcing | Similar sourcing plus explicit claim-scope boundaries | small protocol advantage |
| Uncertainty calibration | Good high-level caveats | More precise about where threshold claims stop transferring | protocol advantage |
| Search/artifact cost | Lower | Higher: decomposition, comparison, probe design, meta artifacts | baseline advantage |

## What the protocol added that the baseline did not

The main gain was **not more facts**. Both procedures found most of the same literature.

The gain was a change in representation:

```text
“network structure affects epidemic threshold”
        ↓
which structure?
which disease dynamics?
which asymptotic regime?
which time representation?
which feedback loop?
which intervention objective?
```

That decomposition generated a discriminator the baseline did not naturally produce.

## What the baseline did better

For a user who only wants a competent high-level explanation, the baseline is cheaper and probably sufficient. The anti-collapse process adds meaningful overhead.

This matters: the protocol should **not** become the default for every question. Its value appears higher when:

- the claim is intended to generalize across domains;
- multiple mechanisms are being bundled;
- the result may alter a durable thesis / decision;
- false synthesis is more costly than extra research effort;
- a discriminating experiment is desired.

## Search-cost caveat

The protocol pass used additional targeted searches and more artifacts than the baseline. This comparison has not normalized for token, time, or source count, so it cannot yet answer whether the additional epistemic value is efficient.

A later meta-test should equalize a fixed search budget.

## Verdict

**Promising procedural effect, not validation.**

In this first test the anti-collapse procedure improved mechanism separation, scope calibration, and probe generation, while the baseline remained more efficient for ordinary explanation.

The useful hypothesis for the protocol is therefore narrower than “always produces better research”:

> When a question contains several potentially conflated mechanisms and the output is meant to support durable generalization, the anti-collapse protocol may produce more discriminating and better-calibrated conclusions than ordinary synthesis, at higher search cost.

That hypothesis is now itself testable in later meta-runs.
