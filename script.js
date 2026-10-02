document.documentElement.classList.add('js-ready');

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const progressBar = document.querySelector('.scroll-progress');
const progressLabel = document.querySelector('.scroll-percent');
const projectCards = [...document.querySelectorAll('.project-card')];

function prepareWordReveal() {
  // Wrap only text nodes so emphasis and explicit line breaks remain intact.
  document.querySelectorAll('.title-reveal').forEach((heading) => {
    const textNodes = [];
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    let wordIndex = 0;
    textNodes.forEach((textNode) => {
      if (!textNode.textContent.trim()) return;
      const fragment = document.createDocumentFragment();
      textNode.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.append(document.createTextNode(part));
          return;
        }

        const word = document.createElement('span');
        word.className = 'title-word';
        word.style.setProperty('--word-index', wordIndex++);
        word.textContent = part;
        fragment.append(word);
      });
      textNode.replaceWith(fragment);
    });
  });
}

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  navigation.classList.remove('is-open');
  header.classList.remove('menu-open');
  document.body.classList.remove('menu-open');
}

function initNavigation() {
  menuButton.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menuButton.setAttribute('aria-label', willOpen ? 'Fechar menu' : 'Abrir menu');
    navigation.classList.toggle('is-open', willOpen);
    header.classList.toggle('menu-open', willOpen);
    document.body.classList.toggle('menu-open', willOpen);
    if (willOpen) navigation.querySelector('a')?.focus({ preventScroll: true });
  });

  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
    if (event.key === 'Tab' && menuButton.getAttribute('aria-expanded') === 'true') {
      const focusable = [menuButton, ...navigation.querySelectorAll('a[href]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const sectionLinks = new Map([...navigation.querySelectorAll('a[href^="#"]')]
    .map((link) => [document.querySelector(link.getAttribute('href')), link])
    .filter(([section]) => section));

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = sectionLinks.get(entry.target);
        if (link && entry.isIntersecting) {
          navigation.querySelectorAll('[aria-current="location"]').forEach((activeLink) => activeLink.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'location');
        }
      });
    }, { rootMargin: '-28% 0px -62% 0px' });
    sectionLinks.forEach((link, section) => sectionObserver.observe(section));

    if (document.body.dataset.page === 'home') {
      const homeSections = [
        ['projects', document.querySelector('.projects')],
        ['studio', document.querySelector('#sobre')],
        ['services', document.querySelector('#servicos')],
        ['process', document.querySelector('#processo')],
        ['contact', document.querySelector('#contato')]
      ].filter(([, section]) => section);
      const homeObserver = new IntersectionObserver((entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (!current) return;
        const pageKey = homeSections.find(([, section]) => section === current.target)?.[0];
        if (!pageKey) return;
        navigation.querySelectorAll('[aria-current="page"]').forEach((link) => link.removeAttribute('aria-current'));
        navigation.querySelector(`[data-nav-page="${pageKey}"]`)?.setAttribute('aria-current', 'page');
      }, { rootMargin: '-32% 0px -58% 0px' });
      homeSections.forEach(([, section]) => homeObserver.observe(section));
    }
  }
}

function initProjectFilters() {
  const filterButtons = document.querySelectorAll('.filter-button');
  const emptyMessage = document.querySelector('.project-empty');
  const visibleCountLabel = document.querySelector('[data-visible-count]');
  const locationFilter = document.querySelector('[data-filter-location]');
  const yearFilter = document.querySelector('[data-filter-year]');
  const typologyFilter = document.querySelector('[data-filter-typology]');
  let filterTimer = 0;
  let animationTimer = 0;
  let filterRevision = 0;
  let activeCategory = 'todos';

  const matchesCurrentFilters = (card) => {
    const categories = [card.dataset.category, ...(card.dataset.categories || '').split(/\s+/)].filter(Boolean);
    return (activeCategory === 'todos' || activeCategory === 'all' || categories.includes(activeCategory))
      && (!locationFilter || locationFilter.value === 'all' || card.dataset.location === locationFilter.value)
      && (!yearFilter || yearFilter.value === 'all' || card.dataset.year === yearFilter.value)
      && (!typologyFilter || typologyFilter.value === 'all' || card.dataset.typology === typologyFilter.value);
  };

  const applyFilters = () => {
    const revision = ++filterRevision;
    projectCards.forEach((card) => {
      card.classList.remove('filter-enter');
      card.classList.add('filter-exit');
    });
    window.clearTimeout(filterTimer);
    window.clearTimeout(animationTimer);
    filterTimer = window.setTimeout(() => {
      if (revision !== filterRevision) return;
      let visibleCount = 0;
      projectCards.forEach((card, index) => {
        const isVisible = matchesCurrentFilters(card);
        card.hidden = !isVisible;
        card.classList.remove('filter-exit', 'filter-enter');
        if (isVisible) {
          visibleCount += 1;
          card.classList.add('filter-enter');
          card.style.setProperty('--filter-delay', `${Math.min(index * 55, 220)}ms`);
        }
      });
      if (emptyMessage) emptyMessage.hidden = visibleCount > 0;
      if (visibleCountLabel) visibleCountLabel.textContent = String(visibleCount).padStart(2, '0');
      animationTimer = window.setTimeout(() => projectCards.forEach((card) => card.classList.remove('filter-enter')), 950);
    }, 230);
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.filter;
      filterButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      applyFilters();
    });
  });

  [locationFilter, yearFilter, typologyFilter].filter(Boolean).forEach((select) => select.addEventListener('change', applyFilters));
}

