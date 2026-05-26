'use strict';

// ─── System prompt mejorado ────────────────────────────────────────────────────
const SYSTEM_PROMPT_GENERAR = `Eres un copywriter experto en redes sociales con 10 años de experiencia creando contenido viral para marcas globales. Tu trabajo es generar publicaciones que generen ENGAGEMENT REAL, no texto genérico.

REGLAS ABSOLUTAS:
1. NUNCA uses frases vacías como "lo que necesitas", "marca la diferencia", "te va a sorprender". Son clichés prohibidos.
2. El texto debe sonar como lo escribió un humano creativo, NO una IA.
3. USA SIEMPRE el contexto adicional si se proporciona — intégralo de forma natural al copy.
4. Los datos, cifras o detalles específicos del tema hacen el copy MÁS persuasivo — úsalos.
5. Cada publicación debe tener un gancho CONCRETO en la primera línea.

GANCHOS POR PLATAFORMA:
- Instagram: abre con una emoción o afirmación audaz + narrativa de 3-4 oraciones + CTA visual. Usa 2-3 emojis estratégicos, no decorativos.
- Twitter/X: MÁXIMO 240 caracteres. Primera palabra = impacto. Sin relleno. Puede ser pregunta provocadora, dato inesperado o declaración controversial.
- Facebook: abre con pregunta directa al lector + desarrollo conversacional de 4-5 oraciones + pregunta de cierre para generar comentarios.
- LinkedIn: abre con un insight de industria o dato real + 3-4 oraciones con estructura situación→problema→solución→CTA. Máximo 1 emoji. Tono de experto, no de vendedor.
- TikTok: 2-3 oraciones MUY energéticas. Primera línea = hook de tensión ("Lo que nadie te dice sobre X", "Por qué dejé de hacer Y"). Usa vocabulario generacional actual.
- General: 3 oraciones versátiles. Directo, claro, con CTA.

TONOS:
- Formal: oraciones completas, vocabulario técnico preciso, sin contracciones, autoridad demostrada con datos.
- Creativo: metáforas originales, ritmo literario, imágenes mentales vívidas, sorpresa al final.
- Promocional: beneficio concreto en la primera línea, urgencia genuina (no "oferta limitada" genérico), CTA con verbo de acción fuerte.
- Profesional: datos cuantificables, estructura lógica, propuesta de valor clara, credibilidad.
- Juvenil: tono de conversación real entre amigos, referencias actuales, energía alta, emojis naturales (no forzados).

INSTRUCCIONES PARA EL PROMPT DE IMAGEN:
Genera un prompt cinematográfico en inglés para Pollinations/Flux de 40-60 palabras.
Estructura OBLIGATORIA: [sujeto exacto y específico] + [acción o posición concreta] + [entorno detallado] + [iluminación específica] + [estilo fotográfico] + [detalles técnicos].
Ejemplos de prompts BUENOS:
- "A single pair of white Nike Air Max sneakers on a wet concrete surface reflecting neon city lights at night, dramatic side lighting, commercial product photography, 85mm lens, shallow depth of field, 4K"
- "Young woman in her 30s working on a MacBook at a sunlit café window, golden hour light casting warm shadows, lifestyle photography, candid shot, sharp focus, photorealistic"
Ejemplos de prompts MALOS (evitar): "product showcase, marketing style, social media" — demasiado vago.
Si hay personas, describe UNA sola persona con características físicas específicas y pose concreta.

FORMATO DE RESPUESTA — JSON puro sin bloques de código ni texto extra:
{
  "razonamiento": "en 1-2 oraciones: qué estrategia usaste y por qué funciona para este caso específico",
  "texto": "publicación completa lista para publicar, con emojis si aplica según plataforma",
  "hashtagsPrincipales": ["#Tag1específico", "#Tag2específico", "#Tag3específico"],
  "hashtagsSecundarios": ["#Tag4", "#Tag5", "#Tag6", "#Tag7", "#Tag8"],
  "promptImagen": "prompt cinematográfico en inglés de 40-60 palabras siguiendo la estructura indicada"
}

SOBRE LOS HASHTAGS:
- Principales (3): deben ser ESPECÍFICOS al tema — no #SocialMedia, no #Marketing genérico. Ej: para zapatillas Nike → #NikeAirMax #RunningCommunity #SneakerHead
- Secundarios (5-8): mix de nicho + tendencia + comunidad relacionada al sector del tema`;

