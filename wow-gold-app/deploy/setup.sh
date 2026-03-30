#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup.sh — Installation initiale de GoldMaster sur Ubuntu
# À exécuter UNE SEULE FOIS sur le serveur 92.222.243.123
#
# Prérequis :
#   - Ubuntu 22.04+ avec Docker + Nginx installés
#   - DNS : A record  gold.glatek.cloud → 92.222.243.123  déjà propagé
#   - Port 80 et 443 ouverts (ufw allow 80 && ufw allow 443)
#
# Usage :
#   chmod +x deploy/setup.sh
#   sudo ./deploy/setup.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DOMAIN="gold.glatek.cloud"
APP_DIR="/opt/goldmaster"
HTPASSWD_FILE="/etc/nginx/.htpasswd-goldmaster"
NGINX_SITE="/etc/nginx/sites-available/${DOMAIN}"
REPO_URL="https://github.com/Ovvyy/Ovvycmb.git"  # ajuste si besoin
BRANCH="claude/wow-gold-farming-app-b9HtQ"

# ── Couleurs ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Vérifications ─────────────────────────────────────────────────────────────
[[ $EUID -ne 0 ]] && error "Ce script doit être exécuté en root (sudo)"
command -v docker  &>/dev/null || error "Docker n'est pas installé"
command -v nginx   &>/dev/null || error "Nginx n'est pas installé"
command -v certbot &>/dev/null || error "Certbot n'est pas installé (sudo apt install certbot python3-certbot-nginx)"

info "=== Installation GoldMaster sur ${DOMAIN} ==="

# ── 1. Cloner / mettre à jour le repo ────────────────────────────────────────
info "1/7 — Clonage du dépôt..."
if [[ -d "${APP_DIR}/.git" ]]; then
    warn "Le répertoire ${APP_DIR} existe déjà — mise à jour"
    git -C "${APP_DIR}" fetch origin
    git -C "${APP_DIR}" checkout "${BRANCH}"
    git -C "${APP_DIR}" pull origin "${BRANCH}"
else
    git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
fi

# ── 2. Créer le fichier .htpasswd ─────────────────────────────────────────────
info "2/7 — Configuration du mot de passe d'accès..."
if [[ ! -f "${HTPASSWD_FILE}" ]]; then
    command -v htpasswd &>/dev/null || apt-get install -y apache2-utils -qq

    echo ""
    echo -e "${YELLOW}Créez un utilisateur pour l'accès à GoldMaster :${NC}"
    read -rp "  Nom d'utilisateur : " AUTH_USER
    htpasswd -c "${HTPASSWD_FILE}" "${AUTH_USER}"
    chmod 640 "${HTPASSWD_FILE}"
    chown root:www-data "${HTPASSWD_FILE}"
    info "Fichier .htpasswd créé : ${HTPASSWD_FILE}"
else
    warn ".htpasswd existe déjà — ignoré. Pour ajouter un user : htpasswd ${HTPASSWD_FILE} <user>"
fi

# ── 3. Configurer Nginx hôte ──────────────────────────────────────────────────
info "3/7 — Configuration Nginx..."
cp "${APP_DIR}/wow-gold-app/deploy/nginx-host.conf" "${NGINX_SITE}"

# Activer le site
if [[ ! -L "/etc/nginx/sites-enabled/${DOMAIN}" ]]; then
    ln -s "${NGINX_SITE}" "/etc/nginx/sites-enabled/${DOMAIN}"
fi

# Test de la config nginx
nginx -t || error "Configuration Nginx invalide — vérifiez ${NGINX_SITE}"

# ── 4. Obtenir le certificat Let's Encrypt ───────────────────────────────────
info "4/7 — Certificat Let's Encrypt pour ${DOMAIN}..."
CERT_PATH="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

if [[ -f "${CERT_PATH}" ]]; then
    warn "Certificat déjà existant pour ${DOMAIN} — skip"
else
    # Reload nginx avec config HTTP seulement pour le challenge ACME
    # On commente temporairement la config HTTPS et on la remet après
    certbot --nginx -d "${DOMAIN}" \
        --non-interactive \
        --agree-tos \
        --email admin@glatek.cloud \
        --redirect
    info "Certificat obtenu avec succès"
fi

# ── 5. Créer le répertoire webroot pour renouvellement Certbot ───────────────
mkdir -p /var/www/certbot

# ── 6. Construire et démarrer le conteneur Docker ────────────────────────────
info "5/7 — Build Docker..."
cd "${APP_DIR}/wow-gold-app"
docker compose build --no-cache

info "6/7 — Démarrage du conteneur..."
docker compose up -d

# Attendre que le conteneur soit healthy
info "Attente du démarrage du conteneur (max 30s)..."
for i in {1..10}; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' goldmaster 2>/dev/null || echo "starting")
    if [[ "${STATUS}" == "healthy" ]]; then
        info "Conteneur démarré et healthy ✓"
        break
    fi
    echo -n "."
    sleep 3
done
echo ""

# ── 7. Reload Nginx ───────────────────────────────────────────────────────────
info "7/7 — Rechargement Nginx..."
nginx -t && systemctl reload nginx

# ── Configurer le renouvellement automatique du certificat ───────────────────
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
    info "Renouvellement automatique certbot configuré (cron 3h du matin)"
fi

# ── Résumé ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  GoldMaster déployé avec succès !${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 URL      : https://${DOMAIN}"
echo -e "  🔒 Auth     : Basic Auth (htpasswd)"
echo -e "  🐳 Docker   : docker compose -f ${APP_DIR}/wow-gold-app/docker-compose.yml ps"
echo -e "  📋 Logs app : docker logs goldmaster -f"
echo -e "  📋 Logs nginx: tail -f /var/log/nginx/goldmaster.access.log"
echo ""
echo -e "  Pour mettre à jour : sudo ${APP_DIR}/wow-gold-app/deploy/deploy.sh"
echo ""
