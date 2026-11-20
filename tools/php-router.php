<?php
// Roteador para testar localmente com o servidor embutido do PHP (faz o papel do .htaccess):
//   php -S localhost:8080 -t public tools/php-router.php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('~^/api(/|$)~', $path)) { require __DIR__ . '/../public/api/index.php'; return true; }
if (preg_match('~^/admin/?$~', $path)) { readfile(__DIR__ . '/../public/admin/index.html'); return true; }
if (preg_match('~^/q/[a-z0-9]{1,32}/?$~', $path)) { header('Content-Type: text/html; charset=utf-8'); readfile(__DIR__ . '/../public/quiz.html'); return true; }
if (preg_match('~^/(privacidade|termos)/?$~', $path, $m)) { header('Content-Type: text/html; charset=utf-8'); readfile(__DIR__ . "/../public/{$m[1]}.html"); return true; }
return false; // arquivos estáticos
