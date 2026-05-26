/* ═══════════════════════════════════════════════════════════════
   AISocial — shared.js  (cargado en todas las páginas)
   La API key se lee de assets/config.js (archivo en .gitignore)
   ═══════════════════════════════════════════════════════════════ */

// Modelo correcto de Claude Haiku
const CLAUDE_MODEL = 'claude-haiku-4-5';

// Lee la key desde config.js (nunca hardcodeada aquí)
function getApiKey() {
  if (window.ANTHROPIC_CONFIG && window.ANTHROPIC_CONFIG.apiKey) {
    return window.ANTHROPIC_CONFIG.apiKey;
  }
  return null;
}

// ── Marca nav-link activo según URL ───────────────────────────
(function marcarNavActivo() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    const esActivo =
      path.endsWith(href) ||
      (href === 'index.html' && (path === '/' || path.endsWith('/') || path.endsWith('index.html')));
    link.classList.toggle('active', esActivo);
  });
})();

// ── Utilidades ─────────────────────────────────────────────────
async function copiarAlPortapapeles(texto) {
  await navigator.clipboard.writeText(texto);
}

function formatearFecha(iso) {
  return new Date(iso).toLocaleString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Llamada a Claude API ───────────────────────────────────────
async function llamarClaude(systemPrompt, userPrompt, maxTokens = 1500) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('API key no configurada. Asegúrate de que assets/config.js existe.');
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.error?.message || `Error ${res.status}`;
    throw new Error(`Claude API: ${msg}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

// ── Generador de URL de imagen (Pollinations) ─────────────────
// Usa flux-realism, resolución 1024×1024 y enhance=true para más calidad
const NEGATIVE_PROMPT = 'cartoon, illustration, painting, drawing, anime, 3d render, deformed, extra limbs, bad anatomy, text, watermark, logo, blurry, low quality, oversaturated';

function generarUrlImagen(promptEN) {
  const seed    = Math.floor(Math.random() * 999999);
  const encoded = encodeURIComponent(promptEN.trim().substring(0, 500));
  const neg     = encodeURIComponent(NEGATIVE_PROMPT);
  return `https://image.pollinations.ai/prompt/${encoded}?model=flux-realism&negative=${neg}&width=1024&height=1024&seed=${seed}&enhance=true&nologo=true`;
}
