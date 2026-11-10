<?php
/*
 * Mini Pizza Junior — API em PHP (para hospedagem compartilhada, ex.: Hostinger Premium).
 * Mesmas rotas e regras do server.js:
 *   GET  /api/public                 dados públicos do site
 *   POST /api/orders                 novo pedido
 *   POST /api/login | /api/logout    sessão do painel
 *   GET  /api/me
 *   GET  /api/admin/data             (admin) tudo
 *   PUT  /api/admin/settings|flavors|testimonials
 *   GET  /api/admin/orders           (admin)
 *   PATCH|DELETE /api/admin/orders/{n}
 *
 * Configuração: arquivo .env FORA da pasta pública (um nível acima de public_html),
 * com ADMIN_PASSWORD=...  (e opcionalmente SESSION_SECRET=..., DATA_DIR=...).
 * Os dados ficam em DATA_DIR (padrão: pasta "data" ao lado do .env), fora do site.
 */
declare(strict_types=1);

/* ---------- configuração ---------- */
$ROOT = dirname(__DIR__, 2); // pasta acima do site (ex.: domains/seusite.com)
$ENV = [];
foreach ([$ROOT . '/.env', dirname(__DIR__) . '/.env'] as $f) {
    if (!is_file($f)) continue;
    foreach (file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (preg_match('/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/', $line, $m)) $ENV[$m[1]] = trim($m[2], "\"'");
    }
    break;
}
$env = fn(string $k, string $d = '') => getenv($k) !== false ? (string)getenv($k) : ($ENV[$k] ?? $d);
$DATA_DIR = $env('DATA_DIR', $ROOT . '/data');
$ADMIN_PASSWORD = $env('ADMIN_PASSWORD');
$CATALOG = json_decode((string)file_get_contents(__DIR__ . '/catalog.json'), true);
$HTTPS = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Cache-Control: no-store');

