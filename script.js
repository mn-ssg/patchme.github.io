/* ============================================
   PATCH ME // Scroll Animation & Interaction Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu Toggle ---
  const hamburger = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const overlay = document.getElementById('mobile-overlay');

  function openMenu() {
    if (!hamburger || !navMenu || !overlay) return;
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('is-open');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!hamburger || !navMenu || !overlay) return;
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', () => navMenu.classList.contains('is-open') ? closeMenu() : openMenu());
  if (overlay) overlay.addEventListener('click', closeMenu);
  if (navMenu) navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => { if (window.innerWidth <= 1024) closeMenu(); });
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && navMenu && navMenu.classList.contains('is-open')) closeMenu();
  });

  // --- Shared reveal observer ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  document.querySelectorAll('.m-reveal, .m-reveal-left, .m-reveal-right, .m-reveal-scale, .animate-on-scroll').forEach(el => {
    revealObserver.observe(el);
  });

  // --- MAIN PAGE ANIMATIONS ---
  if (document.querySelector('.m-hero')) {

    // 1. Hero
    const heroTitle = document.querySelector('.m-hero-title');
    const heroSubtitle = document.querySelector('.m-hero-subtitle');
    const heroBottom = document.querySelector('.m-hero-bottom');
    [heroTitle, heroSubtitle].forEach((el, i) => {
      if (el) { el.classList.add('m-reveal', `m-delay-${i + 1}`); revealObserver.observe(el); }
    });
    if (heroBottom) { heroBottom.classList.add('m-reveal', 'm-delay-3'); revealObserver.observe(heroBottom); }

    // 2. Problem title
    const problemTitle = document.querySelector('.m-problem-title');
    if (problemTitle) { problemTitle.classList.add('m-reveal', 'm-delay-1'); revealObserver.observe(problemTitle); }

    // 3. Solution
    const solutionTitle = document.querySelector('.m-solution-title');
    const solutionBottom = document.querySelector('.m-solution-bottom');
    if (solutionTitle) { solutionTitle.classList.add('m-reveal', 'm-delay-1'); revealObserver.observe(solutionTitle); }
    if (solutionBottom) { solutionBottom.classList.add('m-reveal', 'm-delay-2'); revealObserver.observe(solutionBottom); }

    // 4. Features title
    const featuresTitle = document.querySelector('.m-features-title');
    if (featuresTitle) { featuresTitle.classList.add('m-reveal', 'm-delay-1'); revealObserver.observe(featuresTitle); }

    // Feature items staggered
    const featureObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          featureObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    document.querySelectorAll('.m-feature-item').forEach((item, i) => {
      item.style.transitionDelay = `${i * 0.15}s`;
      featureObserver.observe(item);
    });

    // 5. Phase cards staggered
    const phaseObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          phaseObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    document.querySelectorAll('.m-phase-card').forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.2}s`;
      phaseObserver.observe(card);
    });

    // 6. CTA
    const ctaTitle = document.querySelector('.m-cta-title');
    if (ctaTitle) { ctaTitle.classList.add('m-reveal'); revealObserver.observe(ctaTitle); }
  }

  // --- PRODUCT PAGE ANIMATIONS ---
  if (document.querySelector('.p-hero')) {
    // Hero content
    const pSystem = document.querySelector('.p-hero-system');
    const pTitle  = document.querySelector('.p-hero-title');
    const pSub    = document.querySelector('.p-hero-sub');
    const pScroll = document.querySelector('.p-hero-scroll');
    [pSystem, pTitle, pSub, pScroll].forEach((el, i) => {
      if (el) { el.classList.add('m-reveal', `m-delay-${i + 1}`); revealObserver.observe(el); }
    });

    // Friction section
    const pFricTitle = document.querySelector('.p-friction-title');
    const pFricDesc  = document.querySelector('.p-friction-desc');
    if (pFricTitle) { pFricTitle.classList.add('m-reveal-left'); revealObserver.observe(pFricTitle); }
    if (pFricDesc)  { pFricDesc.classList.add('m-reveal-right'); revealObserver.observe(pFricDesc); }

    // Steps section
    const pStepsTitle = document.querySelector('.p-steps-title');
    if (pStepsTitle) { pStepsTitle.classList.add('m-reveal', 'm-delay-1'); revealObserver.observe(pStepsTitle); }

    const pPhotos = document.querySelectorAll('.p-step-photo');
    const photoObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); photoObs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    pPhotos.forEach((p, i) => {
      p.style.opacity = '0'; p.style.transition = `opacity 0.7s ${i * 0.1}s ease`;
      photoObs.observe(p);
    });
    document.addEventListener('animationframe_p', () => {});

    const stepObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); stepObs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    document.querySelectorAll('.p-step-item').forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.15}s`;
      stepObs.observe(el);
    });

    // Photos fade in via observer
    const photoRevObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; photoRevObs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    pPhotos.forEach(p => photoRevObs.observe(p));

    // Rules panels staggered
    const rulesObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); rulesObs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    document.querySelectorAll('.p-rules-panel').forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.2}s`;
      rulesObs.observe(el);
    });

    // Action card
    const pActionCard = document.querySelector('.p-action-card');
    const pActionTitle = document.querySelector('.p-action-title');
    if (pActionTitle) { pActionTitle.classList.add('m-reveal', 'm-delay-1'); revealObserver.observe(pActionTitle); }
    if (pActionCard) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });
      obs.observe(pActionCard);
    }

    // Join section
    const pJoinTitle = document.querySelector('.p-join-title');
    const pJoinSub   = document.querySelector('.p-join-sub');
    const pJoinForm  = document.querySelector('.p-join-form');
    if (pJoinTitle) { pJoinTitle.classList.add('m-reveal', 'm-delay-1'); revealObserver.observe(pJoinTitle); }
    if (pJoinSub)   { pJoinSub.classList.add('m-reveal', 'm-delay-2'); revealObserver.observe(pJoinSub); }
    if (pJoinForm)  { pJoinForm.classList.add('m-reveal', 'm-delay-3'); revealObserver.observe(pJoinForm); }
  }

  // --- Footer reveal ---
  const footerBrand = document.querySelector('.m-footer-brand');
  const footerLinks = document.querySelector('.m-footer-links');
  if (footerBrand) { footerBrand.classList.add('m-reveal-left'); revealObserver.observe(footerBrand); }
  if (footerLinks) { footerLinks.classList.add('m-reveal-right'); revealObserver.observe(footerLinks); }

  // --- Glitch text effect ---
  document.querySelectorAll('.glitch-text').forEach(el => {
    if (!el.hasAttribute('data-text')) el.setAttribute('data-text', el.textContent.trim());

    function triggerGlitch() {
      el.classList.add('is-glitching');
      setTimeout(() => el.classList.remove('is-glitching'), 200 + Math.random() * 200);
    }

    setTimeout(triggerGlitch, 1200 + Math.random() * 800);
    setInterval(() => { if (Math.random() > 0.6) triggerGlitch(); }, 3000 + Math.random() * 2000);
  });

  // --- Phase card hover parallax ---
  document.querySelectorAll('.m-phase-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const img = card.querySelector('.m-phase-bg img');
      if (img) img.style.transform = `scale(1.05) translate(${x * -10}px, ${y * -10}px)`;
    });
    card.addEventListener('mouseleave', () => {
      const img = card.querySelector('.m-phase-bg img');
      if (img) img.style.transform = 'scale(1) translate(0,0)';
    });
  });

  // --- Nav: transparent on hero, dark after ---
  const topNav = document.querySelector('.top-nav');
  if (topNav) {
    const hero = document.querySelector('.m-hero') || document.querySelector('.t-hero') || document.querySelector('.p-hero');
    const threshold = hero ? hero.offsetHeight * 0.9 : window.innerHeight;
    window.addEventListener('scroll', () => {
      topNav.classList.toggle('scrolled', window.scrollY > threshold);
    }, { passive: true });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href');
      if (target && target !== '#') {
        const el = document.querySelector(target);
        if (el) {
          e.preventDefault();
          const navH = topNav ? topNav.offsetHeight : 120;
          window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - navH, behavior: 'smooth' });
        }
      }
    });
  });

  // --- TEAM PAGE ANIMATIONS ---
  if (document.querySelector('.t-hero')) {
    // Hero content
    const tLabel = document.querySelector('.t-hero-label');
    const tTitle = document.querySelector('.t-hero-title');
    const tSub = document.querySelector('.t-hero-sub');
    [tLabel, tTitle, tSub].forEach((el, i) => {
      if (el) { el.classList.add('m-reveal', `m-delay-${i + 1}`); revealObserver.observe(el); }
    });

    // About section
    const tHeading = document.querySelector('.t-about-heading');
    const tDesc = document.querySelector('.t-about-desc');
    if (tHeading) { tHeading.classList.add('m-reveal-left'); revealObserver.observe(tHeading); }
    if (tDesc) { tDesc.classList.add('m-reveal-right'); revealObserver.observe(tDesc); }

    // Member meta rows
    document.querySelectorAll('.t-about-meta').forEach(el => {
      el.classList.add('m-reveal'); revealObserver.observe(el);
    });

    // Member cards staggered
    const memberObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          memberObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    document.querySelectorAll('.t-member-card').forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.2}s`;
      memberObserver.observe(card);
    });

    // Mission section
    const missionTitle = document.querySelector('.t-mission-title');
    if (missionTitle) { missionTitle.classList.add('m-reveal', 'm-delay-1'); revealObserver.observe(missionTitle); }

    const missionCardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          missionCardObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    document.querySelectorAll('.t-mission-card').forEach((card, i) => {
      card.style.transitionDelay = `${i * 0.15}s`;
      missionCardObserver.observe(card);
    });
  }

});
