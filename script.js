document.addEventListener('DOMContentLoaded', function() {
  // Register GSAP Flip plugin
  gsap.registerPlugin(Flip);
  
  // Get elements
  const container = document.querySelector('.container');
  const letters = document.querySelectorAll('.letter');
  const words = document.querySelectorAll('.word');
  const kingdom = document.querySelector('.kingdom');
  const bahrain = document.querySelector('.bahrain');
  
  // Define layouts
  const layouts = ['final', 'plain', 'columns', 'rows', 'grid'];
  let currentLayout = 0;
  let animationInProgress = false;
  
  // Hide all words initially
  gsap.set(words, { opacity: 0, y: 20 });
  
  // Pre-position elements to prevent jumps
  function prePositionElements() {
    // Store original class
    const originalClass = container.className;
    
    // For each layout, temporarily apply class to calculate positions
    layouts.forEach(layout => {
      container.className = `container ${layout}`;
      // Force reflow
      document.body.offsetHeight;
    });
    
    // Restore original class
    container.className = originalClass;
  }
  
  // Call pre-positioning once at start
  prePositionElements();
  
  // Function to show words in grid layout
  function showWords() {
    // Create a sequence for word animations
    words.forEach((word, index) => {
      // Delay each word
      setTimeout(() => {
        // Animate the word
        gsap.to(word, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power4.inOut"
        });
        
        // Pulse the letter
        gsap.to(word.parentElement, {
          scale: 1.05,
          duration: 0.3,
          ease: "power4.inOut",
          yoyo: true,
          repeat: 1
        });
      }, index * 800); // 800ms between each word
    });
  }
  
  // Function to hide words
  function hideWords() {
    return new Promise(resolve => {
      gsap.to(words, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power4.inOut",
        onComplete: resolve
      });
    });
  }
  
  // Function to change layout
  async function changeLayout() {
    if (animationInProgress) return;
    animationInProgress = true;
    
    // If we're leaving grid layout, hide words first
    if (layouts[currentLayout] === 'grid') {
      await hideWords();
    }
    
    // Get current state with precise options
    const state = Flip.getState(letters, {
      props: "all",
      simple: false,
      absolute: true
    });
    
    // Remove current layout class
    container.classList.remove(layouts[currentLayout]);
    
    // Update to next layout
    currentLayout = (currentLayout + 1) % layouts.length;
    
    // Add new layout class
    container.classList.add(layouts[currentLayout]);
    
    // Force browser to apply layout before animating
    document.body.offsetHeight; // Force reflow
    
    // Handle kingdom and bahrain text visibility
    if (layouts[currentLayout] === 'final') {
      gsap.set([kingdom, bahrain], { display: 'block', opacity: 0 });
      gsap.to([kingdom, bahrain], { opacity: 1, duration: 0.5, delay: 0.5 });
    } else {
      gsap.to([kingdom, bahrain], { 
        opacity: 0, 
        duration: 0.3, 
        onComplete: () => gsap.set([kingdom, bahrain], { display: 'none' }) 
      });
    }
    
    // Animate the change with smooth transition
    Flip.from(state, {
      duration: 1,
      ease: "power4.inOut",
      stagger: 0.05,
      absolute: true,
      nested: true,
      prune: true,
      onComplete: function() {
        // If we're now in grid layout, show the words
        if (layouts[currentLayout] === 'grid') {
          // Resize letters for grid layout
          gsap.to(letters, {
            fontSize: '3rem',
            duration: 0.5,
            ease: "power4.inOut",
            onComplete: function() {
              // Show words after resize
              setTimeout(showWords, 300);
              
              // Schedule next layout change after words animation + viewing time
              setTimeout(() => {
                animationInProgress = false;
                changeLayout();
              }, 10000); // 10 seconds total for grid view
            }
          });
        } else {
          // Reset font size for other layouts
          gsap.to(letters, {
            fontSize: '5rem',
            duration: 0.5,
            ease: "power4.inOut",
            onComplete: function() {
              // Schedule next layout change
              setTimeout(() => {
                animationInProgress = false;
                changeLayout();
              }, 3000); // 3 seconds for other layouts
            }
          });
        }
      }
    });
  }
  
  // Start the animation cycle with a longer delay to ensure everything is ready
  setTimeout(changeLayout, 2000);
});
