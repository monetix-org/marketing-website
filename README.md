# marketing-landing-web

Landing pública de Monetix. HTML, CSS y JS estáticos, publicados en Cloudflare Workers.

## Estructura

- `public/`: todo lo que se publica (index.html, css, js, assets).
- `public/_headers`: encabezados de seguridad y caché.
- `wrangler.jsonc`: configuración del Worker y sus ambientes.
- `.github/workflows/deploy.yml`: despliegue automático.

## Ambientes

| Rama | Ambiente | URL |
|---|---|---|
| `develop` | dev | https://dev.monetix.mx (acceso restringido) |
| `main` | producción | https://monetix.mx (pendiente) |

## Cómo publicar un cambio

1. Crear una rama desde `main`: `feature/descripcion-corta`.
2. Abrir PR hacia `develop`. Al fusionarse, se publica en dev.monetix.mx.
3. Germán valida en dev.
4. Abrir PR de `develop` a `main` (cuando producción esté habilitada).

## Secretos (environment `dev` en GitHub)

- `CLOUDFLARE_API_TOKEN`: token limitado a Workers de la cuenta Monetix (respaldo en Bitwarden).
- `CLOUDFLARE_ACCOUNT_ID`: Account ID de la cuenta Monetix.

## Probar localmente

Abrir `public/index.html` en el navegador, o con Node instalado:

    npx wrangler dev
