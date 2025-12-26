@echo off
echo ================================
echo Configuration Newsletter CIPS
echo ================================
echo.

REM Créer le fichier .env s'il n'existe pas
if not exist .env (
    echo Creation du fichier .env...
    (
        echo # MongoDB Configuration - Railway
        echo MONGO_PUBLIC_URL=mongodb://mongo:yhsquvSUxQpHOkzDbdQaMZymPmWYGmOX@switchyard.proxy.rlwy.net:51728
        echo.
        echo # Configuration optionnelle
        echo MONGOHOST=crossover.proxy.rlwy.net
        echo MONGOPASSWORD=twcNYNxxdQErYYpfzSKKmcGkfNNlNibg
        echo MONGOPORT=59255
        echo.
        echo # Configuration du serveur
        echo PORT=3001
        echo NODE_ENV=development
        echo FRONTEND_URL=http://localhost:5173
    ) > .env
    echo Fichier .env cree avec succes
) else (
    echo Le fichier .env existe deja
)

echo.
echo Installation des dependances...
call npm install

echo.
echo Configuration terminee !
echo.
echo Pour demarrer le serveur :
echo   npm run dev    (mode developpement^)
echo   npm start      (mode production^)
echo.
echo Le pop-up newsletter est maintenant configure ! 🎉
pause

