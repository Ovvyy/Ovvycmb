#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Mise à jour de GoldMaster (zero-downtime)
# À exécuter à chaque nouvelle version
#
# Usage :
#   sudo /opt/goldmaster/wow-gold-app/deploy/deploy.sh
#   ou depuis n'importe où :
#   sudo bash <(curl -s https://raw.githubusercontent.com/Ovvyy/Ovvycmb/main/wow-gold-app/deploy/deploy.sh)
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/opt/goldmaster"
BRANCH="claude/wow-gold-farming-app-b9HtQ"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

[[ $EUID -ne 0 ]] && error "Exécuter en root (sudo)"
[[ -d "${APP_DIR}/.git" ]] || error "Répertoire ${APP_DIR} introuvable — exécutez setup.sh d'abord"

info "=== Déploiement GoldMaster ==="

# ── 1. Pull latest code ───────────────────────────────────────────────────────
info "1/4 — Mise à jour du code..."
git -C "${APP_DIR}" fetch origin
git -C "${APP_DIR}" checkout "${BRANCH}"
git -C "${APP_DIR}" pull origin "${BRANCH}"

# ── 2. Build nouvelle image ───────────────────────────────────────────────────
info "2/4 — Build Docker..."
cd "${APP_DIR}/wow-gold-app"
docker compose build

# ── 3. Redémarrage avec zero-downtime ─────────────────────────────────────────
info "3/4 — Redémarrage conteneur..."
docker compose up -d --remove-orphans

# Attendre que le nouveau conteneur soit healthy
info "Vérification du démarrage..."
for i in {1..15}; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' goldmaster 2>/dev/null || echo "unknown")
    if [[ "${STATUS}" == "healthy" ]]; then
        info "Conteneur healthy ✓"
        break
    fi
    if [[ $i -eq 15 ]]; then
        warn "Timeout healthcheck — vérifiez : docker logs goldmaster"
    fi
    sleep 2
done

# ── 4. Nettoyage des anciennes images ────────────────────────────────────────
info "4/4 — Nettoyage images obsolètes..."
docker image prune -f --filter "dangling=true" >/dev/null 2>&1 || true

# ── Résumé ────────────────────────────────────────────────────────────────────
COMMIT=$(git -C "${APP_DIR}" log -1 --format="%h — %s" 2>/dev/null || echo "unknown")
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  Déploiement terminé !${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 URL     : https://gold.glatek.cloud"
echo -e "  📦 Commit  : ${COMMIT}"
echo -e "  🕐 Date    : $(date '+%d/%m/%Y %H:%M:%S')"
echo -e "  📋 Logs    : docker logs goldmaster -f --tail 50"
echo ""
