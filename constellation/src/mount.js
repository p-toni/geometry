import {
  HOVER_THRESHOLD,
  HOVER_MAX_SCALE,
  HOVER_EDGE_BOOST,
  PERSON_HOVER_EDGE_ALPHA_BOOST,
  LABEL_HIT_PADDING,
  SELECTED_LABEL_FONT_BOOST,
  SELECTED_LABEL_WEIGHT_BOOST,
  PERSON_LABEL_WEIGHT,
  SELECTED_LABEL_OFFSET_BOOST,
  SELECTED_LABEL_NEIGHBOR_SHIFT,
  SELECTED_LABEL_NEIGHBOR_RANGE,
  SELECTED_TOPIC_LABEL_COLOR,
  CANVAS_LABEL_FONT_STACK,
  MOBILE_LAYOUT_BREAKPOINT,
  MOBILE_NODE_RADIUS_SCALE,
  MOBILE_GRAPH_RADIUS_SCALE,
  MOBILE_PERSON_LABEL_OFFSET_BOOST,
  INTRO_TEMPLATE,
  P_A,
  P_B,
} from './constants.js';
import { getDefaultGraph } from './data/index.js';
import { resolveGraph } from './graph/resolveGraph.js';
import {
  easeOutCubic,
  easeOutQuart,
  clamp01,
  rgba,
  makeBundledPath,
  pointOnPath,
  partialQuadratic,
  splitLabel,
  makeTransition,
  makeView,
} from './utils.js';

