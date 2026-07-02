# Release Please Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up automated semantic versioning with Release Please, generating version bumps, changelogs, git tags, and GitHub Releases from conventional commits on `main`.

**Architecture:** A GitHub Actions workflow triggered on push to `main` runs Release Please, which inspects commits since the last tag and creates/updates a Release PR with the version bump and changelog. When merged, it tags the commit and creates a GitHub Release. No npm publishing is included.

**Tech Stack:** `googleapis/release-please-action@v5`, conventional commits, GitHub Actions

**Relevant files:**
- Create: `.github/workflows/release-please.yml`
- Create: `release-please-config.json`
- Create: `.release-please-manifest.json`

---

### Task 1: Create Release Please Workflow

**Files:**
- Create: `.github/workflows/release-please.yml`

- [ ] **Step 1: Create the release-please workflow file**

```yaml
name: release-please
on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v5
        with:
          release-type: node
          token: ${{ secrets.GITHUB_TOKEN }}
```

Notes:
- `release-type: node` tells Release Please to bump `version` in `package.json`, update `version` in any lockfile, and generate a Node-style changelog.
- `GITHUB_TOKEN` is sufficient here. If downstream CI workflows need to trigger on the Release PR events, switch to a PAT stored as `${{ secrets.RELEASE_PLEASE_TOKEN }}`.
- No `publish` job — npm publishing is omitted per requirements.

- [ ] **Step 2: Verify workflow syntax**

```bash
npx action-validator .github/workflows/release-please.yml 2>/dev/null || echo "action-validator not installed — skipping"
```

Expected: if `action-validator` is installed, no errors. If not, a visual inspection of the YAML is sufficient (indentation must be consistent, no tabs).

---

### Task 2: Create Optional Config Files

**Files:**
- Create: `release-please-config.json`
- Create: `.release-please-manifest.json`

These are optional — without them, the action uses defaults based on `release-type: node`. Adding them gives explicit control and documents the configuration.

- [ ] **Step 1: Create `release-please-config.json`**

```json
{
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
  "release-type": "node",
  "bump-minor-pre-major": true,
  "include-v-in-tag": true,
  "packages": {
    ".": {
      "release-type": "node"
    }
  }
}
```

| Option | Purpose |
|--------|---------|
| `bump-minor-pre-major: true` | Before v1.0.0, a `feat:` bumps minor instead of major |
| `include-v-in-tag: true` | Tags are `v1.2.3` (not `1.2.3`) |
| `packages["."]` | Single-package mode at repo root |

- [ ] **Step 2: Create `.release-please-manifest.json`**

```json
{
  ".": "1.0.1"
}
```

This tells Release Please the current version. It will update this file automatically when a release is created. Must match the current version in `package.json`.

---

### Task 3: Verify Conventional Commit Convention

**Files:**
- Modify: `.github/workflows/ci.yml`

Release Please parses commit messages in the `feat:`, `fix:`, `feat!:`, `fix!:`, `build:`, `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:` format. The project's existing history uses similar but non-standard prefixes like `feature:` instead of `feat:`.

To help contributors use the right format, add a PR title linting step.

- [ ] **Step 1: Add commitlint or a simple conventional commit check**

Option A — **Simple PR title check** (no new dependency): add a step to the CI workflow that validates PR titles.

Modify `.github/workflows/ci.yml` to add:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint-commits:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci --ignore-scripts
      - run: echo "PR_TITLE=${{ github.event.pull_request.title }}" >> $GITHUB_ENV
      - run: |
          if ! echo "$PR_TITLE" | grep -qE '^(feat|fix|chore|docs|refactor|test|ci|perf|style|build)(\(.+\))?!?: '; then
            echo "❌ PR title does not follow conventional commits:"
            echo "   Expected: feat: ..., fix: ..., chore: ..., docs: ..., refactor: ..., test: ..., ci: ..., perf: ..., style: ..., build: ..."
            exit 1
          fi
          echo "✅ PR title follows conventional commits"

  ci:
    # existing job...
```

Option B — **No commit linting** (simpler, less friction). Accept that Release Please will only parse commits matching conventional format and ignore others.

Recommendation: Use Option B for now. The PR title lint adds noise and Release Please gracefully ignores non-conventional commits. Add linting later if needed.

- [ ] **Step 2: (Conditional) If Option A was chosen, verify by opening a test PR** — not applicable here.

---

### Task 4: Validate Full Pipeline

- [ ] **Step 1: Push the workflow files to GitHub and test**

```bash
git add .github/workflows/release-please.yml release-please-config.json .release-please-manifest.json
git commit -m "ci: add release-please for automated versioning"
git push
```

Expected: on push to `main`, the `release-please` workflow runs. Since the current tag is `v1.0.1` and there are no new conventional commits since then, Release Please should complete with `release_created: false` (no new release needed).

- [ ] **Step 2: Simulate a release by pushing a `feat:` commit**

After the workflow is merged and running:

1. Create a branch with a `feat:` commit
2. Open a PR, merge it to `main`
3. The Release Please workflow should create a **Release PR** with the changelog and bumped version (e.g., `v1.1.0`)
4. Merge that Release PR
5. Verify a GitHub Release was created with the tag `v1.1.0`
6. Verify `package.json` version was bumped and `CHANGELOG.md` was created/updated
