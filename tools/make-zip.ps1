# Gera deploy/minipizzajunior-hostinger.zip com o conteúdo de public/ (inclui .htaccess)
# Uso:  powershell -ExecutionPolicy Bypass -File tools/make-zip.ps1 -Domain minipizzajunior.com.br
# - preenche o domínio (canonical, Open Graph, Schema.org, sitemap.xml, robots.txt)
# - usa "/" nos caminhos (o ZIP padrão do Windows usa "\" e quebra as pastas no Linux da Hostinger)
param([Parameter(Mandatory = $true)][string]$Domain)

$Domain = $Domain.Trim().ToLower() -replace '^https?://', '' -replace '/.*$', '' -replace '^www\.', ''
if ($Domain -notmatch '^[a-z0-9-]+(\.[a-z0-9-]+)+$') { throw "Domínio inválido: '$Domain' (ex.: minipizzajunior.com.br)" }
$site = "https://$Domain"
$today = (Get-Date).ToString('yyyy-MM-dd')

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "public"
$out = Join-Path $root "deploy"
New-Item -ItemType Directory -Force $out | Out-Null
$zipPath = Join-Path $out "minipizzajunior-hostinger.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$templated = @('index.html', 'sitemap.xml', 'robots.txt', 'privacidade.html', 'termos.html')
$utf8 = New-Object System.Text.UTF8Encoding($false)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  Get-ChildItem -Path $src -Recurse -File -Force | ForEach-Object {
    $rel = $_.FullName.Substring($src.Length + 1).Replace('\', '/')
    if ($templated -contains $rel) {
      $txt = [System.IO.File]::ReadAllText($_.FullName, $utf8).Replace('__SITE_URL__', $site).Replace('__LASTMOD__', $today)
      $entry = $zip.CreateEntry($rel, [System.IO.Compression.CompressionLevel]::Optimal)
      $w = New-Object System.IO.StreamWriter($entry.Open(), $utf8)
      $w.Write($txt); $w.Dispose()
    } else {
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  }
} finally { $zip.Dispose() }
Write-Host "OK: $zipPath  (site: $site)"
