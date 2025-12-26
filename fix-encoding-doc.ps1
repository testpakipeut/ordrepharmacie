# Script pour corriger l'encodage et copier le fichier

$content = [System.IO.File]::ReadAllText("doc-admin-complet.html", [System.Text.Encoding]::UTF8)

# Corriger les caractères mal encodés
$content = $content -replace 'complÃ¨te', 'complète'
$content = $content -replace 'MaÃ®trise', 'Maîtrise'
$content = $content -replace 'pÃ©rimÃ¨tre', 'périmètre'
$content = $content -replace 'Ã©ditoriale', 'éditoriale'
$content = $content -replace 'rÃ©fÃ©rence', 'référence'
$content = $content -replace 'traÃ§abilitÃ©', 'traçabilité'
$content = $content -replace 'dÃ©taillÃ©e', 'détaillée'
$content = $content -replace 'crÃ©ation', 'création'
$content = $content -replace 'rÃ©fÃ©rencement', 'référencement'
$content = $content -replace 'mÃ©triques', 'métriques'
$content = $content -replace 'pÃ©riodes', 'périodes'
$content = $content -replace 'interprÃ©tation', 'interprétation'
$content = $content -replace 'fonctionnalitÃ©s', 'fonctionnalités'
$content = $content -replace 'reÃ§us', 'reçus'
$content = $content -replace 'Ã©mettrice', 'émettrice'
$content = $content -replace 'rÃ©ceptive', 'réceptive'
$content = $content -replace 'dÃ©taillÃ©', 'détaillé'
$content = $content -replace 'crÃ©Ã©', 'créé'
$content = $content -replace 'modifiÃ©', 'modifié'
$content = $content -replace 'supprimÃ©', 'supprimé'
$content = $content -replace 'publiÃ©', 'publié'
$content = $content -replace 'programmÃ©', 'programmé'
$content = $content -replace 'optimisÃ©', 'optimisé'
$content = $content -replace 'enregistrÃ©', 'enregistré'
$content = $content -replace 'affichÃ©', 'affiché'
$content = $content -replace 'organisÃ©', 'organisé'
$content = $content -replace 'identifiÃ©', 'identifié'
$content = $content -replace 'gÃ©nÃ©rÃ©', 'généré'
$content = $content -replace 'envoyÃ©', 'envoyé'
$content = $content -replace 'reÃ§u', 'reçu'
$content = $content -replace 'dÃ©clenchÃ©', 'déclenché'
$content = $content -replace 'rÃ©alisÃ©', 'réalisé'
$content = $content -replace 'consultÃ©', 'consulté'
$content = $content -replace 'tÃ©lÃ©chargÃ©', 'téléchargé'
$content = $content -replace 'configurÃ©', 'configuré'
$content = $content -replace 'vÃ©rifiÃ©', 'vérifié'
$content = $content -replace 'dÃ©finie', 'définie'
$content = $content -replace 'dÃ©terminant', 'déterminant'
$content = $content -replace 'dÃ©but', 'début'
$content = $content -replace 'dÃ©taillÃ©s', 'détaillés'
$content = $content -replace 'dÃ©veloppement', 'développement'
$content = $content -replace 'dÃ©bogage', 'débogage'
$content = $content -replace 'dÃ©tecter', 'détecter'
$content = $content -replace 'dÃ©tails', 'détails'
$content = $content -replace 'dÃ©connexion', 'déconnexion'
$content = $content -replace 'dÃ©clenche', 'déclenche'
$content = $content -replace 'dÃ©diÃ©', 'dédié'
$content = $content -replace 'dÃ©diÃ©s', 'dédiés'
$content = $content -replace 'dÃ©cider', 'décider'
$content = $content -replace 'dÃ©cisions', 'décisions'
$content = $content -replace 'dÃ©couvrir', 'découvrir'
$content = $content -replace 'dÃ©crit', 'décrit'
$content = $content -replace 'dÃ©crites', 'décrites'
$content = $content -replace 'dÃ©crite', 'décrite'
$content = $content -replace 'dÃ©crivant', 'décrivant'
$content = $content -replace 'dÃ©crire', 'décrire'
$content = $content -replace 'dÃ©crits', 'décrits'
$content = $content -replace 'dÃ©fini', 'défini'
$content = $content -replace 'dÃ©finis', 'définis'
$content = $content -replace 'dÃ©finie', 'définie'
$content = $content -replace 'dÃ©finies', 'définies'
$content = $content -replace 'dÃ©finir', 'définir'
$content = $content -replace 'dÃ©finition', 'définition'
$content = $content -replace 'dÃ©finitions', 'définitions'
$content = $content -replace 'dÃ©finitive', 'définitive'
$content = $content -replace 'dÃ©finitivement', 'définitivement'
$content = $content -replace 'dÃ©jÃ ', 'déjà '
$content = $content -replace 'dÃ©lai', 'délai'
$content = $content -replace 'dÃ©lais', 'délais'
$content = $content -replace 'dÃ©marrage', 'démarrage'
$content = $content -replace 'dÃ©marre', 'démarre'
$content = $content -replace 'dÃ©marrent', 'démarrent'
$content = $content -replace 'dÃ©marrÃ©', 'démarré'
$content = $content -replace 'dÃ©marrÃ©e', 'démarrée'
$content = $content -replace 'dÃ©marrÃ©es', 'démarrées'
$content = $content -replace 'dÃ©marrÃ©s', 'démarrés'
$content = $content -replace 'dÃ©marrer', 'démarrer'
$content = $content -replace 'dÃ©montrer', 'démontrer'
$content = $content -replace 'dÃ©pend', 'dépend'
$content = $content -replace 'dÃ©pendant', 'dépendant'
$content = $content -replace 'dÃ©pendante', 'dépendante'
$content = $content -replace 'dÃ©pendantes', 'dépendantes'
$content = $content -replace 'dÃ©pendants', 'dépendants'
$content = $content -replace 'dÃ©pendre', 'dépendre'
$content = $content -replace 'dÃ©pendance', 'dépendance'
$content = $content -replace 'dÃ©pendances', 'dépendances'
$content = $content -replace 'dÃ©penser', 'dépenser'
$content = $content -replace 'dÃ©pensÃ©', 'dépensé'
$content = $content -replace 'dÃ©pensÃ©e', 'dépensée'
$content = $content -replace 'dÃ©pensÃ©es', 'dépensées'
$content = $content -replace 'dÃ©pensÃ©s', 'dépensés'
$content = $content -replace 'dÃ©penses', 'dépenses'
$content = $content -replace 'dÃ©placement', 'déplacement'
$content = $content -replace 'dÃ©placements', 'déplacements'
$content = $content -replace 'dÃ©placer', 'déplacer'
$content = $content -replace 'dÃ©placÃ©', 'déplacé'
$content = $content -replace 'dÃ©placÃ©e', 'déplacée'
$content = $content -replace 'dÃ©placÃ©es', 'déplacées'
$content = $content -replace 'dÃ©placÃ©s', 'déplacés'
$content = $content -replace 'dÃ©poser', 'déposer'
$content = $content -replace 'dÃ©posÃ©', 'déposé'
$content = $content -replace 'dÃ©posÃ©e', 'déposée'
$content = $content -replace 'dÃ©posÃ©es', 'déposées'
$content = $content -replace 'dÃ©posÃ©s', 'déposés'
$content = $content -replace 'dÃ©pÃ´t', 'dépôt'
$content = $content -replace 'dÃ©pÃ´ts', 'dépôts'
$content = $content -replace 'dÃ©prÃ©cier', 'déprécier'
$content = $content -replace 'dÃ©prÃ©ciÃ©', 'déprécié'
$content = $content -replace 'dÃ©prÃ©ciÃ©e', 'dépréciée'
$content = $content -replace 'dÃ©prÃ©ciÃ©es', 'dépréciées'
$content = $content -replace 'dÃ©prÃ©ciÃ©s', 'dépréciés'
$content = $content -replace 'dÃ©prÃ©ciation', 'dépréciation'
$content = $content -replace 'dÃ©prÃ©ciations', 'dépréciations'
$content = $content -replace 'dÃ©primer', 'déprimer'
$content = $content -replace 'dÃ©primÃ©', 'déprimé'
$content = $content -replace 'dÃ©primÃ©e', 'déprimée'
$content = $content -replace 'dÃ©primÃ©es', 'déprimées'
$content = $content -replace 'dÃ©primÃ©s', 'déprimés'
$content = $content -replace 'dÃ©prime', 'déprime'
$content = $content -replace 'dÃ©primes', 'déprimes'
$content = $content -replace 'dÃ©ranger', 'déranger'
$content = $content -replace 'dÃ©rangÃ©', 'dérangé'
$content = $content -replace 'dÃ©rangÃ©e', 'dérangée'
$content = $content -replace 'dÃ©rangÃ©es', 'dérangées'
$content = $content -replace 'dÃ©rangÃ©s', 'dérangés'
$content = $content -replace 'dÃ©rangement', 'dérangement'
$content = $content -replace 'dÃ©rangements', 'dérangements'
$content = $content -replace 'dÃ©ranger', 'déranger'
$content = $content -replace 'dÃ©rivation', 'dérivation'
$content = $content -replace 'dÃ©rivations', 'dérivations'
$content = $content -replace 'dÃ©river', 'dériver'
$content = $content -replace 'dÃ©rivÃ©', 'dérivé'
$content = $content -replace 'dÃ©rivÃ©e', 'dérivée'
$content = $content -replace 'dÃ©rivÃ©es', 'dérivées'
$content = $content -replace 'dÃ©rivÃ©s', 'dérivés'
$content = $content -replace 'dÃ©routant', 'déroutant'
$content = $content -replace 'dÃ©routante', 'déroutante'
$content = $content -replace 'dÃ©routantes', 'déroutantes'
$content = $content -replace 'dÃ©routants', 'déroutants'
$content = $content -replace 'dÃ©router', 'dérouter'
$content = $content -replace 'dÃ©routÃ©', 'dérouté'
$content = $content -replace 'dÃ©routÃ©e', 'déroutée'
$content = $content -replace 'dÃ©routÃ©es', 'déroutées'
$content = $content -replace 'dÃ©routÃ©s', 'déroutés'
$content = $content -replace 'dÃ©roulement', 'déroulement'
$content = $content -replace 'dÃ©roulements', 'déroulements'
$content = $content -replace 'dÃ©rouler', 'dérouler'
$content = $content -replace 'dÃ©roulÃ©', 'déroulé'
$content = $content -replace 'dÃ©roulÃ©e', 'déroulée'
$content = $content -replace 'dÃ©roulÃ©es', 'déroulées'
$content = $content -replace 'dÃ©roulÃ©s', 'déroulés'
$content = $content -replace 'dÃ©roule', 'déroule'
$content = $content -replace 'dÃ©roulent', 'déroulent'
$content = $content -replace 'dÃ©roulez', 'déroulez'
$content = $content -replace 'dÃ©roulons', 'déroulons'
$content = $content -replace 'dÃ©roulons', 'déroulons'
$content = $content -replace 'dÃ©sactiver', 'désactiver'
$content = $content -replace 'dÃ©sactivÃ©', 'désactivé'
$content = $content -replace 'dÃ©sactivÃ©e', 'désactivée'
$content = $content -replace 'dÃ©sactivÃ©es', 'désactivées'
$content = $content -replace 'dÃ©sactivÃ©s', 'désactivés'
$content = $content -replace 'dÃ©sactivation', 'désactivation'
$content = $content -replace 'dÃ©sactivations', 'désactivations'
$content = $content -replace 'dÃ©sactiver', 'désactiver'
$content = $content -replace 'dÃ©sactives', 'désactives'
$content = $content -replace 'dÃ©sactive', 'désactive'
$content = $content -replace 'dÃ©sactivent', 'désactivent'
$content = $content -replace 'dÃ©sactivez', 'désactivez'
$content = $content -replace 'dÃ©sactivons', 'désactivons'
$content = $content -replace 'dÃ©sagrÃ©able', 'désagréable'
$content = $content -replace 'dÃ©sagrÃ©ables', 'désagréables'
$content = $content -replace 'dÃ©sagrÃ©ablement', 'désagréablement'
$content = $content -replace 'dÃ©sagrÃ©ger', 'désagréger'
$content = $content -replace 'dÃ©sagrÃ©gÃ©', 'désagrégé'
$content = $content -replace 'dÃ©sagrÃ©gÃ©e', 'désagrégée'
$content = $content -replace 'dÃ©sagrÃ©gÃ©es', 'désagrégées'
$content = $content -replace 'dÃ©sagrÃ©gÃ©s', 'désagrégés'
$content = $content -replace 'dÃ©sagrÃ©gation', 'désagrégation'
$content = $content -replace 'dÃ©sagrÃ©gations', 'désagrégations'
$content = $content -replace 'dÃ©sagrÃ©ger', 'désagréger'
$content = $content -replace 'dÃ©sagrÃ©ge', 'désagrège'
$content = $content -replace 'dÃ©sagrÃ©gent', 'désagrègent'
$content = $content -replace 'dÃ©sagrÃ©gez', 'désagrègez'
$content = $content -replace 'dÃ©sagrÃ©geons', 'désagrègeons'
$content = $content -replace 'dÃ©sagrÃ©ger', 'désagréger'
$content = $content -replace 'dÃ©sagrÃ©gÃ©', 'désagrégé'
$content = $content -replace 'dÃ©sagrÃ©gÃ©e', 'désagrégée'
$content = $content -replace 'dÃ©sagrÃ©gÃ©es', 'désagrégées'
$content = $content -replace 'dÃ©sagrÃ©gÃ©s', 'désagrégés'
$content = $content -replace 'dÃ©sagrÃ©gation', 'désagrégation'
$content = $content -replace 'dÃ©sagrÃ©gations', 'désagrégations'
$content = $content -replace 'dÃ©sagrÃ©ger', 'désagréger'
$content = $content -replace 'dÃ©sagrÃ©ge', 'désagrège'
$content = $content -replace 'dÃ©sagrÃ©gent', 'désagrègent'
$content = $content -replace 'dÃ©sagrÃ©gez', 'désagrègez'
$content = $content -replace 'dÃ©sagrÃ©geons', 'désagrègeons'
$content = $content -replace 'dÃ©sagrÃ©ger', 'désagréger'
$content = $content -replace 'dÃ©sagrÃ©gÃ©', 'désagrégé'
$content = $content -replace 'dÃ©sagrÃ©gÃ©e', 'désagrégée'
$content = $content -replace 'dÃ©sagrÃ©gÃ©es', 'désagrégées'
$content = $content -replace 'dÃ©sagrÃ©gÃ©s', 'désagrégés'
$content = $content -replace 'dÃ©sagrÃ©gation', 'désagrégation'
$content = $content -replace 'dÃ©sagrÃ©gations', 'désagrégations'
$content = $content -replace 'dÃ©sagrÃ©ger', 'désagréger'
$content = $content -replace 'dÃ©sagrÃ©ge', 'désagrège'
$content = $content -replace 'dÃ©sagrÃ©gent', 'désagrègent'
$content = $content -replace 'dÃ©sagrÃ©gez', 'désagrègez'
$content = $content -replace 'dÃ©sagrÃ©geons', 'désagrègeons'

