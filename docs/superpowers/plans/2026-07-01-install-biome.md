# Install and Configure Biome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Biome as the project's linter and formatter, replacing the need for ESLint + Prettier.

**Architecture:** Single devDependency (`@biomejs/biome`), a `biome.json` config file at repo root, and npm scripts that wrap `biome check` and `biome format`. CI gets a new lint step.

**Tech Stack:** Biome v2 (Rust-based, zero-config TypeScript support), Node 20+, TypeScript 6

**Relevant files:**
- `package.json` — add dep + scripts
- `biome.json` — create config
- `.github/workflows/ci.yml` — add lint step

---

### Task 1: Install Biome and Create Config

**Files:**
- Modify: `package.json`
- Create: `biome.json`

- [ ] **Step 1: Install Biome as devDependency**

```bash
npm install --save-dev @biomejs/biome
```

- [ ] **Step 2: Create biome.json config**

Biome v2 works with zero-config for basic projects, but we need to pin settings for consistency:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "semicolons": "always",
      "trailingCommas": "all",
      "quoteStyle": "double"
    }
  },
  "files": {
    "ignore": ["dist", "node_modules", ".taskly.json"]
  }
}
```

- [ ] **Step 3: Run Biome to see current state**

```bash
npx biome check src/
```

Expected: list of lint warnings and formatting differences. This is informational — we'll fix in the next tasks.

---

### Task 2: Add npm Scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add lint/format scripts to package.json**

Edit the `"scripts"` section:

```json
"scripts": {
  "test": "vitest",
  "typecheck": "tsc --noEmit",
  "lint": "biome check src/",
  "lint:fix": "biome check --write src/",
  "format": "biome format src/",
  "format:fix": "biome format --write src/",
  "dev": "tsx src/index.ts",
  "build": "rm -rf dist && tsc",
  "watch": "tsc -w",
  "start": "node dist/index.js",
  "prepare": "npm run build"
}
```

---

### Task 3: Fix All Lint and Format Issues

**Files:**
- Modify: `src/**/*.ts` (may be auto-fixed)

- [ ] **Step 1: Auto-fix formatting**

```bash
npx biome format --write src/
```

Expected: files reformatted according to config (spaces, 2 indent, double quotes, trailing commas, semicolons, 100 line width).

- [ ] **Step 2: Auto-fix lint issues**

```bash
npx biome check --write src/
```

Expected: auto-fixable issues resolved (unused imports, organize imports, etc.).

- [ ] **Step 3: Review remaining warnings**

```bash
npx biome check src/
```

Expected: some warnings may remain (e.g., `noExplicitAny`). Review and either:
- Fix manually, or
- Add inline overrides if intentional (e.g., for legitimate `any` use), or
- Add rule exclusions to `biome.json` under `linter.rules` if project-wide

- [ ] **Step 4: Run tests to verify nothing broke**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Run typecheck to verify no type errors**

```bash
npm run typecheck
```

Expected: no type errors.

---

### Task 4: Add Lint Step to CI

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add `lint` step after `typecheck`**

```yaml
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

Expected: CI pipeline now enforces linting on PRs.

---

### Task 5: Verify Everything Works End-to-End

- [ ] **Step 1: Run full check suite**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

Expected: all four steps pass (typecheck, lint, tests, build).

- [ ] **Step 2: Commit all changes**

```bash
git add package.json biome.json src/ .github/workflows/ci.yml docs/superpowers/plans/2026-07-01-install-biome.md
git commit -m "feat: add biome linter and formatter"
```