// ─── Fallback de templates ─────────────────────────────────────────────────────

const ESTRUCTURAS = {
  instagram: {
    formal:      '{intro}. {desarrollo}. {cta} ✨',
    creativo:    '🌟 {intro} — {desarrollo}. {cta}',
    promocional: '🔥 {intro}! {beneficio}. {urgencia}. {cta}',
    profesional: '💼 {intro}. {desarrollo}. {cta}',
    juvenil:     '👀 {intro}?? {desarrollo}!! {cta} 🙌',
  },
  twitter: {
    formal:      '{intro}. {desarrollo}.',
    creativo:    '{intro} → {desarrollo}. {cta}',
    promocional: '🔥 {intro}! {beneficio}. {cta}',
    profesional: '{intro}. {desarrollo}. {cta}',
    juvenil:     '{intro}?? {desarrollo}! 🔥',
  },
  facebook: {
    formal:      '{intro}. {desarrollo}. {reflexion}. {cta}',
    creativo:    '🌟 {intro}. {desarrollo}. {cta}',
    promocional: '🎯 {intro}! {beneficio}. {urgencia}. {cta}',
    profesional: '{intro}. {desarrollo}. {reflexion}. {cta}',
    juvenil:     '😎 {intro}! {desarrollo}. {cta}',
  },
  linkedin: {
    formal:      '{intro}. {desarrollo}. {reflexion}. {cta}',
    creativo:    '{intro}. {desarrollo}. {reflexion}. {cta}',
    promocional: '{intro}. {beneficio}. {reflexion}. {cta}',
    profesional: '{intro}. {desarrollo}. {reflexion}. {cta}',
    juvenil:     '{intro}. {desarrollo}. {reflexion}. {cta}',
  },
  tiktok: {
    formal:      '{intro}. {desarrollo}. {cta}',
    creativo:    '✨ {intro}! {desarrollo}. {cta}',
    promocional: '🎯 {intro}! {beneficio}. {cta}',
    profesional: '{intro}. {desarrollo}. {cta}',
    juvenil:     '🔥 {intro}!! {desarrollo}. {cta}',
  },
  general: {
    formal:      '{intro}. {desarrollo}. {cta}',
    creativo:    '✨ {intro}. {desarrollo}. {cta}',
    promocional: '🎯 {intro}! {beneficio}. {cta}',
    profesional: '{intro}. {desarrollo}. {cta}',
    juvenil:     '🔥 {intro}! {desarrollo}. {cta}',
  },
};

