/*  CLAO — Cognition Layer for Autonomous Organizations
 *  A dependency-free, framework-agnostic animated agent web component.
 *  Semi-organic sentient intelligence: inner cognitive core, soft deforming shell,
 *  orbital satellites, expressive minimal face, 6-state finite machine.
 *
 *  ── USAGE ────────────────────────────────────────────────────────────────
 *  <clao-agent mood="thinking" confidence="80" interactive></clao-agent>
 *
 *  const c = document.querySelector('clao-agent');
 *  c.setMood('warning');                        // observing|thinking|explaining|warning|success|dispute
 *  c.setLevels({ confidence:92, risk:12, energy:60 });
 *  c.speaking = true;
 *  c.addEventListener('clao-action', e => …);   // tap-to-ask  (e.detail.id)
 *  c.addEventListener('clao-tap',    e => …);
 *  c.addEventListener('clao-state',  e => …);   // (e.detail.mood / e.detail.rive)
 *
 *  Rive-compatible state inputs:
 *    Boolean: mood_idle, mood_thinking, mood_warning, mood_success, mood_dispute, mood_explaining, speaking, hover_reaction
 *    Numeric: confidence_level (0–100), risk_level (0–100), energy_level (0–100)
 *  ──────────────────────────────────────────────────────────────────────── */

