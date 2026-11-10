# Gera deploy/minipizzajunior-hostinger.zip com o conteúdo de public/ (inclui .htaccess)
# Usa "/" nos caminhos (o ZIP padrão do Windows usa "\" e quebra as pastas no Linux da Hostinger).
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "public"
$out = Join-Path $root "deploy"
New-Item -ItemType Directory -Force $out | Out-Null
$zipPath = Join-Path $out "minipizzajunior-hostinger.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  Get-ChildItem -Path $src -Recurse -File -Force | ForEach-Object {
    $rel = $_.FullName.Substring($src.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally { $zip.Dispose() }
Write-Host "OK: $zipPath"
