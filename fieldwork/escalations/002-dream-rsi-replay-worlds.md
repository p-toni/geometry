# escalation 002 — Dream-RSI: history as replay world

Status: **escalation lane — protocol-relevant, no deep cycle yet**  
Source: Zheng et al., *Dream-RSI: Recursive Self-Improvement through Evolving Worlds*, arXiv:2609.14858v1 (14 Sep 2026).

## Why this escalated

The paper is directly relevant to two live research-system questions:

1. whether accumulated research history should remain memory / summary, or become an executable substrate for improving future search;
2. whether "world construction" means generating new scientific possibilities, or can also mean reorganizing realized history into a decision environment.

It also contains a controlled result about semantic guidance that pressures our own summary-inheritance assumptions.

## Native mechanism

Dream-RSI separates the **discovery agent** from an explicit **exploration policy**.

The online loop is:

~~~text
exploration policy
      ↓
coding/discovery agent
      ↓
proposal + execution + score
      ↓
discovery tree
~~~

After an online rollout, the completed discovery tree is frozen and reused as a replay environment. Candidate exploration policies can reveal different recorded branches, in different orders, with different batching and stopping decisions, without rerunning the underlying coding agent or evaluator.

A fixed LLM-based policy-development agent then edits the exploration-policy code using replay feedback. The selected policy is redeployed online, producing another discovery tree, which enlarges the replay pool.

Crucially, the paper states that only the **exploration-policy code** changes. The underlying model(s), evaluator and execution interfaces remain fixed.

This is therefore recursive improvement at the **meta-exploration / orchestration layer**, not general recursive modification of the base model.

## What the paper supports

### Controlled adaptive-exploration effect

The main controlled baseline, Recursive Fixed Exploration, uses the same discovery agent, evaluator, initialization and per-round resource constraints. Both systems start from the same manually designed exploration policy. The difference is that Dream-RSI updates that policy after the first round using replay.

Reported examples include:

- Lasso algorithm engineering: with Gemini-3.1 Pro, Dream-RSI reports 317 discovery-agent calls versus 550 for fixed exploration, with lower average runtime on six held-out datasets; with Gemini-3.7-Flash, 1,879 versus 3,200 calls with lower average runtime.
- GPU kernels: on the four reported KernelBench tasks, the paper reports either comparable performance with 1.79x–2.43x fewer generations or 1.44x–2.09x higher performance under comparable budgets.
- mathematical optimization: results are mixed but competitive; Dream-RSI improves Sum-Difference over the fixed baseline, matches the top reported Circle Packing value, and is not best on Autocorrelation.

This supports the narrow claim:

> changing the exploration controller, while holding the underlying discovery agent and evaluator fixed, can improve discovery quality / compute trade-offs in some long-horizon search tasks.

It does not establish that every discovery process benefits from replay-based controller evolution.

### History as structured feedback, not only context

The central move is stronger than ordinary memory. The history is stored as a tree of workspace states, proposals, outcomes, diagnostics and scores, then exposed through the same decision interface used online.

This gives past exploration a new operational role:

~~~text
history as text/context
        !=
history as training data
        !=
history as a replayable decision environment
~~~

### Semantic guidance can hurt exploration

The paper also tests a different use of history: abstract previous trajectories into high-level directional guidance and inject that guidance into later prompts.

On the reported ConvDiv setting, explicit directional guidance under equivalent discovery budgets performs worse than the unguided counterpart for both fixed exploration and Dream-RSI.

The authors interpret this as strong semantic inductive bias over-constraining long-horizon parallel exploration.

This is highly relevant to anti-collapse, but the scope is narrow: one reported analysis setting does **not** establish that summaries or inherited guidance are generally harmful.

It does establish that "more distilled guidance" is not automatically better than retaining richer structured history.

## Important limits

### 1. The replay "world" is not a generative world model

Replay can only reveal outcomes that were actually recorded in the historical tree.

For a non-root branch, the replay transition returns that branch's unique recorded child. It cannot ask:

> what would the coding agent have generated from this same parent under a different stochastic draw or a genuinely different instruction?

The paper explicitly states that no outcomes beyond the recorded tree are generated.

So:

~~~text
generative environment model
        !=
support-limited historical replay
~~~

Calling both "worlds" is convenient, but they have materially different counterfactual power.

### 2. Replay improvement is only guaranteed on replay

Because the incumbent policy is among the candidates, the selected next policy is guaranteed to be no worse on average replay score over the fixed historical trees.

That is not a guarantee of improved online discovery.

