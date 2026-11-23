# Pendientes: Mini Pizza Junior

_Última actualización: 23/11/2026_

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
- `tools/test-api.sh` ahora solo corre en servidor local: hace login y cambia datos, y el 16/11 borró el link del e-book en el sitio en vivo.
- [ ] Hacer un pedido de prueba desde el celular, verlo en el panel y borrarlo.
- [x] Cabeceras y `.htaccess` comprobados en vivo (16/11).
- [x] **Search Console** (16/11): propiedad de dominio `minipizzajunior.com` verificada por TXT en el DNS de Hostinger (**no borrar ese registro**). Sitemap enviado con estado "Correcto". Está en la cuenta de Google del usuario; falta agregar a la clienta como propietaria si lo quiere.
- [x] **GA4** (16/11): cuenta "Mini Pizza Junior", propiedad `minipizzajunior.com`, ID **G-N9JVDHTBLZ** pegado en el panel. Comprobado en vivo: llega el `page_view`. Zona horaria de São Paulo y moneda R$. `purchase` ya es evento clave.
- [ ] GA4: marcar **`generate_lead`** como evento clave (Administrar → Eventos → estrella) cuando aparezca en "Eventos recientes", en unas 24 h desde el primer clic en WhatsApp.

## Cumplimiento legal en Brasil (19/11/2026)
- [x] Hecho:
  - Política de Privacidad, conforme a la LGPD (`/privacidade`).
  - Términos y condiciones de compra, conforme al CDC y al Decreto 7.962/2013 (`/termos`): arrepentimiento en 7 días, vicios del producto, cancelación y foro.
  - Banner de cookies: GA4 solo se carga después de "Aceitar", y rechazar es igual de fácil.
  - Aviso legal en el checkout.
  - Pie de página con la identificación de la empresa y los enlaces legales.
- [x] ZIP subido y comprobado en vivo (19/11): `/privacidade`, `/termos` y banner de cookies (GA4 solo con consentimiento), sin errores de CSP.
- [ ] **La clienta completa en el panel** (Configurações → Dados legais): razón social o nombre, **CNPJ o CPF**, **dirección física** y **e-mail**. El Decreto 7.962 los exige; mientras falten, las páginas muestran "(a informar)".
- [ ] Recomendado: que un abogado o contador revise los textos legales. Son una base sólida, pero no sustituyen una asesoría jurídica.

## Quiz oculto del e-book (20/11/2026): en prueba con la clienta
- Página `/q/<código>`: solo se abre con el link, `noindex` y fuera del sitemap. Pestaña 🧩 Quiz en el panel: encender o apagar, link, textos, perfiles, preguntas y números anónimos. **No recoge datos personales.**
- **Demo en Render** (para que la clienta lo pruebe): el link está en la variable `QUIZ_SLUG` de Render (no está en el repo). En Render el quiz arranca encendido con ese link aunque el servidor reinicie. Los números y las ediciones de la demo se borran en cada reinicio.
- En `main` el quiz viene **apagado por defecto**, así que subir el ZIP a Hostinger no lo activa solo.
- [x] Link del checkout configurado (20/11): `https://pay.hotmart.com/R108434856U`, es el valor por defecto del quiz.
- [ ] La clienta **aprueba los textos** (preguntas y perfiles) y, si quiere mostrarlo, envía el **precio**.
- [x] Publicado en Hostinger (22/11), **apagado**. La clienta lo enciende en el panel → 🧩 Quiz → "Quiz ativo" y copia su link definitivo (`minipizzajunior.com/q/...`).
- [ ] (Para vender después) Captura de WhatsApp en el resultado, con consentimiento LGPD.

## Tráfico y seguridad (22/11/2026)
- Prueba de carga en vivo con 60 usuarios simultáneos y 0 errores: página ~110 req/s; API del menú ~230 req/s con caché de 60 s (antes ~78). Capacidad muy por encima de un Reel viral.
- Auditoría de secretos: no hay claves de API secretas. La contraseña nunca estuvo en git; `.env`, `.git`, `data/` y `secret.key` están bloqueados en vivo, y el ZIP no lleva secretos.
- [ ] Recomendado: cambiar la contraseña del panel por una de 12 caracteres o más y mover el `.env` una carpeta arriba de `public_html` (hoy está dentro, bloqueado con 403).
- Nota: los cambios de precio y menú en el panel tardan hasta 1 minuto en verse en el sitio, por la caché.

## Cardápio y disponibilidad (23/11/2026): falta subir el ZIP
- El botón "Cardápio" (inicio y menú) lleva a los sabores con todos los precios; debajo, un solo botón "Ver disponibilidade" abre el WhatsApp. Es lo que pidió la clienta; la versión anterior (botón por pizza) quedó en vivo hasta subir este ZIP.
- "Aceitar pedidos pelo site" ya está apagado en vivo; prendido, vuelve el carrinho.
- Los mensajes de WhatsApp van sin emojis: wa.me los convertía en � en computadora.
- Al cambiar `cart.js` o `pizza.js`, subir el `?v=` en index.html (los navegadores los guardan 1 día).
- [ ] Subir el ZIP y **borrarlo de `public_html`** después (hoy se puede descargar).
- [ ] Quiz en vivo: si ya se había creado con los textos viejos, corregir en el panel la frase de los contactos (perfil Empreendedor) y la de congelar (perfil Chef).
- [ ] Confirmar con la clienta el mínimo de reventa: el sitio dice 20 discos, el e-book dice 15.
- [ ] Privacidad: no hay borrado automático de pedidos a los 5 años, y el IP cifrado (límites y quiz) se limpia solo con la siguiente visita. Ajustar el texto o programar la limpieza; mencionar los contadores del quiz.

## Decidido
- **Depoimentos:** se quedan los actuales.
- El sitio en Hostinger arranca con datos limpios, sin pedidos de prueba.

## Opcional, sin decidir
- [ ] Botón "📲 Avisar cliente" en el panel, con un mensaje de WhatsApp listo según el estado del pedido (confirmado / en preparo / salió / entregado).

## Para retomar el trabajo
- Abrir esta carpeta en Claude Code y pedir: _"sigamos con Mini Pizza Junior, lee PENDIENTES.md"_.
- Correr en local: `npm start` (Node, http://localhost:3000). La versión PHP necesita PHP 8.1 o superior:
  `php -S localhost:8080 -t public tools/php-router.php`
- **Para subir cambios:** en el Gerenciador de arquivos, extraer en `/files/` con el nombre de carpeta `public_html` y marcar "Overwrite". Si se extrae dentro de `public_html`, se crea una subcarpeta duplicada.
- Videos para redes: `node video/record.js <reel-tools> reel2|reel3` (voz de ElevenLabs "Yuri" en `video/audio/`).
