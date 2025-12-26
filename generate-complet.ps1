# Script pour générer doc-admin-complet.html à partir des fichiers découpés

$output = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documentation Panneau d'Administration CIPS - Version complète</title>
    <link rel="stylesheet" href="doc-admin-styles.css">
</head>
<body>
"@

# Page de couverture
$cover = [System.IO.File]::ReadAllText("doc-admin-00-cover.html", [System.Text.Encoding]::UTF8)
# Extraire le contenu de la page de garde (div.cover-page)
if ($cover -match '(?s)<div class="cover-page">.*?</div>\s*</body>') {
    $coverContent = $matches[0]
    $coverContent = $coverContent -replace '</body>.*', ''
    $output += $coverContent
} elseif ($cover -match '(?s)<div class="cover-page">.*?</div>') {
    $coverContent = $matches[0]
    $output += $coverContent
} else {
    # Fallback si la structure a changé
    $cover = $cover -replace '(?s).*<body>', ''
    $cover = $cover -replace '(?s)</body>.*', ''
    $output += $cover
}

# Ouvrir le container pour le reste du contenu
$output += @"
    <div class="container">
"@

# Table des matières - extraire du fichier original
$originalDoc = [System.IO.File]::ReadAllText("documentation-admin-cips.html", [System.Text.Encoding]::UTF8)
if ($originalDoc -match '(?s)<section class="toc">.*?</section>') {
    $toc = $matches[0]
    $output += $toc
} else {
    # Fallback si pas trouvé
    $output += '<section class="toc"><h2>Table des matieres</h2><ol><li><a href="#introduction">Introduction</a></li><li><a href="#connexion">Connexion</a></li><li><a href="#dashboard">Dashboard</a></li><li><a href="#analytics">Analytics</a></li><li><a href="#simulations">Simulations</a></li><li><a href="#articles">Articles</a></li><li><a href="#projets">Projets</a></li><li><a href="#emploi">Offres d emploi</a></li><li><a href="#calendrier">Calendrier</a></li><li><a href="#logs">Logs systeme</a></li><li><a href="#parametres">Parametres</a></li><li><a href="#emails">Gestion des emails</a></li><li><a href="#annexes">Annexes</a></li></ol></section>'
}

# Charger les autres sections
$files = @(
    "doc-admin-01-introduction.html",
    "doc-admin-02-connexion.html",
    "doc-admin-03-dashboard.html",
    "doc-admin-04-analytics.html",
    "doc-admin-05-simulations.html",
    "doc-admin-06-articles.html",
    "doc-admin-07-projets.html",
    "doc-admin-08-emploi.html",
    "doc-admin-09-calendrier.html",
    "doc-admin-10-logs.html",
    "doc-admin-11-parametres.html",
    "doc-admin-12-emails.html",
    "doc-admin-13-annexes.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        # Extraire seulement la section
        if ($content -match '(?s)<section[^>]*class="section"[^>]*>.*?</section>') {
            $section = $matches[0]
            # Supprimer les navigations
            $section = $section -replace '(?s)<div class="section-nav">.*?</div>', ''
            $output += $section
        }
    }
}

$output += @"
    </div>
</body>
</html>
"@

[System.IO.File]::WriteAllText("doc-admin-complet.html", $output, [System.Text.Encoding]::UTF8)
Write-Host "Fichier doc-admin-complet.html généré avec succès!"

