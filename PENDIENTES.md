# Pendientes: Mini Pizza Junior

_Última actualización: 16/11/2026_

## Estado actual: ✅ **PUBLICADO en https://minipizzajunior.com** (16/11/2026)
- Dominio registrado en Hostinger el 16/11/2026; vence el 16/11/2027. SSL de Let's Encrypt para el dominio con y sin www, con renovación automática.
- Comprobado en vivo: sitio, panel, API (el `.env` y los datos vinieron del dominio temporal), HTTPS, www → sin www, cabeceras de seguridad, gzip, 404, robots y sitemap con el dominio correcto.
- El dominio temporal `darkseagreen-snail-353135.hostingersite.com` ya no se usa (responde 403).
- El sitio y el panel están terminados, con todos los cambios de la clienta: cardápio, encomendas, eventos, revenda, e-book con link de Hotmart, Bandeja Brotinho (calabresa, frango, carne) y el botón "personalizar bandeja" por WhatsApp.
- **Versión PHP probada el 12/11** desde cero, como en una instalación nueva: 19/19 pruebas de API y revisión en el navegador.
- **ZIP listo para `minipizzajunior.com`:** `deploy/minipizzajunior-hostinger.zip` (generado el 15/11, 1,5 MB). No lleva datos ni contraseñas. Si se cambia algo en el código o el dominio, regenerarlo con `-Domain` (paso 1 de DEPLOY-HOSTINGER.md).
- **Auditoría SEO hecha el 15/11:** sitemap, robots, canonical, Open Graph con imagen 1200x630, Schema.org, imágenes WebP, GA4 configurable en el panel con eventos de conversión, página 404 y redirección de www a sin www.
- **Seguridad revisada el 13/11:** sesiones revocables, límites generales contra fuerza bruta y contra lluvias de pedidos, y cabeceras CSP y HSTS. El ZIP ya la incluye.
- [ ] **Demo en Render:** tiene la seguridad del 13/11, pero le faltan los cambios de SEO del 15/11 (`noindex` para no competir con el sitio oficial, 404 y WebP). Republicar con Manual Deploy → "Clear build cache & deploy", con la sesión de Render iniciada en el navegador de Claude.

## Para el día de la subida (seguir [DEPLOY-HOSTINGER.md](DEPLOY-HOSTINGER.md))
- [x] **Hostinger Premium contratado.** Vence el 15/11/2027. Tengo acceso como colaborador.
- [x] `minipizzajunior.com` registrado (16/11).
- [x] Sitio PHP/HTML creado y ZIP subido (16/11), con dominio temporal.
- [x] Link de Hotmart restaurado en vivo (16/11).
- [x] Sitio movido a `minipizzajunior.com`, con el SSL activo (16/11).
- [ ] El dominio no aparece en "Meus domínios" de la cuenta de la clienta, quizá porque se registró desde otra cuenta de Hostinger. Confirmar en qué cuenta quedó, para la renovación de 2027.
- [ ] **Contraseña del panel:** por ahora poner en el `.env` la misma contraseña de la demo, la que ya conoce la clienta. Cambiarla después por una fuerte.
- [ ] Probar con `bash tools/test-api.sh https://minipizzajunior.com`. Ahora guarda y restaura la configuración, pero crea y borra un pedido de prueba, así que el contador de pedidos avanza. El script lee la contraseña del `.env` **local**, así que debe coincidir con la del servidor.
- [ ] Hacer un pedido de prueba desde el celular, verlo en el panel y borrarlo.
- [x] Cabeceras y `.htaccess` comprobados en vivo (16/11).
- [x] **Search Console** (16/11): propiedad de dominio `minipizzajunior.com` verificada por TXT en el DNS de Hostinger (**no borrar ese registro**). Sitemap enviado con estado "Correcto". Está en la cuenta de Google del usuario; falta agregar a la clienta como propietaria si lo quiere.
- [x] **GA4** (16/11): cuenta "Mini Pizza Junior", propiedad `minipizzajunior.com`, ID **G-N9JVDHTBLZ** pegado en el panel. Comprobado en vivo: llega el `page_view`. Zona horaria de São Paulo y moneda R$. `purchase` ya es evento clave.
- [ ] GA4: marcar **`generate_lead`** como evento clave (Administrar → Eventos → estrella) cuando aparezca en "Eventos recientes", en unas 24 h desde el primer clic en WhatsApp.

## Decidido
- **Depoimentos:** se quedan los actuales.
- El sitio en Hostinger arranca con datos limpios, sin pedidos de prueba.

## Opcional, sin decidir
- [ ] Botón "📲 Avisar cliente" en el panel, con un mensaje de WhatsApp listo según el estado del pedido (confirmado / en preparo / salió / entregado).

## Para retomar el trabajo
- Abrir esta carpeta en Claude Code y pedir: _"sigamos con Mini Pizza Junior, lee PENDIENTES.md"_.
- Correr en local: `npm start` (Node, http://localhost:3000). La versión PHP necesita PHP 8.1 o superior:
  `php -S localhost:8080 -t public tools/php-router.php`
- Videos para redes: `node video/record.js <reel-tools> reel2|reel3` (voz de ElevenLabs "Yuri" en `video/audio/`).
