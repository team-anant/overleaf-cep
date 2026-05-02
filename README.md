# Team Anant Overleaf

A self-hosted collaborative LaTeX editor for Team Anant, based on [overleaf-cep](https://github.com/yu-i-i/overleaf-cep) (Overleaf Community Edition with extended features).

**Live instance:** https://overleaf.team-anant.com

---

## What's different from upstream

### Admin — Manage Users (`/admin/register`)

The register page has been enhanced beyond the default "register only" form:

- **User table** — lists all existing users with email, first/last name, admin status, sign-up date, and last login
- **Delete user** — each row has a delete button (soft-delete with confirmation prompt); the table refreshes automatically after deletion
- **Register new users** — original bulk-email registration form retained above the table

Relevant files:
- `services/web/modules/user-activate/app/src/UserActivateController.mjs` — added `getUsers` and `deleteUser` handlers
- `services/web/modules/user-activate/app/src/UserActivateRouter.mjs` — added `GET /admin/register/users` and `DELETE /admin/register/user/:userId`
- `services/web/modules/user-activate/frontend/js/components/user-activate-register.jsx` — added users table component

### TeX Live

The community image installs `scheme-full` (complete TeX Live) and updates all packages at build time, so every LaTeX package on CTAN is available to all users out of the box.

---

## Server

| | |
|---|---|
| **Host** | `23.95.182.35` |
| **OS** | Ubuntu 24.04 |
| **Disk** | 62 GB (41 GB free) |
| **Deployment** | Docker Compose |

### Key paths

| Path | Purpose |
|---|---|
| `/opt/overleaf` | Source repo (this repo, branch `ext-ce`) |
| `/opt/overleaf-data` | Persistent data volume (MongoDB, Redis, uploads) |
| `/opt/overleaf/docker-compose.override.yml` | Site-specific env vars (URL, SMTP, etc.) |
| `/tmp/overleaf-build.log` | Output of the last image build |

---

## Deploying changes

### 1. Make and commit changes locally

```bash
# edit files...
git add <files>
git commit -m "your message"
git push fork ext-ce
```

### 2. Pull on the server

```bash
ssh root@23.95.182.35
cd /opt/overleaf
git pull origin ext-ce
```

### 3. Rebuild the community image

Use the cached base image (avoids a full multi-hour rebuild):

```bash
cd /opt/overleaf/server-ce
make build-community OVERLEAF_BASE_TAG=sharelatex/sharelatex-base:ext-ce
```

> To rebuild everything from scratch (e.g. after base system changes): `make all`

### 4. Retag and restart

```bash
docker tag sharelatex/sharelatex:ext-ce sharelatex/sharelatex:latest
cd /opt/overleaf
docker compose down && docker compose up -d
```

### Adding LaTeX packages

To add a `.cls` or `.sty` file so all users can use it without uploading:

```bash
# Copy the file to the server
scp yourfile.cls root@23.95.182.35:/tmp/

# Place it in the TeX Live local tree
docker exec sharelatex mkdir -p /usr/local/texlive/texmf-local/tex/latex/local
docker cp /tmp/yourfile.cls sharelatex:/usr/local/texlive/texmf-local/tex/latex/local/

# Regenerate the filename database (no restart needed)
docker exec sharelatex mktexlsr
```

> Files added this way do not survive a container rebuild. To make them permanent, add them to the repo and copy them in the Dockerfile, or mount a host directory.

---

## Environment variables

Configured in `/opt/overleaf/docker-compose.override.yml` on the server. Key variables:

| Variable | Value |
|---|---|
| `OVERLEAF_SITE_URL` | `https://overleaf.team-anant.com` |
| `OVERLEAF_APP_NAME` | `Team Anant Overleaf` |
| `OVERLEAF_ADMIN_EMAIL` | `anant_coordinator@pilani.bits-pilani.ac.in` |
| `OVERLEAF_EMAIL_SMTP_HOST` | `smtp.gmail.com` |

---

## Upstream

- Base: [yu-i-i/overleaf-cep](https://github.com/yu-i-i/overleaf-cep)
- Original: [overleaf/overleaf](https://github.com/overleaf/overleaf)