function initScrollExperience() {
  let frameRequested = false;
  const updateScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    const percent = Math.round(progress * 100);
    progressBar.style.setProperty('--page-progress', progress);
    progressBar.setAttribute('aria-valuenow', String(percent));
    progressLabel.textContent = String(percent).padStart(2, '0');
    header.classList.toggle('is-scrolled', window.scrollY > 36);
    const contactSection = document.querySelector('.contact');
    if (contactSection) {
      const contactBounds = contactSection.getBoundingClientRect();
      const contactProgress = Math.min(1, Math.max(0, (window.innerHeight - contactBounds.top) / (window.innerHeight + contactBounds.height)));
      contactSection.style.setProperty('--contact-line', `${contactProgress * 100}%`);
    }

    if (!motionPreference.matches && window.innerWidth > 760) {
      const hero = document.querySelector('.hero');
      hero?.style.setProperty('--hero-parallax', `${Math.min(window.scrollY * .13, 78)}px`);
      document.querySelectorAll('.light-study-image, .manifesto-image').forEach((element) => {
        const bounds = element.getBoundingClientRect();
        const offset = (bounds.top + bounds.height / 2 - window.innerHeight / 2) * -.045;
        element.style.setProperty(element.classList.contains('manifesto-image') ? '--manifesto-parallax' : '--study-parallax', `${Math.max(-20, Math.min(20, offset))}px`);
      });
      contactSection?.style.setProperty('--contact-parallax', `${(progress - .5) * 15}px`);
    }
    frameRequested = false;
  };

  window.addEventListener('scroll', () => {
    if (!frameRequested) {
      frameRequested = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();
}

function initReveals() {
  const revealSelector = '.reveal, .title-reveal, .contact, .process-steps, [data-count], .reveal-up, .reveal-left, .reveal-right, .scale-reveal, .blur-reveal, .clip-reveal, .text-reveal, .image-reveal, .line-reveal, .stagger';
  if (!('IntersectionObserver' in window) || motionPreference.matches) {
    document.querySelectorAll(revealSelector).forEach((element) => element.classList.add('is-visible'));
    document.querySelectorAll('[data-count]').forEach((element) => { element.textContent = `${element.dataset.count}${element.dataset.countSuffix || ''}`; });
    return;
  }

  document.documentElement.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      if (entry.target.hasAttribute('data-count')) animateCount(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -35px 0px' });

  document.querySelectorAll(revealSelector).forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${Math.min((index % 4) * 65, 195)}ms`);
    revealObserver.observe(element);
  });
}

function animateCount(element) {
  if (element.dataset.counted) return;
  element.dataset.counted = 'true';
  const rawValue = element.dataset.count;
  const target = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(target)) return;
  const suffix = element.dataset.countSuffix || (rawValue.endsWith('+') ? '+' : '');
  const padLength = /^0\d/.test(rawValue) ? rawValue.length : 0;
  const startedAt = performance.now();
  const duration = 950;

  const update = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - (1 - progress) ** 4;
    const value = Math.round(target * eased);
    element.textContent = `${padLength ? String(value).padStart(padLength, '0') : value}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

function initPageTransitions() {
  const curtain = document.querySelector('.page-transition');
  let isNavigating = false;
  const navigate = (href, source) => {
    if (isNavigating || !href) return;
    isNavigating = true;
    const sourceImage = source?.querySelector('img');
    if (sourceImage && curtain) {
      curtain.style.setProperty('--transition-image', `url("${sourceImage.currentSrc || sourceImage.src}")`);
      curtain.classList.add('has-image');
    }
    curtain?.classList.add('is-active');
    window.setTimeout(() => { window.location.href = href; }, motionPreference.matches ? 20 : 420);
  };

  document.addEventListener('studio:navigate', (event) => navigate(event.detail?.href, event.detail?.source));
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const destination = new URL(link.href, window.location.href);
    if (!['file:', 'http:', 'https:'].includes(destination.protocol) || destination.origin !== window.location.origin) return;
    if (destination.pathname === window.location.pathname || (destination.hash && destination.pathname === window.location.pathname)) return;
    event.preventDefault();
    navigate(destination.href, link);
  });
}

function initPointerInteractions() {
  const hero = document.querySelector('.hero');
  const magneticElements = document.querySelectorAll('.magnetic');
  document.querySelectorAll('.project-card').forEach((card) => {
    const image = card.querySelector('.project-image-wrap');
    card.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || motionPreference.matches || window.innerWidth <= 760) return;
      const bounds = image.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      image.style.setProperty('--pointer-x', `${x * 100}%`);
      image.style.setProperty('--pointer-y', `${y * 100}%`);
      image.style.setProperty('--image-x', `${(x - .5) * -9}px`);
      image.style.setProperty('--image-y', `${(y - .5) * -9}px`);
    });
    card.addEventListener('pointerleave', () => {
      image.style.removeProperty('--image-x');
      image.style.removeProperty('--image-y');
    });
  });

  magneticElements.forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || motionPreference.matches || window.innerWidth <= 760) return;
      const bounds = element.getBoundingClientRect();
      const moveX = (event.clientX - bounds.left - bounds.width / 2) * .12;
      const moveY = (event.clientY - bounds.top - bounds.height / 2) * .12;
      element.style.setProperty('--mag-x', `${Math.max(-8, Math.min(8, moveX))}px`);
      element.style.setProperty('--mag-y', `${Math.max(-8, Math.min(8, moveY))}px`);
    });
    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--mag-x', '0px');
      element.style.setProperty('--mag-y', '0px');
    });
  });

  hero?.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || motionPreference.matches || window.innerWidth <= 760) return;
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty('--hero-pointer-x', `${event.clientX - bounds.left}px`);
    hero.style.setProperty('--hero-pointer-y', `${event.clientY - bounds.top}px`);
  });

  initCustomCursor();
}

