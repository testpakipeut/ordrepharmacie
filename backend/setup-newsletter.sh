#!/bin/bash

echo "🚀 Configuration du système de Newsletter CIPS"
echo "================================================"
echo ""

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cat > .env << 'EOF'
# MongoDB Configuration - Railway
MONGO_PUBLIC_URL=mongodb://mongo:yhsquvSUxQpHOkzDbdQaMZymPmWYGmOX@switchyard.proxy.rlwy.net:51728

# Configuration optionnelle
MONGOHOST=crossover.proxy.rlwy.net
MONGOPASSWORD=twcNYNxxdQErYYpfzSKKmcGkfNNlNibg
MONGOPORT=59255

# Configuration du serveur
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
    echo "✅ Fichier .env créé avec succès"
else
    echo "ℹ️  Le fichier .env existe déjà"
fi

echo ""
echo "📦 Installation des dépendances..."
npm install

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "Pour démarrer le serveur :"
echo "  npm run dev    (mode développement)"
echo "  npm start      (mode production)"
echo ""
echo "Le pop-up newsletter est maintenant configuré et fonctionnel ! 🎉"

