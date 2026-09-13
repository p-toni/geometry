# meta-test 001 — simple baseline

Question: **How does contact-network structure change epidemic thresholds and intervention leverage?**

Procedure: ordinary public-source research followed by one synthesis. No blind scouts, collision gating, source-closed reconstruction, or explicit verification contracts.

## Synthesis

Classical epidemic models often assume homogeneous or random mixing, but directly transmitted disease spreads over finite contact patterns. Network structure therefore changes both whether an infection can invade and which interventions have leverage.

Degree heterogeneity is one major mechanism. In idealized infinite scale-free SIS models with sufficiently heavy-tailed degree distributions, highly connected nodes can drive the epidemic threshold toward zero, making the network unusually permissive to persistent spread. Finite-size cutoffs restore a nonzero threshold, but it may remain much smaller than homogeneous approximations predict.

Time also matters. Real contact networks are not static: transmission requires time-respecting paths, and the timing/order of contacts can shift epidemic thresholds even when an aggregated static graph looks similar. Models that ignore contact duration, concurrency, or network turnover can therefore misestimate outbreak risk.

The network can also adapt to the epidemic. If susceptible individuals avoid infected contacts and rewire relationships, topology and disease dynamics coevolve; this can generate correlations, oscillations, hysteresis, and discontinuous transitions not present in a fixed network.

These structural effects create intervention leverage. Vaccinating or otherwise protecting structurally important nodes can outperform uniform allocation. When global degree information is unavailable, acquaintance immunization exploits the fact that a random person's contacts are biased toward higher-degree nodes, improving efficiency without a complete global map.

## Practical conclusion

“Transmission rate” is not enough to characterize epidemic risk. The degree distribution, finite-size constraints, temporal contact structure, and behavioral adaptation of the network can all shift invasion conditions and intervention effectiveness. Epidemic control is therefore partly a problem of changing contact structure or targeting positions in that structure, not only changing pathogen-level parameters.

## Sources used

- Keeling & Eames (2005), *Networks and epidemic models*, DOI 10.1098/rsif.2005.0051.
- Pastor-Satorras & Vespignani (2001), *Epidemic Spreading in Scale-Free Networks*, DOI 10.1103/PhysRevLett.86.3200.
- Pastor-Satorras & Vespignani (2002), *Epidemic dynamics in finite size scale-free networks*, DOI 10.1103/PhysRevE.65.035108.
- Leitch, Alexander & Sengupta (2019), *Toward epidemic thresholds on temporal networks*, DOI 10.1007/s41109-019-0230-4.
- Gross, D’Lima & Blasius (2006), *Epidemic Dynamics on an Adaptive Network*, DOI 10.1103/PhysRevLett.96.208701.
- Cohen, Havlin & ben-Avraham (2003), *Efficient Immunization Strategies for Computer Networks and Populations*, DOI 10.1103/PhysRevLett.91.247901.

## Baseline limitation recorded before comparison

This is a useful high-level answer, but it bundles several different meanings of “network structure” and “epidemic threshold.” It does not explicitly state which claims would fail under a change of disease model, finite-size regime, temporal representation, or intervention objective.
