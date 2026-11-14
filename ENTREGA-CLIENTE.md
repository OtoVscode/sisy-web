# Studio Glow — Guía de entrega

Web de una sola página, lista para cualquier hosting estático (Vercel, Netlify, Cloudflare Pages o un hosting tradicional por FTP). No necesita base de datos ni instalar nada en el servidor.

---

## 1. Qué subir al hosting

Sube **el contenido** de la carpeta `studio-glow/` con esta estructura exacta:

```
index.html
hero-beauty.mp4
vercel.json          ← solo hace falta en Vercel
_headers             ← solo hace falta en Netlify o Cloudflare Pages
assets/
  styles.css
  og-cover.jpg
  hero-fallback.jpg
  servicio-maquillaje.jpg
  servicio-lashes.jpg
  servicio-pmu.jpg
  servicio-laminado.jpg
  lookbook-1.jpg
  lookbook-2.jpg
  lookbook-3.jpg
  lookbook-4.jpg
  vendor/
    gsap.min.js
    ScrollTrigger.min.js
    lenis.min.js
```

**No subas:**
- La carpeta `tailwind/`: solo sirve para recompilar los estilos en tu computadora.
- Este archivo `ENTREGA-CLIENTE.md`.

> `index.html` debe quedar en la raíz del dominio (por ejemplo `https://tudominio.com/index.html`), con `assets/` y `hero-beauty.mp4` a su lado.

---

## 2. Paso obligatorio al publicar: el dominio

Abre `index.html`, busca el texto `TU-DOMINIO.com` (aparece 4 veces) y cámbialo por el dominio real, por ejemplo `studioglow.com`.

Está en `og:url`, `og:image`, `twitter:image` y en `"image"` del JSON-LD. Sin este cambio, al compartir el enlace por WhatsApp o Instagram no se verá la foto de portada.

---

## 3. Cambiar WhatsApp, Booksy, redes, dirección y horario

Todo está en un solo lugar: el objeto **`STUDIO_CONFIG`** dentro de `index.html`. Busca `window.STUDIO_CONFIG` y edita solo los valores entre comillas:

| Dato | Campo | Ejemplo |
|---|---|---|
| Nombre del estudio | `studioName` | `'Studio Glow'` |
| WhatsApp | `whatsappNumber` | `'17135550199'` → código de país + número, **sin** `+`, espacios ni guiones |
| Booksy | `booksyUrl` | `'https://booksy.com/es-us/12345_studio-glow'` |
| Instagram | `instagramUrl` | `'https://www.instagram.com/studioglow'` |
| TikTok | `tiktokUrl` | `'https://www.tiktok.com/@studioglow'` |
| Dirección visible | `address` | `'1234 Main St, Suite 2 · Houston, TX 77002'` |
| Horario visible (español) | `hours` | `'Mar - Sáb: 9:00 AM - 7:00 PM • Con cita previa'` |
| Horario visible (inglés) | `hoursEn` | `'Tue - Sat: 9:00 AM - 7:00 PM • By appointment only'` |
| Dirección para Google | `seoAddress` | calle, ciudad, estado (2 letras), código postal, país (`US`) |
| Horario para Google | `seoHours` | días en inglés (`'Tuesday'`…), `opens` y `closes` en formato 24 h (`'09:00'`, `'19:00'`) |

Al guardar y volver a subir `index.html`, la web se actualiza sola: el formulario de WhatsApp, los enlaces, la dirección y el horario de la sección de reserva y del pie de página, y los datos para Google.

> Para máxima compatibilidad con herramientas de SEO, cambia también los mismos datos en el bloque `<script type="application/ld+json">` del principio de `index.html`.

**Textos en español e inglés:** la web tiene un botón `ES | EN` y recuerda el idioma elegido. Para cambiar cualquier texto, busca `window.TRANSLATIONS` en `index.html` y edita la misma clave en `es` y en `en` (por ejemplo `"svc1.desc"`). El mensaje de WhatsApp se envía en el idioma activo.

---

## 4. Reemplazar fotos o el video

Los archivos se guardan en caché durante **1 año** para que la web cargue rápido. Por eso, al reemplazar uno hay que avisar al navegador de que es nuevo.

**Fotos (`assets/…jpg`)**
1. Prepara la foto nueva en JPG, de unos 1200 px de ancho y menos de 500 KB.
2. Guárdala en `assets/` con el **mismo nombre** que la que reemplazas (por ejemplo `servicio-pmu.jpg`).
3. En `index.html`, busca ese nombre y añádele `?v=2` al final de la ruta:
   `./assets/servicio-pmu.jpg` → `./assets/servicio-pmu.jpg?v=2`
4. Sube la foto y el `index.html`. En el siguiente cambio de esa misma foto usa `?v=3`, y así sucesivamente.

**Video del Hero (`hero-beauty.mp4`)**
1. Usa un MP4 de 10–20 segundos, sin audio, horizontal y de menos de 5 MB.
2. Guárdalo como `hero-beauty.mp4`, reemplazando el anterior.
3. En `index.html`, cambia `<source src="./hero-beauty.mp4"` por `<source src="./hero-beauty.mp4?v=2"`.
4. Sube el video y el `index.html`.

> Si el video no carga, la web muestra automáticamente la foto `assets/hero-fallback.jpg` con una animación suave, así que la portada nunca queda vacía.

**Portada al compartir (`assets/og-cover.jpg`)**: debe medir exactamente 1200 × 630 px. Al cambiarla, añade `?v=2` en las rutas `og-cover.jpg` del principio de `index.html`. WhatsApp y Facebook pueden tardar unos días en mostrar la nueva.

---

## 5. Antes de publicar, revisa

- [ ] `TU-DOMINIO.com` reemplazado por el dominio real (4 veces).
- [ ] `STUDIO_CONFIG` con WhatsApp, Booksy, redes, dirección y horario reales.
- [ ] Fotos y video reales del estudio en lugar de las imágenes de muestra.
- [ ] Probar el botón "Confirmar Disponibilidad por WhatsApp": debe abrir el chat con el número correcto.
