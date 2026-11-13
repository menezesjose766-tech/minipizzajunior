# Pendientes: Mini Pizza Junior

_Última actualización: 12/11/2026_

## Estado actual: **listo para subir a Hostinger**
- El sitio y el panel están terminados, con todos los cambios de la clienta: cardápio, encomendas, eventos, revenda, e-book con link de Hotmart, Bandeja Brotinho (calabresa, frango, carne) y el botón "personalizar bandeja" por WhatsApp.
- **Versión PHP probada el 12/11** desde cero, como en una instalación nueva: 19/19 pruebas de API y revisión en el navegador.
- **ZIP listo:** `deploy/minipizzajunior-hostinger.zip` (generado el 12/11, 916 KB). No lleva datos ni contraseñas. Si se cambia algo en el código, regenerarlo (paso 1 de DEPLOY-HOSTINGER.md).
- **Seguridad revisada el 13/11:** sesiones revocables, límites generales contra fuerza bruta y contra lluvias de pedidos, y cabeceras CSP y HSTS. El ZIP ya la incluye.
- [ ] **Demo en Render (`minipizzajunior.onrender.com`):** le faltan los arreglos de seguridad del 13/11. Republicar con Manual Deploy → "Clear build cache & deploy". Hay que iniciar sesión en Render dentro del navegador de Claude.

## Para el día de la subida (seguir [DEPLOY-HOSTINGER.md](DEPLOY-HOSTINGER.md))
- [ ] La clienta contrata **Hostinger Premium a 12 meses** con dominio. Confirmar en el carrito que el dominio es gratis; `.com.br` probablemente se registre aparte, en Registro.br.
- [ ] Poner PHP 8.2 o superior, subir y extraer el ZIP en `public_html`, crear el `.env` un nivel arriba y activar el SSL.
- [ ] **Contraseña del panel:** por ahora poner en el `.env` la misma contraseña de la demo, la que ya conoce la clienta. Cambiarla después por una fuerte.
- [ ] Probar con `bash tools/test-api.sh https://dominio-del-cliente`. El script lee la contraseña del `.env` **local**, así que debe coincidir con la del servidor.
- [ ] Hacer un pedido de prueba desde el celular, verlo en el panel y borrarlo.

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