export function mount(root, options = {}) {
    if (!root) throw new Error('ConstellationEmbed.mount requires a root element.');

    const { PEOPLE, topics, topicOrder, EXTRA_EDGES } = resolveGraph(
      options.graph ?? getDefaultGraph(),
    );

    root.classList.add('constellation-embed');
    root.innerHTML = [
      '<div class="constellation-view-toggle" role="button" tabindex="0">Inquiries + Concepts</div>',
      '<div class="constellation-info" aria-hidden="true">',
      '  <div class="constellation-info-name"></div>',
      '  <div class="constellation-info-meta"></div>',
      '</div>',
      '<div class="constellation-cursor" aria-hidden="true"></div>',
      '<canvas class="constellation-canvas-a"></canvas>',
      '<canvas class="constellation-canvas-b" style="display:none"></canvas>',
    ].join('');

    const toggleEl = root.querySelector('.constellation-view-toggle');
    const infoEl = root.querySelector('.constellation-info');
    const infoNameEl = root.querySelector('.constellation-info-name');
    const infoMetaEl = root.querySelector('.constellation-info-meta');
    const cursorEl = root.querySelector('.constellation-cursor');
    const canvasA = root.querySelector('.constellation-canvas-a');
    const canvasB = root.querySelector('.constellation-canvas-b');
    const viewA = makeView('A', canvasA, { ...P_A });
    const viewB = makeView('B', canvasB, { ...P_B });

    const state = {
      root,
      W: 0,
      H: 0,
      dpr: 1,
      cx: 0,
      cy: 0,
      currentView: options.initialView === 'B' ? 'B' : 'A',
      viewScale: 1,
      renderedIdleness: 0,
      lastActivity: performance.now(),
      rafId: null,
      cursorVisible: false,
      destroyed: false,
      resizeObserver: null,
    };

    function activeView() {
      return state.currentView === 'A' ? viewA : viewB;
    }

    function otherView() {
      return state.currentView === 'A' ? viewB : viewA;
    }

    function screenToGraphPoint(x, y) {
      const s = state.viewScale || 1;
      return {
        x: state.cx + (x - state.cx) / s,
        y: state.cy + (y - state.cy) / s,
      };
    }

    function nodeRadius(radius) {
      const mobileScale = state.W <= MOBILE_LAYOUT_BREAKPOINT ? MOBILE_NODE_RADIUS_SCALE : 1;
      return radius * mobileScale;
    }

    function graphRadius(frac) {
      const mobileScale = state.W <= MOBILE_LAYOUT_BREAKPOINT ? MOBILE_GRAPH_RADIUS_SCALE : 1;
      return Math.min(state.W, state.H) * frac * mobileScale;
    }

    function getIdleness() {
      const elapsed = performance.now() - state.lastActivity;
      if (elapsed < 30000) return 0;
      return easeOutCubic(clamp01((elapsed - 30000) / 4000));
    }

    function tickIdleness() {
      const target = getIdleness();
      if (target > state.renderedIdleness) {
        state.renderedIdleness += (target - state.renderedIdleness) * 0.008;
      } else {
        state.renderedIdleness += (target - state.renderedIdleness) * 0.06;
        if (state.renderedIdleness < 0.001) state.renderedIdleness = 0;
      }
    }

    function placeNodesA() {
      const innerR = graphRadius(viewA.P.innerRFrac);
      const outerR = graphRadius(viewA.P.outerRFrac);
      viewA.nodes = {};
      PEOPLE.forEach((p, i) => {
        const a = (i / PEOPLE.length) * Math.PI * 2 - Math.PI / 2;
        viewA.nodes[p.id] = { ...p, type: 'person', x: state.cx + Math.cos(a) * innerR, y: state.cy + Math.sin(a) * innerR, angle: a };
      });
      topicOrder.forEach((t, i) => {
        const a = (i / topicOrder.length) * Math.PI * 2 - Math.PI / 2;
        viewA.nodes[t.id] = { ...t, type: 'topic', x: state.cx + Math.cos(a) * outerR, y: state.cy + Math.sin(a) * outerR, angle: a };
      });
    }

    function placeNodesB() {
      const outerR = graphRadius(viewB.P.outerRFrac);
      viewB.nodes = {};
      topicOrder.forEach((t, i) => {
        const a = (i / topicOrder.length) * Math.PI * 2 - Math.PI / 2;
        viewB.nodes[t.id] = { ...t, type: 'topic', x: state.cx + Math.cos(a) * outerR, y: state.cy + Math.sin(a) * outerR, angle: a };
      });
    }

    function buildIntroOrder(view) {
      const peopleIds = PEOPLE.map(p => p.id).filter(id => view.nodes[id]);
      const topicIds = topicOrder.map(t => t.id).filter(id => view.nodes[id]);
      view.nodeIntroOrder = [...peopleIds, ...topicIds];
    }

    function buildEdgesA() {
      const out = [];
      PEOPLE.forEach(p => {
        p.topicIds.forEach(tid => {
          const pn = viewA.nodes[p.id];
          const tn = viewA.nodes[tid];
          if (!pn || !tn) return;
          out.push({
            from: p.id,
            to: tid,
            shared: tn.personIds.length,
            edgeKind: 'theme',
            path: makeBundledPath(pn.x, pn.y, tn.x, tn.y, viewA.P, state.cx, state.cy),
          });
        });
      });
      return out;
    }

    function buildTopicEdges() {
      const seen = new Set();
      const out = [];
      for (let i = 0; i < topics.length; i++) {
        for (let j = i + 1; j < topics.length; j++) {
          const ta = topics[i];
          const tb = topics[j];
          const bridgePeople = ta.personIds.filter(pid => tb.personIds.includes(pid));
          if (!bridgePeople.length) continue;
          const na = viewB.nodes[ta.id];
          const nb = viewB.nodes[tb.id];
          if (!na || !nb) continue;
          const key = [ta.id, tb.id].sort().join('::');
          seen.add(key);
          out.push({
            from: ta.id,
            to: tb.id,
            shared: bridgePeople.length,
            bridgePeople,
            edgeKind: 'shared-topic',
            path: makeBundledPath(na.x, na.y, nb.x, nb.y, viewB.P, state.cx, state.cy),
          });
        }
      }
      EXTRA_EDGES.forEach(([a, b]) => {
        if (!viewB.nodes[a] || !viewB.nodes[b]) return;
        const key = [a, b].sort().join('::');
        if (seen.has(key)) return;
        seen.add(key);
        out.push({
          from: a,
          to: b,
          shared: 1,
          bridgePeople: [],
          edgeKind: 'direct',
          path: makeBundledPath(viewB.nodes[a].x, viewB.nodes[a].y, viewB.nodes[b].x, viewB.nodes[b].y, viewB.P, state.cx, state.cy),
        });
      });
      return out;
    }

    function resizeCanvas(view) {
      const canvas = view.canvas;
      canvas.width = Math.floor(state.W * state.dpr);
      canvas.height = Math.floor(state.H * state.dpr);
      canvas.style.width = `${state.W}px`;
      canvas.style.height = `${state.H}px`;
      view.ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    }

    function canvasDpr() {
      const rawDpr = window.devicePixelRatio || 1;
      const isMobile = state.W <= MOBILE_LAYOUT_BREAKPOINT || window.matchMedia('(hover: none)').matches;
      const minDpr = isMobile ? 1.75 : 1;
      const maxDpr = isMobile ? 2 : 2;
      return Math.min(Math.max(rawDpr, minDpr), maxDpr);
    }

    function startIntro(view) {
      view.intro.startTime = performance.now();
      view.intro.active = true;
      view.particles.length = 0;
    }

    function resize() {
      const rect = root.getBoundingClientRect();
      state.W = Math.max(320, rect.width || window.innerWidth);
      state.H = Math.max(320, rect.height || window.innerHeight);
      state.dpr = canvasDpr();
      state.cx = state.W / 2;
      state.cy = state.H / 2;
      resizeCanvas(viewA);
      resizeCanvas(viewB);
      placeNodesA();
      placeNodesB();
      viewA.edges = buildEdgesA();
      viewB.edges = buildTopicEdges();
      if (!viewA.nodeIntroOrder.length) buildIntroOrder(viewA);
      if (!viewB.nodeIntroOrder.length) buildIntroOrder(viewB);
      refreshSelection(viewA);
      refreshSelection(viewB);
      startIntro(viewA);
      startIntro(viewB);
    }

    function updateIntro(view) {
      const intro = view.intro;
      if (!intro.active) return;
      const elapsed = performance.now() - intro.startTime;
      const nodeRevealDuration = (view.nodeIntroOrder.length - 1) * intro.nodeDelay + 400;
      const naturalDuration = Math.max(intro.duration, nodeRevealDuration);
      if (elapsed / naturalDuration >= 1) {
        intro.active = false;
        for (let i = 0; i < 40; i++) spawnParticle(view);
      }
    }

    function introNodeAlpha(view, id) {
      if (!view.intro.active) return 1;
      const idx = Math.max(0, view.nodeIntroOrder.indexOf(id));
      const elapsed = performance.now() - view.intro.startTime - idx * view.intro.nodeDelay;
      return easeOutCubic(clamp01(elapsed / 400));
    }

    function introEdgeProgress(view, idx) {
      if (!view.intro.active) return 1;
      const elapsed = performance.now() - view.intro.startTime;
      const edgeStart = view.intro.edgeStartOffset + (idx % 8) * 30;
      return easeOutQuart(clamp01((elapsed - edgeStart) / view.intro.edgeGrowDuration));
    }

    function updateSelectionTransition(view) {
      const tr = view.selectionTransition;
      if (tr.active) {
        const elapsed = performance.now() - tr.startTime;
        const limit = tr.phase === 'out' ? tr.fadeDuration : tr.duration;
        if (elapsed >= limit) {
          tr.active = false;
          if (tr.phase === 'out') {
            view.activeNodeIds = new Set();
            view.activeEdgeSet = new Set();
            view.activeBridgePeople = new Set();
          }
        }
      }
      if (tr.prevActive) {
        const elapsed = performance.now() - tr.prevStartTime;
        if (elapsed >= tr.prevFadeDuration) {
          tr.prevActive = false;
          tr.prevEdgeSet = new Set();
        }
      }
    }

    function getRippleProgress(view, edge, idx) {
      const tr = view.selectionTransition;
      const isActive = view.activeEdgeSet.has(idx);
      if (!tr.active) return isActive ? 1 : 0;
      const elapsed = performance.now() - tr.startTime;
      if (tr.phase === 'out') {
        if (!isActive) return 0;
        return 1 - easeOutCubic(clamp01(elapsed / tr.fadeDuration));
      }
      if (!isActive) return 0;
      const fromNode = view.nodes[tr.fromId];
      const farNode = view.nodes[edge.from === tr.fromId ? edge.to : edge.from];
      if (!fromNode || !farNode) return easeOutCubic(clamp01(elapsed / 300));
      let angleDiff = Math.abs(farNode.angle - fromNode.angle);
      if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
      return easeOutCubic(clamp01((elapsed - (angleDiff / Math.PI) * 200) / 300));
    }

    function getPrevFadeProgress(view, idx) {
      const tr = view.selectionTransition;
      if (!tr.prevActive || !tr.prevEdgeSet.has(idx) || view.activeEdgeSet.has(idx)) return 0;
      return 1 - easeOutCubic(clamp01((performance.now() - tr.prevStartTime) / tr.prevFadeDuration));
    }

    function fireBurst(view, nodeId) {
      const activeIndices = [...view.activeEdgeSet];
      if (!activeIndices.length) return;
      const count = Math.min(14, activeIndices.length * 2);
      for (let i = 0; i < count; i++) {
        const idx = activeIndices[i % activeIndices.length];
        const edge = view.edges[idx];
        if (!edge) continue;
        const startAtFrom = edge.from === nodeId;
        view.particles.push({
          edge,
          edgeIndex: idx,
          t: startAtFrom ? 0.01 : 0.99,
          speed: view.P.particleSpeed * (3.2 + Math.random() * 1.4) * (startAtFrom ? 1 : -1),
          life: 0.9 + Math.random() * 0.1,
          decay: 0.028 + Math.random() * 0.012,
          size: view.P.particleSize * (1.6 + Math.random() * 0.6),
          isBurst: true,
        });
      }
    }

    function refreshSelection(view) {
      view.activeNodeIds = new Set();
      view.activeEdgeSet = new Set();
      view.activeBridgePeople = new Set();
      const sel = view.selectedId;
      if (!sel) return;
      view.activeNodeIds.add(sel);
      view.edges.forEach((edge, idx) => {
        const active = edge.from === sel || edge.to === sel;
        if (!active) return;
        view.activeEdgeSet.add(idx);
        view.activeNodeIds.add(edge.from);
        view.activeNodeIds.add(edge.to);
        (edge.bridgePeople || []).forEach(pid => view.activeBridgePeople.add(pid));
      });
    }

    function setInfoForView(view) {
      const id = view.selectedId;
      if (!id) {
        infoEl.style.opacity = '0';
        root.classList.remove('is-selected');
        return;
      }
      const node = view.nodes[id];
      if (!node) return;
      infoNameEl.textContent = node.type === 'person' ? node.name : node.label;
      if (view.key === 'A') {
        infoMetaEl.textContent = node.type === 'person' ? node.meta : `topic — ${node.personIds.length} connections`;
      } else {
        const neighborIds = new Set();
        const bridgePeople = new Set();
        view.edges.forEach(edge => {
          if (edge.from === id || edge.to === id) {
            neighborIds.add(edge.from === id ? edge.to : edge.from);
            (edge.bridgePeople || []).forEach(pid => bridgePeople.add(pid));
          }
        });
        infoMetaEl.textContent = `connected to ${neighborIds.size} topics · via ${bridgePeople.size} people`;
      }
      infoEl.style.opacity = '1';
      root.classList.add('is-selected');
    }

    function selectNode(view, id) {
      const wasSelected = view.selectedId === id;
      const prevId = view.selectedId;
      const isCrossSelect = !wasSelected && prevId !== null;
      if (isCrossSelect) {
        const tr = view.selectionTransition;
        tr.prevEdgeSet = new Set(view.activeEdgeSet);
        tr.prevActive = true;
        tr.prevStartTime = performance.now();
      }
      view.selectedId = wasSelected ? null : id;
      refreshSelection(view);
      if (wasSelected) {
        view.selectionTransition.active = true;
        view.selectionTransition.startTime = performance.now();
        view.selectionTransition.phase = 'out';
      } else {
        view.selectionTransition.active = true;
        view.selectionTransition.startTime = performance.now();
        view.selectionTransition.phase = 'in';
        view.selectionTransition.fromId = id;
        fireBurst(view, id);
      }
      if (view.key === state.currentView) setInfoForView(view);
    }

    function clearSelection(view) {
      if (view.selectedId) {
        view.selectionTransition.active = true;
        view.selectionTransition.startTime = performance.now();
        view.selectionTransition.phase = 'out';
      }
      view.selectedId = null;
      refreshSelection(view);
      if (view.key === state.currentView) {
        infoEl.style.opacity = '0';
        root.classList.remove('is-selected');
      }
    }

    function spawnParticle(view, edge) {
      const pool = edge ? [edge] : (view.selectedId ? [...view.activeEdgeSet].map(i => view.edges[i]).filter(Boolean) : view.edges);
      if (!pool.length) return;
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      const idx = view.edges.indexOf(chosen);
      const dir = Math.random() < 0.5 ? -1 : 1;
      view.particles.push({
        edge: chosen,
        edgeIndex: idx,
        t: Math.random(),
        speed: view.P.particleSpeed * (0.55 + Math.random() * 0.75) * dir,
        life: 0.5 + Math.random() * 0.5,
        decay: view.P.particleDecay * (0.65 + Math.random() * 0.7),
        size: view.P.particleSize * (0.7 + Math.random() * 0.8),
      });
    }

    function spawnParticles(view) {
      if (view.intro.active && performance.now() - view.intro.startTime < view.intro.particleStartOffset) return;
      const idleParticleFactor = 1 - state.renderedIdleness * 0.72;
      const baseMax = view.selectedId ? Math.floor(view.P.maxParticles * 1.6) : view.P.maxParticles;
      const max = Math.floor(baseMax * idleParticleFactor);
      if (view.frame % 3 === 0 && view.particles.length < max) spawnParticle(view);
      if (view.selectedId && view.frame % 2 === 0 && view.particles.length < max) spawnParticle(view);
    }

    function hitTest(mx, my, view) {
      let closest = null;
      let minDist = 20;
      Object.values(view.nodes).forEach(n => {
        const d = Math.hypot(mx - n.x, my - n.y);
        if (d < minDist) {
          minDist = d;
          closest = n;
        }
      });
      return closest;
    }

    function hitTestLabel(mx, my, view) {
      for (let i = view.labelBoxes.length - 1; i >= 0; i--) {
        const b = view.labelBoxes[i];
        const dx = mx - b.cx;
        const dy = my - b.cy;
        const cos = Math.cos(-b.rot);
        const sin = Math.sin(-b.rot);
        const lx = dx * cos - dy * sin;
        const ly = dx * sin + dy * cos;
        if (Math.abs(lx) <= b.w / 2 + LABEL_HIT_PADDING && Math.abs(ly) <= b.h / 2 + LABEL_HIT_PADDING) {
          return b.node;
        }
      }
      return null;
    }

    function resolveClickTarget(mx, my, view) {
      return hitTest(mx, my, view) || hitTestLabel(mx, my, view);
    }

    function updateHover(mx, my, view) {
      let nearestId = null;
      let nearestProximity = 0;
      let nearestDist = HOVER_THRESHOLD;
      Object.values(view.nodes).forEach(n => {
        const d = Math.hypot(mx - n.x, my - n.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearestId = n.id;
          nearestProximity = Math.pow(1 - d / HOVER_THRESHOLD, 2);
        }
      });
      const labelHit = hitTestLabel(mx, my, view);
      if (labelHit && nearestProximity < 0.45) {
        nearestId = labelHit.id;
        nearestProximity = 0.45;
      }
      view.hoverId = nearestId;
      view.hoverProximity = nearestProximity;
    }

    function handleMove(e) {
      state.lastActivity = performance.now();
      const view = activeView();
      const rect = root.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const graphPoint = screenToGraphPoint(mx, my);
      updateHover(graphPoint.x, graphPoint.y, view);
      updateCursor(mx, my, view);
    }

    function handleClick(e) {
      state.lastActivity = performance.now();
      const view = activeView();
      const rect = root.getBoundingClientRect();
      const graphPoint = screenToGraphPoint(e.clientX - rect.left, e.clientY - rect.top);
      const target = resolveClickTarget(graphPoint.x, graphPoint.y, view);
      if (target) selectNode(view, target.id);
      else clearSelection(view);
    }

    function handleLeave() {
      const view = activeView();
      view.hoverId = null;
      view.hoverProximity = 0;
      state.cursorVisible = false;
      cursorEl.style.opacity = '0';
    }

    function handleEnter() {
      state.cursorVisible = true;
    }

    function updateCursor(mx, my, view) {
      state.cursorVisible = true;
      cursorEl.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
      const proximity = view.hoverProximity || 0;
      const idleFade = 1 - state.renderedIdleness * 0.65;
      const baseOpacity = 0.18 + proximity * 0.54;
      const recedeFactor = proximity > 0.7 ? 1 - ((proximity - 0.7) / 0.3) * 0.35 : 1;
      const sizePx = 6 - proximity * 2;
      cursorEl.style.opacity = (baseOpacity * recedeFactor * idleFade).toFixed(3);
      cursorEl.style.width = `${sizePx.toFixed(1)}px`;
      cursorEl.style.height = `${sizePx.toFixed(1)}px`;
    }

    function switchView(viewKey) {
      if (viewKey !== 'A' && viewKey !== 'B') return;
      state.currentView = viewKey;
      canvasA.style.display = viewKey === 'A' ? 'block' : 'none';
      canvasB.style.display = viewKey === 'B' ? 'block' : 'none';
      toggleEl.textContent = viewKey === 'A' ? 'Inquiries + Concepts' : 'Concepts';
      otherView().hoverId = null;
      otherView().hoverProximity = 0;
      const view = activeView();
      if (!view.hasShown) {
        startIntro(view);
        view.hasShown = true;
      }
      if (view.selectedId) setInfoForView(view);
      else {
        infoEl.style.opacity = '0';
        root.classList.remove('is-selected');
      }
    }

    function drawBackground(view) {
      const ctx = view.ctx;
      ctx.fillStyle = view.P.colorBg;
      ctx.fillRect(0, 0, state.W, state.H);
      const g = ctx.createRadialGradient(state.cx, state.cy, 0, state.cx, state.cy, Math.max(state.W, state.H) * 0.66);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, rgba('#000000', view.P.vigStrength));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, state.W, state.H);
    }

    function drawRingsA() {
      const ring = viewA.P.ringOpacity * (1 - state.renderedIdleness);
      if (ring <= 0) return;
      const ctx = viewA.ctx;
      ctx.save();
      ctx.setLineDash([2, 12]);
      ctx.strokeStyle = rgba('#ffffff', ring);
      ctx.lineWidth = 1;
      [viewA.P.innerRFrac, viewA.P.outerRFrac].forEach(frac => {
        ctx.beginPath();
        ctx.arc(state.cx, state.cy, graphRadius(frac), 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();
    }

    function drawRingB() {
      const ring = viewB.P.ringOpacity * (1 - state.renderedIdleness);
      if (ring <= 0) return;
      const ctx = viewB.ctx;
      ctx.save();
      ctx.setLineDash([2, 12]);
      ctx.strokeStyle = rgba('#ffffff', ring);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(state.cx, state.cy, graphRadius(viewB.P.outerRFrac), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    function drawPath(ctx, path, progress) {
      const p = progress >= 1 ? path : partialQuadratic(path, progress);
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.quadraticCurveTo(p.cpx, p.cpy, p.x2, p.y2);
      ctx.stroke();
    }

    function drawEdgesA() {
      const ctx = viewA.ctx;
      const idleEdgeFactor = 1 - state.renderedIdleness * 0.48;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      viewA.edges.forEach((edge, idx) => {
        let alpha = (viewA.P.edgeAlpha + Math.sin(viewA.frame * 0.008 + idx * 0.3) * viewA.P.edgeAlpha * 0.2) * idleEdgeFactor;
        let width = viewA.P.edgeWidth;
        const hasSelection = viewA.selectedId || (viewA.selectionTransition.active && viewA.selectionTransition.phase === 'out');
        if (hasSelection) {
          const ripple = getRippleProgress(viewA, edge, idx);
          if (viewA.activeEdgeSet.has(idx) || (viewA.selectionTransition.active && viewA.selectionTransition.phase === 'out')) {
            const targetAlpha = Math.min(0.7, alpha * 5.5);
            alpha += (targetAlpha - alpha) * ripple;
            width += (viewA.P.edgeWidth * 2 - width) * ripple;
          } else {
            const prevFade = getPrevFadeProgress(viewA, idx);
            if (prevFade > 0) {
              const targetAlpha = Math.min(0.7, alpha * 5.5);
              alpha += (targetAlpha - alpha) * prevFade;
              width += (viewA.P.edgeWidth * 2 - width) * prevFade;
            } else {
              const dimProgress = viewA.selectionTransition.active && viewA.selectionTransition.phase === 'in'
                ? easeOutCubic(clamp01((performance.now() - viewA.selectionTransition.startTime) / viewA.selectionTransition.duration))
                : 1;
              alpha *= (1 - 0.78 * dimProgress);
              width *= (1 - 0.30 * dimProgress);
            }
          }
        }
        if (!viewA.selectedId && viewA.hoverId && (edge.from === viewA.hoverId || edge.to === viewA.hoverId)) {
          const hn = viewA.nodes[viewA.hoverId];
          alpha = hn && hn.type === 'person'
            ? alpha + PERSON_HOVER_EDGE_ALPHA_BOOST * viewA.hoverProximity
            : alpha * (1 + (HOVER_EDGE_BOOST - 1) * viewA.hoverProximity);
        }
        const progress = introEdgeProgress(viewA, idx);
        if (progress <= 0) return;
        ctx.strokeStyle = rgba(viewA.P.colorEdge, alpha);
        ctx.lineWidth = width;
        drawPath(ctx, edge.path, progress);
      });
      ctx.restore();
    }

    function drawEdgesB() {
      const ctx = viewB.ctx;
      const idleEdgeFactor = 1 - state.renderedIdleness * 0.48;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      viewB.edges.forEach((edge, idx) => {
        let alpha = (viewB.P.edgeAlpha + Math.sin(viewB.frame * 0.008 + idx * 0.3) * viewB.P.edgeAlpha * 0.2) * idleEdgeFactor;
        let width = viewB.P.edgeWidth * edge.shared * viewB.P.sharedWeightScale;
        const hasSelection = viewB.selectedId || (viewB.selectionTransition.active && viewB.selectionTransition.phase === 'out');
        if (hasSelection) {
          const ripple = getRippleProgress(viewB, edge, idx);
          if (viewB.activeEdgeSet.has(idx) || (viewB.selectionTransition.active && viewB.selectionTransition.phase === 'out')) {
            const targetAlpha = Math.min(0.72, alpha * 4.8);
            alpha += (targetAlpha - alpha) * ripple;
            width += (viewB.P.edgeWidth * edge.shared * viewB.P.sharedWeightScale * 1.55 - width) * ripple;
          } else {
            const prevFade = getPrevFadeProgress(viewB, idx);
            if (prevFade > 0) {
              const targetAlpha = Math.min(0.72, alpha * 4.8);
              alpha += (targetAlpha - alpha) * prevFade;
              width += (viewB.P.edgeWidth * edge.shared * viewB.P.sharedWeightScale * 1.55 - width) * prevFade;
            } else {
              const dimProgress = viewB.selectionTransition.active && viewB.selectionTransition.phase === 'in'
                ? easeOutCubic(clamp01((performance.now() - viewB.selectionTransition.startTime) / viewB.selectionTransition.duration))
                : 1;
              alpha *= (1 - 0.82 * dimProgress);
              width *= (1 - 0.30 * dimProgress);
            }
          }
        }
        if (!viewB.selectedId && viewB.hoverId && (edge.from === viewB.hoverId || edge.to === viewB.hoverId)) {
          alpha = alpha * (1 + (HOVER_EDGE_BOOST - 1) * viewB.hoverProximity);
        }
        const progress = introEdgeProgress(viewB, idx);
        if (progress <= 0) return;
        ctx.strokeStyle = rgba(viewB.P.colorEdge, alpha);
        ctx.lineWidth = width;
        drawPath(ctx, edge.path, progress);
      });
      ctx.restore();
    }

    function drawParticles(view) {
      const ctx = view.ctx;
      ctx.save();
      for (let i = view.particles.length - 1; i >= 0; i--) {
        const p = view.particles[i];
        p.t += p.speed;
        if (p.t > 1) p.t -= 1;
        if (p.t < 0) p.t += 1;
        p.life -= p.decay;
        if (p.life <= 0) {
          view.particles.splice(i, 1);
          continue;
        }
        const isBurst = !!p.isBurst;
        const active = view.selectedId && view.activeEdgeSet.has(p.edgeIndex);
        const alpha = isBurst ? p.life : (view.selectedId ? (active ? p.life * 0.9 : 0.04) : p.life * 0.48);
        const [x, y] = pointOnPath(p.edge.path, p.t);
        ctx.fillStyle = rgba(view.P.colorParticle, alpha);
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawGlow(ctx, n, radius, color) {
      if (!n || radius <= 0) return;
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius);
      g.addColorStop(0, rgba(color, 0.14));
      g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function nodeAlpha(view, id) {
      if (!view.selectedId) return 0.78;
      if (view.activeNodeIds.has(id) || id === view.selectedId || id === view.hoverId) return 1;
      return 0.10;
    }

    function drawNodesA() {
      const ctx = viewA.ctx;
      ctx.save();
      if (viewA.selectedId) viewA.activeNodeIds.forEach(id => drawGlow(ctx, viewA.nodes[id], viewA.P.glowRadius, viewA.P.colorPerson));
      if (viewA.hoverId && !viewA.selectedId) drawGlow(ctx, viewA.nodes[viewA.hoverId], viewA.P.glowRadius * 0.5 * viewA.hoverProximity, viewA.P.colorPerson);
      PEOPLE.forEach(p => {
        const n = viewA.nodes[p.id];
        const prox = viewA.hoverId === p.id ? viewA.hoverProximity : 0;
        const r = nodeRadius(viewA.P.personNodeR) * (1 + (HOVER_MAX_SCALE - 1) * prox);
        ctx.fillStyle = rgba(viewA.P.colorPerson, nodeAlpha(viewA, p.id) * introNodeAlpha(viewA, p.id));
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      topics.forEach(t => {
        const n = viewA.nodes[t.id];
        const prox = viewA.hoverId === t.id ? viewA.hoverProximity : 0;
        const r = nodeRadius(viewA.P.topicNodeR) * (1 + (HOVER_MAX_SCALE - 1) * prox);
        ctx.fillStyle = rgba(viewA.P.colorPerson, nodeAlpha(viewA, t.id) * 0.52 * introNodeAlpha(viewA, t.id));
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawNodesB() {
      const ctx = viewB.ctx;
      ctx.save();
      if (viewB.selectedId) viewB.activeNodeIds.forEach(id => drawGlow(ctx, viewB.nodes[id], viewB.P.glowRadius, viewB.P.colorEdge));
      if (viewB.hoverId && !viewB.selectedId) drawGlow(ctx, viewB.nodes[viewB.hoverId], viewB.P.glowRadius * 0.5 * viewB.hoverProximity, viewB.P.colorEdge);
      topics.forEach(t => {
        const n = viewB.nodes[t.id];
        const prox = viewB.hoverId === t.id ? viewB.hoverProximity : 0;
        const r = nodeRadius(viewB.P.topicNodeR) * (1 + (HOVER_MAX_SCALE - 1) * prox);
        ctx.fillStyle = rgba(viewB.P.colorEdge, nodeAlpha(viewB, t.id) * 0.58 * introNodeAlpha(viewB, t.id));
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function labelGeometry(node, text, fontSize, offset, radius, selected, neighborShift, options = {}) {
      let angle = node.angle;
      let rot = angle;
      let align = 'left';
      const rightSide = Math.cos(angle) >= 0;
      if (!rightSide) {
        rot = angle + Math.PI;
        align = 'right';
      }
      if (options.centerAlign) align = 'center';
      const selectedOffset = selected ? SELECTED_LABEL_OFFSET_BOOST : 0;
      const labelR = offset + radius + selectedOffset + neighborShift;
      const x = node.x + Math.cos(angle) * labelR;
      const y = node.y + Math.sin(angle) * labelR;
      const lines = options.lines || splitLabel(text);
      const lineHeight = fontSize * (lines.length > 1 ? (options.lineHeightRatio || 1.1) : 1.4);
      return { x, y, rot, align, lines, lineHeight };
    }

    function drawRotatedLabel(ctx, view, node, text, fontSize, color, alpha, offset, radius, options = {}) {
      if (alpha <= 0 || !node) return;
      const selected = options.selected || node.id === view.selectedId;
      const fontWeight = options.weight || (selected ? 300 + SELECTED_LABEL_WEIGHT_BOOST : 300);
      const boost = selected ? SELECTED_LABEL_FONT_BOOST : 0;
      const size = fontSize + boost;
      const neighborShift = options.neighborShift || 0;
      const geo = labelGeometry(node, text, size, offset, radius, selected, neighborShift, options);
      ctx.save();
      ctx.translate(geo.x, geo.y);
      ctx.rotate(geo.rot);
      ctx.textAlign = geo.align;
      ctx.textBaseline = 'middle';
      ctx.font = `${fontWeight} ${size}px ${CANVAS_LABEL_FONT_STACK}`;
      ctx.fillStyle = rgba(color, alpha);
      const totalH = (geo.lines.length - 1) * geo.lineHeight;
      geo.lines.forEach((line, i) => ctx.fillText(line, 0, i * geo.lineHeight - totalH / 2));
      const widths = geo.lines.map(line => ctx.measureText(line).width);
      const boxW = Math.max(...widths, 1);
      const boxH = Math.max(geo.lineHeight, geo.lines.length * geo.lineHeight);
      view.labelBoxes.push({ node, cx: geo.x, cy: geo.y, rot: geo.rot, w: boxW, h: boxH });
      ctx.restore();
    }

    function neighborLabelShift(view, node) {
      if (!view.selectedId || node.id === view.selectedId) return 0;
      const sel = view.nodes[view.selectedId];
      if (!sel || Math.abs(node.angle - sel.angle) > SELECTED_LABEL_NEIGHBOR_RANGE) return 0;
      const dir = node.angle > sel.angle ? 1 : -1;
      return dir * SELECTED_LABEL_NEIGHBOR_SHIFT;
    }

    function drawLabelsA() {
      const ctx = viewA.ctx;
      viewA.labelBoxes = [];
      const useMobilePersonLabels = state.W <= MOBILE_LAYOUT_BREAKPOINT;
      const personLabelOffset = useMobilePersonLabels
        ? viewA.P.labelOffset + MOBILE_PERSON_LABEL_OFFSET_BOOST
        : viewA.P.labelOffset;
      PEOPLE.forEach(p => {
        const n = viewA.nodes[p.id];
        let alpha = viewA.selectedId ? (viewA.activeNodeIds.has(p.id) ? viewA.P.labelAlpha * 1.45 : viewA.P.labelAlpha * 0.18) : viewA.P.labelAlpha;
        if (viewA.hoverId === p.id) alpha = Math.max(alpha, viewA.P.labelAlpha * (1.35 + viewA.hoverProximity * 0.35));
        drawRotatedLabel(ctx, viewA, n, p.name, viewA.P.fontPerson, viewA.P.colorLabelP, alpha * (1 - state.renderedIdleness) * introNodeAlpha(viewA, p.id), personLabelOffset, viewA.P.personNodeR, {
          centerAlign: useMobilePersonLabels,
          lineHeightRatio: 1.08,
          lines: useMobilePersonLabels ? p.name.split(/\s+/) : null,
          weight: p.id === viewA.selectedId ? PERSON_LABEL_WEIGHT + SELECTED_LABEL_WEIGHT_BOOST : PERSON_LABEL_WEIGHT,
        });
      });
      topicOrder.forEach(t => {
        const n = viewA.nodes[t.id];
        let alpha = viewA.P.labelAlpha * 0.42;
        if (viewA.selectedId) alpha = viewA.activeNodeIds.has(t.id) ? viewA.P.labelAlpha * 1.6 : (viewA.hoverId === t.id ? viewA.P.labelAlpha * 0.95 : 0);
        if (viewA.hoverId === t.id) alpha = Math.max(alpha, viewA.P.labelAlpha * (0.7 + viewA.hoverProximity * 0.7));
        const selected = t.id === viewA.selectedId;
        const color = selected ? SELECTED_TOPIC_LABEL_COLOR : viewA.P.colorLabelT;
        drawRotatedLabel(ctx, viewA, n, t.label, viewA.P.fontTopic, color, alpha * (1 - state.renderedIdleness) * introNodeAlpha(viewA, t.id), viewA.P.labelOffset, viewA.P.topicNodeR, {
          selected,
          neighborShift: neighborLabelShift(viewA, n),
        });
      });
    }

    function drawLabelsB() {
      const ctx = viewB.ctx;
      viewB.labelBoxes = [];
      topicOrder.forEach(t => {
        const n = viewB.nodes[t.id];
        let alpha = viewB.P.labelAlpha * 0.42;
        if (viewB.selectedId) alpha = viewB.activeNodeIds.has(t.id) ? viewB.P.labelAlpha * 1.6 : (viewB.hoverId === t.id ? viewB.P.labelAlpha * 0.95 : 0);
        if (viewB.hoverId === t.id) alpha = Math.max(alpha, viewB.P.labelAlpha * (0.7 + viewB.hoverProximity * 0.7));
        const selected = t.id === viewB.selectedId;
        const color = selected ? SELECTED_TOPIC_LABEL_COLOR : viewB.P.colorLabelT;
        drawRotatedLabel(ctx, viewB, n, t.label, viewB.P.fontTopic, color, alpha * (1 - state.renderedIdleness) * introNodeAlpha(viewB, t.id), viewB.P.labelOffset, viewB.P.topicNodeR, {
          selected,
          neighborShift: neighborLabelShift(viewB, n),
        });
      });
    }

    function drawView(view) {
      view.frame++;
      tickIdleness();
      updateIntro(view);
      updateSelectionTransition(view);
      drawBackground(view);
      const ctx = view.ctx;
      ctx.save();
      ctx.translate(state.cx, state.cy);
      ctx.scale(state.viewScale, state.viewScale);
      ctx.translate(-state.cx, -state.cy);
      if (view.key === 'A') {
        drawRingsA();
        drawEdgesA();
        drawParticles(viewA);
        drawNodesA();
        drawLabelsA();
      } else {
        drawRingB();
        drawEdgesB();
        drawParticles(viewB);
        drawNodesB();
        drawLabelsB();
      }
      ctx.restore();
      spawnParticles(view);
    }

    function loop() {
      if (state.destroyed) return;
      drawView(activeView());
      state.rafId = requestAnimationFrame(loop);
    }

    function onToggle() {
      state.lastActivity = performance.now();
      switchView(state.currentView === 'A' ? 'B' : 'A');
    }

    function onToggleKey(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    }

    [canvasA, canvasB].forEach(canvas => {
      canvas.addEventListener('mousemove', handleMove);
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('mouseenter', handleEnter);
      canvas.addEventListener('mouseleave', handleLeave);
    });
    toggleEl.addEventListener('click', onToggle);
    toggleEl.addEventListener('keydown', onToggleKey);

    if ('ResizeObserver' in window) {
      state.resizeObserver = new ResizeObserver(resize);
      state.resizeObserver.observe(root);
    } else {
      window.addEventListener('resize', resize);
    }

    resize();
    switchView(state.currentView);
    loop();

    return {
      switchView,
      resize,
      setScale(scale = 1) {
        state.viewScale = Math.max(0.75, Math.min(1.3, scale));
      },
      destroy() {
        state.destroyed = true;
        if (state.rafId) cancelAnimationFrame(state.rafId);
        if (state.resizeObserver) state.resizeObserver.disconnect();
        else window.removeEventListener('resize', resize);
        [canvasA, canvasB].forEach(canvas => {
          canvas.removeEventListener('mousemove', handleMove);
          canvas.removeEventListener('click', handleClick);
          canvas.removeEventListener('mouseenter', handleEnter);
          canvas.removeEventListener('mouseleave', handleLeave);
        });
        toggleEl.removeEventListener('click', onToggle);
        toggleEl.removeEventListener('keydown', onToggleKey);
        root.innerHTML = '';
        root.classList.remove('constellation-embed', 'is-selected');
      },
    };
  }