Online redeployment is the actual out-of-sample contact.

This matters because the history was generated by earlier policies and therefore defines the support on which later policies are judged.

### 3. History can create its own inductive bias

The method uses realized search history to improve the future search policy. That is efficient, but it creates a feedback loop:

~~~text
policy_t
  → realized history_t
  → replay evaluation
  → policy_(t+1)
  → new realized history
~~~

A weakly explored region has little replay evidence and may remain weakly valued.

The paper partly protects against this with explicit exploration rules, root opening, underexplored-branch logic and adaptive width/depth planning. Those protections are themselves important components of the system.

### 4. The "RSI" is substantially scaffolded

The policy-development prompt does not ask an unconstrained agent to invent any possible discovery strategy. It supplies a rich policy API and explicit rules about prefix-only decisions, failure classification, exploration/exploitation/recovery portfolios, beta scheduling, grid planning, batching and stopping.

The system still edits executable policy code, but the improvement happens inside a strongly designed meta-architecture.

That is a feature for scientific control, but it narrows what "recursive self-improvement" means here.

### 5. Cost accounting is narrower than total system cost

The paper defines discovery cost as cumulative **discovery-agent calls**.

Replay avoids rerunning the expensive discovery agent/evaluator, but policy-development itself uses an LLM agent and therefore is not literally free. Claims about lower discovery cost should be read using the paper's stated cost definition unless total meta-optimization cost is reported separately.

### 6. Reproduction is not yet fully open

At the time of this review, the project repository says the full codebase and reproduction scripts are still being prepared for release. The paper and discovered programs are available, but the full empirical pipeline is not yet independently rerunnable from the public repository.

The v1 paper also presents point trajectories/results rather than a clearly reported multi-seed uncertainty analysis for the stochastic coding-agent experiments. Treat effect sizes as provisional until stronger replication evidence exists.

## Collision with escalation 001

"001-buehler-recursive-worlds.md" used "world" for an executable scientific instrument / persistent environment.

Dream-RSI uses "world" for a replayable historical discovery tree.

Do not collapse them.

~~~text
physical / executable scientific world
    generates new measured outcomes

historical replay world
    reorders access to already-recorded outcomes

learned generative world model
    predicts / samples unobserved outcomes
~~~

These differ in what counterfactuals they support.

The common higher-level operation is weaker:

> an artifact can externalize structure so that later reasoning can operate over a different effective decision environment.

That statement remains an inquiry candidate, not a promoted Geometry theory.

## Displacement for our research system

Round 001 mostly treated prior research in two ways:

- source / artifact archive;
- compressed summaries handed to later reasoning.

Dream-RSI exposes a third possibility:

> preserve enough structured decision history that alternative **research-routing policies** can later be replayed against it.

This is not yet implementable from our current archive without choices about:

- what counts as a research action;
- parent/child relation;
- outcome/verifier;
- cost;
- objective;
- how to represent ambiguous, failed and non-discriminating outcomes without collapsing them to one scalar.

Those choices are dangerous because a badly chosen replay objective could optimize the protocol toward its own measurement artifacts.

Therefore **do not retrofit a scalar replay score onto round 001 now**.

## Candidate future discriminator

A deep cycle would be earned if we decide to automate or adapt the research router itself.

A suitable test would be:

~~~text
target:
  structured replay of prior research trajectories improves future research routing

rival:
  replay mainly overfits the support and scoring conventions of earlier trajectories

hold fixed:
  base model
  evidence packet
  downstream task family
  online research budget
  verifier

A:
  fixed router

B:
  router improved from replay of previous research trees

critical evaluation:
  new held-out research tasks not present in replay history

measure:
  consequential uncertainty reduced
  unsupported generalizations
  verifier success
  useful conclusions per online cost

account separately:
  offline replay / policy-development compute
~~~

The holdout is essential. Success on the same historical trees is only evidence that the router learned the archive.

## Routing decision

Remain in **escalation**.

The paper earned two durable distinctions:

1. semantic inheritance and structured replay are different uses of history;
2. replay worlds and generative worlds have different counterfactual power.

It also provides real evidence that meta-exploration policy can improve while the base discovery model stays fixed.

But it does not yet justify changing Geometry's router. The next deep cycle should occur only if we choose to make **adaptive research orchestration** an active system objective.

## Sources

- https://arxiv.org/abs/2609.14858v1
- https://arxiv.org/pdf/2609.14858v1
- https://github.com/zhengkid/Dream-RSI
- fieldwork/escalations/001-buehler-recursive-worlds.md
