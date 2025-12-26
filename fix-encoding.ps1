$content = [System.IO.File]::ReadAllText("doc-admin-complet.html", [System.Text.Encoding]::UTF8)

# Corriger les caractères mal encodés
$content = $content -replace 'ðŸ"', '📑'
$content = $content -replace 'matiÃ¨res', 'matières'
$content = $content -replace 'dÃ©taillÃ©es', 'détaillées'
$content = $content -replace 'Ã©ditorial', 'éditorial'
$content = $content -replace 'systÃ¨me', 'système'
$content = $content -replace 'ParamÃ¨tres', 'Paramètres'
$content = $content -replace 'fonctionnalitÃ©s', 'fonctionnalités'
$content = $content -replace 'cachÃ©es', 'cachées'
$content = $content -replace 'complÃ¨te', 'complète'
$content = $content -replace 'MaÃ®trise', 'Maîtrise'
$content = $content -replace 'RÃ©digÃ©', 'Rédigé'
$content = $content -replace 'rÃ©servÃ©s', 'réservés'
$content = $content -replace 'SÃ©curitÃ©', 'Sécurité'
$content = $content -replace 'gÃ©rer', 'gérer'
$content = $content -replace 'Ã©tÃ©', 'été'
$content = $content -replace 'conÃ§ue', 'conçue'
$content = $content -replace 'Ã ', 'à'

[System.IO.File]::WriteAllText("doc-admin-complet.html", $content, [System.Text.Encoding]::UTF8)
Write-Host "Encodage corrigé!"