const FRASES = {
  informar: {
    intro:      ['Hoy te hablamos de {tema}', 'Descubre todo sobre {tema}', 'Lo esencial de {tema}', '{tema}: lo que necesitas saber'],
    desarrollo: ['En el mundo de {tema}, los detalles importan', '{tema} tiene más para ofrecer de lo que imaginas', 'Conocer {tema} a fondo cambia la perspectiva'],
    reflexion:  ['Estar bien informado sobre {tema} siempre da ventaja', 'Quien conoce {tema} toma mejores decisiones'],
    cta:        ['Comparte si te pareció útil', '¿Qué opinas? Cuéntanos en los comentarios', 'Guarda esta publicación para consultarla después'],
    beneficio:  ['{tema} te da la información que necesitas para actuar con confianza'],
    urgencia:   ['No te quedes sin saberlo'],
  },
  vender: {
    intro:      ['{tema} llegó — exactamente lo que estabas buscando', 'Presentamos {tema}', '{tema}: la oportunidad que no puedes dejar pasar', 'Descubre {tema} hoy'],
    desarrollo: ['Con {tema} obtienes calidad y valor en cada uso', 'Miles de personas ya confían en {tema}', '{tema} está diseñado para quienes exigen lo mejor'],
    reflexion:  ['Invertir en {tema} es apostar por resultados reales'],
    cta:        ['Haz clic en el enlace de la bio', 'Escríbenos y te damos toda la información', '¡Reserva el tuyo ahora!'],
    beneficio:  ['Con {tema} ves resultados desde el primer día', 'Ahorra tiempo y esfuerzo con {tema}'],
    urgencia:   ['Oferta por tiempo limitado', 'Quedan pocas unidades disponibles', 'Actúa hoy'],
  },
  inspirar: {
    intro:      ['{tema}: una meta que vale la pena', '{tema} empieza con una decisión — la tuya', 'Lo extraordinario comienza con {tema}', 'Cada día es una oportunidad con {tema}'],
    desarrollo: ['Los grandes logros no ocurren solos — {tema} es el camino', 'Tu potencial no tiene límites cuando tienes {tema}', 'La diferencia está en dar ese primer paso con {tema}'],
    reflexion:  ['Recuerda: con {tema} cada paso cuenta', 'No importa dónde estés, siempre puedes avanzar'],
    cta:        ['Comparte con alguien que necesite esto hoy', '¿Te identificas? Cuéntanos en los comentarios', 'Guarda esto para cuando lo necesites'],
    beneficio:  ['{tema} te acerca a quien quieres ser'],
    urgencia:   ['El momento de empezar es ahora'],
  },
  entretener: {
    intro:      ['¿Sabías esto sobre {tema}?', '{tema} tiene un lado que pocos conocen', 'Esto de {tema} te va a sorprender', '{tema}: el dato que cambia todo'],
    desarrollo: ['{tema} es más fascinante de lo que parece', 'La realidad supera la ficción, especialmente en {tema}', '{tema} guarda secretos que vale la pena descubrir'],
    reflexion:  ['Al final, siempre hay algo nuevo por descubrir en {tema}'],
    cta:        ['¡Deja tu reacción en los comentarios!', 'Etiqueta a alguien que necesita ver esto', '¿Conocías este lado de {tema}?'],
    beneficio:  ['{tema} te sorprenderá con cada descubrimiento'],
    urgencia:   ['No te pierdas lo que viene'],
  },
  educar: {
    intro:      ['Guía práctica: {tema}', 'Aprende {tema} paso a paso', 'Todo lo que necesitas saber sobre {tema}', 'Lección del día: {tema}'],
    desarrollo: ['El primer paso con {tema} es entender los fundamentos', 'Dominar {tema} abre puertas que antes parecían cerradas', 'Este conocimiento sobre {tema} cambia la perspectiva'],
    reflexion:  ['El aprendizaje continuo es la mejor inversión', 'Quien domina {tema} siempre lleva ventaja'],
    cta:        ['Guarda esta publicación para repasar después', '¿Tienes dudas? Pregunta en los comentarios', 'Comparte con alguien que quiera aprender'],
    beneficio:  ['{tema} te da las herramientas para avanzar con confianza'],
    urgencia:   ['Empieza hoy, no mañana'],
  },
};

const HASHTAGS_PLATAFORMA = {
  instagram: ['#Instagram', '#InstaContent', '#ContentCreator', '#DigitalMarketing'],
  twitter:   ['#Twitter', '#Trending', '#ViralContent', '#SocialMedia'],
  facebook:  ['#Facebook', '#Community', '#SocialMedia', '#Engagement'],
  linkedin:  ['#LinkedIn', '#ProfessionalDevelopment', '#Business', '#Networking'],
  tiktok:    ['#TikTok', '#FYP', '#Viral', '#TrendingNow'],
  general:   ['#SocialMedia', '#ContentMarketing', '#DigitalMarketing', '#Branding'],
};

const HASHTAGS_TONO = {
  creativo:    ['#CreativeContent', '#Inspiration', '#Creative'],
  profesional: ['#Professional', '#Excellence', '#Leadership'],
  juvenil:     ['#GenZ', '#TrendAlert', '#Viral'],
  formal:      ['#Official', '#Quality', '#Trusted'],
  promocional: ['#Promo', '#Oferta', '#MustHave'],
};

// ─── Helpers de template ───────────────────────────────────────
function detectarCategoria(objetivo) {
  const o = objetivo.toLowerCase();
  if (/vend|venta|compr|adquir|reserv|paga|precio|ofert|descuento|promoc/.test(o)) return 'vender';
  if (/inspir|motiv|superac|logro|éxito|exito|crecer/.test(o))                     return 'inspirar';
  if (/aprend|educa|enseña|compren|guía|guia|curso|tutorial/.test(o))              return 'educar';
  if (/entret|divert|humor|curiosid|sorpren/.test(o))                              return 'entretener';
  return 'informar';
}

function pick(arr, tema) {
  const item = arr[Math.floor(Math.random() * arr.length)];
  return item.replace(/\{tema\}/g, tema);
}

