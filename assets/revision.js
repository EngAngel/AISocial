'use strict';

const SYSTEM_PROMPT_REVISION = `Eres un experto en revisión de código. Analiza el fragmento que recibes y devuelve un JSON con las claves: resumen (string), positivos (array de strings), problemas (array de strings), sugerencias (array de strings), calificacion (número del 1 al 10). El análisis debe ser claro, constructivo y didáctico. No ejecutes el código, solo analiza estructura, legibilidad y buenas prácticas.`;

const estado       = document.getElementById('resultado-estado');
const formRevision = document.getElementById('form-revision');
const btnAnalizar  = document.getElementById('btn-analizar');

function mostrarCargando() {
  estado.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div class="skeleton" style="height:14px;width:80%;"></div>
      <div class="skeleton" style="height:14px;width:60%;"></div>
      <div class="skeleton" style="height:80px;border-radius:8px;margin-top:8px;"></div>
      <div class="skeleton" style="height:80px;border-radius:8px;"></div>
      <div class="skeleton" style="height:80px;border-radius:8px;"></div>
      <div class="skeleton" style="height:40px;border-radius:8px;"></div>
    </div>`;
}

function mostrarError(msg) {
  estado.innerHTML = `
    <div class="alert alert-error">
      <span>⚠️</span>
      <span>${msg}</span>
    </div>`;
}

function calificacionColor(n) {
  if (n >= 8) return 'var(--success)';
  if (n >= 5) return 'var(--warning)';
  return 'var(--danger)';
}

function listaHtml(items) {
  if (!items || items.length === 0) {
    return '<p style="color:var(--muted);font-size:0.85rem;">Ninguno encontrado.</p>';
  }
  return `<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px;">
    ${items.map(i => `<li style="color:var(--text);font-size:0.875rem;line-height:1.55;">${i}</li>`).join('')}
  </ul>`;
}

function mostrarAnalisis(datos) {
  const color = calificacionColor(datos.calificacion);
  estado.innerHTML = `
    <div class="fade-in">

      <div class="review-section">
        <div class="review-section-title">📋 Resumen general</div>
        <p style="color:var(--text);font-size:0.875rem;line-height:1.6;">${datos.resumen}</p>
      </div>

      <div class="review-section">
        <div class="review-section-title">✅ Puntos positivos</div>
        ${listaHtml(datos.positivos)}
      </div>

      <div class="review-section">
        <div class="review-section-title">⚠️ Problemas encontrados</div>
        ${listaHtml(datos.problemas)}
      </div>

      <div class="review-section">
        <div class="review-section-title">💡 Sugerencias de mejora</div>
        ${listaHtml(datos.sugerencias)}
      </div>

      <div class="review-section" style="border-bottom:none;margin-bottom:0;padding-bottom:0;">
        <div class="review-section-title">⭐ Calificación general</div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:6px;">
          <span style="font-size:2rem;font-weight:800;color:${color};">
            ${datos.calificacion}<span style="font-size:1rem;color:var(--muted);font-weight:400;">/10</span>
          </span>
          <div style="flex:1;height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${datos.calificacion * 10}%;background:${color};border-radius:4px;"></div>
          </div>
        </div>
      </div>

    </div>`;
}

formRevision.addEventListener('submit', async (e) => {
  e.preventDefault();

  const lenguaje  = document.getElementById('lenguaje').value;
  const codigo    = document.getElementById('codigo').value.trim();
  const campoCod  = document.getElementById('codigo');
  const errCodigo = document.getElementById('error-codigo');

  if (!codigo) {
    errCodigo.style.display = 'block';
    campoCod.classList.add('error');
    return;
  }
  errCodigo.style.display = 'none';
  campoCod.classList.remove('error');

  btnAnalizar.disabled = true;
  btnAnalizar.innerHTML = '<span class="spinner"></span> Analizando…';
  mostrarCargando();

  const userPrompt = `Lenguaje: ${lenguaje}

Código a analizar:
\`\`\`${lenguaje}
${codigo}
\`\`\`

Devuelve SOLO el JSON.`;

  try {
    const raw = await llamarClaude(SYSTEM_PROMPT_REVISION, userPrompt);
    const limpio = raw.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const datos = JSON.parse(limpio);
    mostrarAnalisis(datos);
  } catch (err) {
    mostrarError(`Error al analizar el código: ${err.message}`);
  } finally {
    btnAnalizar.disabled = false;
    btnAnalizar.innerHTML = '🔍 Analizar código';
  }
});
