# Recompilar los estilos

Los estilos de la web salen de aquí y se compilan a `../assets/styles.css`.
Hay que recompilar cada vez que se añadan o cambien clases de Tailwind en `index.html`
o se edite `input.css`.

Desde esta carpeta (`studio-glow/tailwind`):

```bash
npx --yes tailwindcss@3.4.17 -c tailwind.config.js -i input.css -o ../assets/styles.css --minify
```

Después, sube el número de versión del enlace en `index.html`
(`./assets/styles.css?v=1` → `?v=2`) para que los visitantes reciban el CSS nuevo,
porque el servidor lo guarda en caché durante 1 año.

- `tailwind.config.js`: colores (`noir`, `cream`, `champagne`), fuentes y espaciado `luxe`.
- `input.css`: directivas de Tailwind + todo el CSS propio (keyframes `kenburns`, `shimmer-drift`, `marquee`, acordeón, navbar, etc.).

Esta carpeta no hace falta subirla al hosting.
