# Plataforma Generadora de Contenido para Redes Sociales

Proyecto universitario para la materia **Programación Web II** - Una plataforma web completa que permite generar contenido para redes sociales y analizar código fuente.

## 📋 Descripción del Sistema

La plataforma es una aplicación web full-stack que ofrece dos funcionalidades principales:

1. **Generación de Contenido**: Crea textos, hashtags e imágenes para redes sociales basados en temas y objetivos específicos
2. **Análisis de Código**: Revisa fragmentos de código y proporciona feedback sobre calidad, legibilidad y buenas prácticas

## 🏗️ Arquitectura Elegida

### Stack Tecnológico
- **Frontend**: React 18 + TailwindCSS + Lucide Icons
- **Backend**: Node.js + Express.js
- **Comunicación**: REST API con Axios
- **Estilos**: TailwindCSS con diseño responsive y moderno

### ¿Por qué esta arquitectura?

1. **Simplicidad**: React + Express es una combinación probada y fácil de entender
2. **Escalabilidad**: Separación clara entre frontend y backend
3. **Mantenibilidad**: Código modular y bien estructurado
4. **Facilidad de ejecución**: Solo requiere Node.js para funcionar
5. **Sin base de datos**: Implementación mock que simplifica el despliegue

## 📁 Estructura del Proyecto

```
plataforma-generador-contenido/
├── backend/                     # Servidor Node.js
│   ├── src/
│   │   ├── app.js              # Punto de entrada del servidor
│   │   ├── controllers/        # Controladores de lógica
│   │   │   ├── contenidoController.js
│   │   │   └── codigoController.js
│   │   ├── routes/             # Definición de rutas
│   │   │   ├── contenidoRoutes.js
│   │   │   └── codigoRoutes.js
│   │   ├── services/           # Lógica de negocio
│   │   │   ├── contenidoService.js
│   │   │   └── codigoService.js
│   │   └── utils/              # Utilidades varias
│   ├── public/                 # Archivos estáticos
│   ├── package.json
│   └── .env.example            # Variables de entorno
├── frontend/                   # Aplicación React
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   │   └── Navbar.js
│   │   ├── pages/              # Páginas principales
│   │   │   ├── HomePage.js
│   │   │   ├── ContenidoPage.js
│   │   │   └── CodigoPage.js
│   │   ├── services/           # Servicios API
│   │   │   └── api.js
│   │   ├── utils/              # Utilidades del frontend
│   │   ├── App.js              # Componente principal
│   │   ├── index.css           # Estilos globales
│   │   └── index.js            # Punto de entrada
│   ├── package.json
│   └── tailwind.config.js      # Configuración de Tailwind
└── README.md
```

## 🔄 Flujo de Datos

### Generación de Contenido

1. **Usuario ingresa datos** en el formulario (tema, objetivo, tono, plataforma)
2. **Frontend** valida los datos y envía POST a `/api/contenido/generar`
3. **Backend** recibe la solicitud en `contenidoController.js`
4. **Controller** llama a `contenidoService.generarContenidoCompleto()`
5. **Service** procesa la información y genera:
   - Texto personalizado usando plantillas
   - Hashtags relevantes según categoría
   - URL de imagen placeholder coherente
6. **Response** JSON con los resultados
7. **Frontend** muestra los resultados con botones para copiar

### Análisis de Código

1. **Usuario pega código** en el textarea y selecciona lenguaje
2. **Frontend** envía POST a `/api/codigo/analizar`
3. **Backend** procesa en `codigoController.js`
4. **Controller** delega a `codigoService.analizarCodigo()`
5. **Service** realiza análisis heurístico:
   - Detección automática de lenguaje
   - Análisis de estructura y legibilidad
   - Cálculo de métricas de calidad
   - Generación de observaciones y sugerencias
6. **Response** JSON con análisis detallado
7. **Frontend** muestra resultados con métricas visuales

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 16+ instalado
- npm o yarn

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
2. **Abrir terminal** en la carpeta raíz del proyecto

3. **Instalar dependencias del backend**:
```bash
cd backend
npm install
```

4. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env si es necesario (opcional para desarrollo)
```

5. **Iniciar servidor backend**:
```bash
npm run dev
# O npm start para producción
```

6. **Abrir nueva terminal** e instalar dependencias del frontend:
```bash
cd frontend
npm install
```

7. **Iniciar aplicación frontend**:
```bash
npm start
```

8. **Abrir navegador** en `http://localhost:3000`

### URLs de Acceso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001 (endpoint raíz)

