(() => {
  const content = window.StudioContent;
  const body = document.body;
  const root = document.querySelector('#page-content');
  const route = content.route;
  const page = body.dataset.page;
  const isHome = page === 'home';

  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const image = (src, alt, className = '', loading = 'lazy') => `<img class="${className}" src="${src}" alt="${escapeHtml(alt)}" loading="${loading}" decoding="async" />`;
  const arrow = '<span aria-hidden="true">↗</span>';
  const notice = '<p class="demo-notice"><span aria-hidden="true">*</span> Conteúdo demonstrativo. Dados de projetos, equipe e contato são campos editáveis e precisam ser confirmados antes da publicação.</p>';
  const categoryLabel = (category) => ({ 'LIGHT / MATERIAIS': 'LUZ / MATERIAIS', MATERIAIS: 'MATERIAIS', ARCHITECTURE: 'ARQUITETURA', PLACES: 'LUGARES', PROCESS: 'PROCESSO', STUDIO: 'ESTÚDIO' })[category] || category;
  const drawingLabels = { plan: 'PLANTA', section: 'CORTE', elevation: 'ELEVAÇÃO', detail: 'DETALHE' };

  function renderSharedChrome() {
    const header = document.querySelector('.site-header');
    header.innerHTML = `
      <a class="wordmark" href="${route('')}" aria-label="Clara Andrade Arquitetura, início">
        <span class="mark" aria-hidden="true">ca<span>.</span></span>
        <span class="wordmark-name">CLARA ANDRADE<span>ARQUITETURA</span></span>
      </a>
      <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="site-nav"><span></span><span></span></button>
      <nav class="site-nav" id="site-nav" aria-label="Navegação principal">
        <a data-nav-page="projects" href="${route('projects')}"><span class="nav-number" aria-hidden="true">01</span>Projetos</a>
        <a data-nav-page="studio" href="${route('studio')}"><span class="nav-number" aria-hidden="true">02</span>Estúdio</a>
        <a data-nav-page="services" href="${route('services')}"><span class="nav-number" aria-hidden="true">03</span>Serviços</a>
        <a data-nav-page="process" href="${route('process')}"><span class="nav-number" aria-hidden="true">04</span>Processo</a>
        <a data-nav-page="journal" href="${route('journal')}"><span class="nav-number" aria-hidden="true">05</span>Caderno</a>
        <a class="nav-contact" data-nav-page="contact" href="${route('contact')}"><span class="nav-number" aria-hidden="true">06</span>Contato ${arrow}</a>
        <p class="menu-location" aria-hidden="true">São Paulo · Brasil<br />23° 33' S — 46° 38' W</p>
        <div class="menu-image" aria-hidden="true">${image(content.projects[0].image, '', '', 'eager')}<span>01 / 06 · TRABALHOS SELECIONADOS</span></div>
      </nav>
      <span class="scroll-readout" aria-hidden="true"><span class="scroll-percent">00</span><i></i> ROLAGEM</span>`;

    const footer = document.querySelector('.site-footer');
    footer.innerHTML = `
      <div class="footer-main">
        <div class="footer-brand"><a class="footer-mark" href="${route('')}">ca<span>.</span></a><p>Arquitetura, matéria<br />e tempo.</p></div>
        <div class="footer-column"><p class="footer-label">Explorar</p><a href="${route('projects')}">Projetos</a><a href="${route('studio')}">Estúdio</a><a href="${route('services')}">Serviços</a><a href="${route('process')}">Processo</a><a href="${route('journal')}">Caderno</a></div>
        <div class="footer-column"><p class="footer-label">Contato</p><a href="mailto:studio@claraandrade.example">studio@claraandrade.example</a><span>Telefone · campo editável</span><span>São Paulo · Brasil</span><a href="${route('contact')}">Iniciar um projeto ${arrow}</a></div>
        <div class="footer-column"><p class="footer-label">Redes sociais</p><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram ${arrow}</a><a href="https://www.pinterest.com/" target="_blank" rel="noreferrer">Pinterest ${arrow}</a><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn ${arrow}</a></div>
      </div>
      <div class="footer-bottom"><span>© 2026 Clara Andrade Arquitetura</span><span>São Paulo · 23° 33' S — 46° 38' W</span><a href="${route('')}">Voltar ao topo ↑</a></div>`;

    if (!document.querySelector('.scroll-progress')) {
      document.body.insertAdjacentHTML('afterbegin', '<div class="scroll-progress" role="progressbar" aria-label="Progresso de leitura" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="scroll-progress-fill"></span></div>');
    }
    if (!document.querySelector('.custom-cursor')) {
      document.body.insertAdjacentHTML('beforeend', '<div class="custom-cursor" aria-hidden="true"><span class="cursor-dot"></span><span class="cursor-ring"><span class="cursor-label"></span></span></div>');
    }
    if (!document.querySelector('.page-transition')) {
      document.body.insertAdjacentHTML('beforeend', '<div class="page-transition" aria-hidden="true"><span class="transition-mark">ca<span>.</span></span><span class="transition-line"></span><span class="transition-code">CA / CADERNO DE ESTÚDIO</span></div>');
    }
    if (!document.querySelector('.page-loader')) {
      document.body.insertAdjacentHTML('beforeend', '<div class="page-loader" aria-hidden="true"><span class="loader-mark">ca<span>.</span></span><span class="loader-word">CARREGANDO</span><span class="loader-percent">07</span><i class="loader-line"><b></b></i><span class="loader-caption">ARQUITETURA · MATÉRIA · TEMPO</span></div>');
    }
    const activePage = page === 'project' ? 'projects' : page === 'article' ? 'journal' : page;
    header.querySelector(`[data-nav-page="${activePage}"]`)?.setAttribute('aria-current', 'page');
  }

  function projectCard(project, index, className = '') {
    return `<a class="project-card reveal ${className}" href="${route(`projects/${project.id}`)}" data-transition data-category="${project.category}" data-categories="${project.categories.join(' ')}" data-location="${escapeHtml(project.location)}" data-year="${project.year}" data-typology="${escapeHtml(project.type)}" data-cursor-label="ABRIR" aria-label="Abrir o projeto ${escapeHtml(project.title)}">
      <div class="project-image-wrap">${image(project.image, `${project.title}, ${project.type}`, '', index < 2 ? 'eager' : 'lazy')}<span class="project-number">${String(index + 1).padStart(2, '0')} / 06</span><span class="project-arrow" aria-hidden="true">↗</span><span class="project-overlay-label">VER PROJETO</span></div>
      <div class="project-meta"><div><h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.type)} · ${escapeHtml(project.location)}</p></div><span>${escapeHtml(project.year)}</span></div>
    </a>`;
  }

  function renderProjects() {
    const filters = ['all', 'residential', 'commercial', 'hospitality', 'interiors', 'objects'];
    const filterLabels = { all: 'Todos', residential: 'Residencial', commercial: 'Comercial', hospitality: 'Hospitalidade', interiors: 'Interiores', objects: 'Objetos' };
    const label = (key) => filterLabels[key];
    const options = (values) => [...new Set(values)].sort().map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
    root.innerHTML = `<section class="route-hero projects-hero">
      <p class="eyebrow"><span class="eyebrow-line"></span> Portfólio · 2021—2025</p><h1 class="title-reveal">Arquitetura moldada pelo lugar, pela luz e pela vida cotidiana.</h1>
      <div class="route-hero-bottom"><p>Trabalhos selecionados</p><span><strong data-project-count>${String(content.projects.length).padStart(2, '0')}</strong> PROJETOS</span></div>
    </section>
    <section class="projects-page section-wrap" aria-label="Catálogo de projetos">
      <div class="catalogue-tools"><div class="project-filters" role="group" aria-label="Filtrar por categoria">${filters.map((key) => `<button class="filter-button${key === 'all' ? ' is-active' : ''}" type="button" data-filter="${key}" aria-pressed="${key === 'all'}">${label(key)} <span>${key === 'all' ? String(content.projects.length).padStart(2, '0') : ''}</span></button>`).join('')}</div>
        <div class="catalogue-selects"><label><span>Localização</span><select data-filter-location><option value="all">Todas as localizações</option>${options(content.projects.map((item) => item.location))}</select></label><label><span>Ano</span><select data-filter-year><option value="all">Todos os anos</option>${options(content.projects.map((item) => item.year))}</select></label><label><span>Tipologia</span><select data-filter-typology><option value="all">Todas as tipologias</option>${options(content.projects.map((item) => item.type))}</select></label></div>
        <div class="view-switch" role="group" aria-label="Visualização dos projetos"><button type="button" class="is-active" data-view="grid" aria-pressed="true">Grade</button><button type="button" data-view="list" aria-pressed="false">Lista</button></div>
      </div>
      <div class="catalogue-count"><span><strong data-visible-count>${String(content.projects.length).padStart(2, '0')}</strong> projetos</span><span>São Paulo · 23° 33' S</span></div>
      <div class="project-grid catalogue-grid">${content.projects.map((project, index) => projectCard(project, index, index % 2 ? 'project-small' : 'project-large')).join('')}</div>
      <p class="project-empty" hidden>Nenhum projeto corresponde a estes filtros.</p>
    </section>`;

    root.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
      root.querySelectorAll('[data-view]').forEach((item) => {
        const selected = item === button;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      root.querySelector('.projects-page').classList.toggle('is-list', button.dataset.view === 'list');
    }));
  }

  function projectFacts(project) {
    const facts = [
      ['Ano', project.year], ['Localização', project.location], ['Tipologia', project.type], ['Área', project.area],
      ['Situação', project.status], ['Cliente', project.client], ['Equipe', project.team], ['Fotografia', project.photography]
    ];
    return facts.map(([label, value], index) => {
      const countValue = label === 'Área' ? project.areaMetric : label === 'Ano' ? project.year : null;
      const countSuffix = label === 'Área' ? ' m²*' : label === 'Ano' ? '*' : '';
      const countContent = label === 'Área' ? '0 m²*' : label === 'Ano' ? '0*' : escapeHtml(value);
      return `<div class="data-fact reveal"><span>${String(index + 1).padStart(2, '0')}</span><p>${label}</p><strong${countValue ? ` data-count="${countValue}" data-count-suffix="${countSuffix}"` : ''}>${countContent}</strong></div>`;
    }).join('');
  }

  function drawingArtwork(kind) {
    const drawings = {
      plan: '<path d="M60 45h250v185H60zM60 115h90v115M150 45v70h90v115M240 45v60h70M150 115h90M60 160h90M240 105v75h70M105 45v70M195 160v70"/><path d="M150 90h14M225 115v14M105 160h14M240 200v14" stroke-dasharray="3 4"/>',
      section: '<path d="M45 225h300M75 225V95l58-42 58 42v130M191 112h116v113M87 103h92M205 128h88M75 95l58-42 58 42M191 112l58-32 58 32"/><path d="M132 53v172M249 80v145" stroke-dasharray="4 5"/>',
      elevation: '<path d="M48 220h295M75 220V105l65-42 65 42v115M205 125h105v95M86 112h106M218 139h78M102 151h28v38h-28zM227 155h25v34h-25zM270 155h25v34h-25z"/><path d="M140 63v157M205 105v115" stroke-dasharray="3 5"/>',
      detail: '<path d="M80 60h230v36H80zM105 96v160h180V96M105 145h180M105 200h180M80 60v196M310 60v196"/><path d="M65 60h-18M65 96h-18M65 145h-18M65 200h-18M65 256h-18M330 60h18M330 256h18" stroke-dasharray="4 4"/>'
    };
    return `<svg class="drawing-svg" viewBox="0 0 390 300" role="img" aria-label="${drawingLabels[kind]} · desenho ilustrativo demonstrativo"><g fill="none" stroke="currentColor" stroke-width="1.2">${drawings[kind]}</g><g class="drawing-dimensions" fill="currentColor" font-family="DM Sans, sans-serif" font-size="7"><text x="176" y="278">ESQUEMÁTICO · NÃO USAR NA OBRA</text><text x="185" y="24">1:100*</text></g></svg>`;
  }

  function renderProject() {
    const project = content.projects.find((item) => item.id === body.dataset.id) || content.projects[0];
    const index = content.projects.indexOf(project);
    const previous = content.projects[(index + content.projects.length - 1) % content.projects.length];
    const next = content.projects[(index + 1) % content.projects.length];
    document.title = `${project.title} — Clara Andrade Arquitetura`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', `${project.summary} Informações do projeto, galeria de imagens e estudo de materiais.`);
    const drawingTabs = ['plan', 'section', 'elevation', 'detail'];
    const drawingLabels = { plan: 'PLANTA', section: 'CORTE', elevation: 'ELEVAÇÃO', detail: 'DETALHE' };
    const materialProfiles = project.materials.map((name, materialIndex) => ({ name, image: project.gallery[materialIndex % project.gallery.length].src }));

    root.innerHTML = `<section class="project-detail-hero" style="--project-image:url('${project.image}')">
      ${image(project.image, `${project.title}, arquitetura e paisagem`, 'project-detail-backdrop', 'eager')}<div class="project-detail-shade"></div>
      <div class="project-detail-top"><a href="${route('projects')}">← TODOS OS PROJETOS</a><span>PROJETO ${String(index + 1).padStart(2, '0')} / ${String(content.projects.length).padStart(2, '0')}</span></div>
      <div class="project-detail-title"><p class="eyebrow"><span class="eyebrow-line"></span>${escapeHtml(project.location)} · ${project.year} · ${escapeHtml(project.type)}</p><h1>${escapeHtml(project.title)}</h1><p>${escapeHtml(project.summary)}</p></div>
      <div class="project-detail-arrows"><a href="${route(`projects/${previous.id}`)}" aria-label="Projeto anterior">← <span>ANTERIOR</span></a><a href="${route(`projects/${next.id}`)}"><span>PRÓXIMO</span> →</a></div>
    </section>
    <section class="project-data section-wrap"><div class="data-heading"><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> Informações do projeto</p><p class="data-code">${project.code} · ${project.year}</p></div><div class="data-grid">${projectFacts(project)}</div>${notice}</section>
    <section class="project-concept section-wrap"><div class="concept-image reveal">${image(project.gallery[1].src, project.gallery[1].alt)}</div><div class="concept-copy reveal"><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> 01 / Conceito · 23° 33' S</p><h2 class="title-reveal">Um lugar para<br />sentir <em>mais.</em></h2><p>${escapeHtml(project.concept)}</p><p class="image-caption-text">${escapeHtml(project.location)} · ${project.code}</p></div></section>
    <section class="project-gallery section-wrap"><div class="section-heading"><div><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> 02 / Sequência de imagens</p><h2>Espaços em <em>uso.</em></h2></div><span class="gallery-index">01 — 0${project.gallery.length}</span></div><div class="cinema-gallery">${project.gallery.map((entry, imageIndex) => `<button class="gallery-frame gallery-frame-${imageIndex + 1} reveal" type="button" data-gallery-index="${imageIndex}" data-cursor-label="VER" aria-label="Ver imagem ${imageIndex + 1}: ${escapeHtml(entry.caption)}">${image(entry.src, entry.alt)}<span class="gallery-caption"><span>0${imageIndex + 1} / 0${project.gallery.length}</span>${escapeHtml(entry.caption)}</span><span class="gallery-zoom" aria-hidden="true">↗</span></button>`).join('')}</div></section>
    <section class="documentation section-wrap"><div class="section-heading"><div><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> 03 / Conjunto de desenhos</p><h2>Documentação<br /><em>arquitetônica.</em></h2></div><p class="documentation-intro">Uma visão esquemática do conjunto de desenhos. Substitua estes diagramas ilustrativos por documentação verificada antes de publicar.</p></div><div class="drawing-viewer"><div class="drawing-tabs" role="tablist" aria-label="Desenhos arquitetônicos">${drawingTabs.map((tab, tabIndex) => `<button type="button" role="tab" id="tab-${tab}" aria-controls="drawing-panel" aria-selected="${tabIndex === 0}" tabindex="${tabIndex === 0 ? '0' : '-1'}" data-drawing="${tab}">${drawingLabels[tab]}</button>`).join('')}</div><div class="drawing-panel" id="drawing-panel" role="tabpanel" aria-labelledby="tab-plan"><div class="drawing-meta"><span class="drawing-name">PLANTA DO PAVIMENTO TÉRREO</span><span>01 / 04 · ${project.code}</span></div><div class="drawing-art">${drawingArtwork('plan')}<span class="drawing-watermark">ESQUEMÁTICO / DEMONSTRAÇÃO</span></div><button class="drawing-full" type="button" data-drawing-full>Ver desenho ampliado ${arrow}</button></div></div></section>
    <section class="material-study section-wrap"><div class="section-heading"><div><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> 04 / Estudo de materiais</p><h2>Escolhidos para <em>pertencer.</em></h2></div><span class="material-count">${String(materialProfiles.length).padStart(2, '0')} MATERIAIS</span></div><div class="material-grid">${materialProfiles.map((material, materialIndex) => `<article class="material-card reveal" data-cursor-label="EXPLORAR">${image(material.image, `Estudo do material: ${material.name}`)}<div class="material-copy"><span>0${materialIndex + 1} / ${project.code}</span><h3>${escapeHtml(material.name)}</h3><p>Descrição demonstrativa. Informe a origem, o acabamento e as qualidades táteis escolhidas para este projeto.</p><dl><div><dt>Origem</dt><dd>A confirmar*</dd></div><div><dt>Acabamento</dt><dd>Especificação do projeto*</dd></div></dl></div></article>`).join('')}</div><p class="material-note">*Origem e acabamento são campos demonstrativos e editáveis.</p></section>
    <section class="project-details-band"><div class="section-wrap details-band-inner"><p class="eyebrow light-eyebrow"><span class="eyebrow-line"></span> 05 / Ficha do projeto</p><h2>Medidas para<br /><em>a vida cotidiana.</em></h2><p>${escapeHtml(project.summary)} As especificações abaixo são demonstrativas e precisam ser confirmadas pela equipe do projeto.</p><div class="detail-stats"><span><strong data-count="${project.areaMetric}">0</strong><small>m² · ÁREA DEMONSTRATIVA</small></span><span><strong data-count="${project.year}">0</strong><small>ANO · DADO DEMONSTRATIVO</small></span><span><strong>01</strong><small>CÓDIGO DO PROJETO · ${project.code}</small></span></div></div></section>
    <section class="related-projects section-wrap"><div class="section-heading"><div><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> Mais trabalhos do estúdio</p><h2>Projetos <em>relacionados.</em></h2></div><a class="text-link" href="${route('projects')}">Todos os projetos ${arrow}</a></div><div class="project-grid">${content.projects.filter((item) => item.id !== project.id).slice(index % 2, index % 2 + 3).map((item, relatedIndex) => projectCard(item, relatedIndex, 'project-small')).join('')}</div><p class="demo-note-small">As descrições e especificações desta página são conteúdo demonstrativo e editável.</p></section>
    <div class="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Visualizador de imagens do projeto" aria-hidden="true" hidden><button class="lightbox-close" type="button" aria-label="Fechar visualizador">×</button><button class="lightbox-arrow lightbox-prev" type="button" aria-label="Imagem anterior">←</button><figure><img src="" alt="" /><figcaption><span class="lightbox-count">01 / 03</span><span class="lightbox-caption"></span></figcaption></figure><button class="lightbox-arrow lightbox-next" type="button" aria-label="Próxima imagem">→</button><p class="lightbox-hint">ESC PARA FECHAR · ← → PARA NAVEGAR</p></div>`;
    initProjectPage(project, drawingTabs);
  }

  function initProjectPage(project, drawingTabs) {
    const viewer = document.querySelector('.gallery-lightbox');
    const viewerImage = viewer.querySelector('img');
    const previousButton = viewer.querySelector('.lightbox-prev');
    const nextButton = viewer.querySelector('.lightbox-next');
    let currentIndex = 0;
    let touchStartX = 0;
    let returnFocus = null;

    const showImage = (index) => {
      currentIndex = (index + project.gallery.length) % project.gallery.length;
      const item = project.gallery[currentIndex];
      viewerImage.src = item.src;
      viewerImage.alt = item.alt;
      viewer.querySelector('.lightbox-count').textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(project.gallery.length).padStart(2, '0')}`;
      viewer.querySelector('.lightbox-caption').textContent = item.caption;
    };
    const closeViewer = () => {
      viewer.classList.remove('is-open');
      viewer.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      previousButton.hidden = false;
      nextButton.hidden = false;
      window.setTimeout(() => { viewer.hidden = true; returnFocus?.focus(); }, 360);
    };
    const openViewer = (index, trigger) => {
      returnFocus = trigger;
      showImage(index);
      viewer.hidden = false;
      viewer.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      requestAnimationFrame(() => viewer.classList.add('is-open'));
      window.setTimeout(() => viewer.querySelector('.lightbox-close').focus(), 40);
    };

    document.querySelectorAll('[data-gallery-index]').forEach((button) => button.addEventListener('click', () => openViewer(Number(button.dataset.galleryIndex), button)));
    viewer.querySelector('.lightbox-close').addEventListener('click', closeViewer);
    viewer.addEventListener('click', (event) => { if (event.target === viewer) closeViewer(); });
    previousButton.addEventListener('click', () => showImage(currentIndex - 1));
    nextButton.addEventListener('click', () => showImage(currentIndex + 1));
    viewer.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
    viewer.addEventListener('touchend', (event) => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 55) showImage(currentIndex + (delta < 0 ? 1 : -1));
    }, { passive: true });
    document.addEventListener('keydown', (event) => {
      if (viewer.hidden) return;
      if (event.key === 'Escape') closeViewer();
      if (event.key === 'ArrowRight') showImage(currentIndex + 1);
      if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (event.key === 'Tab') {
        const focusable = [...viewer.querySelectorAll('button:not([hidden])')];
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

    document.querySelectorAll('[data-drawing]').forEach((tab) => {
      tab.addEventListener('keydown', (event) => {
        const tabs = [...document.querySelectorAll('[data-drawing]')];
        const currentTab = tabs.indexOf(tab);
        const nextIndex = event.key === 'ArrowRight' ? (currentTab + 1) % tabs.length : event.key === 'ArrowLeft' ? (currentTab + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
        if (nextIndex < 0) return;
        event.preventDefault();
        tabs[nextIndex].focus();
        tabs[nextIndex].click();
      });
      tab.addEventListener('click', () => {
      document.querySelectorAll('[data-drawing]').forEach((item) => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      const panel = document.querySelector('.drawing-panel');
      panel.classList.add('is-changing');
      window.setTimeout(() => {
        const drawing = tab.dataset.drawing;
        const index = drawingTabs.indexOf(drawing) + 1;
        panel.querySelector('.drawing-name').textContent = drawingLabels[drawing] + (drawing === 'plan' ? ' · TÉRREO' : ' · ESTUDO');
        panel.querySelector('.drawing-meta > span:last-child').textContent = `0${index} / 04 · ${project.code}`;
        panel.querySelector('.drawing-art').innerHTML = `${drawingArtwork(drawing)}<span class="drawing-watermark">ESQUEMÁTICO / DEMONSTRAÇÃO</span>`;
        panel.setAttribute('aria-labelledby', `tab-${drawing}`);
        panel.classList.remove('is-changing');
      }, 180);
      });
    });

    document.querySelector('[data-drawing-full]').addEventListener('click', () => {
      const activeDrawing = document.querySelector('[data-drawing][aria-selected="true"]').dataset.drawing;
      openViewer(0, document.querySelector('[data-drawing-full]'));
      const drawingImage = viewer.querySelector('img');
      drawingImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(document.querySelector('.drawing-svg').outerHTML)}`;
      drawingImage.alt = `Desenho de ${drawingLabels[activeDrawing]}, demonstração ilustrativa`;
      viewer.querySelector('.lightbox-count').textContent = 'DESENHO / DEMONSTRAÇÃO';
      viewer.querySelector('.lightbox-caption').textContent = `${drawingLabels[activeDrawing]} · Esquemático · não usar na obra`;
      previousButton.hidden = true;
      nextButton.hidden = true;
    });
  }

  function renderStudio() {
    root.innerHTML = `<section class="editorial-hero studio-hero"><div class="editorial-hero-copy"><p class="eyebrow"><span class="eyebrow-line"></span> O estúdio · São Paulo</p><h1 class="title-reveal">Projetamos espaços<br />que <em>envelhecem com o tempo.</em></h1><p>Um escritório dedicado a espaços contemporâneos, moldados pelo lugar, pela luz, pelos materiais e pelas pessoas que os habitam.</p></div>${image(content.projects[0].image, 'Ambiente de estúdio contemporâneo com luz natural', 'editorial-hero-image', 'eager')}<span class="hero-image-label">CA / PRÁTICA DE ESTÚDIO · 2018—</span></section>
      <section class="studio-introduction section-wrap"><div class="studio-intro-label"><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> Apresentação</p><span>01 / 06</span></div><p class="studio-statement title-reveal">Arquitetura não é um objeto na paisagem. É uma forma de <em>fazer parte dela.</em></p><div class="studio-intro-text"><p>Clara Andrade Arquitetura é um escritório independente que atua em arquitetura, interiores e nos espaços entre eles. Começamos pela escuta atenta para então abrir espaço à clareza, à descoberta e às decisões compartilhadas.</p><p>Nosso trabalho parte do que é particular: como a luz percorre o terreno, como o material encontra a mão e como um lugar acolhe os rituais cotidianos.</p></div></section>
      <section class="studio-philosophy"><div class="studio-philosophy-image reveal">${image(content.projects[1].image, 'Residência contemporânea integrada à paisagem')}<span class="image-caption-text">CADERNO DE CAMPO · O LUGAR PRIMEIRO</span></div><div class="studio-philosophy-copy reveal"><p class="eyebrow light-eyebrow"><span class="eyebrow-line"></span> Filosofia</p><h2>Menos gestos.<br /><em>Mais sentido.</em></h2><p>Acreditamos que um bom espaço é generoso com a atenção e discreto nas exigências. Oferece conforto sem espetáculo e um caráter que amadurece com o tempo.</p><span class="technical-caption">MATÉRIA / LUZ / USO · 03 EIXOS</span></div></section>
      <section class="studio-approach section-wrap"><div><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> Abordagem</p><h2>Escutar com atenção.<br />Desenhar com <em>intenção.</em></h2></div><div class="approach-points"><article><span>01</span><div><h3>Começar pelo lugar</h3><p>Ler o terreno, suas histórias, orientação e condicionantes antes de propor uma forma.</p></div></article><article><span>02</span><div><h3>Abrir espaço para a vida</h3><p>Projetar para o movimento, o encontro, o recolhimento e os rituais cotidianos.</p></div></article><article><span>03</span><div><h3>Construir para durar</h3><p>Escolher materiais duráveis e detalhes claros, possíveis de reparar, manter e habitar.</p></div></article></div></section>
      <section class="team-section section-wrap"><div class="section-heading"><div><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> Pessoas por trás do trabalho</p><h2>Um trabalho feito <em>em conjunto.</em></h2></div><p class="placeholder-tag">RETRATOS + BIOGRAFIAS · CAMPOS EDITÁVEIS</p></div><div class="team-grid">${content.team.map((person, index) => `<article class="team-card reveal" data-cursor-label="CONHECER"><div class="team-image">${image(person.image, `${person.name}, ${person.role}`)}<span>0${index + 1} / 03</span></div><div class="team-info"><div><h3>${escapeHtml(person.name)}</h3><p>${escapeHtml(person.role)}</p></div><span class="team-arrow">↗</span><p>${escapeHtml(person.bio)}</p></div></article>`).join('')}</div></section>
      <section class="studio-numbers section-wrap"><div class="section-heading"><div><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> O estúdio em números</p><h2>Um trabalho em <em>construção.</em></h2></div><span class="placeholder-tag">TODOS OS VALORES SÃO DEMONSTRATIVOS</span></div><div class="number-grid">${[['12+', 'ANOS'], ['38', 'PROJETOS'], ['07', 'CIDADES'], ['04', 'PAÍSES']].map(([value, label], index) => `<div class="studio-number reveal"><span>0${index + 1}</span><strong data-count="${value}">0</strong><small>${label}</small></div>`).join('')}</div></section>
      <section class="timeline-section section-wrap"><div><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> Linha do tempo</p><h2>Um estúdio <em>ao longo do tempo.</em></h2></div><div class="timeline-list"><article><span>2018</span><p>Fundação do escritório em São Paulo. <small>MARCO DEMONSTRATIVO</small></p></article><article><span>2020</span><p>Primeiros projetos residenciais fora da capital. <small>MARCO DEMONSTRATIVO</small></p></article><article><span>2023</span><p>Interiores e requalificação passam a integrar o trabalho do estúdio. <small>MARCO DEMONSTRATIVO</small></p></article><article><span>2026</span><p>Um acervo crescente de lugares, detalhes e ideias. <small>MARCO DEMONSTRATIVO</small></p></article></div></section>`;
  }

  function renderServices() {
    root.innerHTML = `<section class="route-hero services-hero"><p class="eyebrow"><span class="eyebrow-line"></span> Serviços do estúdio</p><h1 class="title-reveal">Projetos cuidadosos,<br /><em>do terreno ao detalhe.</em></h1><div class="route-hero-bottom"><p>Um estúdio, diferentes formas de começar.</p><span>01 — 07 / SERVIÇOS</span></div></section>
      <section class="services-explorer section-wrap"><div class="service-explorer-visual"><div class="service-visual-frame">${image(content.services[0].image, 'Projeto de arquitetura selecionado para ilustrar o serviço', '', 'eager')}<span class="service-visual-index">01 / 07</span><span class="service-visual-caption">ESTUDO SELECIONADO · IMAGEMM DEMONSTRATIVA</span></div><p class="service-visual-description" aria-live="polite">${escapeHtml(content.services[0].description)}</p></div><div class="service-explorer-list" role="tablist" aria-label="Conheça os serviços do estúdio">${content.services.map((service, index) => `<button class="service-explorer-item${index === 0 ? ' is-active' : ''}" type="button" role="tab" aria-selected="${index === 0}" data-service-index="${index}"><span>${service.number}</span><strong>${escapeHtml(service.title)}</strong><span aria-hidden="true">↗</span></button>`).join('')}</div></section>
      <section class="service-detail-list section-wrap"><div class="section-heading"><div><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> Escopo e entregáveis</p><h2>Clareza desde o <em>início.</em></h2></div><p>Cada projeto é único. Escopo e entregas são definidos em conjunto antes do início do trabalho.</p></div><div class="service-detail-rows">${content.services.map((service) => `<article class="service-detail-row reveal" id="${service.id}"><span class="service-detail-number">${service.number}</span><div><h3>${escapeHtml(service.title)}</h3><p>${escapeHtml(service.description)}</p></div><div class="service-detail-meta"><span><small>ETAPAS</small>${escapeHtml(service.etapas)}</span><span><small>ENTREGÁVEIS</small>${escapeHtml(service.deliverables)}</span></div><a href="${route('contact')}" aria-label="Consultar sobre ${escapeHtml(service.title)}">${arrow}</a></article>`).join('')}</div><p class="demo-note-small">Etapas e entregáveis são demonstrativos; o escopo final é definido para cada projeto.</p></section>`;
    root.querySelectorAll('[data-service-index]').forEach((button) => button.addEventListener('click', () => {
      const service = content.services[Number(button.dataset.serviceIndex)];
      const visual = root.querySelector('.service-visual-frame img');
      button.parentElement.querySelectorAll('[data-service-index]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      visual.classList.add('is-changing');
      window.setTimeout(() => {
        visual.src = service.image;
        visual.alt = `${service.title} imagem de serviço, projeto de arquitetura selecionado`;
        root.querySelector('.service-visual-description').textContent = service.description;
        root.querySelector('.service-visual-index').textContent = `${service.number} / 07`;
        visual.classList.remove('is-changing');
      }, 180);
    }));
  }

  function renderProcess() {
    root.innerHTML = `<section class="route-hero process-hero"><p class="eyebrow"><span class="eyebrow-line"></span> Como trabalhamos</p><h1 class="title-reveal">Um processo claro.<br /><em>Espaço para descobrir.</em></h1><div class="route-hero-bottom"><p>Sete etapas, moldadas por cada projeto.</p><span>CA / MÉTODO 01—07</span></div></section>
      <section class="process-page section-wrap"><div class="process-page-intro"><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> Da primeira conversa ao último detalhe</p><p>Cada projeto tem seu próprio ritmo. Os prazos abaixo são estimativas demonstrativas, ajustadas após a definição do escopo e a análise do local.</p></div><div class="process-track">${content.process.map((step, index) => `<article class="process-track-step reveal${index % 2 ? ' is-offset' : ''}"><div class="process-step-image">${image(content.projects[index % content.projects.length].gallery[index % 3].src, `Imagem ilustrativa da etapa ${step.title.toLowerCase()} etapa`)}<span>${step.number} / 07</span></div><div class="process-step-copy"><p class="eyebrow dark-eyebrow">${step.number} / ETAPA · ${step.duration}</p><h2>${escapeHtml(step.title)}</h2><p>${escapeHtml(step.description)}</p><div class="deliverable-line"><span>ENTREGÁVEIS</span>${escapeHtml(step.deliverables)}</div></div></article>`).join('')}</div><p class="demo-note-small">Os prazos são estimativas editáveis, não compromissos. Confirme datas e entregas para cada projeto.</p></section>`;
  }

  function renderJournal() {
    const categories = [['all', 'TODOS'], ['architecture', 'ARQUITETURA'], ['materials', 'MATERIAIS'], ['light', 'LUZ'], ['places', 'LUGARES'], ['process', 'PROCESSO'], ['studio', 'ESTÚDIO']];
    root.innerHTML = `<section class="route-hero journal-hero"><p class="eyebrow"><span class="eyebrow-line"></span> Caderno de campo · Revista</p><h1 class="title-reveal">Uma revista sobre<br /><em>lugar e prática.</em></h1><div class="route-hero-bottom"><p>Ideias reunidas pelo caminho.</p><span>EDIÇÃO 01 · 2024—2025</span></div></section><section class="journal-page section-wrap"><div class="journal-filters" role="group" aria-label="Filtrar caderno por categoria">${categories.map(([key, label], index) => `<button type="button" class="filter-button${index === 0 ? ' is-active' : ''}" data-journal-filter="${key}" aria-pressed="${index === 0}">${label}</button>`).join('')}</div><div class="journal-grid">${content.articles.map((article, index) => `<a class="journal-card reveal${index === 0 ? ' journal-card-featured' : ''}" href="${route(`journal/${article.id}`)}" data-transition data-journal-category="${article.category.toLowerCase().replace(' / ', ' ')}" data-cursor-label="ABRIR ARTIGO"><div class="journal-image">${image(article.image, article.title, '', index === 0 ? 'eager' : 'lazy')}<span>0${index + 1} / 0${content.articles.length}</span><b aria-hidden="true">↗</b></div><div class="journal-meta"><span>${categoryLabel(article.category)}</span><span>${article.date} · ${article.read}</span></div><h2>${escapeHtml(article.title)}</h2><p>${escapeHtml(article.summary)}</p></a>`).join('')}</div><p class="journal-empty" hidden>Ainda não há textos nesta categoria.</p></section>`;
    root.querySelectorAll('[data-journal-filter]').forEach((button) => button.addEventListener('click', () => {
      root.querySelectorAll('[data-journal-filter]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      let shown = 0;
      root.querySelectorAll('.journal-card').forEach((card) => {
        const visible = button.dataset.journalFilter === 'all' || card.dataset.journalCategory.includes(button.dataset.journalFilter);
        card.hidden = !visible;
        shown += Number(visible);
      });
      root.querySelector('.journal-empty').hidden = shown > 0;
    }));
  }

  function renderArticle() {
    const article = content.articles.find((item) => item.id === body.dataset.id) || content.articles[0];
    const next = content.articles[(content.articles.indexOf(article) + 1) % content.articles.length];
    document.title = `${article.title} — Caderno Clara Andrade`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', article.summary);
    root.innerHTML = `<article class="journal-article"><header class="article-header section-wrap"><a class="article-back" href="${route('journal')}">← CADERNO</a><p class="eyebrow dark-eyebrow">${categoryLabel(article.category)} · ${article.date} · ${article.read}</p><h1 class="title-reveal">${escapeHtml(article.title)}</h1><p class="article-deck">${escapeHtml(article.summary)}</p></header><figure class="article-cover">${image(article.image, `${article.title}, luz natural em um interior arquitetônico`, '', 'eager')}<figcaption>ESTUDO DE CAMPO · ${article.date} · IMAGEMM DEMONSTRATIVA</figcaption></figure><div class="article-body"><p class="article-lead">Light is not an accessory to a room. It is one of the materials that gives the room its measure, its rhythm and, in time, its memory.</p><p>A luz da manhã chega baixa e precisa. By midday it softens, finding the grain in timber, the quiet unevenness of stone and the changing temperature of a wall. A space does not remain still when the sun moves through it.</p><blockquote>“A room is understood not only by what it contains, but by what light allows us to notice.”<cite>CADERNO DE CAMPO · ACERVO DO ESTÚDIO</cite></blockquote><figure class="article-inline-image">${image(content.projects[0].gallery[1].src, 'Luz do sol atravessando um ambiente contemporâneo')}<figcaption>01 / A mesma superfície, percebida de outra forma ao longo do dia.</figcaption></figure><h2>A matéria também é luz</h2><p>Matte and polished finishes return light in different ways. A deep reveal can make a surface feel quiet; a carefully placed opening can carry daylight further into a plan. These are not isolated effects. They are decisions about how a person will experience a place over many ordinary days.</p><p>In each project, we study orientation, openings and the surfaces that receive the sun. The drawings help us anticipate a condition; being present in the space helps us refine it.</p><div class="article-diagram"><span>08:30</span><i></i><span>12:00</span><i></i><span>17:20</span><small>DAYLUZ STUDY · DEMONSTRAÇÃO TIMESTAMPS</small></div><p class="article-disclaimer">This journal entry is conteúdo editorial demonstrativo. Revise imagens, datas e informações técnicas antes de publicar.</p></div><a class="next-article" href="${route(`journal/${next.id}`)}"><span>PRÓXIMO ARTICLE · ${next.category}</span><strong>${escapeHtml(next.title)}</strong><span>Continue a leitura →</span></a></article>`;
  }

  function renderArticleContent() {
    const article = content.articles.find((item) => item.id === body.dataset.id) || content.articles[0];
    const articleIndex = content.articles.indexOf(article);
    const articleBody = root.querySelector('.article-body');
    articleBody.querySelector('.article-lead').textContent = article.lead;
    articleBody.querySelector('blockquote').firstChild.textContent = `“${article.quote}”`;
    articleBody.querySelector('h2').textContent = article.sectionTitle;
    const bodyParagraphs = [...articleBody.querySelectorAll('p')].filter((paragraph) => !paragraph.classList.contains('article-lead') && !paragraph.classList.contains('article-disclaimer'));
    bodyParagraphs.forEach((paragraph, index) => { paragraph.textContent = article.paragraphs[index] || ''; });
    const inlineImage = articleBody.querySelector('.article-inline-image img');
    const project = content.projects[articleIndex % content.projects.length];
    inlineImage.src = project.gallery[1].src;
    inlineImage.alt = `${article.title} · ${project.gallery[1].alt}`;
    articleBody.querySelector('.article-inline-image figcaption').textContent = `01 / ${categoryLabel(article.category)} · ${project.location}`;
  }

  function renderContact() {
    root.innerHTML = `<section class="route-hero contact-page-hero"><p class="eyebrow"><span class="eyebrow-line"></span> Iniciar um projeto</p><h1 class="title-reveal">Conte sobre<br />o lugar que tem <em>em mente.</em></h1><div class="route-hero-bottom"><p>A primeira conversa começa pela escuta.</p><span>ESTÚDIO / SÃO PAULO</span></div></section><section class="contact-page section-wrap"><div class="contact-form-column"><p class="eyebrow dark-eyebrow"><span class="eyebrow-line"></span> Consulta sobre projeto</p><h2>Alguns detalhes<br />para <em>começar.</em></h2>${notice}<form class="project-enquiry-form" novalidate>
        <label>Nome <span>*</span><input name="name" autocomplete="name" required placeholder="Seu nome" /><small class="field-error" aria-live="polite"></small></label>
        <label>E-mail <span>*</span><input type="email" name="email" autocomplete="email" required placeholder="seu@email.com" /><small class="field-error" aria-live="polite"></small></label>
        <label>Telefone <span class="optional-label">Opcional</span><input name="phone" type="tel" autocomplete="tel" placeholder="+00 000 000 0000" /></label>
        <label>Localização <span>*</span><input name="location" autocomplete="address-level2" required placeholder="Cidade, país" /><small class="field-error" aria-live="polite"></small></label>
        <label>Tipo de projeto <span>*</span><select name="projectType" required><option value="">Escolha um tipo</option><option>Arquitetura</option><option>Arquitetura de interiores</option><option>Planejamento urbano</option><option>Paisagismo</option><option>Reformas</option><option>Consultoria</option><option>Design de objetos</option></select><small class="field-error" aria-live="polite"></small></label>
        <label>Orçamento <span class="optional-label">Opcional</span><select name="budget"><option value="">Prefiro conversar</option><option>A definir em conversa</option><option>Faixa a confirmar</option></select></label>
        <label class="form-message">Mensagem <span>*</span><textarea name="message" rows="5" required placeholder="O que você gostaria de tornar possível neste espaço?"></textarea><small class="field-error" aria-live="polite"></small></label>
        <button class="form-submit magnetic" type="submit">Preparar mensagem ${arrow}</button><p class="form-status" role="status" aria-live="polite"></p><p class="form-privacy">Esta demonstração prepara uma mensagem no seu aplicativo de e-mail. Nenhuma informação é enviada ou armazenada por esta página.</p>
      </form></div><aside class="contact-aside"><div class="contact-aside-map"><div class="map-grid" aria-hidden="true"><span class="map-cross map-cross-a">+</span><span class="map-cross map-cross-b">+</span><i class="map-route"></i><b class="map-pin">CA</b></div><div class="map-caption"><span>SÃO PAULO · BR</span><span>23° 33' S — 46° 38' W</span></div></div><div class="contact-detail-list"><div><span>ESTÚDIO</span><strong>Clara Andrade Arquitetura</strong></div><div><span>E-MAIL</span><a href="mailto:studio@claraandrade.example">studio@claraandrade.example</a></div><div><span>TELEFONE</span><strong>Campo demonstrativo editável</strong></div><div><span>ENDEREÇO</span><strong>São Paulo, Brasil · Endereço completo a confirmar</strong></div><div><span>REDES</span><strong>Instagram · Pinterest · LinkedIn</strong></div></div><p class="contact-aside-note">Os dados do estúdio são demonstrativos e editáveis. Confirme contato e endereço antes de publicar.</p></aside></section>`;
    const form = root.querySelector('.project-enquiry-form');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = form.querySelector('.form-status');
      let isValid = true;
      form.querySelectorAll('[required]').forEach((field) => {
        const error = field.parentElement.querySelector('.field-error');
        const fieldValid = field.checkValidity();
        field.setAttribute('aria-invalid', String(!fieldValid));
        if (error) error.textContent = fieldValid ? '' : field.validity.typeMismatch ? 'Digite um e-mail válido.' : 'Este campo é obrigatório.';
        isValid &&= fieldValid;
      });
      if (!isValid) {
        status.textContent = 'Revise os campos indicados.';
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      const values = new FormData(form);
      const subject = encodeURIComponent(`Consulta sobre projeto — ${values.get('name')}`);
      const message = encodeURIComponent(`Nome: ${values.get('name')}\nE-mail: ${values.get('email')}\nTelefone: ${values.get('phone') || 'Não informado'}\nLocalização: ${values.get('location')}\nTipo de projeto: ${values.get('projectType')}\nOrçamento: ${values.get('budget') || 'A definir em conversa'}\n\n${values.get('message')}`);
      status.textContent = 'Seu aplicativo de e-mail abrirá com a mensagem preparada. Esta demonstração não envia nem armazena dados.';
      window.location.href = `mailto:studio@claraandrade.example?subject=${subject}&body=${message}`;
    });
    form.querySelectorAll('input, select, textarea').forEach((field) => field.addEventListener('input', () => {
      field.removeAttribute('aria-invalid');
      const error = field.parentElement.querySelector('.field-error');
      if (error) error.textContent = '';
    }));
  }

  function renderPage() {
    const renderers = { projects: renderProjects, project: renderProject, studio: renderStudio, services: renderServices, process: renderProcess, journal: renderJournal, article: renderArticle, contact: renderContact };
    renderers[page]?.();
    if (page === 'article') renderArticleContent();
    if (isHome) {
      document.querySelectorAll('.project-card').forEach((card) => {
        const title = card.querySelector('h3')?.textContent.trim();
        const match = content.projects.find((project) => project.title.toLowerCase() === title?.toLowerCase());
        if (match) {
          card.href = route(`projects/${match.id}`);
          card.dataset.cursorLabel = 'ABRIR';
        }
      });
    }
    document.querySelectorAll('.site-header a, .site-footer a').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (link.protocol === 'mailto:' || link.protocol === 'tel:' || link.target === '_blank' || link.hash || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.pathname === location.pathname) return;
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('studio:navigate', { detail: { href: link.href, source: link } }));
      });
    });
    initMenuPreview();
    initPageLoader();
  }

  function initPageLoader() {
    const loader = document.querySelector('.page-loader');
    const percent = loader.querySelector('.loader-percent');
    const line = loader.querySelector('.loader-line > b');
    const finishAfter = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 40 : 360;
    requestAnimationFrame(() => { percent.textContent = '100'; line.style.transform = 'scaleX(1)'; });
    window.setTimeout(() => {
      loader.classList.add('is-finished');
      window.setTimeout(() => loader.remove(), 650);
    }, finishAfter);
  }

  function initMenuPreview() {
    const preview = document.querySelector('.menu-image img');
    if (!preview) return;
    const menuImages = [content.projects[0].image, content.projects[1].image, content.projects[2].image, content.projects[3].image, content.articles[0].image, content.projects[4].image];
    document.querySelectorAll('.site-nav a').forEach((link, index) => {
      const update = () => {
        preview.classList.add('is-changing');
        window.setTimeout(() => { preview.src = menuImages[index % menuImages.length]; preview.classList.remove('is-changing'); }, 180);
      };
      link.addEventListener('pointerenter', update);
      link.addEventListener('focus', update);
    });
  }

  renderSharedChrome();
  renderPage();
})();