(function () {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const lc    = (a, b, t) => [lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t)];
  const rgba  = (c, a) => `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;

  const MOODS = {
    observing:  { bright:.52, orbit:.45, shake:0,   squashY:0,    col:[124,99,255],  col2:[34,211,238],  narrow:0,   wide:0,   happy:.18, worry:0,  speaking:0, split:0, particle:'ambient', lv:{confidence:74,risk:8, energy:34}, dot:'#7c63ff' },
    thinking:   { bright:.80, orbit:1.05,shake:.04, squashY:-.07, col:[139,92,246],  col2:[34,211,238],  narrow:.72, wide:0,   happy:0,   worry:0,  speaking:0, split:0, particle:'inward',  lv:{confidence:58,risk:14,energy:62}, dot:'#9b7bff' },
    explaining: { bright:.74, orbit:.60, shake:0,   squashY:.02,  col:[34,211,238],  col2:[124,99,255],  narrow:0,   wide:.10, happy:.26, worry:0,  speaking:1, split:0, particle:'ambient', lv:{confidence:70,risk:10,energy:46}, dot:'#22d3ee' },
    warning:    { bright:.90, orbit:1.50,shake:.50, squashY:.04,  col:[251,146,60],  col2:[251,176,96],  narrow:0,   wide:.70, happy:0,   worry:.8, speaking:0, split:0, particle:'spike',   lv:{confidence:44,risk:80,energy:78}, dot:'#ff9a4d' },
    success:    { bright:1.0, orbit:.78, shake:0,   squashY:0,    col:[52,211,153],  col2:[34,211,238],  narrow:0,   wide:0,   happy:1,   worry:0,  speaking:0, split:0, particle:'burst',   lv:{confidence:96,risk:4, energy:58}, dot:'#34d399' },
    dispute:    { bright:.92, orbit:1.70,shake:.34, squashY:0,    col:[244,63,94],   col2:[34,211,238],  narrow:.32, wide:.30, happy:0,   worry:.3, speaking:0, split:1, particle:'ambient', lv:{confidence:36,risk:60,energy:88}, dot:'#f43f5e' },
  };

  const ACTIONS = [
    { id:'explain',   label:'Explain proposal',  dot:'#22d3ee', mood:'explaining' },
    { id:'simulate',  label:'Simulate outcome',  dot:'#9b7bff', mood:'thinking'   },
    { id:'precedent', label:'Show precedents',   dot:'#7c63ff', mood:'thinking'   },
    { id:'risk',      label:'Analyze risk',      dot:'#ff9a4d', mood:'warning'    },
  ];

  class ClaoAgent extends HTMLElement {
    static get observedAttributes() { return ['mood','confidence','risk','energy','speaking','interactive','ambient']; }

    constructor() {
      super();
      this._mood = 'observing';
      this._lv = { ...MOODS.observing.lv };
      this._speaking = false;
      this._interactive = false;
      this._ambient = false;
      this._expanded = false;
      this.mouse = { x: .5, y: .42 };
      this.gaze = { x: 0, y: 0 };
      this.driftX = 0; this.driftY = 0;
      this.hoverAmt = 0; this.hoverTarget = 0;
      this.blinkT = 1.5 + Math.random() * 2;
      this.blink = 0;
      this.pulses = [];
      this.particles = [];
      this.spawnAcc = 0;
      this.pulseAcc = 0;
      this.pulseEnv = 0;
      this.flick = 0;
      const m = MOODS.observing;
      this.cur = { bright:m.bright, orbit:m.orbit, shake:m.shake, squashY:m.squashY,
        narrow:m.narrow, wide:m.wide, happy:m.happy, worry:m.worry, speaking:0, split:0,
        col:[...m.col], col2:[...m.col2],
        confidence:m.lv.confidence, risk:m.lv.risk, energy:m.lv.energy };
      // orbital satellites
      this.sats = [];
      for (let i = 0; i < 10; i++) {
        this.sats.push({
          a: .78 + (i % 5) * .16 + Math.random() * .08,
          b: .30 + (i % 3) * .12,
          tilt: (i * .62) % Math.PI,
          phase: Math.random() * Math.PI * 2,
          speed: .5 + (i % 4) * .18,
          size: 1.6 + Math.random() * 1.8,
          hue: i % 2,
          branch: i % 2 === 0 ? 1 : -1,
        });
      }
    }

    // ── lifecycle ────────────────────────────────────────────────────────
    connectedCallback() {
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `<style>
        :host{display:block;position:relative;width:100%;height:100%;contain:layout style;-webkit-user-select:none;user-select:none}
        canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
        .ring{position:absolute;inset:0;pointer-events:none;z-index:2}
        .chip{position:absolute;transform:translate(-50%,-50%) scale(.5);opacity:0;pointer-events:auto;cursor:pointer;
          display:flex;align-items:center;gap:8px;white-space:nowrap;padding:8px 14px;border-radius:999px;
          border:1px solid rgba(150,135,255,.32);background:rgba(15,17,38,.86);backdrop-filter:blur(14px);
          color:#e6e8ff;font:500 12px/1 'Space Grotesk',system-ui,sans-serif;letter-spacing:.01em;
          box-shadow:0 10px 30px -8px rgba(110,90,255,.5);transition:opacity .26s ease, transform .3s cubic-bezier(.2,1.4,.4,1)}
        .chip.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
        .chip i{width:6px;height:6px;border-radius:50%}
      </style><canvas></canvas><div class="ring"></div>`;
      this.canvas = root.querySelector('canvas');
      this.ringEl = root.querySelector('.ring');
      this.ctx = this.canvas.getContext('2d');

      ['mood','confidence','risk','energy','speaking','interactive','ambient'].forEach(a => {
        if (this.hasAttribute(a)) this.attributeChangedCallback(a, null, this.getAttribute(a));
      });
      this.buildRing();

      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this);
      this._onMove = e => this.onMove(e);
      this._onLeave = () => { this.hoverTarget = 0; this.mouse = { x: .5, y: .42 }; };
      this._onTap = e => this.onTap(e);
      this.addEventListener('pointermove', this._onMove);
      this.addEventListener('pointerleave', this._onLeave);
      this.addEventListener('click', this._onTap);

      this.t0 = performance.now();
      this.last = this.t0;
      this.resize();
      this.raf = requestAnimationFrame(this.frame);
    }
    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      this.ro && this.ro.disconnect();
      this.removeEventListener('pointermove', this._onMove);
      this.removeEventListener('pointerleave', this._onLeave);
      this.removeEventListener('click', this._onTap);
    }
    attributeChangedCallback(name, _o, v) {
      if (name === 'mood') this.setMood(v || 'observing');
      else if (name === 'confidence' || name === 'risk' || name === 'energy') this.setLevels({ [name]: +v });
      else if (name === 'speaking') this._speaking = v !== null && v !== 'false';
      else if (name === 'interactive') this._interactive = v !== null && v !== 'false';
      else if (name === 'ambient') this._ambient = v !== null && v !== 'false';
    }

    // ── public API ───────────────────────────────────────────────────────
    setMood(name) {
      if (!MOODS[name]) return;
      const prev = this._mood;
      this._mood = name;
      this._lv = { ...MOODS[name].lv };
      if (name === 'success' && prev !== 'success') { this.pulseEnv = 1; this.burst(); }
      this.dispatchEvent(new CustomEvent('clao-state', { detail: { mood: name, rive: 'mood_' + (name === 'observing' ? 'idle' : name) } }));
    }
    setLevels(o) {
      if (o.confidence != null) this._lv.confidence = clamp(+o.confidence, 0, 100);
      if (o.risk != null)       this._lv.risk = clamp(+o.risk, 0, 100);
      if (o.energy != null)     this._lv.energy = clamp(+o.energy, 0, 100);
    }
    get mood() { return this._mood; }
    set mood(v) { this.setMood(v); }
    set speaking(v) { this._speaking = !!v; }
    get speaking() { return this._speaking; }
    set interactive(v) { this._interactive = !!v; }

    // ── interaction ──────────────────────────────────────────────────────
    onMove(e) {
      if (!this._interactive) return;
      const r = this.getBoundingClientRect();
      this.mouse = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
      const dx = e.clientX - r.left - this.cx, dy = e.clientY - r.top - this.cy;
      this.hoverTarget = Math.hypot(dx, dy) < this.R * 1.7 ? 1 : 0;
    }
    onTap(e) {
      if (!this._interactive) return;
      const r = this.getBoundingClientRect();
      const dx = e.clientX - r.left - this.cx, dy = e.clientY - r.top - this.cy;
      if (Math.hypot(dx, dy) < this.R * 1.7) {
        this._expanded = !this._expanded;
        this.layoutRing();
        this.dispatchEvent(new CustomEvent('clao-tap', { detail: { expanded: this._expanded } }));
      }
    }
    buildRing() {
      this.chips = ACTIONS.map(a => {
        const el = document.createElement('button');
        el.className = 'chip';
        el.innerHTML = `<i style="background:${a.dot};box-shadow:0 0 8px ${a.dot}"></i>${a.label}`;
        el.addEventListener('click', ev => {
          ev.stopPropagation();
          this._expanded = false; this.layoutRing();
          this.setMood(a.mood);
          this.dispatchEvent(new CustomEvent('clao-action', { detail: { id: a.id, mood: a.mood } }));
        });
        this.ringEl.appendChild(el);
        return el;
      });
    }
    layoutRing() {
      const n = this.chips.length, R = this.R * 2.15;
      this.chips.forEach((el, i) => {
        const ang = -Math.PI / 2 + (i - (n - 1) / 2) * 0.62;
        el.style.left = (this.cx + Math.cos(ang) * R) + 'px';
        el.style.top = (this.cy + Math.sin(ang) * R * .82 - this.R * .2) + 'px';
        el.style.transitionDelay = (this._expanded ? i * .04 : 0) + 's';
        el.classList.toggle('on', this._expanded);
      });
    }

    resize() {
      const r = this.getBoundingClientRect();
      this.W = r.width || 1; this.H = r.height || 1;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = this.W * this.dpr;
      this.canvas.height = this.H * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.R = clamp(Math.min(this.W, this.H) * 0.17, 40, 150);
      this.cx = this.W / 2;
      this.cy = this.H * 0.46;
      this.layoutRing();
    }

    // ── particles ────────────────────────────────────────────────────────
    burst() {
      for (let i = 0; i < 46; i++) {
        const a = Math.random() * Math.PI * 2, s = 1.4 + Math.random() * 3.2;
        this.particles.push({ x: this.cx, y: this.cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: 0, max: .7 + Math.random() * .6, size: 1 + Math.random() * 2,
          col: Math.random() < .5 ? [52,211,153] : [34,211,238], mode: 'out' });
      }
    }
    spawn(mode, dt, col) {
      this.spawnAcc += dt;
      const rate = mode === 'inward' ? .018 : mode === 'spike' ? .05 : .07;
      while (this.spawnAcc > rate) {
        this.spawnAcc -= rate;
        const a = Math.random() * Math.PI * 2;
        if (mode === 'inward') {
          const rr = this.R * (2 + Math.random());
          this.particles.push({ x: this.cx + Math.cos(a) * rr, y: this.cy + Math.sin(a) * rr,
            ang: a, rad: rr, life: 0, max: 1.4, size: 1 + Math.random() * 1.6, col, mode: 'in' });
        } else if (mode === 'spike') {
          const s = 3 + Math.random() * 3;
          this.particles.push({ x: this.cx, y: this.cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            life: 0, max: .5, size: 1 + Math.random() * 1.4, col, mode: 'out' });
        } else {
          const rr = this.R * (1.3 + Math.random() * 1.6);
          this.particles.push({ x: this.cx + Math.cos(a) * rr, y: this.cy + Math.sin(a) * rr,
            vx: (Math.random() - .5) * .2, vy: -.1 - Math.random() * .2, life: 0, max: 2 + Math.random() * 2,
            size: .8 + Math.random() * 1.2, col, mode: 'drift' });
        }
      }
    }

    // ── main loop ────────────────────────────────────────────────────────
    frame = (now) => {
      this.raf = requestAnimationFrame(this.frame);
      const dt = Math.min(.05, (now - this.last) / 1000); this.last = now;
      const t = (now - this.t0) / 1000;
      const ctx = this.ctx; if (!ctx) return;

      // ease toward target mood
      const m = MOODS[this._mood];
      const k = 1 - Math.pow(.0009, dt);
      const c = this.cur;
      c.bright  = lerp(c.bright, m.bright, k);
      c.orbit   = lerp(c.orbit, m.orbit, k);
      c.shake   = lerp(c.shake, m.shake, k);
      c.squashY = lerp(c.squashY, m.squashY, k);
      c.narrow  = lerp(c.narrow, m.narrow, k);
      c.wide    = lerp(c.wide, m.wide, k);
      c.happy   = lerp(c.happy, m.happy, k);
      c.worry   = lerp(c.worry, m.worry || 0, k);
      c.speaking= lerp(c.speaking, (this._speaking || m.speaking) ? 1 : 0, k);
      c.split   = lerp(c.split, m.split, k);
      c.col     = lc(c.col, m.col, k);
      c.col2    = lc(c.col2, m.col2, k);
      c.confidence = lerp(c.confidence, this._lv.confidence, k * .8);
      c.risk       = lerp(c.risk, this._lv.risk, k * .8);
      c.energy     = lerp(c.energy, this._lv.energy, k * .8);
      this.hoverAmt = lerp(this.hoverAmt, (this._interactive && this.hoverTarget) ? 1 : 0, k);
      this.pulseEnv = Math.max(0, this.pulseEnv - dt * 1.6);

      const e01 = c.energy / 100, r01 = c.risk / 100, cf01 = c.confidence / 100;
      const col = lc(c.col, [251, 96, 70], clamp(r01 - .35, 0, .65) * .55);
      const col2 = c.col2;
      const orbitSpeed = c.orbit * (.5 + e01 * 1.0);
      const brightEff = clamp(c.bright * (.62 + .55 * cf01) + this.hoverAmt * .12 + this.pulseEnv * .4, 0, 1.6);
      const shakeEff = c.shake * (.4 + r01);

      // gaze + drift
      const tgx = this._interactive ? clamp((this.mouse.x - .5) * 2, -1, 1) : Math.sin(t * .5) * .35;
      const tgy = this._interactive ? clamp((this.mouse.y - .46) * 2, -1, 1) : Math.sin(t * .37) * .25;
      this.gaze.x = lerp(this.gaze.x, tgx, k * .6);
      this.gaze.y = lerp(this.gaze.y, tgy, k * .6);
      this.driftX = lerp(this.driftX, this._interactive ? (this.mouse.x - .5) * this.R * .5 : 0, k * .3);
      this.driftY = lerp(this.driftY, this._interactive ? (this.mouse.y - .46) * this.R * .35 : 0, k * .3);

      // blink
      this.blinkT -= dt;
      if (this.blinkT <= 0) { this.blink = 1; this.blinkT = 2 + Math.random() * 3.5; }
      this.blink = Math.max(0, this.blink - dt * 7);

      // speech pulses
      if (c.speaking > .5) {
        this.pulseAcc += dt;
        if (this.pulseAcc > .85) { this.pulseAcc = 0; this.pulses.push({ r: this.R * 1.05, a: .5, col: col2 }); }
      }
      this.pulses.forEach(p => { p.r += dt * this.R * 1.6; p.a -= dt * .6; });
      this.pulses = this.pulses.filter(p => p.a > 0);

      const R = this.R;
      const breathe = Math.sin(t * 1.05) * .03;
      const bob = Math.sin(t * .85) * (4 + e01 * 9);
      const cx = this.cx + this.driftX + (shakeEff > .01 ? (Math.random() - .5) * shakeEff * 7 : 0);
      const cy = this.cy + bob + this.driftY;

      ctx.clearRect(0, 0, this.W, this.H);
      ctx.save();

      if (this._ambient) this.drawAmbient(t);

      // ground aura
      ctx.globalCompositeOperation = 'lighter';
      let ga = ctx.createRadialGradient(cx, cy + R * 1.55, 0, cx, cy + R * 1.55, R * 2.4);
      ga.addColorStop(0, rgba(col, .22 + this.pulseEnv * .2));
      ga.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = ga;
      ctx.save(); ctx.translate(cx, cy + R * 1.55); ctx.scale(1, .32);
      ctx.beginPath(); ctx.arc(0, 0, R * 2.4, 0, 7); ctx.fill(); ctx.restore();

      // satellites
      const sats = this.sats.map(s => {
        const sp = c.split;
        const tilt = s.tilt + sp * s.branch * .5;
        const ang = t * orbitSpeed * s.speed + s.phase;
        const px = Math.cos(ang) * s.a * R * (1.7 + sp * s.branch * .25);
        const py = Math.sin(ang) * s.b * R * 1.7;
        const rx = px * Math.cos(tilt) - py * Math.sin(tilt);
        const ry = px * Math.sin(tilt) + py * Math.cos(tilt);
        const depth = Math.sin(ang);
        let sc = sp > .2 ? (s.hue ? col2 : [244, 63, 94]) : (s.hue ? col2 : col);
        return { x: cx + rx, y: cy + ry * .62, depth, size: s.size, col: sc, ang };
      });

      this.spawn(m.particle, dt, col2);
      this.drawSats(sats.filter(s => s.depth < 0), .55);
      this.drawParticles(dt, cx, cy, R, col2);

      // ── orb body ──
      ctx.save();
      ctx.translate(cx, cy);
      const stretchY = 1 + breathe + c.squashY + this.pulseEnv * .12;
      const stretchX = 1 - breathe * .6 - c.squashY * .5 + this.pulseEnv * .12 + this.hoverAmt * .03;
      ctx.scale(stretchX, stretchY);

      // soft shell (wobbly translucent)
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      const seg = 56;
      for (let i = 0; i <= seg; i++) {
        const a = i / seg * Math.PI * 2;
        const w = Math.sin(a * 3 + t * 1.5) * .022 + Math.sin(a * 5 - t * 1.1) * .014;
        const rr = R * (1 + w * (.6 + e01));
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      let sg = ctx.createRadialGradient(0, -R * .25, R * .2, 0, 0, R * 1.15);
      sg.addColorStop(0, rgba(col, .16));
      sg.addColorStop(.55, rgba(col, .26));
      sg.addColorStop(1, rgba(col, .04));
      ctx.fillStyle = sg; ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = rgba(col2, .42 + this.hoverAmt * .25);
      ctx.shadowColor = rgba(col2, .6); ctx.shadowBlur = 18;
      ctx.stroke(); ctx.shadowBlur = 0;

      // inner core glow
      ctx.globalCompositeOperation = 'lighter';
      const pulse = 1 + Math.sin(t * 1.8) * .06 + this.pulseEnv * .2;
      let cg = ctx.createRadialGradient(0, -R * .04, 0, 0, -R * .04, R * .92 * pulse);
      cg.addColorStop(0, rgba([255,255,255], .9 * brightEff));
      cg.addColorStop(.18, rgba(col2, .85 * brightEff));
      cg.addColorStop(.5, rgba(col, .5 * brightEff));
      cg.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(0, -R * .04, R * .92 * pulse, 0, 7); ctx.fill();

      // hot nucleus
      let hc = ctx.createRadialGradient(0, -R * .04, 0, 0, -R * .04, R * .34);
      hc.addColorStop(0, rgba([255,255,255], .95 * brightEff));
      hc.addColorStop(1, rgba(col2, 0));
      ctx.fillStyle = hc;
      ctx.beginPath(); ctx.arc(0, -R * .04, R * .34, 0, 7); ctx.fill();

      // neuron filaments
      for (let i = 0; i < 6; i++) {
        const a = t * (.6 + i * .12) + i * 1.05;
        const rr = R * (.2 + (i % 3) * .16);
        const fx = Math.cos(a) * rr, fy = Math.sin(a * 1.3) * rr * .8 - R * .04;
        ctx.fillStyle = rgba([255,255,255], .5 * brightEff);
        ctx.beginPath(); ctx.arc(fx, fy, 1.4, 0, 7); ctx.fill();
      }

      // forehead crystal
      this.drawCrystal(ctx, R, col, col2, brightEff, t);

      // face
      this.drawFace(ctx, R, col2, brightEff);

      ctx.restore(); // orb transform

      // front satellites + dispute branches + speech pulses
      this.drawSats(sats.filter(s => s.depth >= 0), .8);
      if (c.split > .2) this.drawBranches(cx, cy, R, t, col2);
      ctx.globalCompositeOperation = 'lighter';
      this.pulses.forEach(p => {
        ctx.strokeStyle = rgba(p.col, p.a); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy + R * .04, p.r, p.r * .9, 0, 0, 7); ctx.stroke();
      });

      ctx.restore();
    };

    drawCrystal(ctx, R, col, col2, bright, t) {
      const cx = 0, cy = -R * .62;          // forehead position
      const s = R * .18;                     // gem half-size
      const pulse = .85 + Math.sin(t * 2.4) * .15;
      const c = this.cur;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);              // diamond orientation

      // outer glow halo
      ctx.globalCompositeOperation = 'lighter';
      let hg = ctx.createRadialGradient(0, 0, s * .2, 0, 0, s * 3.2);
      hg.addColorStop(0, rgba(col2, .55 * bright * pulse));
      hg.addColorStop(.4, rgba(col, .2 * bright * pulse));
      hg.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.arc(0, 0, s * 3.2, 0, 7); ctx.fill();

      // silver bezel (outer frame)
      ctx.globalCompositeOperation = 'source-over';
      const bz = s * 1.22;
      ctx.fillStyle = 'rgba(200,205,220,.32)';
      ctx.strokeStyle = 'rgba(220,225,240,.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.rect(-bz, -bz, bz * 2, bz * 2);
      ctx.fill(); ctx.stroke();

      // inner bezel step
      const bz2 = s * 1.08;
      ctx.fillStyle = 'rgba(180,190,210,.18)';
      ctx.beginPath(); ctx.rect(-bz2, -bz2, bz2 * 2, bz2 * 2);
      ctx.fill();

      // main gem body — multi-facet gradient
      let gg = ctx.createLinearGradient(-s, -s, s, s);
      gg.addColorStop(0, rgba(lc([220,225,245], col2, .3), .92));
      gg.addColorStop(.3, rgba(lc([240,245,255], col2, .15), .95));
      gg.addColorStop(.5, rgba([255,255,255], .98));
      gg.addColorStop(.7, rgba(lc([210,215,235], col, .2), .92));
      gg.addColorStop(1, rgba(lc([190,195,220], col2, .25), .88));
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.rect(-s, -s, s * 2, s * 2);
      ctx.fill();

      // facet lines (pyramid effect)
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.lineWidth = .8;
      // diagonal facets from center to corners
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(-s, -s);
      ctx.moveTo(0, 0); ctx.lineTo(s, -s);
      ctx.moveTo(0, 0); ctx.lineTo(s, s);
      ctx.moveTo(0, 0); ctx.lineTo(-s, s);
      ctx.stroke();
      // center highlight ridge
      ctx.strokeStyle = 'rgba(255,255,255,.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-s * .15, -s); ctx.lineTo(0, 0); ctx.lineTo(s, -s * .15);
      ctx.stroke();

      // top-left bright facet (light catch)
      ctx.fillStyle = 'rgba(255,255,255,.28)';
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(-s, -s); ctx.lineTo(s, -s); ctx.closePath();
      ctx.fill();

      // specular highlight spot
      ctx.globalCompositeOperation = 'lighter';
      let sp = ctx.createRadialGradient(-s * .2, -s * .3, 0, -s * .2, -s * .3, s * .7);
      sp.addColorStop(0, 'rgba(255,255,255,.85)');
      sp.addColorStop(.4, 'rgba(255,255,255,.2)');
      sp.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sp;
      ctx.beginPath(); ctx.arc(-s * .2, -s * .3, s * .7, 0, 7); ctx.fill();

      // mood-color inner fire
      let mg = ctx.createRadialGradient(0, 0, 0, 0, 0, s * .9);
      mg.addColorStop(0, rgba(col2, .5 * bright * pulse));
      mg.addColorStop(.6, rgba(col, .25 * bright * pulse));
      mg.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = mg;
      ctx.beginPath(); ctx.rect(-s, -s, s * 2, s * 2);
      ctx.fill();

      // edge highlight
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = rgba(lc([255,255,255], col2, .3), .5);
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.rect(-s, -s, s * 2, s * 2);
      ctx.stroke();

      ctx.restore();
    }

    drawFace(ctx, R, eyeCol, bright) {
      const c = this.cur;
      const ex = R * .38, ey = R * .10;
      const gx = this.gaze.x * R * .12, gy = this.gaze.y * R * .09;
      const open = (1 - this.blink) * (1 - c.happy * .55);

      // per-eye dimensions
      for (const side of [-1, 1]) {
        let h = R * .48 * (1 - .55 * c.narrow + .22 * c.wide + this.hoverAmt * .08);
        let w = R * .22 * (1 + .12 * c.wide);
        h *= clamp(open, .06, 1);

        // worry: inner-brow tilt
        const rot = c.worry > .1 ? c.worry * .25 * side : 0;
        const x = side * ex + gx, y = ey + gy;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);

        // glow
        ctx.globalCompositeOperation = 'lighter';
        let g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 2.4);
        g.addColorStop(0, rgba(eyeCol, .55 * bright));
        g.addColorStop(1, rgba(eyeCol, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, w * 2.4, 0, 7); ctx.fill();

        if (c.happy > .5) {
          // ◠‿◠ beaming success eyes — clean arcs + subtle sparkle
          const hBlend = clamp((c.happy - .5) * 2, 0, 1);
          const warmCol = lc(eyeCol, [120, 255, 200], hBlend * .35);

          // subtle glow (much reduced)
          let eg = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 2);
          eg.addColorStop(0, rgba(warmCol, .15 * bright * hBlend));
          eg.addColorStop(1, rgba(warmCol, 0));
          ctx.fillStyle = eg;
          ctx.beginPath(); ctx.arc(0, 0, w * 2, 0, 7); ctx.fill();

          // main arc — clean, no shadow blur
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = rgba(warmCol, .92 * bright);
          ctx.lineWidth = w * .55;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.arc(0, w * .35, w * 1.05, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();

          // thin bright inner line for definition
          ctx.strokeStyle = rgba([255,255,255], .5 * bright);
          ctx.lineWidth = w * .15;
          ctx.beginPath();
          ctx.arc(0, w * .35, w * 1.05, Math.PI * 1.18, Math.PI * 1.82);
          ctx.stroke();

          // cheek blush (subtle)
          ctx.globalCompositeOperation = 'lighter';
          let blush = ctx.createRadialGradient(side * w * .4, w * .9, 0, side * w * .4, w * .9, w * .8);
          blush.addColorStop(0, rgba([255, 180, 200], .12 * hBlend * bright));
          blush.addColorStop(1, rgba([255, 180, 200], 0));
          ctx.fillStyle = blush;
          ctx.beginPath(); ctx.arc(side * w * .4, w * .9, w * .8, 0, 7); ctx.fill();

          // small sparkle
          const sparkT = performance.now() / 1000;
          const spAlpha = (.4 + Math.sin(sparkT * 3.5 + side * 2) * .4) * hBlend * bright;
          ctx.fillStyle = rgba([255, 255, 255], spAlpha * .6);
          const sx = -w * .4, sy = -w * .2, ss = w * (.2 + Math.sin(sparkT * 2.5) * .05);
          ctx.save(); ctx.translate(sx, sy); ctx.rotate(sparkT * 1.2);
          ctx.beginPath();
          ctx.moveTo(0, -ss); ctx.quadraticCurveTo(0, 0, ss, 0);
          ctx.quadraticCurveTo(0, 0, 0, ss); ctx.quadraticCurveTo(0, 0, -ss, 0);
          ctx.quadraticCurveTo(0, 0, 0, -ss);
          ctx.fill(); ctx.restore();
        } else {
          // rounded rect eyes
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = rgba(eyeCol, .96 * bright);
          this.roundRect(ctx, -w / 2, -h / 2, w, h, w / 2);
          ctx.fill();
          // pupil (gaze-following dark notch)
          const px = this.gaze.x * w * .2, py = this.gaze.y * h * .15;
          ctx.fillStyle = rgba([8,10,26], .85);
          ctx.beginPath(); ctx.ellipse(px, py, w * .3, h * .32, 0, 0, 7); ctx.fill();
          // bright highlight
          ctx.fillStyle = rgba([255,255,255], .8 * bright * open);
          this.roundRect(ctx, -w * .26 + px * .5, -h * .34 + py * .5, w * .34, h * .3, w * .17);
          ctx.fill();
        }
        ctx.restore();
      }

      // mouth
      ctx.globalCompositeOperation = 'lighter';
      const my = ey + R * .42, mw = R * .16;
      const speak = c.speaking > .5 ? (.5 + Math.sin(performance.now() / 90) * .5) : 0;
      ctx.strokeStyle = rgba(eyeCol, .8 * bright);
      ctx.lineWidth = R * .035; ctx.lineCap = 'round';
      ctx.beginPath();
      if (speak > .3) {
        ctx.ellipse(0, my, mw * .5, mw * .4 * speak, 0, 0, 7);
      } else if (c.worry > .4) {
        // worried: slight downturned line
        ctx.moveTo(-mw * .5, my + mw * .15);
        ctx.quadraticCurveTo(0, my + mw * .45, mw * .5, my + mw * .15);
      } else if (c.happy > .4) {
        // beaming smile — wide warm upturned arc
        const hBlend = clamp((c.happy - .4) * 1.67, 0, 1);
        const warmCol = lc(eyeCol, [120, 255, 200], hBlend * .4);
        ctx.strokeStyle = rgba(warmCol, .9 * bright);
        ctx.lineWidth = R * (.035 + hBlend * .015);
        ctx.shadowColor = rgba(warmCol, .5); ctx.shadowBlur = R * .06;
        const smileW = mw * (1.1 + hBlend * .5);
        const smileUp = mw * (.7 + hBlend * .6);
        ctx.arc(0, my - smileUp, smileW, Math.PI * (.5 - .32), Math.PI * (.5 + .32));
        ctx.stroke(); ctx.shadowBlur = 0;
      } else {
        const up = .55 + c.happy * .6 - c.wide * .5;
        ctx.arc(0, my - mw * up, mw, Math.PI * (.5 - .28 * up), Math.PI * (.5 + .28 * up));
      }
      ctx.stroke();
    }

    drawSats(list, baseAlpha) {
      const ctx = this.ctx; ctx.globalCompositeOperation = 'lighter';
      for (const s of list) {
        const dz = (s.depth + 1) / 2;
        const sz = s.size * (.6 + dz * .7);
        const a = baseAlpha * (.3 + dz * .7);
        let g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, sz * 4);
        g.addColorStop(0, rgba(s.col, a));
        g.addColorStop(1, rgba(s.col, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, sz * 4, 0, 7); ctx.fill();
        ctx.fillStyle = rgba([255,255,255], a * .8);
        ctx.beginPath(); ctx.arc(s.x, s.y, sz * .7, 0, 7); ctx.fill();
      }
    }

    drawParticles(dt, cx, cy, R, col) {
      const ctx = this.ctx; ctx.globalCompositeOperation = 'lighter';
      for (const p of this.particles) {
        p.life += dt;
        if (p.mode === 'in') {
          p.rad -= dt * R * 1.3; p.ang += dt * 1.4;
          p.x = cx + Math.cos(p.ang) * p.rad;
          p.y = cy + Math.sin(p.ang) * p.rad;
          if (p.rad < R * .5) p.life = p.max;
        } else if (p.mode === 'drift') { p.x += p.vx; p.y += p.vy; }
        else { p.x += p.vx; p.y += p.vy; p.vx *= .97; p.vy *= .97; }
        const a = clamp(1 - p.life / p.max, 0, 1);
        let g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        g.addColorStop(0, rgba(p.col, a * .9));
        g.addColorStop(1, rgba(p.col, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, 7); ctx.fill();
      }
      this.particles = this.particles.filter(p => p.life < p.max);
      if (this.particles.length > 220) this.particles.splice(0, this.particles.length - 220);
    }

    drawBranches(cx, cy, R, t, col2) {
      const ctx = this.ctx; ctx.globalCompositeOperation = 'lighter';
      this.flick = Math.random() < .12 ? Math.random() : this.flick * .9;
      const cols = [[244, 63, 94], col2, [251, 146, 60]];
      for (let b = 0; b < 3; b++) {
        const baseA = -Math.PI / 2 + (b - 1) * .5;
        ctx.strokeStyle = rgba(cols[b], (.3 + this.flick * .5) * this.cur.split);
        ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx, cy);
        let x = cx, y = cy, ang = baseA;
        for (let i = 0; i < 5; i++) {
          ang += (Math.random() - .5) * .7;
          x += Math.cos(ang) * R * .42;
          y += Math.sin(ang) * R * .42;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    drawAmbient(t) {
      const ctx = this.ctx;
      if (!this.stars) {
        this.stars = [];
        for (let i = 0; i < 70; i++) this.stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + .2, p: Math.random() * 7 });
      }
      ctx.globalCompositeOperation = 'lighter';
      for (const s of this.stars) {
        const a = .25 + Math.sin(t * 1.5 + s.p) * .25;
        ctx.fillStyle = rgba([180, 190, 255], Math.max(0, a));
        ctx.beginPath(); ctx.arc(s.x * this.W, s.y * this.H, s.r, 0, 7); ctx.fill();
      }
    }

    roundRect(ctx, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  }

  if (!customElements.get('clao-agent')) customElements.define('clao-agent', ClaoAgent);
  if (typeof window !== 'undefined') window.ClaoAgent = ClaoAgent;
})();