function generarHashtagsTemplate(tema, plataforma, tono) {
  const palabras = tema
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z\s]/g, '')
    .split(' ')
    .filter(p => p.length > 3);

  const tagsTema    = palabras.map(p => `#${p.charAt(0).toUpperCase()}${p.slice(1)}`);
  const tagsPlatf   = HASHTAGS_PLATAFORMA[plataforma] || HASHTAGS_PLATAFORMA.general;
  const tagsTono    = HASHTAGS_TONO[tono] || [];
  const principales = [...tagsTema.slice(0, 2), ...tagsPlatf.slice(0, 2)].slice(0, 4);
  const secundarios = [...tagsTema.slice(2, 4), ...tagsTono.slice(0, 2), ...tagsPlatf.slice(2, 4), '#AIContent', '#ContentStrategy'].slice(0, 7);
  return { principales, secundarios };
}

function construirPromptImagenFallback(tema, plataforma, tono, objetivo) {
  const estilos = {
    creativo:    'artistic composition, vibrant colors, creative studio photography',
    profesional: 'clean corporate photography, white background, professional lighting',
    juvenil:     'trendy lifestyle photography, bright colors, energetic scene',
    formal:      'elegant sophisticated photography, muted tones, premium feel',
    promocional: 'commercial product photography, bold lighting, marketing shoot',
  };
  const formatos = {
    instagram: 'square format, Instagram-worthy, highly aesthetic',
    twitter:   'high contrast, bold visual, attention-grabbing composition',
    facebook:  'warm tones, community feel, shareable lifestyle image',
    linkedin:  'clean background, professional context, business setting',
    tiktok:    'vertical frame, dynamic scene, youthful energy',
    general:   'versatile composition, natural lighting, clean background',
  };
  const estilo  = estilos[tono] || 'professional photography, natural lighting';
  const formato = formatos[plataforma] || 'social media composition';
  return `${tema}, single subject, detailed scene, ${estilo}, ${formato}, photorealistic, 4K, sharp focus, no text, no watermark`;
}

function generarContenidoTemplate(tema, objetivo, tono, plataforma) {
  const platKey = (plataforma || 'general').toLowerCase().replace(/[^a-z]/g, '');
  const tonoKey = (tono || 'profesional').toLowerCase();
  const catKey  = detectarCategoria(objetivo || '');

  const estructPlatf = ESTRUCTURAS[platKey] || ESTRUCTURAS.general;
  const plantilla    = estructPlatf[tonoKey] || estructPlatf.profesional;
  const frases       = FRASES[catKey] || FRASES.informar;

  let texto = plantilla
    .replace('{intro}',      pick(frases.intro,      tema))
    .replace('{desarrollo}', pick(frases.desarrollo, tema))
    .replace('{reflexion}',  pick(frases.reflexion  || frases.desarrollo, tema))
    .replace('{cta}',        pick(frases.cta,        tema))
    .replace('{beneficio}',  pick(frases.beneficio  || frases.desarrollo, tema))
    .replace('{urgencia}',   pick(frases.urgencia   || frases.cta, tema));

  if (platKey === 'twitter' && texto.length > 240) {
    texto = texto.substring(0, 237) + '...';
  }

  const { principales, secundarios } = generarHashtagsTemplate(tema, platKey, tonoKey);

  return {
    texto,
    hashtagsPrincipales: principales,
    hashtagsSecundarios: secundarios,
    razonamiento: `Contenido generado con templates (Claude no disponible) para ${plataforma} con tono ${tono}.`,
    promptImagen: construirPromptImagenFallback(tema, platKey, tonoKey, objetivo),
  };
}

// ─── Generación principal con Claude ─────────────────────────
async function generarContenido(tema, objetivo, tono, plataforma, contexto) {
  const userPrompt = `Genera una publicación para redes sociales con estos datos:

Tema: ${tema}
Objetivo: ${objetivo}
Tono: ${tono}
Plataforma: ${plataforma}${contexto ? `\nContexto adicional (IMPORTANTE — intégralo al copy): ${contexto}` : ''}

Recuerda: texto específico y humano, prompt de imagen cinematográfico de 40-60 palabras, hashtags concretos al tema.
Devuelve SOLO el JSON.`;

  let datos;
  let usoClaude = true;

  try {
    const raw = await llamarClaude(SYSTEM_PROMPT_GENERAR, userPrompt, 1500);
    const limpio = raw.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    datos = JSON.parse(limpio);
    if (!datos.texto) throw new Error('Campo "texto" ausente en la respuesta.');
  } catch (err) {
    console.warn('Claude falló, usando template:', err.message);
    datos = generarContenidoTemplate(tema, objetivo, tono, plataforma);
    usoClaude = false;
  }

  const promptImg = datos.promptImagen
    || construirPromptImagenFallback(tema, plataforma, tono, objetivo);

  return {
    texto:               datos.texto,
    hashtagsPrincipales: Array.isArray(datos.hashtagsPrincipales) ? datos.hashtagsPrincipales : [],
    hashtagsSecundarios: Array.isArray(datos.hashtagsSecundarios) ? datos.hashtagsSecundarios : [],
    razonamiento:        datos.razonamiento || null,
    imagenUrl:           generarUrlImagen(promptImg),
    modelo:              usoClaude ? CLAUDE_MODEL : 'template-local',
    fecha:               new Date().toISOString(),
  };
}

