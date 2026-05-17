# Déploiement ECOPYE Pro Chantier — Hostinger VPS

## Prérequis sur le VPS
- Node.js >= 18, npm, PM2, Nginx (déjà installés)
- SSH : `ssh -i $HOME\.ssh\ecopye_ed25519 root@187.124.53.4`

## Étapes de déploiement

### 1. Cloner le repo
```bash
cd /opt
git clone https://github.com/brindel2024-design/ECOPYE-PRO-CHANTIER.git
cd ECOPYE-PRO-CHANTIER
```

### 2. Créer le fichier .env
```bash
cat > .env.local << 'EOF'
NEXTAUTH_URL=https://pro.ecopye.fr
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DATABASE_URL=file:./prisma/prod.db
DEMO_MODE=false
NODE_ENV=production
EOF
```

### 3. Installer les dépendances et builder
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npx ts-node --project tsconfig.json -e "require('./prisma/seed.ts')" || npx tsx prisma/seed.ts
npm run build
```

### 4. PM2 — démarrer l'application
```bash
pm2 start npm --name "ecopye-pro" -- start -- -p 3002
pm2 save
pm2 startup
```

### 5. Nginx — reverse proxy
```bash
cat > /etc/nginx/sites-available/pro.ecopye.fr << 'EOF'
server {
    server_name pro.ecopye.fr;
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
ln -s /etc/nginx/sites-available/pro.ecopye.fr /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 6. SSL Let's Encrypt
```bash
certbot --nginx -d pro.ecopye.fr
```

## Redéployer (mise à jour)
```bash
cd /opt/ECOPYE-PRO-CHANTIER
git pull
npm install
npm run build
pm2 reload ecopye-pro
```