## 📡 Endpoints de la API

### Contenido
- `POST /api/contenido/generar` - Generar contenido completo
- `GET /api/contenido/tonos` - Obtener tonos disponibles
- `GET /api/contenido/plataformas` - Obtener plataformas disponibles

### Código
- `POST /api/codigo/analizar` - Analizar fragmento de código
- `GET /api/codigo/lenguajes` - Obtener lenguajes soportados
- `GET /api/codigo/metricas` - Obtener métricas de calidad

## 🎯 Características Implementadas

### ✅ Requerimientos Funcionales
- [x] RF1: Ingresar tema, idea o descripción
- [x] RF2: Generar texto relacionado
- [x] RF3: Generar hashtags
- [x] RF4: Generar imagen relacionada
- [x] RF5: Mostrar resultados organizados
- [x] RF6: Revisar fragmentos de código
- [x] RF7: Mostrar observaciones del código

### ✅ Requerimientos No Funcionales
- [x] Interfaz clara, moderna e intuitiva
- [x] Diseño responsive
- [x] Navegación simple
- [x] Resultados visualmente comprensibles
- [x] Estructura escalable
- [x] Código organizado
- [x] Nombres coherentes

## 🔧 Componentes Principales

### Backend

#### contenidoService.js
- **Responsabilidad**: Generación de contenido para redes sociales
- **Métodos**: 
  - `generarContenidoCompleto()`: Procesa solicitud completa
  - `generarTexto()`: Crea texto basado en plantillas
  - `generarHashtags()`: Genera hashtags relevantes
  - `generarImagen()`: Crea URL de imagen placeholder

#### codigoService.js
- **Responsabilidad**: Análisis heurístico de código
- **Métodos**:
  - `analizarCodigo()`: Análisis completo del fragmento
  - `detectarLenguaje()`: Identifica lenguaje automáticamente
  - `calcularMetricasCalidad()`: Calcula índices de calidad
  - `analizarBuenasPracticas()`: Verifica patrones de código

### Frontend

#### ContenidoPage.js
- **Responsabilidad**: Interfaz de generación de contenido
- **Componentes**: Formulario configuración, visualización de resultados
- **Funcionalidades**: Validación, copiado al portapapeles, animaciones

#### CodigoPage.js
- **Responsabilidad**: Interfaz de análisis de código
- **Componentes**: Editor de código, métricas visuales, observaciones
- **Funcionalidades**: Resaltado de sintaxis, gráficos de calidad

## 🎨 Diseño y UX

### Paleta de Colores
- **Primary**: Azul profesional (#3b82f6)
- **Secondary**: Grises suaves para interfaz limpia
- **Success**: Verde para confirmaciones
- **Warning**: Amarillo para alertas
- **Error**: Rojo para errores

### Componentes de UI
- **Cards**: Contenedores de información con sombras sutiles
- **Buttons**: Estilos consistentes con estados hover
- **Forms**: Validación en tiempo real
- **Navigation**: Menú responsive con indicadores activos
- **Loading States**: Indicadores de progreso claros

## 🔮 Mejoras Futuras

### Corto Plazo
1. **Integración con APIs reales** (OpenAI, HuggingFace)
2. **Base de datos** para guardar historial
3. **Autenticación** de usuarios
4. **Exportación** a diferentes formatos

### Largo Plazo
1. **Análisis de sentimiento** en contenido generado
2. **Sugerencias de optimización** SEO
3. **Integración** con redes sociales directamente
4. **Dashboard** de analytics
5. **Colaboración** en equipo

## 🐛 Solución de Problemas Comunes

### Problemas de Conexión
- Verificar que ambos servidores estén corriendo
- Confirmar puertos 3000 (frontend) y 3001 (backend)
- Revisar configuración CORS en backend

### Problemas de Estilos
- Asegurar instalación de TailwindCSS
- Verificar importación de `index.css`
- Revisar configuración de `tailwind.config.js`

### Problemas de Dependencias
- Ejecutar `npm install` en ambas carpetas
- Limpiar caché: `npm cache clean --force`
- Reinstalar: `rm -rf node_modules package-lock.json && npm install`

## 📄 Licencia

Proyecto educativo desarrollado para **Programación Web II** - Universidad.

## 👥 Autores

- **Desarrollador**: Estudiante de Programación Web II
- **Materia**: Programación Web II
- **Institución**: Universidad

---

**Nota**: Este proyecto fue diseñado como entrega académica, priorizando simplicidad, funcionalidad y aprendizaje sobre complejidad innecesaria.