function out($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function fail(string $msg, int $code = 400): void { out(['error' => $msg], $code); }

if (strlen($ADMIN_PASSWORD) < 8) fail('Servidor não configurado: defina ADMIN_PASSWORD (mín. 8 caracteres) no arquivo .env', 500);
if (!is_dir($DATA_DIR) && !@mkdir($DATA_DIR, 0750, true)) fail('Sem permissão para criar a pasta de dados', 500);
// protege a pasta de dados caso ela fique dentro do site por engano
if (!is_file($DATA_DIR . '/.htaccess')) @file_put_contents($DATA_DIR . '/.htaccess', "Require all denied\nDeny from all\n");

$SECRET = $env('SESSION_SECRET');
if ($SECRET === '') {
    $sf = $DATA_DIR . '/secret.key';
    if (!is_file($sf)) file_put_contents($sf, bin2hex(random_bytes(32)), LOCK_EX);
    $SECRET = trim((string)file_get_contents($sf));
}

/* ---------- armazenamento em JSON (com trava) ---------- */
function jread(string $file, $default) {
    if (!is_file($file)) return $default;
    $d = json_decode((string)file_get_contents($file), true);
    return is_array($d) ? $d : $default;
}
function jwrite(string $file, $data): void {
    $tmp = $file . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
    rename($tmp, $file);
}
/** executa $fn com trava exclusiva (evita dois pedidos gravando ao mesmo tempo) */
function locked(string $name, callable $fn) {
    global $DATA_DIR;
    $h = fopen($DATA_DIR . "/$name.lock", 'c');
    flock($h, LOCK_EX);
    try { return $fn(); } finally { flock($h, LOCK_UN); fclose($h); }
}
function readDB(): array {
    global $DATA_DIR, $CATALOG;
    $f = $DATA_DIR . '/db.json';
    if (!is_file($f)) jwrite($f, $CATALOG['defaults']);
    return jread($f, $CATALOG['defaults']);
}
function writeDB(array $db): void { global $DATA_DIR; jwrite($DATA_DIR . '/db.json', $db); }
function readOrders(): array { global $DATA_DIR; return jread($DATA_DIR . '/orders.json', ['next' => 1001, 'list' => []]); }
function writeOrders(array $o): void { global $DATA_DIR; jwrite($DATA_DIR . '/orders.json', $o); }

/* ---------- validação ---------- */
function str($v, int $max): string {
    if (is_array($v) || is_object($v)) $v = '';
    return mb_substr(trim((string)($v ?? '')), 0, $max);
}
function num($v, float $min, float $max, float $def): float {
    if (!is_numeric($v)) return $def;
    return min($max, max($min, (float)$v));
}
function money($v, float $max, float $def): float { return round(num($v, 0, $max, $def), 2); }

function cleanSettings($s): array {
    global $CATALOG;
    $s = is_array($s) ? $s : [];
    $D = $CATALOG['defaults']['settings'];
    $link = str($s['ebookLink'] ?? '', 300);
    return [
        'whatsapp' => preg_replace('/\D/', '', str($s['whatsapp'] ?? '', 20)),
        'instagram' => preg_replace('/[^a-zA-Z0-9._]/', '', str($s['instagram'] ?? '', 40)),
        'endereco' => str($s['endereco'] ?? '', 200),
        'heroTitle' => str($s['heroTitle'] ?? '', 120) ?: $D['heroTitle'],
        'heroSubtitle' => str($s['heroSubtitle'] ?? '', 400),
        'heroFlavor' => str($s['heroFlavor'] ?? '', 40),
        'mostrarPrecos' => !empty($s['mostrarPrecos']),
        'margemPadrao' => num($s['margemPadrao'] ?? null, 0.5, 50, 3),
        'aceitarPedidos' => ($s['aceitarPedidos'] ?? true) !== false,
        'taxaEntrega' => money($s['taxaEntrega'] ?? null, 500, 0),
        'pedidoMinimo' => (int)round(num($s['pedidoMinimo'] ?? null, 1, 1000, 1)),
        'regiao' => str($s['regiao'] ?? '', 80) ?: 'Nanuque e região',
        'encomenda' => str($s['encomenda'] ?? $D['encomenda'], 1000),
        'ebookLink' => preg_match('~^https://[^\s"\'<>]+$~', $link) ? $link : '',
        'brotinho1' => money($s['brotinho1'] ?? null, 100, 2.5),
        'brotinho60' => money($s['brotinho60'] ?? null, 100, 2),
        'brotinho100' => money($s['brotinho100'] ?? null, 100, 1.9),
        'eventoLocal' => money($s['eventoLocal'] ?? null, 1000, 40),
    ];
}
function cleanFlavor($f, array &$used): array {
    global $CATALOG;
    $f = is_array($f) ? $f : [];
    $id = preg_replace('/[^a-z0-9-]/', '', strtolower(str($f['id'] ?? '', 40)));
    if ($id === '' || isset($used[$id])) $id = 'sabor-' . bin2hex(random_bytes(3));
    $used[$id] = true;
    $tops = [];
    foreach (array_slice(is_array($f['toppings'] ?? null) ? $f['toppings'] : [], 0, 12) as $t) {
        $k = is_array($t) ? (string)($t['k'] ?? '') : '';
        $T = $CATALOG['toppings'][$k] ?? null;
        if (!$T || in_array($k, array_column($tops, 'k'), true)) continue;
        $tops[] = ['k' => $k, 'n' => (int)round(num($t['n'] ?? null, 1, $T['max'], $T['def']))];
    }
    return [
        'id' => $id,
        'name' => str($f['name'] ?? '', 40) ?: 'Novo sabor',
        'short' => str($f['short'] ?? '', 40),
        'badge' => str($f['badge'] ?? '', 40),
        'desc' => str($f['desc'] ?? '', 300),
        'price' => money($f['price'] ?? null, 9999, 0),
        'active' => ($f['active'] ?? true) !== false,
        'base' => in_array($f['base'] ?? '', $CATALOG['bases'], true) ? $f['base'] : 'tomate',
        'cheese' => ($f['cheese'] ?? true) !== false,
        'toppings' => $tops,
        'drizzle' => in_array($f['drizzle'] ?? '', $CATALOG['drizzles'], true) ? $f['drizzle'] : null,
        'center' => in_array($f['center'] ?? '', $CATALOG['centers'], true) ? $f['center'] : null,
        'oregano' => !empty($f['oregano']),
    ];
}
function cleanTestimonial($t): array {
    $t = is_array($t) ? $t : [];
    return ['name' => str($t['name'] ?? '', 40) ?: 'Cliente', 'role' => str($t['role'] ?? '', 40), 'text' => str($t['text'] ?? '', 300)];
}

/* ---------- pedidos ---------- */
const STATUS = ['novo', 'confirmado', 'preparo', 'saiu', 'entregue', 'cancelado'];
const PAGAMENTOS = ['combinar' => 'A combinar no WhatsApp', 'pix' => 'Pix', 'dinheiro' => 'Dinheiro', 'cartao' => 'Cartão na entrega'];

function buildOrder(array $b, array $db): array {
    $S = cleanSettings($db['settings'] ?? []);
    if (!$S['aceitarPedidos']) throw new RuntimeException('No momento não estamos recebendo pedidos pelo site. Chame no WhatsApp!');
    $items = [];
    foreach (array_slice(is_array($b['items'] ?? null) ? $b['items'] : [], 0, 30) as $it) {
        if (!is_array($it)) continue;
        $f = null;
        foreach ($db['flavors'] as $x) if ($x['id'] === ($it['id'] ?? null) && !empty($x['active'])) { $f = $x; break; }
        $qty = (int)round(num($it['qty'] ?? null, 0, 1000, 0));
        if (!$f || $qty < 1) continue;
        $found = false;
        foreach ($items as &$e) if ($e['id'] === $f['id']) { $e['qty'] += $qty; $found = true; }
        unset($e);
        if (!$found) $items[] = ['id' => $f['id'], 'name' => $f['name'], 'qty' => $qty, 'price' => (float)($f['price'] ?? 0)];
    }
    if (!$items) throw new RuntimeException('Seu carrinho está vazio.');
    $units = array_sum(array_column($items, 'qty'));
    if ($units < $S['pedidoMinimo']) throw new RuntimeException("O pedido mínimo é de {$S['pedidoMinimo']} mini pizzas.");
    $c = is_array($b['customer'] ?? null) ? $b['customer'] : [];
    $name = str($c['name'] ?? '', 60);
    $phone = preg_replace('/\D/', '', str($c['phone'] ?? '', 20));
    if (mb_strlen($name) < 2) throw new RuntimeException('Informe seu nome.');
    if (strlen($phone) < 10 || strlen($phone) > 13) throw new RuntimeException('Informe um WhatsApp válido com DDD.');
    $delivery = ($b['delivery'] ?? '') === 'retirada' ? 'retirada' : 'entrega';
    $address = null;
    if ($delivery === 'entrega') {
        $a = is_array($b['address'] ?? null) ? $b['address'] : [];
        $address = ['rua' => str($a['rua'] ?? '', 120), 'numero' => str($a['numero'] ?? '', 20), 'bairro' => str($a['bairro'] ?? '', 80),
            'cidade' => str($a['cidade'] ?? '', 80), 'complemento' => str($a['complemento'] ?? '', 80), 'referencia' => str($a['referencia'] ?? '', 120)];
        if (!$address['rua'] || !$address['numero'] || !$address['bairro'] || !$address['cidade']) throw new RuntimeException('Preencha rua, número, bairro e cidade.');
    }
    $payment = isset(PAGAMENTOS[$b['payment'] ?? '']) ? $b['payment'] : 'combinar';
    $priced = true;
    foreach ($items as $i) if ($i['price'] <= 0) $priced = false;
    $subtotal = null;
    if ($priced) { $subtotal = 0.0; foreach ($items as $i) $subtotal += $i['price'] * $i['qty']; $subtotal = round($subtotal, 2); }
    $fee = $delivery === 'entrega' ? $S['taxaEntrega'] : 0;
    $now = gmdate('Y-m-d\TH:i:s.v\Z');
    return [
        'items' => $items, 'units' => $units, 'subtotal' => $subtotal, 'fee' => $fee,
        'total' => $subtotal === null ? null : round($subtotal + $fee, 2),
        'customer' => ['name' => $name, 'phone' => $phone], 'delivery' => $delivery, 'address' => $address,
        'payment' => $payment, 'change' => $payment === 'dinheiro' ? str($b['change'] ?? '', 20) : '',
        'notes' => str($b['notes'] ?? '', 400),
        'status' => 'novo', 'adminNote' => '', 'createdAt' => $now, 'history' => [['status' => 'novo', 'at' => $now]],
    ];
}

/* ---------- limite de tentativas (por IP, guardado em arquivo) ---------- */
function rateHit(string $bucket, int $max, int $windowSec, bool $count = true): bool {
    global $DATA_DIR;
    $ip = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '0');
    return locked('rate', function () use ($bucket, $max, $windowSec, $count, $ip, $DATA_DIR) {
        $f = $DATA_DIR . '/ratelimit.json';
        $r = jread($f, []);
        $now = time();
        foreach ($r as $k => $hits) { $r[$k] = array_values(array_filter($hits, fn($t) => $now - $t < 3600)); if (!$r[$k]) unset($r[$k]); }
        $key = "$bucket:$ip";
        $hits = array_values(array_filter($r[$key] ?? [], fn($t) => $now - $t < $windowSec));
        if (count($hits) >= $max) { jwrite($f, $r); return true; }
        if ($count) { $hits[] = $now; $r[$key] = $hits; }
        jwrite($f, $r);
        return false;
    });
}
function rateClear(string $bucket): void {
    global $DATA_DIR;
    $ip = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '0');
    locked('rate', function () use ($bucket, $ip, $DATA_DIR) {
        $f = $DATA_DIR . '/ratelimit.json'; $r = jread($f, []); unset($r["$bucket:$ip"]); jwrite($f, $r);
    });
}

