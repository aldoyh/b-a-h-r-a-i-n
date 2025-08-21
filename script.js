/* --------------------------------------------------------------
   ✨  GSAP‑driven Narrative Animation (Refactored)
   -------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', async () => {
  gsap.registerPlugin(Flip);

  // --------------------------------------------------------------
  // 1️⃣  GLOBAL SELECTORS & CONSTANTS
  // --------------------------------------------------------------
  const $ = selector => document.querySelectorAll(selector);
  const container   = document.querySelector('.container');
  const letters     = $('.letter');
  const words       = $('.word');
  const narratives  = $('.narrative');
  const kingdom     = document.querySelector('.kingdom');
  const bahrain     = document.querySelector('.bahrain');

  const TIMING = {
    // ── core pacing
    letterStagger       : 0.2,
    wordReveal          : 1.2,
    narrativeDelay      : 0.8,
    finalTriggerOffset  : 2_000,          // ms before layout loop ends
    particleDuration    : 3,
    dramaDuration       : 3.5,
    // ── layout switch
    fadeOut             : 0.4,
    fadeIn              : 0.4,
    flipDuration        : 1.5,
    // ── grid mode
    gridScale           : 0.65,
    gridDelay           : 8_000,
    // ── final crescendo
    finalRevealStagger  : 0.3,
    finalRevealDuration : 2.5,
  };

  const characterNarratives = {
    shores:      { emotion: 'wonder',      theme: 'natural beauty',   climax: 'architectural transformation' },
    heritage:    { emotion: 'reverence',   theme: 'ancient wisdom',    climax: 'generational continuity' },
    welcome:     { emotion: 'warmth',      theme: 'human connection', climax: 'universal family' },
    strength:    { emotion: 'determination', theme: 'resilience',   climax: 'triumphant growth' },
    dreams:      { emotion: 'aspiration',  theme: 'boundless vision', climax: 'stellar achievement' },
    innovation:  { emotion: 'curiosity',   theme: 'creative fusion',   climax: 'technological poetry' },
    honor:       { emotion: 'dignity',     theme: 'moral leadership', climax: 'sovereign grace' }
  };

  // --------------------------------------------------------------
  // 2️⃣  INITIAL STATE SETUP
  // --------------------------------------------------------------
  gsap.set([kingdom, bahrain], { opacity: 0, display: 'none' });
  gsap.set(words, { opacity: 0, y: 20 });
  gsap.set(narratives, { opacity: 0, y: 30, scale: 0.9 });
  gsap.set(letters, { scale: 1, opacity: 1 });

  // --------------------------------------------------------------
  // 3️⃣  PARTICLE SYSTEM
  // --------------------------------------------------------------
  class ParticleSystem {
    constructor(container, type = 'default') {
      this.container = container;
      this.type      = type;
      this.isActive  = false;
    }

    static create(container, type) {
      return new ParticleSystem(container, type);
    }

    _buildParticle() {
      const p = document.createElement('div');
      p.className = `particle ${this.type}`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top  = `${Math.random() * 100}%`;
      this.container.appendChild(p);
      return p;
    }

    _animate(particle) {
      return gsap.timeline({
        onComplete: () => particle.remove()
      })
        .to(particle, {
          duration: TIMING.particleDuration,
          y: -100 - Math.random() * 50,
          x: (Math.random() - 0.5) * 100,
          opacity: 1,
          scale: 1 + Math.random() * 0.5,
          rotation: Math.random() * 360,
          ease: "power2.out"
        })
        .to(particle, {
          duration: 1,
          opacity: 0,
          scale: 0,
          ease: "power2.in"
        }, "-=1");
    }

    start() {
      if (this.isActive) return;
      this.isActive = true;

      const spawn = () => {
        if (!this.isActive) return;
        const p = this._buildParticle();
        this._animate(p);
        this._timeout = setTimeout(spawn, 200 + Math.random() * 300);
      };

      spawn();
      // auto‑stop after 5 s
      setTimeout(() => this.stop(), 5_000);
    }

    stop() {
      this.isActive = false;
      clearTimeout(this._timeout);
    }
  }

  // --------------------------------------------------------------
  // 4️⃣  REUSABLE ANIMATION HELPERS
  // --------------------------------------------------------------
  const fade = (targets, { opacity, duration, delay = 0, stagger = 0, onComplete }) =>
    gsap.to(targets, { opacity, duration, delay, stagger, ease: "power2.inOut", onComplete });

  const scaleTo = (targets, { scale, duration, delay = 0, stagger = 0 }) =>
    gsap.to(targets, { scale, duration, delay, stagger, ease: "power2.inOut" });

  // --------------------------------------------------------------
  // 5️⃣  DRAMATIC REVEAL FOR A SINGLE LETTER
  // --------------------------------------------------------------
  function dramaticReveal(letter, index, staggered = true) {
    const tl       = gsap.timeline();
    const baseT    = staggered ? index * TIMING.letterStagger : 0;
    const narrative = letter.querySelector('.narrative');
    const word      = letter.querySelector('.word');
    const partCnt   = letter.querySelector('.particles-container');
    const arc       = characterNarratives[letter.dataset.narrative];

    // 1️⃣  Letter “entrance”
    tl.to(letter, {
      duration: TIMING.dramaDuration,
      scale: 1.15,
      rotationY: 10,
      z: 50,
      boxShadow: "0 20px 40px rgba(206,17,38,.3)",
      className: "+=reveal-active",
      ease: "elastic.out(1,0.5)"
    }, baseT);

    // 2️⃣  Emotion‑driven particle burst
    tl.call(() => {
      const pType = arc.emotion === 'wonder' ? 'gold'
                 : arc.emotion === 'warmth' ? 'silver'
                 : 'default';
      ParticleSystem.create(partCnt, pType).start();
    }, null, baseT + 0.5);

    // 3️⃣  Word reveal
    tl.to(word, {
      opacity: 1,
      y: 0,
      scale: 1.05,
      ease: "back.out(1.7)",
      filter: "blur(0px)"
    }, baseT + 0.8);

    // 4️⃣  Narrative “climax”
    tl.to(narrative, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      ease: "power3.out",
      filter: "blur(0px)"
    }, baseT + TIMING.narrativeDelay);

    // 5️⃣  Soft colour‑shift (visual metaphor for growth)
    tl.to(letter, {
      className: "+=color-shift",
      ease: "sine.inOut"
    }, baseT + 2);

    // 6️⃣  Return to calm
    tl.to(letter, {
      scale: 1,
      rotationY: 0,
      z: 0,
      className: "-=reveal-active -=color-shift",
      ease: "power2.inOut"
    }, baseT + 4);

    return tl;
  }

  // --------------------------------------------------------------
  // 6️⃣  FINAL CRESCENDO (once per cycle)
  // --------------------------------------------------------------
  function finalCrescendo() {
    const tl = gsap.timeline();

    // Staggered dramatic reveals
    letters.forEach((letter, i) => {
      tl.add(() => {
        letter.classList.add('final-reveal-active');
        dramaticReveal(letter, i, false);
      }, i * TIMING.finalRevealStagger);
    });

    // Kingdom / Bahrain entrance
    tl.to([kingdom, bahrain], {
      duration: TIMING.finalRevealDuration,
      opacity: 1,
      scale: 1.1,
      y: -10,
      ease: "elastic.out(1,0.3)",
      stagger: 0.5,
      filter: "drop-shadow(0 0 20px rgba(206,17,38,.5))",
      onStart: () => gsap.set([kingdom, bahrain], { display: 'block' })
    }, 1); // start ~1 s after first letter

    return tl;
  }

  // --------------------------------------------------------------
  // 7️⃣  INITIAL ENTRANCE (once on page load)
  // --------------------------------------------------------------
  async function initialEntrance() {
    const tl = gsap.timeline();

    letters.forEach((letter, i) => {
      const arc = characterNarratives[letter.dataset.narrative];
      tl.from(letter, {
        duration: 1.5,
        scale: 0.3,
        opacity: 0,
        rotationY: -90,
        z: -200,
        ease: "back.out(1.4)",
        delay: i * 0.15,
        onComplete: () => {
          if (arc.emotion === 'wonder')
            gsap.to(letter, { duration: 0.5, filter: "hue-rotate(30deg)", yoyo: true, repeat: 1 });
        }
      }, 0.3);
    });

    await tl.play();
  }

  // --------------------------------------------------------------
  // 8️⃣  FADE‑TRANSITION FOR LAYOUT SWITCHES
  // --------------------------------------------------------------
  async function fadeTransition(callback) {
    const tl = gsap.timeline({ onComplete: callback });

    // fade‑out (keep every letter visible just dimmed)
    tl.to(letters, {
      opacity: 0.3,
      scale: 0.9,
      duration: TIMING.fadeOut,
      ease: "power2.inOut",
      stagger: 0.05
    }, 0);

    // fade‑in (restores full‑opacity after layout has changed)
    tl.to(letters, {
      opacity: 1,
      scale: 1,
      duration: TIMING.fadeIn,
      ease: "power2.inOut",
      stagger: 0.05,
      onComplete: () => tl.progress(1) // resolve the await
    }, TIMING.fadeOut);
  }

  // --------------------------------------------------------------
  // 9️⃣  GRID MODE – SHOW WORDS + NARRATIVES WITH EMOTIONAL Buildup
  // --------------------------------------------------------------
  function gridNarrativesTimeline() {
    const tl = gsap.timeline();

    // 1️⃣  Scale into “grid” stance
    tl.to(letters, {
      scale: TIMING.gridScale,
      duration: 1,
      ease: "power2.inOut",
      stagger: 0.08
    }, 0);

    // 2️⃣  Show words + narratives
    letters.forEach((letter, i) => {
      const word = letter.querySelector('.word');
      const narrative = letter.querySelector('.narrative');
      const arc = characterNarratives[letter.dataset.narrative];

      const start = i * 0.8; // small overlap for rhythm

      tl.to(word, {
        opacity: 1,
        y: 0,
        duration: TIMING.wordReveal,
        ease: arc.emotion === 'determination' ? "power4.out" : "power2.out"
      }, start);

      tl.to(narrative, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.5,
        ease: "power3.out"
      }, start + TIMING.narrativeDelay);

      // Optional “resilience” accent
      if (arc.theme === 'resilience') {
        tl.to(letter, {
          boxShadow: "0 10px 30px rgba(206,17,38,.4)",
          yoyo: true,
          repeat: 1,
          duration: 0.5
        }, start + 1);
      }
    });

    return tl;
  }

  // --------------------------------------------------------------
  // 10️⃣  LAYOUT SWITCH LOGIC (plain, columns, rows, grid, final)
  // --------------------------------------------------------------
  const LAYOUTS = ['final', 'plain', 'columns', 'rows', 'grid'];
  let layoutIdx = 0;
  let isAnimating = false;
  let loopTimer;
  let finalCrescendoFired = false;

  async function switchLayout() {
    if (isAnimating) return;
    isAnimating = true;

    // ---- 1️⃣  Trigger final crescendo 2‑3 s before we would reach the “final” layout
    if (!finalCrescendoFired && layoutIdx === LAYOUTS.length - 2) {
      setTimeout(() => {
        if (!finalCrescendoFired) {
          finalCrescendoFired = true;
          finalCrescendo();
        }
      }, TIMING.finalTriggerOffset);
    }

    // ---- 2️⃣  If we are leaving “grid”, hide its narrative first
    if (LAYOUTS[layoutIdx] === 'grid') {
      await hideNarrativesAndWords();
      await gsap.to(letters, { scale: 1, duration: 0.8, stagger: 0.08 }).play();
    }

    // ---- 3️⃣  Capture old state for Flip
    const flipState = Flip.getState(letters, { props: "transform,opacity", simple: true });

    // ---- 4️⃣  Fade‑out → class‑swap → fade‑in
    await fadeTransition(() => {
      container.classList.remove(LAYOUTS[layoutIdx]);
      layoutIdx = (layoutIdx + 1) % LAYOUTS.length;
      container.classList.add(LAYOUTS[layoutIdx]);
    });

    // ---- 5️⃣  Kingdom / Bahrain handling (final layout only)
    if (LAYOUTS[layoutIdx] === 'final') {
      gsap.set([kingdom, bahrain], { display: 'block' });
      gsap.to([kingdom, bahrain], {
        opacity: 1,
        duration: 1.2,
        delay: 0.5,
        ease: "elastic.out(1,0.3)",
        stagger: 0.3,
        scale: 1.05,
        filter: "drop-shadow(0 5px 15px rgba(206,17,38,.3))"
      });
    } else {
      gsap.to([kingdom, bahrain], {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => gsap.set([kingdom, bahrain], { display: 'none' })
      });
    }

    // ---- 6️⃣  Flip‑back to new layout
    await Flip.from(flipState, {
      duration: TIMING.flipDuration,
      ease: "power2.inOut",
      stagger: 0.1
    }).play();

    // ---- 7️⃣  If we entered “grid”, reveal its narrative
    if (LAYOUTS[layoutIdx] === 'grid') {
      await gridNarrativesTimeline().play();
    }

    // ---- 8️⃣  Cleanup for next cycle
    if (layoutIdx === 0) {
      finalCrescendoFired = false;
      letters.forEach(l => l.classList.remove('final-reveal-active'));
    }

    isAnimating = false;
  }

  // --------------------------------------------------------------
  // 11️⃣  Hide Narratives & Words (used when exiting grid)
  // --------------------------------------------------------------
  function hideNarrativesAndWords() {
    const tl = gsap.timeline();
    tl.to(narratives, {
      opacity: 0,
      y: 20,
      scale: 0.9,
      duration: 0.6,
      ease: "power2.inOut",
      stagger: 0.08
    });
    tl.to(words, {
      opacity: 0,
      y: 10,
      duration: 0.6,
      ease: "power2.inOut",
      stagger: 0.05,
      onComplete: () => tl.progress(1) // resolve the await
    }, 0.3);
    return tl;
  }

  // --------------------------------------------------------------
  // 12️⃣  MAIN LOOP (layout changes forever)
  // --------------------------------------------------------------
  async function animationLoop() {
    clearTimeout(loopTimer);
    await switchLayout();

    const currentName = LAYOUTS[layoutIdx];
    const delay = currentName === 'grid' ? TIMING.gridDelay : 3_000;
    loopTimer = setTimeout(animationLoop, delay);
  }

  // --------------------------------------------------------------
  // 13️⃣  START – entrance → loop
  // --------------------------------------------------------------
  await initialEntrance();
  loopTimer = setTimeout(animationLoop, 3_000);

  // --------------------------------------------------------------
  // 14️⃣  WINDOW RESIZE (debounced)
  // --------------------------------------------------------------
  let resizeTimer;
  window.addEventListener('resize', () => {
    if (isAnimating) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(animationLoop, 2_500);
  });

  // --------------------------------------------------------------
  // 15️⃣  TAB VISIBILITY – pause / resume global timeline
  // --------------------------------------------------------------
  document.addEventListener('visibilitychange', () => {
    gsap.globalTimeline[document.hidden ? 'pause' : 'resume']();
  });
});