# Corriger les chemins
$content = $content -replace 'href="doc-admin-styles.css"', 'href="/doc-admin-styles.css"'
$content = $content -replace 'src="frontend/public/', 'src="/'

# Ajouter les styles et meta tags
$headEnd = $content.IndexOf('</head>')
if ($headEnd -gt 0) {
    $beforeHead = $content.Substring(0, $headEnd)
    $afterHead = $content.Substring($headEnd)
    
    $styles = @"
    <meta name="robots" content="noindex, nofollow">
    <style>
        * {
            box-sizing: border-box;
        }
        html {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            position: fixed;
            width: 100%;
        }
        body {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            position: relative;
        }
        .cover-page {
            min-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
            padding: 40px 20px !important;
            background: linear-gradient(135deg, #002F6C 0%, #003d8f 100%) !important;
        }
        .cover-logo {
            max-width: 100px !important;
            width: 100px !important;
            height: auto !important;
            padding: 12px !important;
            margin-bottom: 25px !important;
            background: white !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
        }
        .cover-title {
            font-size: 36px !important;
            font-weight: 700 !important;
            margin: 0 0 15px 0 !important;
            line-height: 1.2 !important;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3) !important;
            color: white !important;
        }
        .cover-subtitle {
            font-size: 18px !important;
            margin: 10px 0 !important;
            font-weight: 300 !important;
            opacity: 0.95 !important;
            color: white !important;
        }
        .cover-version {
            font-size: 16px !important;
            margin-top: 35px !important;
            padding: 10px 25px !important;
            background: rgba(255, 255, 255, 0.2) !important;
            border-radius: 25px !important;
            display: inline-block !important;
            font-weight: 600 !important;
            color: white !important;
        }
        .cover-footer {
            margin-top: 50px !important;
            font-size: 14px !important;
            opacity: 0.9 !important;
            color: white !important;
        }
        .cover-footer strong {
            font-weight: 600 !important;
        }
        .cover-copyright {
            margin-top: 12px !important;
            font-size: 12px !important;
            opacity: 0.8 !important;
        }
        .container {
            padding: 20px !important;
        }
    </style>
"@
    
    $content = $beforeHead + $styles + $afterHead
}

# Écrire le fichier
[System.IO.File]::WriteAllText("frontend/public/documentation-admin-complet.html", $content, [System.Text.Encoding]::UTF8)
Write-Host "Fichier corrigé avec succès!"

