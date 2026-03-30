#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# add-user.sh — Ajouter / modifier un utilisateur Basic Auth
# Usage : sudo ./deploy/add-user.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

HTPASSWD_FILE="/etc/nginx/.htpasswd-goldmaster"

[[ $EUID -ne 0 ]] && { echo "Exécuter en root (sudo)"; exit 1; }
command -v htpasswd &>/dev/null || apt-get install -y apache2-utils -qq

echo ""
echo "=== Gestion des utilisateurs GoldMaster ==="
echo ""
echo "  [1] Ajouter / modifier un utilisateur"
echo "  [2] Supprimer un utilisateur"
echo "  [3] Lister les utilisateurs"
echo ""
read -rp "Choix [1/2/3] : " CHOICE

case "${CHOICE}" in
  1)
    read -rp "Nom d'utilisateur : " USER
    if [[ -f "${HTPASSWD_FILE}" ]]; then
        htpasswd "${HTPASSWD_FILE}" "${USER}"
    else
        htpasswd -c "${HTPASSWD_FILE}" "${USER}"
        chmod 640 "${HTPASSWD_FILE}"
        chown root:www-data "${HTPASSWD_FILE}"
    fi
    echo "✅ Utilisateur '${USER}' créé/mis à jour"
    ;;
  2)
    read -rp "Nom d'utilisateur à supprimer : " USER
    htpasswd -D "${HTPASSWD_FILE}" "${USER}"
    echo "✅ Utilisateur '${USER}' supprimé"
    ;;
  3)
    if [[ -f "${HTPASSWD_FILE}" ]]; then
        echo "Utilisateurs configurés :"
        cut -d: -f1 "${HTPASSWD_FILE}"
    else
        echo "Aucun fichier .htpasswd trouvé"
    fi
    ;;
  *)
    echo "Choix invalide"
    exit 1
    ;;
esac

# Recharger nginx pour prendre en compte les changements
systemctl reload nginx 2>/dev/null && echo "✅ Nginx rechargé" || true
