# Docker Compose para dnt

## Objetivo

Proveer un entorno de desarrollo local aislado y reproducible para contributors de dnt, eliminando la necesidad de instalar Node.js, npm, o compilar better-sqlite3 manualmente en el host.

## Enfoque

Dockerfile único + Docker Compose. Un solo servicio `dnt` con bind-mount del source code para desarrollo iterativo.

## Dockerfile

- **Base:** `node:22-alpine` (coincide con versión del CI)
- **Entrypoint:** `docker-entrypoint.sh` (wrapper script que delega en `dumb-init`)
- **Pasos:**
  1. Instalar `dumb-init` vía apk
  2. Copiar `package*.json` y ejecutar `npm ci --ignore-scripts` (evita que `prepare` corra `tsc` sin source)
  3. Ejecutar `npm rebuild better-sqlite3` (compila el addon nativo, saltado por `--ignore-scripts`)
  4. Copiar el resto del source
  5. Ejecutar `npm run build` (tsc)
  6. Copiar `docker-entrypoint.sh` y hacerlo ejecutable
  7. Agregar `/app/node_modules/.bin` al `PATH`
- **Entrypoint:** `docker-entrypoint.sh` (sin `CMD`)

## docker-compose.yml

Servicio único `dnt`:

| Campo | Valor |
|-------|-------|
| `build.context` | `.` |
| `build.dockerfile` | `Dockerfile` |
| `volumes` | `.:/app` (bind) + `/app/node_modules` (anónimo) |
| `working_dir` | `/app` |
| `environment` | `DNT_VERBOSE` (passthrough desde host) |
| `entrypoint` | Sin override — usa el `ENTRYPOINT` del Dockerfile |

## docker-entrypoint.sh

Script wrapper que distingue entre comandos CLI y comandos de sistema:

- Si no hay argumentos, o el primer arg es `ticket`, `help`, o empieza con `-` → ejecuta `node /app/dist/index.js <args>` (modo CLI)
- Cualquier otro caso (e.g., `npm`, `tsx`, `node`) → pasa el comando directamente a `dumb-init`

Esto permite que `docker compose run --rm dnt ticket list` funcione (CLI mode) y también `docker compose run --rm dnt npm test` (system mode), sin necesidad de especificar `node /app/dist/index.js` cada vez.

## .dockerignore

```
node_modules/
dist/
.git/
.gitignore
AGENTS.md
opencode.json
docs/superpowers/
*.md
```

## Flujo de uso

| Comando | Propósito |
|---------|-----------|
| `docker compose build` | Construir imagen |
| `docker compose run --rm dnt` | Ayuda por defecto |
| `docker compose run --rm dnt ticket list` | CLI modo compilado |
| `docker compose run --rm dnt tsx src/index.ts ticket add "foo"` | Modo dev (tsx, sin rebuild) |
| `docker compose run --rm dnt npm test` | Tests |
| `docker compose run --rm dnt npm run typecheck` | Type check |
| `docker compose run --rm dnt npm run lint` | Lint |
| `docker compose run --rm dnt npm run build` | Recompilar dentro del contenedor |

## Persistencia de datos

El bind mount `.:/app` hace que `.magnetar.db` (SQLite) se cree y persista en el CWD del host automáticamente. No requiere configuración adicional.

## Señales

`dumb-init` asegura que procesos hijo reciban señales correctamente. Esto es relevante para Ctrl+C durante comandos interactivos (p.ej., `dnt ticket add` sin argumentos que usa Inquirer).

## Notas técnicas

- `better-sqlite3` es un addon nativo. Con `npm ci --ignore-scripts` se salta su compilación, por lo que se ejecuta `npm rebuild better-sqlite3` después para compilarlo específicamente para la plataforma del contenedor.
- El volumen anónimo `/app/node_modules` evita que el bind mount de `.` sobrescriba los node_modules del contenedor con los del host.
- `ENV PATH=/app/node_modules/.bin:$PATH` permite ejecutar `tsx`, `npx`, etc. sin ruta completa.
- `dumb-init` como entrypoint final asegura manejo correcto de señales (Ctrl+C, SIGTERM).
- `.magnetar.db` está en `.gitignore` — no se trackea en git.
- El Dockerfile no tiene multi-stage para mantener la simplicidad. La imagen incluye source + build (~200-300MB con alpine).
