<?php
// Roteador para testar localmente com o servidor embutido do PHP (faz o papel do .htaccess):
//   php -S localhost:8080 -t public tools/php-router.php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('~^/api(/|$)~', $path)) { require __DIR__ . '/../public/api/index.php'; return true; }
if (preg_match('~^/admin/?$~', $path)) { readfile(__DIR__ . '/../public/admin/index.html'); return true; }
return false; // arquivos estáticos