// ─── UI helpers ───────────────────────────────────────────────
const estado      = document.getElementById('resultado-estado');
const btnGenerar  = document.getElementById('btn-generar');
const formGenerar = document.getElementById('form-generar');

function mostrarCargando() {
  estado.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div class="skeleton" style="height:16px;width:55%;"></div>
      <div class="skeleton" style="height:220px;border-radius:12px;"></div>
      <div class="skeleton" style="height:14px;width:90%;"></div>
      <div class="skeleton" style="height:14px;width:70%;"></div>
      <div class="skeleton" style="height:14px;width:50%;"></div>
      <div style="display:flex;gap:8px;margin-top:4px;">
        <div class="skeleton" style="height:32px;width:120px;border-radius:8px;"></div>
        <div class="skeleton" style="height:32px;width:120px;border-radius:8px;"></div>
      </div>
    </div>
    <div style="margin-top:14px;padding:10px 14px;background:rgba(124,58,237,0.06);border-radius:10px;text-align:center;">
      <span style="color:var(--violet-lt);font-size:0.82rem;">✨ Claude está redactando tu publicación…</span>
    </div>`;
}

function mostrarError(msg) {
  estado.innerHTML = `
    <div class="alert alert-error" style="flex-direction:column;align-items:flex-start;gap:8px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span>⚠️</span>
        <strong>Error al generar</strong>
      </div>
      <span style="font-size:0.82rem;opacity:0.85;">${msg}</span>
    </div>`;
}

async function copiarConFeedback(btn, texto, labelOriginal) {
  try {
    await copiarAlPortapapeles(texto);
    btn.textContent = '✅ ¡Copiado!';
    setTimeout(() => { btn.textContent = labelOriginal; }, 2000);
  } catch { /* silent */ }
}

const BADGE_COLOR = {
  instagram: 'badge-violet', twitter: 'badge-muted',
  facebook: 'badge-blue',   linkedin: 'badge-amber',
  tiktok: 'badge-violet',   general: 'badge-muted',
};

function mostrarResultado(data, plataforma) {
  const { texto, hashtagsPrincipales, hashtagsSecundarios, razonamiento, imagenUrl, modelo, fecha } = data;
  const esTwitter  = plataforma === 'twitter';
  const badge      = BADGE_COLOR[plataforma] || 'badge-muted';
  const hashPrinc  = hashtagsPrincipales.map(h => `<span class="hashtag">${h}</span>`).join(' ');
  const hashSecund = hashtagsSecundarios.map(h => `<span class="hashtag-pill">${h}</span>`).join(' ');
  const todoTexto  = [texto, hashtagsPrincipales.join(' '), hashtagsSecundarios.join(' ')].filter(Boolean).join('\n\n').trim();
  const esMock     = modelo === 'template-local';

  estado.innerHTML = `
    <div class="fade-in">


      ${razonamiento ? `
        <div style="margin-bottom:16px;padding:12px 14px;background:rgba(124,58,237,0.06);border:1px solid rgba(124,58,237,0.15);border-radius:var(--radius-sm);">
          <button class="collapsible-btn" id="btn-col">
            <span>💡 Estrategia de la IA</span>
            <span id="icono-col" style="font-size:0.7rem;transition:transform 0.2s;">▼</span>
          </button>
          <div id="contenido-col" class="collapsible-content" style="display:none;">${razonamiento}</div>
        </div>` : ''}

      <div class="post-header">
        <div class="post-avatar">AI</div>
        <div class="post-meta">
          <div class="post-name">AISocial</div>
          <div class="post-time">${formatearFecha(fecha)}</div>
        </div>
        <span class="badge ${badge}">${plataforma}</span>
      </div>

      <div id="img-box" style="margin-bottom:14px;">
        <div class="img-placeholder" style="height:200px;">⏳ Generando imagen con Pollinations…</div>
      </div>

      <p id="texto-gen" style="color:var(--text);font-size:0.92rem;line-height:1.75;margin-bottom:12px;white-space:pre-wrap;">${texto}</p>

      ${esTwitter ? `
        <div class="char-counter ${texto.length > 240 ? 'over' : ''}" id="char-counter">
          ${texto.length}/240 caracteres
        </div>` : ''}

      ${hashPrinc  ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${hashPrinc}</div>`  : ''}
      ${hashSecund ? `
        <div style="margin-bottom:16px;">
          <p style="color:var(--muted);font-size:0.72rem;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">Hashtags secundarios</p>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">${hashSecund}</div>
        </div>` : ''}

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
        <button class="btn-ghost" id="btn-cp-texto">📋 Copiar texto</button>
        <button class="btn-ghost" id="btn-cp-todo">📤 Copiar con hashtags</button>
      </div>

      <div style="border-top:1px solid var(--border);padding-top:14px;">
        <p style="color:var(--muted);font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Información de generación</p>
        <div class="meta-table">
          <div class="meta-row"><span class="meta-key">Modelo</span><span class="meta-val">${esMock ? 'Template local' : 'Claude Haiku'}</span></div>
          <div class="meta-row"><span class="meta-key">Plataforma</span><span class="meta-val">${plataforma}</span></div>
          <div class="meta-row"><span class="meta-key">Generado</span><span class="meta-val">${formatearFecha(fecha)}</span></div>
        </div>
      </div>
    </div>`;

  // Collapsible
  if (razonamiento) {
    document.getElementById('btn-col').addEventListener('click', () => {
      const c = document.getElementById('contenido-col');
      const i = document.getElementById('icono-col');
      const visible = c.style.display !== 'none';
      c.style.display = visible ? 'none' : 'block';
      i.style.transform = visible ? '' : 'rotate(180deg)';
    });
  }

  // Botones copiar
  document.getElementById('btn-cp-texto').addEventListener('click', function () {
    copiarConFeedback(this, texto, '📋 Copiar texto');
  });
  document.getElementById('btn-cp-todo').addEventListener('click', function () {
    copiarConFeedback(this, todoTexto, '📤 Copiar con hashtags');
  });

  // Carga de imagen asíncrona
  const imgBox = document.getElementById('img-box');
  const img    = new Image();
  img.onload = () => {
    imgBox.innerHTML = `
      <div class="img-container">
        <img src="${imagenUrl}" alt="Imagen generada para ${plataforma}" loading="lazy">
        <span class="img-badge">🤖 Pollinations AI</span>
      </div>`;
  };
  img.onerror = () => {
    imgBox.innerHTML = `<div class="img-placeholder" style="height:140px;">🖼️ Imagen no disponible</div>`;
  };
  img.src = imagenUrl;
}

// ─── Submit del formulario ────────────────────────────────────
formGenerar.addEventListener('submit', async (e) => {
  e.preventDefault();

  const tema       = document.getElementById('tema').value.trim();
  const objetivo   = document.getElementById('objetivo').value.trim();
  const tono       = document.getElementById('tono').value;
  const plataforma = document.getElementById('plataforma').value;
  const contexto   = document.getElementById('contexto').value.trim();

  // Validación
  let valido = true;
  const campos = [
    { id: 'tema',     errId: 'error-tema',     msg: 'El tema es obligatorio.' },
    { id: 'objetivo', errId: 'error-objetivo', msg: 'El objetivo es obligatorio.' },
  ];
  campos.forEach(({ id, errId }) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!el.value.trim()) {
      err.style.display = 'block';
      el.classList.add('error');
      valido = false;
    } else {
      err.style.display = 'none';
      el.classList.remove('error');
    }
  });
  if (!valido) return;

  btnGenerar.disabled = true;
  btnGenerar.innerHTML = '<span class="spinner"></span> Generando…';
  mostrarCargando();

  try {
    const resultado = await generarContenido(tema, objetivo, tono, plataforma, contexto);
    mostrarResultado(resultado, plataforma);
  } catch (err) {
    mostrarError(err.message);
  } finally {
    btnGenerar.disabled = false;
    btnGenerar.innerHTML = '✨ Generar';
  }
});