/* ---------- sessão (cookie assinado) ---------- */
const COOKIE = 'mpj_admin';
function b64url(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function sign(string $v): string { global $SECRET; return b64url(hash_hmac('sha256', $v, $SECRET, true)); }
function validToken(?string $tok): bool {
    if (!$tok || !str_contains($tok, '.')) return false;
    [$exp, $sig] = explode('.', $tok, 2);
    return hash_equals(sign($exp), $sig) && (int)$exp > (int)(microtime(true) * 1000);
}
function setSession(string $value, int $maxAge): void {
    global $HTTPS;
    setcookie(COOKIE, $value, ['expires' => $maxAge ? time() + $maxAge : time() - 3600, 'path' => '/', 'httponly' => true, 'samesite' => 'Strict', 'secure' => $HTTPS]);
}
function isAdmin(): bool { return validToken($_COOKIE[COOKIE] ?? null); }
function requireAdmin(): void { if (!isAdmin()) fail('Não autorizado', 401); }

/* ---------- roteamento ---------- */
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$route = preg_replace('~^.*?/api/~', '', $path);
$route = trim(preg_replace('~^index\.php/?~', '', $route), '/');

$body = [];
if (!in_array($method, ['GET', 'HEAD', 'DELETE'], true)) {
    // só aceita JSON nas rotas que alteram dados (proteção extra contra CSRF)
    if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) fail('Use JSON', 415);
    $raw = file_get_contents('php://input', false, null, 0, 200 * 1024);
    $body = json_decode((string)$raw, true);
    if (!is_array($body)) $body = [];
}

