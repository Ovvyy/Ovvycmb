# Guide de Déploiement — GoldMaster sur glatek.cloud

## Architecture

```
Internet
    │  HTTPS 443
    ▼
Nginx hôte (Ubuntu)          ← SSL Let's Encrypt + Basic Auth
    │  HTTP 127.0.0.1:3001
    ▼
Docker : goldmaster           ← Nginx alpine servant le build Vite
    │
    └── /usr/share/nginx/html  (dist/ buildé)
```

## Prérequis sur le serveur

| Élément | Statut |
|---------|--------|
| Ubuntu 22.04+ | ✅ |
| Docker + docker compose | ✅ |
| Nginx | ✅ |
| Certbot (`python3-certbot-nginx`) | ✅ (déjà utilisé pour kasm.glatek.cloud) |
| apache2-utils (`htpasswd`) | installé par setup.sh si absent |

## Étape 1 — DNS

Ajouter un enregistrement **A** dans la zone `glatek.cloud` :

```
gold    A    92.222.243.123    TTL 300
```

Vérifier la propagation :
```bash
dig gold.glatek.cloud +short
# doit retourner : 92.222.243.123
```

## Étape 2 — Première installation

```bash
# Se connecter au serveur
ssh user@92.222.243.123

# Cloner ou télécharger le script
curl -fsSL https://raw.githubusercontent.com/Ovvyy/Ovvycmb/claude/wow-gold-farming-app-b9HtQ/wow-gold-app/deploy/setup.sh -o setup.sh

chmod +x setup.sh
sudo ./setup.sh
```

Le script effectue automatiquement :
1. Clone le dépôt dans `/opt/goldmaster`
2. Crée le fichier `.htpasswd` (vous choisissez login/mdp)
3. Copie la config Nginx
4. Obtient le certificat Let's Encrypt pour `gold.glatek.cloud`
5. Build l'image Docker
6. Démarre le conteneur
7. Configure le renouvellement auto du certificat (cron)

## Étape 3 — Mettre à jour l'application

```bash
sudo /opt/goldmaster/wow-gold-app/deploy/deploy.sh
```

## Gestion des utilisateurs

```bash
# Ajouter/modifier/supprimer un utilisateur
sudo /opt/goldmaster/wow-gold-app/deploy/add-user.sh
```

## Commandes utiles

```bash
# Statut du conteneur
docker ps | grep goldmaster

# Logs en temps réel
docker logs goldmaster -f --tail 100

# Logs Nginx accès
tail -f /var/log/nginx/goldmaster.access.log

# Redémarrer le conteneur manuellement
cd /opt/goldmaster/wow-gold-app && docker compose restart

# Tester la config Nginx
sudo nginx -t

# Renouveler le certificat manuellement
sudo certbot renew --dry-run
sudo certbot renew && sudo systemctl reload nginx

# Voir l'espace disque utilisé par Docker
docker system df
```

## Structure des fichiers sur le serveur

```
/opt/goldmaster/                    ← Dépôt Git cloné
  wow-gold-app/
    Dockerfile
    docker-compose.yml
    deploy/
      nginx-host.conf               ← Config Nginx hôte source
      nginx-container.conf          ← Config Nginx dans le conteneur
      setup.sh
      deploy.sh
      add-user.sh

/etc/nginx/
  sites-available/gold.glatek.cloud ← Config Nginx active
  sites-enabled/gold.glatek.cloud   ← Lien symbolique
  .htpasswd-goldmaster              ← Fichier d'authentification

/etc/letsencrypt/live/gold.glatek.cloud/
  fullchain.pem                     ← Certificat SSL
  privkey.pem                       ← Clé privée
```

## Dépannage

### Le site affiche "502 Bad Gateway"
Le conteneur Docker n'est pas démarré ou en erreur.
```bash
docker ps -a | grep goldmaster
docker logs goldmaster
cd /opt/goldmaster/wow-gold-app && docker compose up -d
```

### Erreur "certificate not found"
Le certificat Let's Encrypt n'a pas encore été obtenu.
```bash
sudo certbot --nginx -d gold.glatek.cloud
```

### Mot de passe oublié / réinitialiser l'accès
```bash
sudo /opt/goldmaster/wow-gold-app/deploy/add-user.sh
# Choisir option 1 pour créer un nouveau mot de passe
```

### Vérifier que le port 3001 est bien ouvert en local
```bash
ss -tlnp | grep 3001
curl -s http://127.0.0.1:3001/health
```