function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const ring = cursor.querySelector('.cursor-ring');
  const label = cursor.querySelector('.cursor-label');
  const syncCursorAvailability = () => {
    const canShowCursor = finePointer.matches && !motionPreference.matches && window.innerWidth > 760;
    document.documentElement.classList.toggle('has-custom-cursor', canShowCursor);
    if (!canShowCursor) cursor.classList.remove('is-visible', 'is-hovering', 'is-image');
  };
  syncCursorAvailability();
  window.addEventListener('resize', syncCursorAvailability, { passive: true });
  finePointer.addEventListener?.('change', syncCursorAvailability);
  motionPreference.addEventListener?.('change', syncCursorAvailability);
  let pointerX = -100;
  let pointerY = -100;
  let ringX = pointerX;
  let ringY = pointerY;
  let cursorFrame = 0;

  const animateCursor = () => {
    // Keep one animation frame alive only while the trailing ring is still moving.
    ringX += (pointerX - ringX) * .18;
    ringY += (pointerY - ringY) * .18;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    if (Math.abs(pointerX - ringX) > .4 || Math.abs(pointerY - ringY) > .4) {
      cursorFrame = requestAnimationFrame(animateCursor);
    } else {
      cursorFrame = 0;
    }
  };

  document.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || motionPreference.matches || window.innerWidth <= 760) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursor.querySelector('.cursor-dot').style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
    cursor.classList.add('is-visible');
    if (!cursorFrame) cursorFrame = requestAnimationFrame(animateCursor);
  }, { passive: true });

  document.addEventListener('pointerover', (event) => {
    const target = event.target.closest('a, button, [data-cursor-label]');
    if (!target) return;
    label.textContent = target.dataset.cursorLabel || (target.matches('.filter-button') ? 'FILTER' : 'OPEN');
    cursor.classList.add('is-hovering');
    cursor.classList.toggle('is-image', target.matches('.project-card, .light-study-image, [data-cursor-label="EXPLORE"]'));
  });
  document.addEventListener('pointerout', (event) => {
    if (!event.target.closest('a, button, [data-cursor-label]')) return;
    cursor.classList.remove('is-hovering', 'is-image');
  });
  window.addEventListener('blur', () => cursor.classList.remove('is-visible'));
}

prepareWordReveal();
initNavigation();
initProjectFilters();
initReveals();
initScrollExperience();
initPointerInteractions();
initPageTransitions();