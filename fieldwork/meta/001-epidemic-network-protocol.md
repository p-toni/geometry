# meta-test 001 — anti-collapse protocol output

Question: **How does contact-network structure change epidemic thresholds and intervention leverage?**

Procedure: source-native decomposition before synthesis; preserve model dependence; identify collision/discriminator; no translation into Geometry vocabulary required.

## Native mechanisms recovered

### 1. Degree heterogeneity / static topology

In heterogeneous mean-field and related SIS models, the epidemic threshold depends on moments of the degree distribution or spectral properties of the adjacency matrix. Heavy-tailed degree distributions can drive the threshold very low; in an idealized infinite scale-free limit with diverging second moment, some models yield a vanishing threshold.

This mechanism is about **who is connected to how many others**.

### 2. Finite-size / cutoff effects

The vanishing-threshold result is not interchangeable with a claim that every real finite scale-free network literally has no threshold. Finite connectivity cutoffs restore a nonzero threshold, though it can remain small.

This mechanism is about **the asymptotic regime and support of the degree distribution**.

### 3. Disease-state dynamics

`Epidemic threshold` is not one model-free property. SI, SIS, and SIR dynamics have different state transitions and can produce different threshold behavior on the same network. Temporal-network reviews also report regimes in which memory/modularity pushes SIS and SIR thresholds in different directions.

This mechanism is about **the disease process placed on the network**, not topology alone.

### 4. Temporal order

An aggregated static graph can contain paths that are impossible for transmission because the edge order is wrong in time. Temporal models therefore use time-respecting paths and, in some formulations, infection propagators built from ordered network snapshots.

This mechanism is about **when contacts occur and in what sequence**.

### 5. Adaptive topology

In adaptive-network models, susceptible nodes can rewire away from infected nodes. The network is then not merely a substrate for the epidemic: disease state changes topology, which changes later disease dynamics. This can generate correlations, hysteresis, oscillations, and discontinuous transitions.

This mechanism is about **feedback between the spreading process and the contact graph**.

### 6. Intervention topology

Interventions can exploit structure rather than merely reduce a scalar transmission rate. Acquaintance immunization uses local sampling to bias vaccination toward high-degree nodes without requiring global degree knowledge.

This mechanism is about **changing the susceptible network through selective action**.

## Collision

A sentence like “network structure changes the epidemic threshold” hides several non-equivalent claims.

The same observed threshold can move because of:

- degree heterogeneity;
- finite-size cutoff;
- disease-state model;
- temporal ordering;
- network adaptation;
- intervention policy.

These mechanisms do not compose automatically and can point in different directions.

## Discriminating probe

Construct two temporal contact datasets with the **same aggregated static graph and same disease parameters**, but different edge ordering. Run the same epidemic model on both.

Predeclared alternatives:

```text
A: aggregated topology is sufficient → both produce the same invasion behavior
B: temporal ordering matters → epidemic behavior differs despite identical static graph
```

A time-shuffled control can isolate whether ordering rather than degree structure creates the difference.

## What can be said safely

Contact networks matter, but `network structure` is not a single causal variable and `epidemic threshold` is not a model-independent scalar. Any threshold claim should state at least:

- disease-state model;
- static vs temporal network representation;
- finite vs asymptotic regime;
- which structural statistics are assumed sufficient;
- whether behavior/topology coevolve;
- intervention objective.

## Sources used

Same core baseline sources, plus explicit comparison across SIS/SIR/temporal/adaptive formulations:

- Keeling & Eames (2005), DOI 10.1098/rsif.2005.0051.
- Pastor-Satorras & Vespignani (2001), DOI 10.1103/PhysRevLett.86.3200.
- Pastor-Satorras & Vespignani (2002), DOI 10.1103/PhysRevE.65.035108.
- Leitch, Alexander & Sengupta (2019), DOI 10.1007/s41109-019-0230-4.
- Gross, D’Lima & Blasius (2006), DOI 10.1103/PhysRevLett.96.208701.
- Cohen, Havlin & ben-Avraham (2003), DOI 10.1103/PhysRevLett.91.247901.
- Mei, Mohagheghi, Zampieri & Bullo (2017), DOI 10.1016/j.arcontrol.2017.09.002.
