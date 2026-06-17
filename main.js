document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation & Scroll Header Behavior ---
  const header = document.getElementById('main-header');
  const logoLink = document.getElementById('logo-link');
  const navLinks = document.querySelectorAll('.nav-item-link');
  const navCta = document.getElementById('header-cta');
  const menuToggle = document.getElementById('menu-toggle');
  const toggleSpans = menuToggle.querySelectorAll('span');
  const heroSection = document.getElementById('hero');

  // Helper to toggle light/dark hero classes on header items
  const setHeaderTheme = (isLightHero) => {
    if (isLightHero) {
      header.classList.remove('opaque');
      logoLink.classList.add('light-hero');
      navLinks.forEach(link => link.classList.add('light-hero'));
      navCta.classList.add('light-hero');
      toggleSpans.forEach(span => span.classList.add('light-hero'));
    } else {
      header.classList.add('opaque');
      logoLink.classList.remove('light-hero');
      navLinks.forEach(link => link.classList.remove('light-hero'));
      navCta.classList.remove('light-hero');
      toggleSpans.forEach(span => span.classList.remove('light-hero'));
    }
  };

  // Intersection Observer for Hero Section to toggle Header theme
  if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // If hero is in view, we keep the header transparent with light themes
        // If hero leaves view (isIntersecting is false), we turn header opaque
        setHeaderTheme(entry.isIntersecting);
      });
    }, {
      root: null,
      threshold: 0.15 // Trigger when 15% of hero is in view
    });
    
    heroObserver.observe(heroSection);
  }

  // Active navigation link tracking via scroll
  const sections = document.querySelectorAll('section');
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    root: null,
    threshold: 0.4 // Trigger when 40% of the section is visible
  });

  sections.forEach(section => activeObserver.observe(section));


  // --- Mobile Drawer Menu ---
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-nav-cta');

  const toggleDrawer = () => {
    menuToggle.classList.toggle('open');
    mobileDrawer.classList.toggle('open');
    drawerBackdrop.classList.toggle('active');
    
    // Prevent scrolling behind drawer
    if (mobileDrawer.classList.contains('open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  menuToggle.addEventListener('click', toggleDrawer);
  drawerBackdrop.addEventListener('click', toggleDrawer);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Close drawer on link click
      if (mobileDrawer.classList.contains('open')) {
        toggleDrawer();
      }
    });
  });


  // --- Smooth Scroll For Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
        
        // Update URL hash without jumping
        history.pushState(null, null, targetId);
      }
    });
  });


  // --- Portfolio Carousel & Filtering System ---
  const filterTabs = document.querySelectorAll('.filter-tab');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  const track = document.getElementById('portfolio-track');
  const prevBtn = document.getElementById('portfolio-prev');
  const nextBtn = document.getElementById('portfolio-next');
  const dotsContainer = document.getElementById('portfolio-dots');
  
  let visibleCards = [];
  let currentIndex = 0;
  const gap = 24; // Width of card gaps in CSS (24px)

  const getVisibleCount = () => {
    if (window.innerWidth <= 768) return 1;
    const containerWidth = track.parentElement.offsetWidth;
    const cardWidth = visibleCards[0] ? visibleCards[0].offsetWidth : 420;
    return Math.floor(containerWidth / (cardWidth + gap)) || 1;
  };

  const slideCarousel = () => {
    visibleCards = Array.from(portfolioCards).filter(card => !card.classList.contains('hidden'));
    
    if (window.innerWidth <= 768) {
      // On mobile, let CSS horizontal layout scroll naturally
      track.style.transform = 'none';
      return;
    }
    
    const cardWidth = visibleCards[0] ? visibleCards[0].offsetWidth : 420;
    track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;
    
    // Update dots active state
    const dots = dotsContainer.querySelectorAll('.portfolio-carousel-dot');
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    
    // Update button states
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, visibleCards.length - visibleCount);
    
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
    
    // Hide buttons entirely if all cards fit on screen
    if (visibleCards.length <= visibleCount) {
      prevBtn.style.opacity = '0';
      prevBtn.style.pointerEvents = 'none';
      nextBtn.style.opacity = '0';
      nextBtn.style.pointerEvents = 'none';
    } else {
      prevBtn.style.opacity = '';
      prevBtn.style.pointerEvents = '';
      nextBtn.style.opacity = '';
      nextBtn.style.pointerEvents = '';
    }
  };

  const generateDots = () => {
    dotsContainer.innerHTML = '';
    visibleCards = Array.from(portfolioCards).filter(card => !card.classList.contains('hidden'));
    const visibleCount = getVisibleCount();
    const dotsNum = Math.max(0, visibleCards.length - visibleCount + 1);
    
    if (dotsNum <= 1 || window.innerWidth <= 768) return; // No dots on mobile or if all fit
    
    for (let i = 0; i < dotsNum; i++) {
      const dot = document.createElement('div');
      dot.classList.add('portfolio-carousel-dot');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        currentIndex = i;
        slideCarousel();
      });
      dotsContainer.appendChild(dot);
    }
  };

  const filterProjects = (category) => {
    portfolioCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      
      if (category === 'all' || cardCategory === category || (category === 'glass' && cardCategory.includes('glass')) || (category === 'aluminum' && cardCategory.includes('aluminum'))) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
    
    currentIndex = 0;
    generateDots();
    slideCarousel();
  };

  filterTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Toggle active states
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      
      const category = this.getAttribute('data-filter');
      filterProjects(category);
    });
  });

  // Carousel click listeners
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        slideCarousel();
      }
    });

    nextBtn.addEventListener('click', () => {
      const visibleCount = getVisibleCount();
      const maxIndex = Math.max(0, visibleCards.length - visibleCount);
      if (currentIndex < maxIndex) {
        currentIndex++;
        slideCarousel();
      }
    });
  }

  // Update carousel on viewport resize
  window.addEventListener('resize', () => {
    currentIndex = 0;
    generateDots();
    slideCarousel();
  });

  // Check URL parameters on load to auto-apply filter/inquiry details
  const handleUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    const inquiryParam = urlParams.get('inquiry');

    if (filterParam) {
      const targetTab = document.querySelector(`.filter-tab[data-filter="${filterParam}"]`);
      if (targetTab) {
        targetTab.click();
      }
    }

    if (inquiryParam) {
      const workSelect = document.getElementById('contact-work');
      if (workSelect) {
        workSelect.value = inquiryParam;
      }
    }
  };

  handleUrlParams();
  generateDots();
  slideCarousel();

  // Listen for hash/query changes dynamically
  window.addEventListener('popstate', handleUrlParams);


  // --- Intersection Observer for Scroll Reveals ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Stop observing once animated
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // --- Contact Form Submission ---
  const contactForm = document.getElementById('project-contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value;
      const phone = document.getElementById('contact-phone').value;
      const email = document.getElementById('contact-email').value;
      const service = document.getElementById('contact-work').options[document.getElementById('contact-work').selectedIndex].text;
      
      // Simulate estimator lookup / email sending
      formFeedback.style.display = 'block';
      formFeedback.style.color = 'var(--electric-blue)';
      formFeedback.innerText = 'Submitting request details...';

      setTimeout(() => {
        // Change feedback to success response
        formFeedback.innerText = `Thank you ${name}! Estimator will contact you soon for "${service}" at ${phone}.`;
        formFeedback.style.color = 'green';
        contactForm.reset();
        
        // Hide feedback after 8 seconds
        setTimeout(() => {
          formFeedback.style.display = 'none';
        }, 8000);
      }, 1500);
    });
  }
});
