/* ============================================
   PATCH ME // Scroll Animation & Interaction Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Menu Toggle ---
  const hamburger = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const overlay = document.getElementById('mobile-overlay');
  const navLinksInMenu = navMenu.querySelectorAll('.nav-link');

  function openMenu() {
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('is-open');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    navMenu.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  overlay.addEventListener('click', closeMenu);
  navLinksInMenu.forEach(link => {
    link.addEventListener('click', () => { if (window.innerWidth <= 768) closeMenu(); });
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu.classList.contains('is-open')) closeMenu();
  });

  // --- Intersection Observer for scroll reveals ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  // Observe all elements with reveal classes
  document.querySelectorAll('.m-reveal, .m-reveal-left, .m-reveal-right, .m-reveal-scale, .animate-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });

  // --- MAIN PAGE ANIMATIONS ---
  const isMainPage = document.querySelector('.m-hero');

  if (isMainPage) {
    // 1. Hero section staggered reveals
    const heroLabel = document.querySelector('.m-hero-content .m-section-label');
    const heroTitle = document.querySelector('.m-hero-title');
    const heroDesc = document.querySelector('.m-hero-desc');
    const heroCta = document.querySelector('.m-hero-cta');
    const heroImage = document.querySelector('.m-hero-image');

    [heroLabel, heroTitle, heroDesc, heroCta].forEach((el, i) => {
      if (el) { el.classList.add('m-reveal', `m-delay-${i + 1}`); revealObserver.observe(el); }
    });
    if (heroImage) { heroImage.classList.add('m-reveal-left'); revealObserver.observe(heroImage); }

    // 2. Problem section
    const problemImage = document.querySelector('.m-problem-image');
    const problemTitle = document.querySelector('.m-problem-title');
    const problemDesc = document.querySelector('.m-problem-desc');
    if (problemImage) { problemImage.classList.add('m-reveal-left'); revealObserver.observe(problemImage); }
    if (problemTitle) { problemTitle.classList.add('m-reveal', 'm-delay-2'); revealObserver.observe(problemTitle); }
    if (problemDesc) { problemDesc.classList.add('m-reveal-right', 'm-delay-3'); revealObserver.observe(problemDesc); }

    // 3. Solution section
    const solutionLabel = document.querySelector('.m-solution .m-section-label');
    const solutionImage = document.querySelector('.m-solution-image');
    const solutionTitle = document.querySelector('.m-solution-title');
    const solutionDesc = document.querySelector('.m-solution-desc');
    const specRows = document.querySelectorAll('.m-spec-row');
    if (solutionLabel) { solutionLabel.classList.add('m-reveal'); revealObserver.observe(solutionLabel); }
    if (solutionImage) { solutionImage.classList.add('m-reveal-scale'); revealObserver.observe(solutionImage); }
    if (solutionTitle) { solutionTitle.classList.add('m-reveal', 'm-delay-2'); revealObserver.observe(solutionTitle); }
    if (solutionDesc) { solutionDesc.classList.add('m-reveal', 'm-delay-3'); revealObserver.observe(solutionDesc); }
    specRows.forEach((row, i) => {
      row.classList.add('m-reveal', `m-delay-${i + 4}`);
      revealObserver.observe(row);
    });

    // Add scanline to solution image
    const solutionFrame = document.querySelector('.m-solution-image-frame');
    if (solutionFrame) solutionFrame.classList.add('m-scanline');

    // 4. Features section
    const featuresLabel = document.querySelector('.m-features .m-section-label');
    const featuresTitle = document.querySelector('.m-features-title');
    const featureItems = document.querySelectorAll('.m-feature-item');
    if (featuresLabel) { featuresLabel.classList.add('m-reveal'); revealObserver.observe(featuresLabel); }
    if (featuresTitle) { featuresTitle.classList.add('m-reveal', 'm-delay-2'); revealObserver.observe(featuresTitle); }

    // Feature items with staggered observer
    const featureObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          featureObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });
    featureItems.forEach((item, i) => {
      item.style.transitionDelay = `${i * 0.15}s`;
      featureObserver.observe(item);
    });

    // 5. Phase cards staggered
    const phaseLabel = document.querySelector('.m-howitworks .m-section-label');
    const phaseCards = document.querySelectorAll('.m-phase-card');
    if (phaseLabel) { phaseLabel.classList.add('m-reveal'); revealObserver.observe(phaseLabel); }

    const phaseObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          phaseObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });
    phaseCards.forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.2}s`;
      phaseObserver.observe(card);
    });

    // 6. CTA section
    const ctaTitle = document.querySelector('.m-cta-title');
    const ctaBtn = document.querySelector('.m-cta-btn');
    if (ctaTitle) { ctaTitle.classList.add('m-reveal'); revealObserver.observe(ctaTitle); }
    if (ctaBtn) { ctaBtn.classList.add('m-reveal', 'm-delay-2'); revealObserver.observe(ctaBtn); }

    // --- Section labels - observe for divider animation ---
    document.querySelectorAll('.m-section-label').forEach(label => {
      if (!label.classList.contains('m-reveal') && !label.classList.contains('m-reveal-left')) {
        label.classList.add('m-reveal');
        revealObserver.observe(label);
      }
    });
  }

  // --- GLOBAL GLITCH EFFECT ---
  document.querySelectorAll('.glitch-text').forEach(el => {
    if (!el.hasAttribute('data-text')) {
      el.setAttribute('data-text', el.textContent.trim());
    }
    
    function triggerGlitch() {
      el.classList.add('is-glitching');
      setTimeout(() => el.classList.remove('is-glitching'), 200 + Math.random() * 200);
    }
    
    setTimeout(triggerGlitch, 1000 + Math.random() * 500);
    setInterval(() => {
      if (Math.random() > 0.6) triggerGlitch();
    }, 3000 + Math.random() * 2000);
  });

  // --- GLOBAL PARALLAX EFFECT ---
  const parallaxElements = document.querySelectorAll('.m-parallax-bg');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        parallaxElements.forEach(el => {
          const section = el.closest('section');
          if (!section) return;
          const rect = section.getBoundingClientRect();
          const inView = rect.top < window.innerHeight && rect.bottom > 0;
          if (inView) {
            const offset = (rect.top / window.innerHeight) * -30;
            el.style.transform = `translateY(${offset}px)`;
          }
        });
        ticking = false;
      });
      ticking = true;
    }
  });

  // --- GLOBAL FOOTER REVEAL ---
  const footerBrand = document.querySelector('.m-footer-brand');
  const footerLinks = document.querySelector('.m-footer-links');
  if (footerBrand) { footerBrand.classList.add('m-reveal-left'); revealObserver.observe(footerBrand); }
  if (footerLinks) { footerLinks.classList.add('m-reveal-right'); revealObserver.observe(footerLinks); }

  // --- TEAM PAGE ANIMATIONS (kept from before) ---
  const isTeamPage = document.querySelector('.hero-section');
  if (isTeamPage) {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroTitle = document.querySelector('.hero-title');
    const heroDesc = document.querySelector('.hero-description');
    if (heroSubtitle) { heroSubtitle.classList.add('animate-on-scroll', 'fade-in-up'); revealObserver.observe(heroSubtitle); }
    if (heroTitle) { heroTitle.classList.add('animate-on-scroll', 'fade-in-up', 'delay-2'); revealObserver.observe(heroTitle); }
    if (heroDesc) { heroDesc.classList.add('animate-on-scroll', 'fade-in-up', 'delay-3'); revealObserver.observe(heroDesc); }

    const teamIntroImages = document.querySelector('.team-intro-images');
    const teamIntroText = document.querySelector('.team-intro-text');
    if (teamIntroImages) { teamIntroImages.classList.add('animate-on-scroll', 'slide-in-left'); revealObserver.observe(teamIntroImages); }
    if (teamIntroText) { teamIntroText.classList.add('animate-on-scroll', 'slide-in-right'); revealObserver.observe(teamIntroText); }

    document.querySelectorAll('.member-card').forEach((card, i) => {
      card.classList.add('animate-on-scroll', 'fade-in-up', `delay-${i + 1}`);
      revealObserver.observe(card);
    });
    const missionHeader = document.querySelector('.mission-header');
    if (missionHeader) { missionHeader.classList.add('animate-on-scroll', 'fade-in-up'); revealObserver.observe(missionHeader); }
    document.querySelectorAll('.mission-card').forEach((card, i) => {
      card.classList.add('animate-on-scroll', 'fade-in-up', `delay-${i + 1}`);
      revealObserver.observe(card);
    });
  }

  // --- Smooth scroll for nav links ---
  document.querySelectorAll('.nav-link[href^="#"], .footer-link[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href');
      if (target && target !== '#') {
        e.preventDefault();
        const element = document.querySelector(target);
        if (element) {
          const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
          window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - navHeight, behavior: 'smooth' });
        }
      }
    });
  });

  // --- Nav background opacity on scroll ---
  const topNav = document.querySelector('.top-nav');
  window.addEventListener('scroll', () => {
    topNav.style.background = window.scrollY > 50 ? 'rgba(19, 19, 19, 0.95)' : 'rgba(19, 19, 19, 0.8)';
  });
});
