document.addEventListener('DOMContentLoaded', function () {
  gsap.registerPlugin(Flip);

  const container = document.querySelector('.container');
  const letters = document.querySelectorAll('.letter');
  const words = document.querySelectorAll('.word');
  const narratives = document.querySelectorAll('.narrative');
  const kingdom = document.querySelector('.kingdom');
  const bahrain = document.querySelector('.bahrain');

  // Enhanced timing controls
  const TIMING = {
    letterStagger: 0.2,
    wordReveal: 1.2,
    narrativeDelay: 0.8,
    finalRevealStart: 2000, // 2 seconds before conclusion
    particleDuration: 3,
    dramaDuration: 3.5
  };

  // Character narratives with emotional arcs
  const characterNarratives = {
    shores: {
      emotion: 'wonder',
      theme: 'natural beauty',
      climax: 'architectural transformation'
    },
    heritage: {
      emotion: 'reverence',
      theme: 'ancient wisdom',
      climax: 'generational continuity'
    },
    welcome: {
      emotion: 'warmth',
      theme: 'human connection',
      climax: 'universal family'
    },
    strength: {
      emotion: 'determination',
      theme: 'resilience',
      climax: 'triumphant growth'
    },
    dreams: {
      emotion: 'aspiration',
      theme: 'boundless vision',
      climax: 'stellar achievement'
    },
    innovation: {
      emotion: 'curiosity',
      theme: 'creative fusion',
      climax: 'technological poetry'
    },
    honor: {
      emotion: 'dignity',
      theme: 'moral leadership',
      climax: 'sovereign grace'
    }
  };

  // Set initial states
  gsap.set(words, { opacity: 0, y: 20 });
  gsap.set(narratives, { opacity: 0, y: 30, scale: 0.9 });
  gsap.set([kingdom, bahrain], { opacity: 0, display: 'none' });
  gsap.set(letters, { scale: 1, opacity: 1 });

  // Particle System
  class ParticleSystem {
    constructor(container, type = 'default') {
      this.container = container;
      this.type = type;
      this.particles = [];
      this.isActive = false;
    }

    createParticle() {
      const particle = document.createElement('div');
      particle.className = `particle ${this.type}`;
      
      // Random starting position
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      
      particle.style.left = `${startX}%`;
      particle.style.top = `${startY}%`;
      
      this.container.appendChild(particle);
      
      // Animate particle
      const tl = gsap.timeline({
        onComplete: () => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }
      });

      tl.to(particle, {
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

      this.particles.push(particle);
    }

    start() {
      if (this.isActive) return;
      this.isActive = true;
      
      const createInterval = setInterval(() => {
        if (!this.isActive) {
          clearInterval(createInterval);
          return;
        }
        this.createParticle();
      }, 200 + Math.random() * 300);

      setTimeout(() => {
        this.isActive = false;
        clearInterval(createInterval);
      }, 5000);
    }

    stop() {
      this.isActive = false;
    }
  }

  // Enhanced reveal sequence with emotional arcs
  function createDramaticReveal(letter, index, isStaggered = true) {
    const narrative = letter.querySelector('.narrative');
    const word = letter.querySelector('.word');
    const particlesContainer = letter.querySelector('.particles-container');
    const narrativeType = letter.dataset.narrative;
    const storyArc = characterNarratives[narrativeType];
    
    const tl = gsap.timeline();
    const baseDelay = isStaggered ? index * TIMING.letterStagger : 0;

    // Phase 1: Dramatic letter entrance
    tl.to(letter, {
      duration: TIMING.dramaDuration,
      ease: "elastic.out(1, 0.5)",
      scale: 1.15,
      rotationY: 10,
      z: 50,
      boxShadow: "0 20px 40px rgba(206, 17, 38, 0.3)",
      className: "+=reveal-active",
      delay: baseDelay
    });

    // Phase 2: Particle burst based on emotion
    tl.call(() => {
      const particleType = storyArc.emotion === 'wonder' ? 'gold' : 
                          storyArc.emotion === 'warmth' ? 'silver' : 'default';
      const particles = new ParticleSystem(particlesContainer, particleType);
      particles.start();
    }, null, baseDelay + 0.5);

    // Phase 3: Word revelation with thematic timing
    tl.to(word, {
      duration: TIMING.wordReveal,
      opacity: 1,
      y: 0,
      scale: 1.05,
      ease: "back.out(1.7)",
      filter: "blur(0px)"
    }, baseDelay + 0.8);

    // Phase 4: Narrative climax - the emotional peak
    tl.to(narrative, {
      duration: 2,
      opacity: 1,
      y: 0,
      scale: 1,
      rotationX: 0,
      ease: "power3.out",
      filter: "blur(0px)"
    }, baseDelay + TIMING.narrativeDelay);

    // Phase 5: Color shift representing character growth
    tl.to(letter, {
      duration: 2,
      className: "+=color-shift",
      ease: "sine.inOut"
    }, baseDelay + 2);

    // Phase 6: Gentle return to harmony
    tl.to(letter, {
      duration: 1.5,
      scale: 1,
      rotationY: 0,
      z: 0,
      ease: "power2.inOut",
      className: "-=reveal-active -=color-shift"
    }, baseDelay + 4);

    return tl;
  }

  // Final dramatic sequence - the crescendo
  function createFinalRevealSequence() {
    const finalTl = gsap.timeline();
    
    // Staggered final dramatic reveals - each letter gets its moment
    letters.forEach((letter, index) => {
      const revealDelay = index * 0.3; // 0.3 seconds between each reveal
      
      finalTl.add(() => {
        letter.classList.add('final-reveal-active');
        createDramaticReveal(letter, index, false);
      }, revealDelay);
    });

    // Kingdom and Bahrain crescendo
    finalTl.to([kingdom, bahrain], {
      duration: 2.5,
      opacity: 1,
      scale: 1.1,
      y: -10,
      ease: "elastic.out(1, 0.3)",
      stagger: 0.5,
      filter: "drop-shadow(0 0 20px rgba(206, 17, 38, 0.5))"
    }, 1);

    return finalTl;
  }

  // Enhanced initial entrance with character introductions
  function createInitialEntrance() {
    const entranceTl = gsap.timeline();
    
    letters.forEach((letter, index) => {
      const narrativeType = letter.dataset.narrative;
      const storyArc = characterNarratives[narrativeType];
      
      entranceTl.from(letter, {
        duration: 1.5,
        scale: 0.3,
        opacity: 0,
        rotationY: -90,
        z: -200,
        ease: "back.out(1.4)",
        delay: index * 0.15,
        onComplete: () => {
          // Character-specific entrance effect
          if (storyArc.emotion === 'wonder') {
            gsap.to(letter, { duration: 0.5, filter: "hue-rotate(30deg)", yoyo: true, repeat: 1 });
          }
        }
      }, 0.3);
    });

    return entranceTl;
  }

  // Enhanced layout transition with emotional continuity
  async function fadeTransition(callback) {
    return new Promise(resolve => {
      const tl = gsap.timeline();

      // Emotional fade out - each letter carries its story
      letters.forEach((letter, index) => {
        const narrativeType = letter.dataset.narrative;
        const storyArc = characterNarratives[narrativeType];
        
        tl.to(letter, {
          opacity: 0.3,
          scale: 0.9,
          duration: 0.4,
          ease: "power2.inOut",
          delay: index * 0.05
        }, 0);
      });

      tl.call(callback, null, 0.2);

      // Emotional fade in - characters return transformed
      letters.forEach((letter, index) => {
        tl.to(letter, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power2.inOut",
          delay: index * 0.05,
          onComplete: index === letters.length - 1 ? resolve : null
        }, 0.4);
      });
    });
  }

  // Enhanced word display with narrative context
  function showWordsWithNarratives() {
    const tl = gsap.timeline();

    words.forEach((word, index) => {
      const letter = word.parentElement;
      const narrative = letter.querySelector('.narrative');
      const narrativeType = letter.dataset.narrative;
      const storyArc = characterNarratives[narrativeType];
      const startTime = index * 0.8;

      // Word appearance with thematic easing
      tl.to(word, {
        opacity: 1,
        y: 0,
        duration: TIMING.wordReveal,
        ease: storyArc.emotion === 'determination' ? "power4.out" : "power2.out"
      }, startTime);

      // Narrative reveal - the heart of the story
      tl.to(narrative, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.5,
        ease: "power3.out"
      }, startTime + TIMING.narrativeDelay);

      // Character-specific effects
      if (storyArc.theme === 'resilience') {
        tl.to(letter, {
          boxShadow: "0 10px 30px rgba(206, 17, 38, 0.4)",
          duration: 0.5,
          yoyo: true,
          repeat: 1
        }, startTime + 1);
      }
    });

    return tl;
  }

  // Hide narratives with emotional closure
  function hideWordsAndNarratives() {
    return new Promise(resolve => {
      const tl = gsap.timeline();
      
      // Emotional goodbye - each story concludes
      narratives.forEach((narrative, index) => {
        tl.to(narrative, {
          opacity: 0,
          y: 20,
          scale: 0.9,
          duration: 0.6,
          ease: "power2.inOut",
          delay: index * 0.08
        }, 0);
      });

      tl.to(words, {
        opacity: 0,
        y: 10,
        duration: 0.6,
        ease: "power2.inOut",
        stagger: 0.05,
        onComplete: resolve
      }, 0.3);
    });
  }

  const layouts = ['final', 'plain', 'columns', 'rows', 'grid'];
  let currentLayout = 0;
  let animationInProgress = false;
  let loopTimeout;
  let finalRevealTriggered = false;

  async function changeLayout() {
    if (animationInProgress) return;
    animationInProgress = true;

    try {
      // Trigger final reveal sequence 2-3 seconds before conclusion
      if (!finalRevealTriggered && currentLayout === layouts.length - 2) {
        setTimeout(() => {
          if (!finalRevealTriggered) {
            finalRevealTriggered = true;
            createFinalRevealSequence();
          }
        }, TIMING.finalRevealStart);
      }

      // Handle grid exit with narrative closure
      if (layouts[currentLayout] === 'grid') {
        await hideWordsAndNarratives();
        await new Promise(resolve => {
          gsap.to(letters, {
            scale: 1,
            duration: 0.8,
            ease: "power2.inOut",
            stagger: 0.08,
            onComplete: resolve
          });
        });
      }

      // Capture state for smooth transition
      const state = Flip.getState(letters, {
        props: "transform,opacity",
        simple: true
      });

      // Layout change with emotional transition
      await fadeTransition(() => {
        container.classList.remove(layouts[currentLayout]);
        currentLayout = (currentLayout + 1) % layouts.length;
        container.classList.add(layouts[currentLayout]);
      });

      // Handle kingdom/bahrain with dramatic flair
      if (layouts[currentLayout] === 'final') {
        gsap.set([kingdom, bahrain], { display: 'block' });
        gsap.to([kingdom, bahrain], {
          opacity: 1,
          duration: 1.2,
          delay: 0.5,
          ease: "elastic.out(1, 0.3)",
          stagger: 0.3,
          scale: 1.05,
          filter: "drop-shadow(0 5px 15px rgba(206, 17, 38, 0.3))"
        });
      } else {
        gsap.to([kingdom, bahrain], {
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => gsap.set([kingdom, bahrain], { display: 'none' })
        });
      }

      // Smooth position animation with character personality
      await new Promise(resolve => {
        Flip.from(state, {
          duration: 1.5,
          ease: "power2.inOut",
          stagger: 0.1,
          onComplete: resolve
        });
      });

      // Handle grid entry with narrative revelation
      if (layouts[currentLayout] === 'grid') {
        const gridTl = gsap.timeline();

        // Scale down with anticipation
        gridTl.to(letters, {
          scale: 0.65,
          duration: 1,
          ease: "power2.inOut",
          stagger: 0.08
        });

        // Show words and narratives with emotional buildup
        gridTl.add(showWordsWithNarratives(), "-=0.5");

        await gridTl;
      }

    } catch (error) {
      console.error('Animation error:', error);
    } finally {
      animationInProgress = false;
      
      // Reset final reveal for next cycle
      if (currentLayout === 0) {
        finalRevealTriggered = false;
        letters.forEach(letter => {
          letter.classList.remove('final-reveal-active');
        });
      }
    }
  }

  async function animationLoop() {
    clearTimeout(loopTimeout);

    await changeLayout();

    const displayedLayoutIndex = (currentLayout + layouts.length - 1) % layouts.length;
    const displayedLayoutName = layouts[displayedLayoutIndex];
    
    // Extended timing for narrative absorption
    const delay = (displayedLayoutName === 'grid') ? 8000 : 3000;

    loopTimeout = setTimeout(animationLoop, delay);
  }

  // Initialize with dramatic entrance
  createInitialEntrance().then(() => {
    // Start the narrative journey
    loopTimeout = setTimeout(animationLoop, 3000);
  });
});

// Enhanced window resize handling
window.addEventListener('resize', () => {
  if (!animationInProgress) {
    clearTimeout(loopTimeout);
    loopTimeout = setTimeout(animationLoop, 2500);
  }
});

// Add performance optimizations
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations when tab is hidden
    gsap.globalTimeline.pause();
  } else {
    // Resume animations when tab is visible
    gsap.globalTimeline.resume();
  }
});