# 🤖 AISocial — Plataforma Generadora de Contenido para Redes Sociales

> Proyecto académico — Programación Web II · Docente: Javier Ochoa · 2026

---

## 📌 Descripción

**AISocial** es una plataforma web que genera contenido listo para publicar en redes sociales mediante inteligencia artificial. El usuario ingresa un tema, objetivo y tono, y la plataforma produce automáticamente:

- ✍️ Texto optimizado para la plataforma seleccionada
- #️⃣ Hashtags principales y secundarios
- 🖼️ Imagen generada por IA
- 🔍 Revisión detallada de fragmentos de código

Todo construido con **HTML, CSS y JavaScript vanilla**, sin ningún framework, y desplegado en **GitHub Pages**.

---

## 🚀 Demo en vivo

🔗 [https://engangel.github.io/AISocial](https://engangel.github.io/AISocial)

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| **Generador de contenido** | Crea publicaciones para Instagram, Twitter/X, Facebook, LinkedIn y TikTok |
| **Tonos disponibles** | Formal, Creativo, Promocional, Profesional, Juvenil |
| **Generación de imágenes** | Imágenes fotorrealistas via Pollinations.ai (flux-realism, 1024×1024) |
| **Hashtags** | Principales y secundarios específicos al tema |
| **Revisión de código** | Análisis estructurado con puntos positivos, problemas, sugerencias y calificación |
| **Copiar al portapapeles** | Copia el texto solo o con hashtags en un clic |

---

## 🛠️ Tecnologías utilizadas

- **HTML5 / CSS3 / JavaScript** — sin frameworks, 100% vanilla
- **[Claude Haiku (Anthropic)](https://www.anthropic.com)** — generación de texto, hashtags y revisión de código
- **[Pollinations.ai](https://pollinations.ai)** — generación de imágenes con IA
- **[GitHub Pages](https://pages.github.com)** — hosting estático gratuito
- **[Google Fonts — Inter](https://fonts.google.com/specimen/Inter)** — tipografía

---


## 📁 Estructura del proyecto

AISocial/
├── index.html              # Página de inicio
├── generar.html            # Módulo generador de contenido
├── revision.html           # Módulo de revisión de código
├── .gitignore
├── README.md
└── assets/
├── styles.css          # Estilos globales
├── shared.js           # Utilidades y llamada a Claude API
├── generar.js          # Lógica del generador
└── revision.js         # Lógica del revisor de código


---

## 🔒 Seguridad

La API key de Anthropic **nunca se sube a GitHub**. El archivo `assets/config.js` que la contiene está listado en `.gitignore`. El repositorio solo incluye `config.example.js` como plantilla sin credenciales.

---

## 📄 Licencia

Proyecto académico — uso educativo. 2026.
