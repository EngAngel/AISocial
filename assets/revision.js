'use strict';

/* ─── System prompt para Claude ─────────────────────────────────────────── */
const SYSTEM_PROMPT_REVISION = `Eres un experto en revisión de código. Analiza el fragmento que recibes y devuelve un JSON con las claves:
- lenguajeDetectado (string): lenguaje del código
- descripcion (string): qué hace este código en 2-3 oraciones
- resumen (string): evaluación general breve
- positivos (array de strings): buenas prácticas encontradas
- problemas (array de strings): errores, malas prácticas o riesgos detectados
- sugerencias (array de strings): mejoras concretas y accionables
- calificacion (número del 1 al 10)

El análisis debe ser claro, constructivo y didáctico. No ejecutes el código, solo analiza estructura, legibilidad y buenas prácticas. Devuelve SOLO el JSON, sin markdown.`;

/* ─── Refs DOM ───────────────────────────────────────────────────────────── */
const estado       = document.getElementById('resultado-estado');
const formRevision = document.getElementById('form-revision');
const btnAnalizar  = document.getElementById('btn-analizar');

/* ─── Analizador local ──────────────────────────────────────────────────── */
const PATRONES_LENGUAJE = {
  javascript: {
    patrones: [/\bconst\b|\blet\b|\bvar\b/, /=>/, /\bconsole\.log\b/, /\bfunction\b/, /\bdocument\b|\bwindow\b/, /\bPromise\b|\basync\b|\bawait\b/, /===|!==/, /\brequire\(|\bimport\b.*\bfrom\b/],
    peso: 0
  },
  python: {
    patrones: [/\bdef\b|\bclass\b|\belif\b/, /\bprint\(/, /\bimport\b|\bfrom\b.*\bimport\b/, /^\s{4}|\t/m, /\bself\b/, /\bNone\b|\bTrue\b|\bFalse\b/, /:$/m, /\bfor\b.*\bin\b/],
    peso: 0
  },
  php: {
    patrones: [/<\?php|\$\w+/, /echo\s|print\s/, /\bfunction\b.*\(/, /->|\:\:/, /\$_GET|\$_POST|\$_SESSION/, /mysqli_|PDO::/, /\barray\(|\[\]/, /\bforeach\b/],
    peso: 0
  },
  java: {
    patrones: [/public\s+class\s|private\s+|protected\s+/, /\bSystem\.out\.print/, /\bvoid\b|\bint\b|\bString\b|\bboolean\b/, /\bnew\s+\w+\(/, /\bimport\s+java\./, /\bextends\b|\bimplements\b/, /@Override/, /\btry\s*\{|\bcatch\s*\(/],
    peso: 0
  },
  csharp: {
    patrones: [/using\s+System/, /\bConsole\.\w+/, /\bnamespace\b|\bclass\b.*\{/, /\bpublic\b|\bprivate\b|\bprotected\b/, /\bList<|\bDictionary</, /\bvar\b|\bstring\b|\bint\b|\bbool\b/, /\bawait\b|\basync\b/, /\bforeach\b|\bLINQ\b/],
    peso: 0
  },
  html: {
    patrones: [/<html|<body|<div|<span|<p>|<h[1-6]/, /class="|id="/, /<\/\w+>/, /<!DOCTYPE/, /<script|<style|<link/, /<form|<input|<button/, /<a\s+href=/, /<img\s+src=/],
    peso: 0
  },
  css: {
    patrones: [/\{\s*[\w-]+\s*:/, /\bmargin\b|\bpadding\b|\bcolor\b|\bfont-size\b/, /@media\b/, /:hover|:focus|:active/, /\bdisplay\s*:|\bflex\b|\bgrid\b/, /\bvar\(--/, /#[0-9a-fA-F]{3,6}/, /\bimportant\b/],
    peso: 0
  },
  sql: {
    patrones: [/\bSELECT\b|\bFROM\b|\bWHERE\b/i, /\bINSERT\b|\bUPDATE\b|\bDELETE\b/i, /\bJOIN\b|\bINNER\b|\bLEFT\b/i, /\bGROUP BY\b|\bORDER BY\b/i, /\bCREATE TABLE\b|\bALTER TABLE\b/i, /\bPRIMARY KEY\b|\bFOREIGN KEY\b/i, /\bINDEX\b|\bUNIQUE\b/i, /;$/m],
    peso: 0
  },
  ruby: {
    patrones: [/\bdef\b|\bend\b/, /\bputs\b|\bprint\b/, /\bdo\b.*\||\|.*\|/, /\bclass\b.*\bend\b/, /\brequire\b|\brequire_relative\b/, /\battr_accessor\b|\battr_reader\b/, /\bmodule\b/, /\b\.each\b|\b\.map\b|\b\.select\b/],
    peso: 0
  },
  go: {
    patrones: [/\bfunc\b|\bpackage\b|\bimport\b/, /\bfmt\.Print/, /:=/, /\bgoroutine\b|\bchan\b/, /\bdefer\b|\bpanic\b|\brecover\b/, /\binterface\b|\bstruct\b/, /\brange\b/, /\berr\b.*!=\s*nil/],
    peso: 0
  }
};

function detectarLenguaje(codigo, lenguajeSeleccionado) {
  if (lenguajeSeleccionado && lenguajeSeleccionado !== 'auto') return lenguajeSeleccionado;

  const scores = {};
  for (const [lang, cfg] of Object.entries(PATRONES_LENGUAJE)) {
    scores[lang] = cfg.patrones.filter(p => p.test(codigo)).length;
  }
  const mejor = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return mejor[1] > 0 ? mejor[0] : 'desconocido';
}

function describirCodigo(codigo, lenguaje) {
  const lineas = codigo.split('\n').filter(l => l.trim()).length;
  const funciones = (codigo.match(/\bfunction\b|\bdef\b|\bfunc\b|=>\s*\{/g) || []).length;
  const clases = (codigo.match(/\bclass\b/g) || []).length;
  const bucles = (codigo.match(/\bfor\b|\bwhile\b|\bforeach\b|\b\.each\b|\b\.map\b/g) || []).length;
  const condicionales = (codigo.match(/\bif\b|\belse\b|\bswitch\b|\bcase\b|\bternary\b/g) || []).length;
  const comentarios = (codigo.match(/\/\/|\/\*|#\s|<!--/g) || []).length;

  const partes = [];

  if (clases > 0) partes.push(`define ${clases} clase${clases > 1 ? 's' : ''}`);
  if (funciones > 0) partes.push(`contiene ${funciones} función${funciones > 1 ? 'es' : ''}`);
  if (bucles > 0) partes.push(`usa ${bucles} bucle${bucles > 1 ? 's' : ''}`);
  if (condicionales > 0) partes.push(`incluye ${condicionales} estructura${condicionales > 1 ? 's' : ''} condicionale${condicionales > 1 ? 's' : ''}`);

  // Detectar propósito por lenguaje
  let proposito = '';
  if (lenguaje === 'html') proposito = 'Es una estructura de marcado HTML';
  else if (lenguaje === 'css') proposito = 'Define estilos visuales para una interfaz';
  else if (lenguaje === 'sql') proposito = 'Contiene consultas o definiciones de base de datos';
  else if (lenguaje === 'javascript' && /document\.|window\./i.test(codigo)) proposito = 'Es código JavaScript para manipulación del DOM';
  else if (lenguaje === 'javascript' && /fetch\(|axios\.|http\./i.test(codigo)) proposito = 'Realiza peticiones HTTP o manejo de APIs';
  else if (lenguaje === 'python' && /flask|django|fastapi/i.test(codigo)) proposito = 'Es un servidor web en Python';
  else if (lenguaje === 'python' && /pandas|numpy|matplotlib/i.test(codigo)) proposito = 'Código de análisis o procesamiento de datos';
  else if (lenguaje === 'php' && /\$_GET|\$_POST|echo/i.test(codigo)) proposito = 'Es un script PHP de servidor web';
  else proposito = `Es un fragmento de código en ${lenguaje}`;

  const descripParts = [proposito];
  if (partes.length > 0) descripParts.push(`El código ${partes.join(', ')}`);
  descripParts.push(`Total: ${lineas} línea${lineas !== 1 ? 's' : ''} de código${comentarios > 0 ? `, con ${comentarios} comentario${comentarios > 1 ? 's' : ''}` : ' (sin comentarios)'}.`);

  return descripParts.join('. ');
}

function analizarProblemas(codigo, lenguaje) {
  const problemas = [];
  const positivos = [];
  const sugerencias = [];

  const tieneComentarios = /\/\/|\/\*|\*\/|#\s|<!--|-->/.test(codigo);
  const lineas = codigo.split('\n').length;

  // Positivos generales
  if (tieneComentarios) positivos.push('El código tiene comentarios explicativos.');
  if (lineas < 50) positivos.push('El fragmento es conciso y fácil de leer.');

  // JavaScript
  if (lenguaje === 'javascript') {
    if (/\bvar\b/.test(codigo)) {
      problemas.push('Uso de `var` (obsoleto): puede causar problemas de alcance.');
      sugerencias.push('Reemplaza `var` por `const` o `let` según corresponda.');
    } else if (/\bconst\b|\blet\b/.test(codigo)) {
      positivos.push('Usa `const`/`let` correctamente en lugar de `var`.');
    }
    if (/==(?!=)/.test(codigo)) {
      problemas.push('Comparación con `==` en lugar de `===`: puede causar errores de tipo.');
      sugerencias.push('Usa siempre `===` para comparaciones estrictas.');
    } else {
      positivos.push('Usa `===` para comparaciones estrictas.');
    }
    if (/console\.log/.test(codigo)) {
      problemas.push('`console.log` encontrado: no debería estar en código de producción.');
      sugerencias.push('Elimina los `console.log` antes de subir a producción.');
    }
    if (/\bcatch\s*\(/.test(codigo)) positivos.push('Manejo de errores con try/catch implementado.');
    if (!/\bcatch\s*\(/.test(codigo) && /\bfetch\(|\baxios\b|\bPromise\b/.test(codigo)) {
      problemas.push('Llamadas asíncronas sin manejo de errores detectado.');
      sugerencias.push('Agrega bloques `try/catch` o `.catch()` a tus promesas.');
    }
    if (/innerHTML\s*=/.test(codigo)) {
      problemas.push('Uso de `innerHTML`: puede ser vulnerable a inyección XSS.');
      sugerencias.push('Usa `textContent` o sanitiza el contenido antes de usar `innerHTML`.');
    }
  }

  // Python
  if (lenguaje === 'python') {
    if (/except\s*:/.test(codigo)) {
      problemas.push('`except:` sin especificar excepción: captura todos los errores sin distinguirlos.');
      sugerencias.push('Especifica la excepción: `except ValueError:` o `except Exception as e:`.');
    }
    if (/print\(/.test(codigo) && lineas > 20) {
      problemas.push('Múltiples `print()` en código largo: considera usar `logging`.');
      sugerencias.push('Usa el módulo `logging` para un manejo más profesional de mensajes.');
    }
    if (/\bSELECT\b.*\+|\"SELECT\b.*\+/i.test(codigo)) {
      problemas.push('Posible concatenación de strings en consulta SQL: riesgo de SQL injection.');
      sugerencias.push('Usa consultas parametrizadas con `?` o `%s` para mayor seguridad.');
    }
    if (/def \w+\(self/.test(codigo)) positivos.push('Uso correcto de programación orientada a objetos con `self`.');
    if (/#/.test(codigo)) positivos.push('El código incluye comentarios en Python.');
  }

  // PHP
  if (lenguaje === 'php') {
    if (/\$_GET|\$_POST/.test(codigo) && !/htmlspecialchars|filter_input|htmlentities/.test(codigo)) {
      problemas.push('Entrada de usuario sin sanitizar: riesgo crítico de XSS o SQL injection.');
      sugerencias.push('Usa `htmlspecialchars()` o `filter_input()` para sanitizar entradas del usuario.');
    }
    if (/mysql_connect|mysql_query/.test(codigo)) {
      problemas.push('Uso de extensión `mysql_*` (obsoleta y eliminada en PHP 7+).');
      sugerencias.push('Migra a `mysqli_*` o PDO para acceso a bases de datos.');
    }
    if (/echo\s+\$_/.test(codigo)) {
      problemas.push('Impresión directa de variable de usuario sin escape: riesgo XSS.');
      sugerencias.push('Siempre escapa: `echo htmlspecialchars($_GET["var"]);`');
    }
    if (/PDO::|mysqli_/.test(codigo)) positivos.push('Usa extensiones modernas de base de datos (PDO o mysqli).');
  }

  // Java
  if (lenguaje === 'java') {
    if (/catch\s*\(\s*Exception\s/.test(codigo)) {
      problemas.push('Captura genérica de `Exception`: oculta el tipo real del error.');
      sugerencias.push('Especifica la excepción concreta que esperas: `catch (IOException e)`.');
    }
    if (/System\.out\.print/.test(codigo)) {
      problemas.push('Uso de `System.out.println` en lugar de un Logger.');
      sugerencias.push('Usa `java.util.logging` o un framework como Log4j para logs profesionales.');
    }
    if (/@Override/.test(codigo)) positivos.push('Uso correcto de la anotación `@Override`.');
    if (/\bfinal\b/.test(codigo)) positivos.push('Uso de `final` para inmutabilidad.');
  }

  // SQL
  if (lenguaje === 'sql') {
    if (/SELECT\s+\*/i.test(codigo)) {
      problemas.push('`SELECT *` selecciona todas las columnas: ineficiente y poco explícito.');
      sugerencias.push('Lista las columnas específicas que necesitas: `SELECT id, nombre, email`.');
    }
    if (!/WHERE/i.test(codigo) && /UPDATE|DELETE/i.test(codigo)) {
      problemas.push('UPDATE o DELETE sin cláusula WHERE: puede afectar toda la tabla.');
      sugerencias.push('Siempre incluye `WHERE` en UPDATE y DELETE para limitar el alcance.');
    }
    if (/;\s*$/m.test(codigo)) positivos.push('Consultas terminadas correctamente con punto y coma.');
    if (/JOIN/i.test(codigo)) positivos.push('Uso de JOINs para combinar tablas eficientemente.');
  }

  // General para todos
  if (!tieneComentarios && lineas > 15) {
    problemas.push('Sin comentarios en el código: dificulta el mantenimiento.');
    sugerencias.push('Agrega comentarios explicativos en las partes más complejas.');
  }
  if (lineas > 200) {
    sugerencias.push('El archivo es largo. Considera dividirlo en módulos o funciones más pequeñas.');
  }

  return { problemas, positivos, sugerencias, tieneComentarios };
}

function calcularCalificacion(problemas, lineas, tieneComentarios) {
  let base = 7;
  base -= Math.min(problemas.length * 0.8, 4);
  if (tieneComentarios) base += 0.5;
  if (lineas < 50 && problemas.length === 0) base += 0.5;
  return Math.max(1, Math.min(10, Math.round(base * 10) / 10));
}

function analizarLocalmente(codigo, lenguajeSeleccionado) {
  const lenguaje = detectarLenguaje(codigo, lenguajeSeleccionado);
  const descripcion = describirCodigo(codigo, lenguaje);
  const { problemas, positivos, sugerencias, tieneComentarios } = analizarProblemas(codigo, lenguaje);
  const lineas = codigo.split('\n').filter(l => l.trim()).length;
  const calificacion = calcularCalificacion(problemas, lineas, tieneComentarios);

  let resumen = '';
  if (calificacion >= 8) resumen = 'El código es de buena calidad. Sigue buenas prácticas generales y es legible.';
  else if (calificacion >= 6) resumen = 'El código es funcional pero tiene áreas de mejora. Algunos puntos pueden afectar la legibilidad o seguridad.';
  else if (calificacion >= 4) resumen = 'El código presenta varios problemas que deben corregirse antes de usar en producción.';
  else resumen = 'El código tiene problemas importantes de seguridad, estilo o estructura que requieren atención inmediata.';

  return { lenguajeDetectado: lenguaje, descripcion, resumen, positivos, problemas, sugerencias, calificacion };
}

/* ─── Render ─────────────────────────────────────────────────────────────── */
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

function calificacionColor(n) {
  if (n >= 8) return 'var(--success, #22c55e)';
  if (n >= 5) return 'var(--warning, #f59e0b)';
  return 'var(--danger, #ef4444)';
}

function listaHtml(items) {
  if (!items || items.length === 0) {
    return '<p style="color:var(--muted);font-size:0.85rem;">Ninguno encontrado.</p>';
  }
  return `<ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px;">
    ${items.map(i => `<li style="color:var(--text);font-size:0.875rem;line-height:1.55;">${i}</li>`).join('')}
  </ul>`;
}

function mostrarAnalisis(datos, esFallback = false) {
  const color = calificacionColor(datos.calificacion);
  const notaFallback = esFallback
    ? `<div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:0.8rem;color:var(--violet-lt, #a78bfa);">
        🔍 Análisis estático local — sin conexión a IA en este momento
      </div>`
    : '';

  estado.innerHTML = `
    <div class="fade-in">

      ${notaFallback}

      <div class="review-section">
        <div class="review-section-title">🖥️ Lenguaje detectado</div>
        <p style="color:var(--text);font-size:0.875rem;line-height:1.6;text-transform:capitalize;">${datos.lenguajeDetectado}</p>
      </div>

      <div class="review-section">
        <div class="review-section-title">📖 ¿Qué hace este código?</div>
        <p style="color:var(--text);font-size:0.875rem;line-height:1.6;">${datos.descripcion}</p>
      </div>

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
            <div style="height:100%;width:${datos.calificacion * 10}%;background:${color};border-radius:4px;transition:width 0.6s ease;"></div>
          </div>
        </div>
      </div>

    </div>`;
}

/* ─── Submit ─────────────────────────────────────────────────────────────── */
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

  /* 1 — Intentar con Claude */
  const userPrompt = `Lenguaje: ${lenguaje === 'auto' ? 'detectar automáticamente' : lenguaje}

Código a analizar:
\`\`\`${lenguaje !== 'auto' ? lenguaje : ''}
${codigo}
\`\`\`

Devuelve SOLO el JSON con las claves: lenguajeDetectado, descripcion, resumen, positivos, problemas, sugerencias, calificacion.`;

  let usadoFallback = false;
  let datos;

  try {
    const raw = await llamarClaude(SYSTEM_PROMPT_REVISION, userPrompt, 2000);
    const limpio = raw.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    datos = JSON.parse(limpio);

    // Rellenar campos que Claude pueda omitir
    if (!datos.lenguajeDetectado) datos.lenguajeDetectado = detectarLenguaje(codigo, lenguaje);
    if (!datos.descripcion) datos.descripcion = describirCodigo(codigo, datos.lenguajeDetectado);

  } catch (_err) {
    /* 2 — Fallback local si Claude no está disponible */
    usadoFallback = true;
    datos = analizarLocalmente(codigo, lenguaje);
  }

  mostrarAnalisis(datos, usadoFallback);

  btnAnalizar.disabled = false;
  btnAnalizar.innerHTML = '🔍 Analizar código';
});