switch (true) {
    case $route === 'public' && $method === 'GET':
        $db = readDB();
        out(['settings' => cleanSettings($db['settings'] ?? []), 'flavors' => array_values(array_filter($db['flavors'], fn($f) => !empty($f['active']))), 'testimonials' => $db['testimonials'] ?? []]);

    case $route === 'orders' && $method === 'POST':
        if (rateHit('order', 5, 600, false)) fail('Muitos pedidos seguidos. Aguarde alguns minutos ou chame no WhatsApp.', 429);
        if (!empty($body['website'])) out(['ok' => true, 'number' => 0]); // armadilha para robôs
        try { $order = buildOrder($body, readDB()); } catch (RuntimeException $e) { fail($e->getMessage()); }
        $order = locked('orders', function () use ($order) {
            $o = readOrders();
            $order['number'] = $o['next']++;
            $o['list'][] = $order;
            writeOrders($o);
            return $order;
        });
        rateHit('order', 5, 600);
        out(['ok' => true, 'number' => $order['number'], 'total' => $order['total'], 'fee' => $order['fee'], 'subtotal' => $order['subtotal']]);

    case $route === 'login' && $method === 'POST':
        if (rateHit('login', 5, 900)) fail('Muitas tentativas. Tente de novo em alguns minutos.', 429);
        if (!hash_equals(hash('sha256', $ADMIN_PASSWORD), hash('sha256', (string)($body['password'] ?? '')))) fail('Senha incorreta', 401);
        rateClear('login');
        $exp = (string)((int)(microtime(true) * 1000) + 8 * 3600 * 1000);
        setSession($exp . '.' . sign($exp), 8 * 3600);
        out(['ok' => true]);

    case $route === 'logout' && $method === 'POST':
        setSession('', 0); out(['ok' => true]);

    case $route === 'me' && $method === 'GET':
        out(['admin' => isAdmin()]);

    case $route === 'admin/data' && $method === 'GET':
        requireAdmin(); $db = readDB(); $db['settings'] = cleanSettings($db['settings'] ?? []); out($db);

    case $route === 'admin/settings' && $method === 'PUT':
        requireAdmin();
        out(locked('db', function () use ($body) { $db = readDB(); $db['settings'] = cleanSettings($body); writeDB($db); return $db['settings']; }));

    case $route === 'admin/flavors' && $method === 'PUT':
        requireAdmin();
        if (!array_is_list($body)) fail('Lista inválida');
        out(locked('db', function () use ($body) {
            $used = []; $db = readDB();
            $db['flavors'] = array_map(fn($f) => cleanFlavor($f, $used), array_slice($body, 0, 40));
            writeDB($db); return $db['flavors'];
        }));

    case $route === 'admin/testimonials' && $method === 'PUT':
        requireAdmin();
        if (!array_is_list($body)) fail('Lista inválida');
        out(locked('db', function () use ($body) { $db = readDB(); $db['testimonials'] = array_map('cleanTestimonial', array_slice($body, 0, 30)); writeDB($db); return $db['testimonials']; }));

    case $route === 'admin/orders' && $method === 'GET':
        requireAdmin(); out(array_reverse(readOrders()['list']));

    case (bool)preg_match('~^admin/orders/(\d+)$~', $route, $m) && in_array($method, ['PATCH', 'DELETE'], true):
        requireAdmin();
        $n = (int)$m[1];
        $res = locked('orders', function () use ($n, $method, $body) {
            $o = readOrders();
            foreach ($o['list'] as $i => &$ord) {
                if ($ord['number'] !== $n) continue;
                if ($method === 'DELETE') { array_splice($o['list'], $i, 1); writeOrders($o); return ['ok' => true]; }
                if (array_key_exists('status', $body)) {
                    if (!in_array($body['status'], STATUS, true)) return ['__err' => 'Status inválido'];
                    if ($body['status'] !== $ord['status']) { $ord['status'] = $body['status']; $ord['history'][] = ['status' => $ord['status'], 'at' => gmdate('Y-m-d\TH:i:s.v\Z')]; }
                }
                if (array_key_exists('adminNote', $body)) $ord['adminNote'] = str($body['adminNote'], 400);
                $copy = $ord; unset($ord); writeOrders($o); return $copy;
            }
            return null;
        });
        if ($res === null) fail('Pedido não encontrado', 404);
        if (isset($res['__err'])) fail($res['__err']);
        out($res);

    default:
        fail('Rota não encontrada', 404);
}
