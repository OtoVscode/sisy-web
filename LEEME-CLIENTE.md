# Studio Glow — Léeme

## 1. Qué subir al hosting

Sube estos archivos a la raíz de tu dominio, con esta misma estructura:

```
index.html
hero-beauty.mp4
vercel.json          ← solo en Vercel
_headers             ← solo en Netlify o Cloudflare Pages
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
- La carpeta `tailwind/`, que solo sirve para recompilar los estilos.
- Los archivos `LEEME-CLIENTE.md` y `ENTREGA-CLIENTE.md`.

**Antes de publicar:** en `index.html`, cambia las 4 veces que aparece `TU-DOMINIO.com` por tu dominio real. Si no lo cambias, la foto de portada no saldrá al compartir el enlace.

## 2. Cómo editar tus datos (`STUDIO_CONFIG`)

Abre `index.html`, busca `window.STUDIO_CONFIG` y cambia solo lo que está entre comillas:

```js
window.STUDIO_CONFIG = {
  studioName: 'Studio Glow',
  whatsappNumber: '17135550199',           // Teléfono: código de país + número, sin +, espacios ni guiones
  booksyUrl: 'https://booksy.com/...',     // Tu página de Booksy
  instagramUrl: 'https://www.instagram.com/...',
  tiktokUrl: 'https://www.tiktok.com/@...',
  address: '1234 Main St, Suite 2 · Houston, TX 77002',                // Dirección visible
  hours: 'Mar - Sáb: 9:00 AM - 7:00 PM • Con cita previa',             // Horario en español
  hoursEn: 'Tue - Sat: 9:00 AM - 7:00 PM • By appointment only',       // Horario en inglés
  seoAddress: { ... },  // Dirección para Google: calle, ciudad, estado (2 letras), código postal, país 'US'
  seoHours: { ... }     // Horario para Google: días en inglés y horas en formato 24 h ('09:00', '19:00')
};
```

Guarda el archivo y vuelve a subir `index.html`. Se actualizan solos el botón de WhatsApp, los enlaces a Booksy y a las redes, la dirección, el horario y los datos para Google.

**Textos de la web (español e inglés):** busca `window.TRANSLATIONS` en `index.html` y edita la misma clave en `es` y en `en`.

Para cambiar fotos o el video, o para más detalle, consulta `ENTREGA-CLIENTE.md`.
