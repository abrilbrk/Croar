/* CroAr · app web progresiva. Sin frameworks: rutas con #, vistas como plantillas. */
(function () {
  'use strict';
  const D = window.DATA;
  const ICO = window.ICONS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (n, cls = '') => ICO[n].replace('<svg ', `<svg class="${cls}" `);
  const im = (n) => `assets/img/${n}.jpg`;

  /* ---------- Guardado local (solo en este dispositivo) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('croar:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('croar:' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };
  const guardados = () => store.get('guardados', {});
  const usuario = () => store.get('usuario', null);

  const LOGO = `<svg viewBox="0 0 170 32" width="127" height="24" role="img" aria-label="CroAr"><use href="#logo-cro"/><use href="#logo-ar"/></svg>`;
  const LOGO_BLANCO = `<svg viewBox="0 0 170 32" width="150" height="28" role="img" aria-label="CroAr"><use href="#logo-cro" fill="#fff"/><use href="#logo-ar" fill="#fff"/></svg>`;

  /* ---------- Componentes ---------- */
  const corner = () => '<div class="corner" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>';

  const saveBtn = (item, cls = 'save-btn') => {
    const on = !!guardados()[item.id];
    return `<button class="${cls}" data-save='${esc(JSON.stringify(item))}' aria-pressed="${on}" aria-label="${on ? 'Quitar de guardados' : 'Guardar'}">${ic('bookmark')}</button>`;
  };

  const btn = (txt, href, kind = 'primary', extra = '') => `<a class="btn btn-${kind} ${extra}" href="${href}">${txt}</a>`;

  const secTitle = (t, link) => `<div class="sec-head"><h2 class="title-l">${t}</h2>${link ? `<a href="${link[1]}">${link[0]}</a>` : ''}</div>`;

  const agenda = (titulo, derecha, filas, boton, href = '#/comunidad/actividades') => `
    <section class="agenda" aria-label="${esc(titulo)}">
      <div class="agenda-head"><h2 class="title-m">${titulo}</h2><span class="headline-l">${derecha}</span></div>
      ${filas.map((f) => {
        const ext = f.href && f.href.startsWith('http');
        const link = f.href || href;
        return `<a class="fila" href="${link}" ${ext ? 'target="_blank" rel="noopener"' : ''}>
          <div class="fila-foto"><img src="${im(f.img)}" alt="" loading="lazy"><span class="fecha">${f.fecha}</span></div>
          <div class="fila-info"><span class="overline">${f.cat}</span><b class="title-s">${f.titulo}</b><span class="body-s muted">${f.meta}</span></div>
          <span class="sq-btn" aria-hidden="true">${ic('chevron_right')}</span>
        </a>`;
      }).join('')}
      ${boton ? btn(boton, href, 'outline', 'btn-block') : ''}
    </section>`;

  const mosaico = (img) => `<div class="mosaico" aria-hidden="true">${'<span></span>'.repeat(4).replace(/<span>/g, `<span style="background-image:url(${im(img)})">`)}</div>`;

  const novedad = (n, destacada) => `
    <a class="novedad ${destacada ? 'destacada' : ''}" href="${n.href}">
      ${mosaico(n.img)}
      <div class="novedad-txt">
        <div class="cat overline"><span>${n.cat}</span><i></i><span>${n.cuando}</span></div>
        <h3 class="title-m">${n.titulo}</h3>
        <p class="body-m muted">${n.txt}</p>
        ${n.cierre ? `<div class="cierre label-m">${ic('timer')}<span>${n.cierre}</span></div>` : ''}
        <span class="btn btn-tonal btn-sm">Leer más</span>
      </div>
    </a>`;

  const oferta = (o) => `
    <article class="oferta ${o.soloEscritorio ? 'solo-escritorio' : ''}">
      <a class="foto-card" href="${o.href}">
        <img src="${im(o.img)}" alt="" loading="lazy">
        ${o.celeste ? `<div class="veil-celeste"></div><div class="saludos" aria-hidden="true"><div>BOK</div><div><b>H</b>VALA</div><div>DO<b>V</b>IĐENJA</div><div>ZDR<b>A</b>VO</div><div><b>L</b>AKU NOĆ</div><div>DOB<b>A</b>R DAN</div></div>` : '<div class="veil"></div>'}
        <span class="big ${o.celeste ? 'azul' : ''}" aria-hidden="true">${o.palabra}</span>
        <span class="pill">${o.pill}</span>
        ${corner()}
      </a>
      <div class="oferta-tit"><a href="${o.href}">${o.titulo}</a>${saveBtn({ id: o.id, titulo: o.titulo, meta: o.meta, img: o.img, href: o.href })}</div>
      <p class="body-s muted">${o.meta}</p>
    </article>`;

  const apilado = (items, id) => `
    <div class="apilado" id="${id}" role="region" aria-roledescription="carrusel" tabindex="0">
      ${items.map((c, i) => `<a class="card" href="${c.href}" data-i="${i}"><img src="${im(c.img)}" alt="" loading="lazy"><div class="veil"></div><div class="txt"><b>${c.titulo}</b><span>${c.txt}</span></div></a>`).join('')}
    </div>
    <div class="dots" data-dots="${id}">${items.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>`;

  const historias = (lista) => `
    <section class="sec"><h2 class="title-l">Historias vividas</h2>
      <div class="historias" data-historias>
        <button class="arrow-btn prev" aria-label="Anterior">${ic('chevron_right')}</button>
        <div class="historia" aria-live="polite"></div>
        <button class="arrow-btn next" aria-label="Siguiente">${ic('chevron_right')}</button>
      </div>
      <div class="dots">${lista.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
    </section>`;
  const HISTORIAS = [
    { cat: 'Domovina', cuando: '2025', titulo: 'Un antes y un después en mi vida', txt: '“Conocí a mi familia y a gente de todo el mundo con mis mismas raíces.” Abril Brkljacic.', img: 'abril-mar' },
    { cat: 'Eco Heritage', cuando: 'Dalmacia, 2025', titulo: 'Dos semanas cuidando la costa croata', txt: '“Conocí a primos lejanos y la tierra de mi bisabuelo.” Martín, 22 años, Córdoba.', img: 'dubrovnik-vista' },
    { cat: 'Croaticum', cuando: '2024', titulo: 'Mi mes en el Croaticum de Zagreb', txt: '“Volví hablando con mi abuela en su idioma.” Lucía, 27 años, Rosario.', img: 'croaticum-aula' }
  ];

  const video = (img, dur, titulo) => `<a class="video" href="#" data-video><img src="${im(img)}" alt="" loading="lazy"><span class="play" aria-hidden="true"></span><span class="overline">Video · ${dur}</span><h3>${titulo}</h3></a>`;

  const bloque = (img, titulo, txt, extra = '', esquina = true) => `<section class="bloque"><img src="${im(img)}" alt="" loading="lazy">${esquina ? corner() : ''}<h2>${titulo}</h2><p>${txt}</p>${extra}</section>`;

  /* ---------- Vistas ---------- */
  const V = {};

  V.home = () => {
    const nov = { href: '#/oportunidades/croaticum', img: 'bote', cat: 'Idioma', cuando: 'Hace 2 días', titulo: 'Abrió la inscripción a Croaticum', txt: 'Semestre de verano en la Universidad de Zagreb, de marzo a junio. Pagando o con beca.', cierre: 'Cierra el 15 de febrero' };
    return `
    <section class="hero" aria-label="Secciones de CroAr">
      <picture><source media="(min-width:1024px)" srcset="${im('camino-isla')}"><img class="hero-photo" src="${im('gobierno-domovina')}" alt=""></picture>
      <div class="hero-veil"></div>
      <a class="tile tile-azul t-com" href="#/comunidad">${ic('comunidad')}<span>Comunidad</span></a>
      <a class="tile tile-rojo t-ciu" href="#/ciudadania">${ic('ciudadania')}<span>Ciudadanía</span></a>
      <a class="tile tile-celeste t-opo" href="#/oportunidades">${ic('oportunidades')}<span>Oportunidades</span></a>
      <a class="tile tile-crema t-idi" href="#/idioma">${ic('idioma')}<span>Idioma</span></a>
      <p class="hero-lema">Tus raíces, en un solo lugar.</p>
      <div class="hero-bajada"><h1 class="lema-desk">Tus raíces, en un solo lugar.</h1><p>Ciudadanía, idioma, becas y la agenda de la colectividad croata en Argentina, todo junto y al día.</p></div>
    </section>
    <div class="wrap stack">
      <section class="sec"><h2 class="title-l sec-title">Última novedad</h2>${novedad(nov, true)}</section>
      <section class="sec">${secTitle('Cierra pronto', ['Ver todas', '#/oportunidades'])}
        <div class="ofertas">${D.cierraPronto.map(oferta).join('')}</div></section>
      <div class="solo-movil">${agenda('Agenda', 'Nov 2026', D.agenda, 'Ver toda la agenda')}</div>
      <section class="instalar" data-instalar hidden>
        <div class="txt"><b class="title-m">Llevá CroAr con vos</b><p class="body-m">Instalala en tu celular o compu: abre al toque y funciona sin conexión.</p></div>
        <button class="btn" data-install>Instalar CroAr</button>
      </section>
    </div>`;
  };

  V.oportunidades = () => `
    <div class="wrap stack" style="padding-bottom:0">
      <section class="sec"><h1 class="title-l sec-title">¿Qué buscás hoy?</h1>${apilado(D.buscasHoy, 'ap-opo')}</section>
      ${agenda('Próximas postulaciones', '2026', D.postulaciones, 'Ver todas las postulaciones', '#/oportunidades/becas')}
    </div>
    <div style="height:32px"></div>
    ${video('gobierno-domovina', '2:45', 'Así fue Domovina 2025')}
    <div class="wrap stack">
      <section class="sec"><h2 class="title-l sec-title">Requisitos Domovina</h2>
        ${novedad({ href: '#/oportunidades/domovina', img: 'camino-isla', cat: 'Beca', cuando: 'Domovina', titulo: '¿Quién puede postularse?', txt: 'Descendientes de croatas de 18 a 35 años. Te contamos paso a paso qué documentos necesitás.' }, true).replace('Leer más', 'Ver requisitos')}
      </section>
    </div>`;

  V.becas = () => `
    <div class="wrap page-title"><h1 class="title-l center">Seleccioná lo que estás buscando</h1></div>
    <div class="selector">
      <a class="sel-foto" href="#/oportunidades/estudiar-croata"><img src="${im('croaticum-clase')}" alt=""><span>Estudiar croata en Croacia</span><i class="mark" style="background:var(--rojo)"></i></a>
      <p class="sel-txt right">Cursos de idioma y cultura en Zagreb, Split y Zadar, para todas las edades.</p>
      <p class="sel-txt">Voluntariados, viajes de raíces y encuentros con jóvenes de la diáspora.</p>
      <a class="sel-foto" href="#/oportunidades/experiencias"><img src="${im('gobierno-domovina')}" alt=""><span>Experiencias</span><i class="mark" style="background:var(--azul)"></i></a>
    </div>
    <div class="wrap stack">${historias(HISTORIAS)}${agenda('Próximas postulaciones', '2026', D.postulacionesIdioma, 'Ver todas las postulaciones', '#/oportunidades')}</div>`;

  V.estudiar = () => `
    <section class="damero" aria-label="Programas">
      <img src="${im('dubrovnik-palacio')}" alt=""><div class="veil"></div>
      <a class="tile tile-azul" style="grid-area:1/1" href="#/oportunidades/croaticum">Croaticum</a>
      <h1 class="t-ttl" style="grid-area:1/2/2/4">Estudiar croata en Croacia</h1>
      <a class="tile tile-celeste" style="grid-area:2/2" href="#/oportunidades/croaticum">Escuela universitaria de idioma y cultura croata (Matica)</a>
      <a class="tile tile-rojo" style="grid-area:3/1" href="#/oportunidades/croaticum">Pequeña escuela de idioma y cultura croata (para niños)</a>
      <p class="t-txt" style="grid-area:3/2/4/4">Tres programas para aprender el idioma y la cultura en Croacia, según tu edad y tu nivel.</p>
    </section>
    <div class="wrap stack">${historias(HISTORIAS)}${agenda('Próximas postulaciones', '2026', D.postulacionesIdioma, 'Ver todas las postulaciones', '#/oportunidades')}</div>`;

  V.experiencias = () => `
    <div class="wrap page-title"><h1 class="title-l">Experiencias</h1></div>
    <section class="damero alto" aria-label="Experiencias">
      <img src="${im('banderas')}" alt=""><div class="veil"></div>
      <a class="tile tile-azul" style="grid-area:1/1" href="#/oportunidades/domovina">Domovina</a>
      <a class="tile tile-rojo" style="grid-area:1/3" href="#/oportunidades/experiencias">Concurso “Najljepša Hrvatica” en traje tradicional</a>
      <a class="tile tile-celeste" style="grid-area:2/2" href="#/oportunidades/experiencias">Eco Heritage Task Force</a>
      <a class="tile tile-rojo" style="grid-area:3/1" href="#/comunidad/kolo-velebit">Escuela de folklore croata</a>
      <a class="tile tile-azul" style="grid-area:3/3" href="#/oportunidades/experiencias">Campamento deportivo de verano (Matis)</a>
    </section>
    <div class="wrap stack">${historias([HISTORIAS[1], HISTORIAS[0], HISTORIAS[2]])}${agenda('Próximas postulaciones', '2026', D.postulacionesExp, 'Ver todas las postulaciones', '#/oportunidades')}</div>`;

  const detalle = (o) => `
    <section class="det-hero"><img src="${im(o.img)}" alt="">
      ${saveBtn({ id: o.id, titulo: o.titulo, meta: o.meta, img: o.img, href: o.href }, 'save-btn save-round')}
      <span class="overline">${o.over}</span><h1>${o.titulo}</h1><p>${o.txt}</p>
      <a class="btn btn-tonal" href="${o.masInfo}" target="_blank" rel="noopener">Más info</a>
    </section>
    <div class="bloques">${o.bloques.join('')}</div>`;

  V.domovina = () => detalle({
    id: 'op-domovina', href: '#/oportunidades/domovina', img: 'gobierno-domovina', over: 'Programa · Jóvenes de 18 a 30', titulo: 'Domovina',
    meta: 'Cierra el 15 de diciembre', masInfo: 'https://hrvatiizvanrh.gov.hr/',
    txt: 'Un viaje para conocer la tierra de tus abuelos junto a jóvenes croatas de todo el mundo.',
    bloques: [
      bloque('grupo-domovina', 'Qué es', 'Dos semanas recorriendo Croacia con talleres de idioma, historia y cultura, y encuentros con la comunidad local.'),
      bloque('dubrovnik-vista', 'Cuándo', 'Del 5 al 19 de julio de 2027. Postulaciones abiertas hasta el 15 de diciembre de 2026.', `<a class="btn btn-primary" href="https://hrvatiizvanrh.gov.hr/" target="_blank" rel="noopener">Postularme</a>`)
    ]
  });

  V.croaticum = () => detalle({
    id: 'op-croaticum', href: '#/oportunidades/croaticum', img: 'croaticum-clase', over: 'Curso · Idioma croata', titulo: 'Croaticum',
    meta: 'Semestre de verano: de marzo a junio', masInfo: 'https://croaticum.ffzg.unizg.hr/',
    txt: 'Aprendé croata en la Universidad de Zagreb, pagando el curso o con beca para descendientes.',
    bloques: [
      bloque('croaticum-aula', 'Qué es', 'La escuela de idioma croata de la Universidad de Zagreb. También hay cursos en Split, Rijeka, Osijek, Pula y Zadar.'),
      bloque('san-marcos', 'Cuándo', 'Semestre de invierno: de octubre a enero. Semestre de verano: de marzo a junio. Las becas suelen abrir en abril.', btn('Ver becas', '#/oportunidades/becas', 'primary')),
      bloque('amigos-ciudad', 'La beca', 'Clases presenciales en Croacia, alojamiento en residencia estudiantil y comida, según cada convocatoria.')
    ]
  });

  V.ciudadania = () => `
    <div class="wrap stack" style="padding-bottom:0">
      <div class="two-col even">
        <section class="sec"><h1 class="title-l sec-title">Guía paso a paso</h1>
          <div class="pasos-foto">
            <ol class="pasos" style="list-style:none;margin:0;padding:0">
              ${['Requisitos', 'Documentos', 'Apostilla y traducción', 'Armado y presentación', 'Espera y resolución'].map((p, i) => `<li><a class="paso ${i === 0 ? 'on' : ''}" href="#/ciudadania/requisitos${i ? '?paso=' + (i + 1) : ''}"><span class="n">${i + 1}</span><span>${p}</span>${ic('chevron_right')}</a></li>`).join('')}
            </ol>
            <div class="paso-foto"><img src="${im('banderas')}" alt="">${corner()}</div>
          </div>
        </section>
        <section class="sec">
          <div class="sec-head"><h2 class="title-l">Traductores y gestores</h2><div style="display:flex;gap:8px"><button class="arrow-btn prev" data-carril="-1" aria-label="Anterior">${ic('chevron_right')}</button><button class="arrow-btn" data-carril="1" aria-label="Siguiente">${ic('chevron_right')}</button></div></div>
          <div class="carril" data-carril-box>
            <a class="persona" href="mailto:?subject=Traducción%20para%20ciudadanía%20croata"><img src="${im('grupo-domovina')}" alt=""><div><b>Jelena</b><small>TRADUCTORA</small></div></a>
            <a class="persona" href="mailto:?subject=Gestión%20de%20ciudadanía%20croata"><img src="${im('peka')}" alt=""><div><b>Peka</b><small>GESTORA</small></div></a>
            <a class="persona" href="https://mvep.gov.hr/" target="_blank" rel="noopener"><img src="${im('dubrovnik-palacio')}" alt=""><div><b>Otros</b><small>VER LISTADO</small></div></a>
          </div>
        </section>
      </div>
    </div>
    <div style="height:32px"></div>
    <section class="bloque" style="min-height:240px"><img src="${im('stradun-bandera')}" alt=""><span class="overline">Último paso</span><h2>Juramento</h2><p>El acto en el consulado donde recibís tu ciudadanía croata. Te contamos cómo prepararte.</p></section>
    <div class="wrap stack">${agenda('Próximas fechas consulares', '2026', D.fechasConsulares, 'Ver todas las fechas', '#/ciudadania/requisitos')}</div>`;

  V.requisitos = (q) => {
    const paso = Math.min(5, Math.max(1, parseInt(q.get('paso') || '1', 10)));
    const nombres = ['Requisitos', 'Documentos', 'Apostilla y traducción', 'Armado y presentación', 'Espera y resolución'];
    const casos = [
      ['Soy descendiente', ['Tu partida de nacimiento, apostillada y traducida.', 'Partidas de nacimiento y matrimonio de toda la línea hasta tu ancestro croata.', 'Un documento que pruebe el origen croata de tu ancestro.', 'Certificado de antecedentes penales de Argentina.', 'Copia de tu DNI y pasaporte vigentes.', 'Formulario de solicitud y una breve biografía (životopis).']],
      ['Soy cónyuge', ['Acta de matrimonio apostillada y traducida.', 'Documentos de la ciudadanía croata de tu cónyuge.', 'Certificado de antecedentes penales de Argentina.', 'Copia de tu DNI y pasaporte vigentes.']],
      ['Tengo hijos menores', ['Partida de nacimiento de cada hijo, apostillada y traducida.', 'Consentimiento de ambos padres.', 'Documento croata del padre o la madre.']]
    ];
    return `<div class="wrap stack">
      <div><p class="overline" style="font-weight:700">Paso ${paso} de 5 · ${nombres[paso - 1]}</p><h1 class="title-l sec-title" style="margin-top:4px">¿Cuál es tu caso?</h1>
      <div class="progreso" aria-hidden="true">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= paso ? 'on' : ''}"></i>`).join('')}</div></div>
      <div class="acordeon">${casos.map((c, i) => `<details ${i === 0 ? 'open' : ''}><summary>${c[0]}${ic('chevron_right')}</summary><ol>${c[1].map((t, j) => `<li><span class="n">${j + 1}</span><span>${t}</span></li>`).join('')}</ol><p class="nota body-s muted">Requisitos orientativos: confirmalos siempre con el consulado.</p></details>`).join('')}</div>
      ${paso < 5 ? btn('Siguiente paso', '#/ciudadania/requisitos?paso=' + (paso + 1), 'primary', 'btn-block') : btn('Volver a la guía', '#/ciudadania', 'primary', 'btn-block')}
      ${agenda('Próximas fechas consulares', '2026', D.fechasConsulares, 'Ver todas las fechas', '#/ciudadania')}
    </div>`;
  };

  const mapa = (cerca) => `
    <section class="mapa" aria-label="Mapa de centros croatas en Argentina"><div class="mapa-in" data-mapa>
      <div class="mapa-sq" aria-hidden="true">${window.MAPA_CUADROS.map(([x, y]) => `<i style="left:${x}px;top:${y}px"></i>`).join('')}</div>
      <div class="mapa-txt"><p class="overline">${cerca ? 'Cerca tuyo' : 'Mapa de la comunidad'}</p><h2>Centros croatas en Argentina</h2><p data-mapa-txt>28 centros en todo el país. Tocá una foto para ver qué hay cerca.</p></div>
      ${D.centros.map((c) => `<button class="pin ${c.id === 'cordoba' ? 'on' : ''}" style="left:${c.x}px;top:${c.y}px" data-pin="${c.id}" aria-label="${c.nombre}: ${c.n} ${c.n === 1 ? 'centro' : 'centros'}"><span class="ph"><img src="${im(c.img)}" alt="" loading="lazy"><b>${c.n}</b></span></button>`).join('')}
      <div class="mapa-card" aria-live="polite" data-mapa-card></div>
      <p class="mapa-fuente">Fuente: <a href="https://croaciasiempre.org" target="_blank" rel="noopener" style="text-decoration:underline">croaciasiempre.org</a></p>
      <button class="btn btn-tonal" data-ubicacion>${ic('location_on')}<span>Usar mi ubicación</span></button>
    </div></section>`;

  V.comunidad = () => `
    <div class="wrap stack" style="padding-bottom:32px"><section class="sec"><h1 class="title-l sec-title">¿Qué querés descubrir hoy?</h1>${apilado(D.descubrir, 'ap-com')}</section></div>
    ${mapa()}
    <div class="wrap stack">
      <div class="two-col">
        <section class="sec"><h2 class="title-l sec-title">Última novedad</h2>${novedad({ href: '#/comunidad/actividades', img: 'grupo-domovina', cat: 'Coro', cuando: 'Hace 2 días', titulo: 'Vuelve el coro de la colectividad', txt: 'Ensayos los sábados en Rosario. Abierto a todas las edades, sin experiencia previa.' })}</section>
        ${agenda('Agenda', 'Nov 2026', D.agenda, 'Ver toda la agenda')}
      </div>
    </div>`;

  V.asociaciones = () => `
    ${mapa()}
    <div class="wrap stack" style="padding-bottom:32px"><section class="sec"><h1 class="title-l sec-title">Asociaciones</h1>${apilado(D.asociaciones.map((a) => ({ ...a, href: '#/comunidad/asociaciones#hogar' })), 'ap-aso')}</section></div>
    <section class="bloque" id="hogar" style="min-height:340px"><img src="${im('banderas')}" alt="">${corner()}<span class="overline">Centro croata · Córdoba</span><h2>Hogar Croata</h2><p>Coro, kolo y clases de croata. Abierto los sábados de 16 a 20 h.</p><a class="btn btn-tonal" href="https://www.google.com/maps/search/?api=1&query=Hogar+Croata+C%C3%B3rdoba" target="_blank" rel="noopener">Cómo llegar</a></section>
    <div class="wrap stack">${agenda('Próximas actividades', 'Nov 2026', D.agenda, 'Ver toda la agenda')}</div>`;

  V.actividades = () => `
    <section class="damero alto" aria-label="Actividades">
      <img src="${im('banderas')}" alt=""><div class="veil"></div>
      <a class="tile tile-rojo" style="grid-area:1/1" href="#/comunidad/kolo-velebit">Cultura croata para niños</a>
      <h1 class="t-ttl" style="grid-area:1/2/2/4;align-self:end">Actividades</h1>
      <a class="tile tile-celeste" style="grid-area:2/2" href="#/comunidad/kolo-velebit">Kolito, escuela croata para niños (Asociación Croata Jadran)</a>
      <a class="tile tile-azul" style="grid-area:3/1" href="#/comunidad/kolo-velebit">Danza croata, grupo Kolo Velebit</a>
      <a class="tile tile-rojo" style="grid-area:3/3" href="#/comunidad/kolo-velebit">Taller de folklore croata</a>
    </section>
    <div class="wrap stack"><div class="two-col">
      <section class="sec"><h2 class="title-l sec-title">Última novedad</h2>${novedad({ href: '#/comunidad/kolo-velebit', img: 'grupo-domovina', cat: 'Coro', cuando: 'Hace 2 días', titulo: 'Vuelve el coro de la colectividad', txt: 'Ensayos los sábados en Rosario. Abierto a todas las edades, sin experiencia previa.' })}</section>
      ${agenda('Próximas actividades', 'Nov 2026', D.agenda, 'Ver toda la agenda')}
    </div></div>`;

  V.kolo = () => `
    <section class="det-hero"><img src="${im('folclore-trajes')}" alt="">
      ${saveBtn({ id: 'co-kolo', titulo: 'Kolo Velebit', meta: 'Danza croata · Buenos Aires', img: 'folclore-trajes', href: '#/comunidad/kolo-velebit' }, 'save-btn save-round')}
      <span class="overline">Danza croata · Buenos Aires</span><h1>Kolo Velebit</h1><p>¿Querés sumarte? Ensayamos todos los sábados y no hace falta experiencia.</p>
      <a class="btn btn-tonal" href="https://www.instagram.com/explore/search/keyword/?q=kolo%20velebit" target="_blank" rel="noopener">Más info</a>
    </section>
    <div class="wrap stack"><section class="sec"><h2 class="title-l sec-title">Última novedad</h2>${novedad({ href: '#/comunidad/actividades', img: 'kolo-velebit', cat: 'Danza', cuando: 'Hace 2 días', titulo: 'Kolo Velebit bailó en la Fiesta de las Colectividades', txt: 'Más de 20 bailarines llevaron el kolo y los trajes de Lika al escenario.' })}</section></div>
    ${video('banderas', '1:30', 'Así baila Kolo Velebit')}`;

  V.idioma = () => `
    <div class="wrap page-title"><h1 class="title-l center">¿Cómo querés aprender croata?</h1></div>
    <div class="selector">
      <a class="sel-foto" href="#/oportunidades/estudiar-croata"><img src="${im('dubrovnik-palacio')}" alt=""><span>Presencial</span><i class="mark" style="background:var(--rojo)"></i></a>
      <p class="sel-txt right">Clases en asociaciones de tu ciudad o cursos en Croacia.</p>
      <p class="sel-txt">Clases online en vivo o cursos para hacer a tu ritmo.</p>
      <a class="sel-foto" href="#/idioma/cursos-online"><img src="${im('stradun-bandera')}" alt=""><span>Virtual</span><i class="mark" style="background:var(--azul)"></i></a>
    </div>
    <a class="banda" href="#/oportunidades/croaticum"><div style="flex:1"><p class="overline">Beca de lengua en Croacia</p><h2>Croaticum</h2><p class="body-s">Cursos de croata en Zagreb para descendientes.</p></div><span class="sq-btn">${ic('chevron_right')}</span></a>
    <div class="wrap page-title"><h2 class="title-l center">Aprendiendo croata (a tu ritmo)</h2></div>
    <section class="recursos" aria-label="Recursos para aprender croata">
      <img src="${im('dubrovnik-vista')}" alt="">
      <p class="intro">Recursos para practicar cuando quieras. No son cursos con horario: entrás, elegís y avanzás a tu ritmo.</p>
      ${[
        ['Cursos online del Estado croata', 'Curso guiado para empezar desde cero.', ['A1–A2', 'Gratis'], 'tile-azul', 'https://hrvatiizvanrh.gov.hr/'],
        ['LearnCro', 'Lecciones online con audio y ejercicios.', ['A1–B1', 'Pago'], 'tile-rojo', 'https://www.learncro.com/'],
        ['Aspira / CLA', 'Clases online en vivo con profesor.', ['A1–C1', 'Pago'], 'tile-celeste', 'https://www.aspira.hr/'],
        ['HRT', 'Series, radio y noticias en croata.', ['Todos', 'Gratis'], 'tile-crema', 'https://hrti.hrt.hr/']
      ].map(([t, d, tags, cls, href]) => `<a class="recurso tile ${cls}" href="${href}" target="_blank" rel="noopener"><b class="title-s">${t}</b><span class="body-s" style="font-weight:400">${d}</span><span class="tags">${tags.map((g) => `<span class="tag">${g}</span>`).join('')}</span></a>`).join('')}
    </section>
    <div style="height:32px"></div>`;

  V.cursos = () => `
    <section class="damero alto" aria-label="Cursos online">
      <img src="${im('stradun-bandera')}" alt=""><div class="veil"></div>
      <a class="tile tile-azul" style="grid-area:1/1" href="#cu">Curso online para Sudamérica</a>
      <a class="tile tile-celeste" style="grid-area:2/2" href="#cu">CROLive</a>
      <a class="tile tile-rojo" style="grid-area:3/3" href="#cu">HIT-1</a>
      <h1 class="t-ttl" style="grid-area:3/1/4/3;align-self:end;text-align:left">Cursos online</h1>
    </section>
    <section class="bloque" style="min-height:240px"><img src="${im('gobierno-domovina')}" alt=""><span class="overline">Clases en vivo</span><h2>Aprendé con profes desde Croacia</h2></section>
    <div class="wrap stack" id="cu">${agenda('Cursos', 'Nov 2026', D.cursos, 'Ver todos los cursos', '#/idioma')}</div>`;

  /* ---------- Buscador ---------- */
  const INDICE = [
    { s: 'Oportunidades', t: 'Programa', titulo: 'Domovina', txt: 'Un viaje para conocer la tierra de tus abuelos junto a jóvenes croatas de todo el mundo.', img: 'gobierno-domovina', href: '#/oportunidades/domovina' },
    { s: 'Oportunidades', t: 'Requisitos', titulo: 'Domovina: requisitos', txt: 'Qué necesitás para postularte.', img: 'grupo-domovina', href: '#/oportunidades' },
    { s: 'Comunidad', t: 'Noticia', titulo: 'Abre la convocatoria Domovina', txt: 'Hogar Croata Córdoba te ayuda a postularte.', img: 'dubrovnik-vista', href: '#/comunidad/asociaciones' },
    { s: 'Oportunidades', t: 'Curso', titulo: 'Croaticum', txt: 'Aprendé croata en la Universidad de Zagreb, pagando el curso o con beca.', img: 'croaticum-clase', href: '#/oportunidades/croaticum' },
    { s: 'Oportunidades', t: 'Selector', titulo: 'Becas y programas', txt: 'Estudiá, viajá y conectate con Croacia.', img: 'grupo-domovina', href: '#/oportunidades/becas' },
    { s: 'Oportunidades', t: 'Programas', titulo: 'Estudiar croata en Croacia', txt: 'Croaticum, Escuela Matica y Pequeña escuela para niños.', img: 'dubrovnik-palacio', href: '#/oportunidades/estudiar-croata' },
    { s: 'Oportunidades', t: 'Experiencias', titulo: 'Experiencias', txt: 'Domovina, Najljepša Hrvatica, Eco Heritage Task Force, folklore y campamento Matis.', img: 'banderas', href: '#/oportunidades/experiencias' },
    { s: 'Ciudadanía', t: 'Guía', titulo: 'Ciudadanía por descendencia', txt: 'Guía paso a paso: requisitos, documentos, apostilla y traducción, presentación y resolución.', img: 'banderas', href: '#/ciudadania' },
    { s: 'Ciudadanía', t: 'Requisitos', titulo: '¿Cuál es tu caso?', txt: 'Requisitos para descendientes, cónyuges e hijos menores.', img: 'stradun-bandera', href: '#/ciudadania/requisitos' },
    { s: 'Ciudadanía', t: 'Fechas', titulo: 'Fechas consulares', txt: 'Consulado móvil en Córdoba, Mendoza, Rosario y Comodoro Rivadavia.', img: 'dubrovnik-palacio', href: '#/ciudadania' },
    { s: 'Comunidad', t: 'Mapa', titulo: 'Asociaciones y centros croatas', txt: '28 centros en todo el país, con mapa.', img: 'grupo-domovina', href: '#/comunidad/asociaciones' },
    { s: 'Comunidad', t: 'Actividad', titulo: 'Kolo Velebit', txt: 'Danza croata en Buenos Aires. Ensayos los sábados.', img: 'folclore-trajes', href: '#/comunidad/kolo-velebit' },
    { s: 'Comunidad', t: 'Agenda', titulo: 'Actividades y agenda', txt: 'Folclore, almuerzos, cine y cursos de croata.', img: 'bote', href: '#/comunidad/actividades' },
    { s: 'Idioma', t: 'Cursos', titulo: 'Cursos online de croata', txt: 'Curso para Sudamérica, CROLive y HIT-1.', img: 'stradun-bandera', href: '#/idioma/cursos-online' },
    { s: 'Idioma', t: 'Recursos', titulo: 'Aprender croata a tu ritmo', txt: 'LearnCro, Aspira, HRT y cursos del Estado croata.', img: 'dubrovnik-vista', href: '#/idioma' }
  ];
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

  V.buscar = (q) => {
    const term = q.get('q') || '';
    return `<div class="wrap stack">
      <form class="searchbar" role="search" data-buscar>${ic('search')}<label class="sr-only" for="q">Buscar</label><input id="q" name="q" type="search" placeholder="Buscá becas, cursos o trámites" value="${esc(term)}" autocomplete="off" enterkeyhint="search"><button type="button" class="icon-btn" data-limpiar aria-label="Borrar" ${term ? '' : 'hidden'}>${ic('close')}</button></form>
      <div data-resultados></div>
    </div>`;
  };
  function pintarBusqueda(term) {
    const box = $('[data-resultados]'); if (!box) return;
    const t = norm(term.trim());
    $('[data-limpiar]').hidden = !term;
    if (!t) {
      const rec = store.get('recientes', ['Croaticum', 'Ciudadanía por descendencia']);
      box.innerHTML = `<div class="stack" style="padding:0">
        ${rec.length ? `<section class="sec"><div class="sec-head"><h2 class="title-m">Búsquedas recientes</h2><button class="btn-text" style="color:var(--secondary);font-weight:700" data-borrar-rec>Borrar</button></div><div>${rec.map((r) => `<a class="reciente" href="#/buscar?q=${encodeURIComponent(r)}">${ic('schedule')}<span>${esc(r)}</span></a>`).join('')}</div></section>` : ''}
        <section class="sec"><h2 class="title-m">Explorá por sección</h2><div class="chips">${[['Oportunidades', '#/oportunidades'], ['Ciudadanía', '#/ciudadania'], ['Comunidad', '#/comunidad'], ['Idioma', '#/idioma']].map(([n, h]) => `<a class="chip" href="${h}">${n}</a>`).join('')}</div></section></div>`;
      return;
    }
    const res = INDICE.filter((r) => norm(`${r.titulo} ${r.txt} ${r.s} ${r.t}`).includes(t));
    const secciones = {}; res.forEach((r) => { secciones[r.s] = (secciones[r.s] || 0) + 1; });
    const hl = (s) => { const n = norm(s); const i = n.indexOf(t); return i < 0 ? esc(s) : esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + t.length)) + '</mark>' + esc(s.slice(i + t.length)); };
    box.innerHTML = `<div class="chips" style="margin-bottom:16px"><button class="chip" aria-pressed="true" data-f="">Todo (${res.length})</button>${Object.entries(secciones).map(([s, n]) => `<button class="chip" aria-pressed="false" data-f="${s}">${s} (${n})</button>`).join('')}</div>
      <p class="body-s muted">${res.length} ${res.length === 1 ? 'resultado' : 'resultados'}</p>
      ${res.length ? res.map((r) => `<a class="resultado" data-s="${r.s}" href="${r.href}"><img src="${im(r.img)}" alt="" loading="lazy"><div><p class="overline">${r.s} · ${r.t}</p><b class="title-s">${hl(r.titulo)}</b><p class="body-s muted">${hl(r.txt)}</p></div></a>`).join('') : `<p class="vacio">No encontramos nada con “${esc(term)}”. Probá con otra palabra, por ejemplo “beca” o “ciudadanía”.</p>`}`;
  }

  /* ---------- Cuenta y guardados (en este dispositivo) ---------- */
  V.ingresar = () => `<div class="wrap stack">
    <form class="form" data-form="ingresar">
      <p class="overline" style="font-weight:700">Tu cuenta CroAr</p><h1 class="title-l sec-title">Ingresá a CroAr</h1><p class="body-m muted">Guardá oportunidades y recibí avisos de eventos.</p>
      <div class="campo"><label for="mail">Correo electrónico</label><input id="mail" name="mail" type="email" placeholder="nombre@correo.com" required autocomplete="email"></div>
      <div class="campo"><label for="pass">Contraseña</label><input id="pass" name="pass" type="password" placeholder="••••••••" required minlength="6" autocomplete="current-password"></div>
      <button class="btn btn-primary btn-block" type="submit">Ingresar</button>
      <a class="btn btn-text" href="#/ingresar" data-olvide>Olvidé mi contraseña</a>
      <p class="separador">¿PRIMERA VEZ EN CROAR?</p>
      ${btn('Crear cuenta', '#/crear-cuenta', 'outline', 'btn-block')}
      <div class="aviso">${ic('info')}<p class="body-s">Por ahora tu cuenta se guarda solo en este dispositivo.</p></div>
    </form></div>`;

  V.crear = () => `<div class="wrap stack">
    <form class="form" data-form="crear">
      <p class="overline" style="font-weight:700">¿Primera vez en CroAr?</p><h1 class="title-l sec-title">Creá tu cuenta</h1><p class="body-m muted">Guardá oportunidades y te avisamos antes de cada cierre.</p>
      <div class="campo"><label for="nom">Nombre y apellido</label><input id="nom" name="nombre" placeholder="Ana Kovačić" required autocomplete="name"></div>
      <div class="campo"><label for="mail">Correo electrónico</label><input id="mail" name="mail" type="email" placeholder="nombre@correo.com" required autocomplete="email"></div>
      <div class="campo"><label for="pass">Contraseña</label><input id="pass" name="pass" type="password" placeholder="••••••••" required minlength="6" autocomplete="new-password"></div>
      <button class="btn btn-primary btn-block" type="submit">Crear cuenta</button>
      <p class="separador">¿YA TENÉS CUENTA?</p>
      ${btn('Ingresar', '#/ingresar', 'outline', 'btn-block')}
      <div class="aviso">${ic('info')}<p class="body-s">Por ahora tu cuenta se guarda solo en este dispositivo.</p></div>
    </form></div>`;

  V.guardados = () => {
    const g = Object.values(guardados());
    const u = usuario();
    return `<div class="wrap stack">
      <div><p class="overline" style="font-weight:700">Tu lista</p><h1 class="title-l sec-title">Guardados</h1><p class="body-m muted">${u ? `Hola, ${esc(u.nombre.split(' ')[0])}. ` : ''}Lo que guardaste en este dispositivo.</p></div>
      ${g.length ? `<div class="ofertas">${g.map((o) => `<article class="oferta"><a class="foto-card" href="${o.href}"><img src="${im(o.img)}" alt="" loading="lazy"><div class="veil"></div>${corner()}</a><div class="oferta-tit"><a href="${o.href}">${esc(o.titulo)}</a>${saveBtn(o)}</div><p class="body-s muted">${esc(o.meta || '')}</p></article>`).join('')}</div>`
        : `<p class="vacio">Todavía no guardaste nada. Tocá ${ic('bookmark')} en una beca, curso o actividad para tenerla acá.</p>`}
      ${u ? `<button class="btn btn-outline" data-salir>Cerrar sesión</button>` : btn('Ingresar', '#/ingresar', 'outline')}
    </div>`;
  };

  V.creditos = () => `<div class="wrap stack" style="max-width:760px">
    <h1 class="title-l sec-title">Créditos</h1>
    <p class="body-m">CroAr es un proyecto de Abril Brkljacic: una aplicación web progresiva para la colectividad croata en Argentina.</p>
    <section class="sec"><h2 class="title-m">Fotografías</h2><p class="body-m">Sofía Bašić, Flora Lennihan y otros. Las fotos de eventos pertenecen a sus organizadores y se usan con fines de difusión.</p></section>
    <section class="sec"><h2 class="title-m">Tipografía</h2><p class="body-m">Catamaran (SIL Open Font License).</p></section>
    <section class="sec"><h2 class="title-m">Aviso</h2><p class="body-m">La información sobre ciudadanía es orientativa. Confirmala siempre con el Consulado de Croacia.</p></section>
  </div>`;

  V.noEncontrada = () => `<div class="wrap stack"><h1 class="title-l">No encontramos esta página</h1>${btn('Ir al inicio', '#/', 'primary')}</div>`;

  /* ---------- Rutas ---------- */
  const RUTAS = {
    '/': [V.home, 'home', 'CroAr'],
    '/comunidad': [V.comunidad, 'comunidad', 'Comunidad'],
    '/comunidad/asociaciones': [V.asociaciones, 'comunidad', 'Asociaciones', 1],
    '/comunidad/actividades': [V.actividades, 'comunidad', 'Actividades', 1],
    '/comunidad/kolo-velebit': [V.kolo, 'comunidad', 'Kolo Velebit', 1],
    '/oportunidades': [V.oportunidades, 'oportunidades', 'Oportunidades'],
    '/oportunidades/becas': [V.becas, 'oportunidades', 'Becas y programas', 1],
    '/oportunidades/estudiar-croata': [V.estudiar, 'oportunidades', 'Estudiar croata en Croacia', 1],
    '/oportunidades/experiencias': [V.experiencias, 'oportunidades', 'Experiencias', 1],
    '/oportunidades/domovina': [V.domovina, 'oportunidades', 'Domovina', 1],
    '/oportunidades/croaticum': [V.croaticum, 'oportunidades', 'Croaticum', 1],
    '/ciudadania': [V.ciudadania, 'ciudadania', 'Ciudadanía'],
    '/ciudadania/requisitos': [V.requisitos, 'ciudadania', 'Requisitos', 1],
    '/idioma': [V.idioma, 'idioma', 'Idioma'],
    '/idioma/cursos-online': [V.cursos, 'idioma', 'Cursos online', 1],
    '/buscar': [V.buscar, '', 'Buscar', 1],
    '/ingresar': [V.ingresar, '', 'Ingresar', 1],
    '/crear-cuenta': [V.crear, '', 'Crear cuenta', 1],
    '/guardados': [V.guardados, '', 'Guardados', 1],
    '/creditos': [V.creditos, '', 'Créditos', 1]
  };

  function parse() {
    const h = location.hash.replace(/^#/, '') || '/';
    if (!h.startsWith('/')) return null; /* ancla interna */
    const [p, qs] = h.split('?');
    return { path: p.replace(/\/+$/, '') || '/', q: new URLSearchParams(qs || '') };
  }

  let ultimo = null;
  function render() {
    const r = parse();
    if (!r) { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView({ behavior: 'smooth' }); return; }
    const key = r.path + '?' + r.q.toString();
    if (key === ultimo) return;
    const mismaRuta = ultimo && ultimo.split('?')[0] === r.path && r.path === '/buscar';
    ultimo = key;
    const ruta = RUTAS[r.path] || [V.noEncontrada, '', 'No encontrada', 1];
    const [vista, seccion, titulo, interna] = ruta;
    document.title = titulo === 'CroAr' ? 'CroAr · Tus raíces, en un solo lugar' : `${titulo} · CroAr`;
    $$('[data-tab]').forEach((a) => a.toggleAttribute('aria-current', false));
    $$(`[data-tab="${seccion || (r.path === '/' ? 'home' : '')}"]`).forEach((a) => a.setAttribute('aria-current', 'page'));
    const top = $('.topbar');
    top.classList.toggle('has-back', !!interna);
    $('.back').hidden = !interna;
    actualizarCuenta();
    if (mismaRuta) { pintarBusqueda(r.q.get('q') || ''); return; }
    const main = $('#main');
    main.innerHTML = vista(r.q);
    window.scrollTo(0, 0);
    montar(main, r);
  }

  /* ---------- Interacciones de cada vista ---------- */
  function montar(root, r) {
    $$('.apilado', root).forEach(montarApilado);
    $$('[data-historias]', root).forEach(montarHistorias);
    const mapa = $('[data-mapa]', root); if (mapa) montarMapa(mapa);
    const box = $('[data-carril-box]', root);
    $$('[data-carril]', root).forEach((b) => b.addEventListener('click', () => box.scrollBy({ left: +b.dataset.carril * 148, behavior: 'smooth' })));
    $$('[data-video]', root).forEach((v) => v.addEventListener('click', (e) => { e.preventDefault(); toast('El video se suma cuando esté publicado.'); }));
    const inst = $('[data-instalar]', root); if (inst) inst.hidden = !puedeInstalar();
    if (r.path === '/buscar') {
      const f = $('[data-buscar]', root); const inp = $('input', f);
      pintarBusqueda(inp.value);
      if (!inp.value) setTimeout(() => inp.focus(), 50);
      let tmr; inp.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => history.replaceState(null, '', '#/buscar' + (inp.value ? '?q=' + encodeURIComponent(inp.value) : '')) || (ultimo = '/buscar?' + (inp.value ? 'q=' + encodeURIComponent(inp.value) : '')) && pintarBusqueda(inp.value), 120); });
      f.addEventListener('submit', (e) => { e.preventDefault(); const v = inp.value.trim(); if (!v) return; const rec = store.get('recientes', ['Croaticum', 'Ciudadanía por descendencia']).filter((x) => x !== v); rec.unshift(v); store.set('recientes', rec.slice(0, 6)); inp.blur(); });
      $('[data-limpiar]', root).addEventListener('click', () => { inp.value = ''; inp.dispatchEvent(new Event('input')); inp.focus(); });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-borrar-rec]'); if (b) { store.set('recientes', []); pintarBusqueda(''); }
        const c = e.target.closest('[data-f]'); if (c) { $$('[data-f]', root).forEach((x) => x.setAttribute('aria-pressed', x === c)); $$('.resultado', root).forEach((x) => { x.hidden = c.dataset.f && x.dataset.s !== c.dataset.f; }); }
        const res = e.target.closest('.resultado'); if (res && inp.value.trim()) { const v = inp.value.trim(); const rec = store.get('recientes', []).filter((x) => x !== v); rec.unshift(v); store.set('recientes', rec.slice(0, 6)); }
      });
    }
    const form = $('[data-form]', root);
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      if (form.dataset.form === 'crear') { store.set('usuario', { nombre: d.nombre, mail: d.mail }); toast(`¡Bienvenida/o, ${d.nombre.split(' ')[0]}! Dobro došli kući.`); }
      else { const u = usuario(); if (!u || u.mail !== d.mail) { toast('No encontramos esa cuenta en este dispositivo. Creala en un minuto.'); location.hash = '#/crear-cuenta'; return; } toast(`Hola de nuevo, ${u.nombre.split(' ')[0]}.`); }
      location.hash = '#/guardados';
    });
    const olv = $('[data-olvide]', root); if (olv) olv.addEventListener('click', (e) => { e.preventDefault(); toast('Como la cuenta vive en este dispositivo, podés crearla de nuevo.'); });
    const salir = $('[data-salir]', root); if (salir) salir.addEventListener('click', () => { store.set('usuario', null); toast('Cerraste sesión.'); ultimo = null; render(); });
  }

  function montarApilado(el) {
    const cards = $$('.card', el); const n = cards.length; let cur = 0;
    const dots = $$(`[data-dots="${el.id}"] i`);
    const pos = (off, w) => {
      const a = Math.abs(off); const s = a === 0 ? 1 : a === 1 ? 232 / 288 : 176 / 288;
      const dx = off === 0 ? 0 : Math.sign(off) * (a === 1 ? w * 0.27 : w * 0.38);
      return `translate(calc(-50% + ${dx}px), -50%) scale(${s})`;
    };
    const paint = () => {
      const w = Math.min(el.clientWidth, 520);
      cards.forEach((c, i) => {
        let off = ((i - cur) % n + n) % n; if (off > n / 2) off -= n;
        c.style.transform = pos(off, w); c.style.zIndex = 10 - Math.abs(off); c.style.opacity = Math.abs(off) > 2 ? 0 : 1;
        c.classList.toggle('is-center', off === 0); c.tabIndex = off === 0 ? 0 : -1;
        c.setAttribute('aria-hidden', off !== 0);
      });
      dots.forEach((d, i) => d.classList.toggle('on', i === cur));
    };
    const go = (d) => { cur = (cur + d + n) % n; paint(); };
    let x0 = null, moved = false;
    el.addEventListener('pointerdown', (e) => { x0 = e.clientX; moved = false; });
    el.addEventListener('pointermove', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 10) moved = true; });
    el.addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); });
    el.addEventListener('click', (e) => {
      const c = e.target.closest('.card'); if (!c) return;
      if (moved || !c.classList.contains('is-center')) { e.preventDefault(); if (!moved) { const i = +c.dataset.i; let off = ((i - cur) % n + n) % n; if (off > n / 2) off -= n; go(off); } }
    });
    el.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
    window.addEventListener('resize', paint);
    paint();
  }

  function montarHistorias(el) {
    const lista = el.closest('.sec').querySelectorAll('.dots i');
    const datos = $$('.dots i', el.closest('.sec')).length === 3 && el.dataset.lista ? JSON.parse(el.dataset.lista) : null;
    const items = datos || (location.hash.includes('experiencias') ? [HISTORIAS[1], HISTORIAS[0], HISTORIAS[2]] : HISTORIAS);
    let i = 0; const card = $('.historia', el);
    const paint = () => {
      const h = items[i];
      card.innerHTML = `<div class="h-txt"><div class="cat overline"><span>${h.cat}</span><i></i></div><span class="body-s">${h.cuando}</span><b class="title-m">${h.titulo}</b><p class="body-s muted">${h.txt}</p></div><div class="h-foto"><img src="${im(h.img)}" alt=""></div>`;
      lista.forEach((d, j) => d.classList.toggle('on', j === i));
    };
    $('.prev', el).addEventListener('click', () => { i = (i + items.length - 1) % items.length; paint(); });
    $('.next', el).addEventListener('click', () => { i = (i + 1) % items.length; paint(); });
    let x0 = null; card.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    card.addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) { i = (i + (dx < 0 ? 1 : items.length - 1)) % items.length; paint(); } });
    paint();
  }

  function montarMapa(el) {
    const card = $('[data-mapa-card]', el);
    const sel = (id, extra) => {
      const c = D.centros.find((x) => x.id === id);
      $$('.pin', el).forEach((p) => p.classList.toggle('on', p.dataset.pin === id));
      card.innerHTML = `<span class="overline" style="font-weight:700">${extra ? extra.over : esc(c.nombre)}</span><b class="title-s">${extra ? extra.tit : `${c.n} ${c.n === 1 ? 'centro' : 'centros'}`}</b><span class="body-s muted">${extra ? extra.txt : esc(c.centro)}</span><a href="${extra ? `https://www.google.com/maps/search/?api=1&query=centro+croata+${encodeURIComponent(c.nombre)}` : '#/comunidad/asociaciones#hogar'}" ${extra ? 'target="_blank" rel="noopener"' : ''}>${extra ? 'Cómo llegar ›' : 'Ver centro ›'}</a>`;
    };
    el.addEventListener('click', (e) => { const p = e.target.closest('[data-pin]'); if (p) sel(p.dataset.pin); });
    $('[data-ubicacion]', el).addEventListener('click', (e) => {
      const b = e.currentTarget;
      if (!navigator.geolocation) { toast('Tu navegador no permite usar la ubicación.'); return; }
      b.disabled = true; $('span', b).textContent = 'Buscando…';
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude: la, longitude: lo } = pos.coords;
        const dist = (c) => { const R = 6371, r = Math.PI / 180; const dLa = (c.lat - la) * r, dLo = (c.lon - lo) * r; const a = Math.sin(dLa / 2) ** 2 + Math.cos(la * r) * Math.cos(c.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(a)); };
        const best = D.centros.slice().sort((a, b2) => dist(a) - dist(b2))[0];
        const km = dist(best); const kms = km < 10 ? km.toFixed(1).replace('.', ',') : Math.round(km);
        sel(best.id, { over: `Más cercano · ${kms} km`, tit: esc(best.nombre), txt: esc(best.centro) });
        $('[data-mapa-txt]', el).textContent = `El centro más cercano está a ${kms} km.`;
        b.disabled = false; $('span', b).textContent = 'Ubicación activada';
      }, () => { b.disabled = false; $('span', b).textContent = 'Usar mi ubicación'; toast('No pudimos acceder a tu ubicación.'); }, { timeout: 10000, maximumAge: 600000 });
    });
    sel('cordoba');
  }

  /* ---------- Guardar ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-save]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const it = JSON.parse(b.dataset.save); const g = guardados();
    if (g[it.id]) { delete g[it.id]; toast('Lo sacaste de Guardados.'); } else { g[it.id] = it; toast('Guardado. Lo encontrás en tu perfil.'); }
    store.set('guardados', g);
    $$(`[data-save]`).forEach((x) => { const id = JSON.parse(x.dataset.save).id; x.setAttribute('aria-pressed', !!g[id]); });
    if (location.hash.startsWith('#/guardados')) { ultimo = null; render(); }
  });

  function actualizarCuenta() {
    const u = usuario();
    $$('[data-cuenta]').forEach((a) => { a.href = u ? '#/guardados' : '#/ingresar'; $('span', a).textContent = u ? u.nombre.split(' ')[0] : 'Ingresar'; });
  }

  let tt; function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 2800); }

  /* ---------- Instalación (PWA) ---------- */
  let promptInstalar = null;
  const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const instalada = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const puedeInstalar = () => !instalada() && (!!promptInstalar || esIOS);
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); promptInstalar = e; $$('[data-instalar]').forEach((x) => { x.hidden = false; }); });
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-install]'); if (!b) return;
    if (promptInstalar) { promptInstalar.prompt(); const r = await promptInstalar.userChoice; promptInstalar = null; if (r.outcome === 'accepted') toast('¡Listo! CroAr quedó instalada.'); }
    else if (instalada()) toast('CroAr ya está instalada en este dispositivo.');
    else if (esIOS) toast('En Safari: tocá Compartir y después “Agregar a inicio”.');
    else toast('Abrí el menú del navegador y elegí “Instalar app”.');
  });

  /* ---------- Agenda flotante (escritorio) ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-agenda-fab]');
    const pop = $('#agenda-pop');
    if (b) { pop.hidden = !pop.hidden; b.setAttribute('aria-expanded', !pop.hidden); return; }
    if (!pop.hidden && !e.target.closest('#agenda-pop')) { pop.hidden = true; $('[data-agenda-fab]').setAttribute('aria-expanded', 'false'); }
  });

  /* ---------- Arranque ---------- */
  $('#agenda-pop').innerHTML = agenda('Agenda', 'Nov 2026', D.agenda, 'Ver toda la agenda');
  $('.back').addEventListener('click', () => { if (history.length > 1) history.back(); else location.hash = '#/'; });
  window.addEventListener('scroll', () => $('.topbar').classList.toggle('scrolled', scrollY > 4), { passive: true });
  window.addEventListener('hashchange', render);
  render();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
