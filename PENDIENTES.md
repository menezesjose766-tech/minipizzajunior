# Pendientes — Mini Pizza Junior

_Última actualización: 10/11/2026_

## Estado actual
- El sitio y el panel están terminados, con los cambios que pidió el cliente: cardápio real, encomendas, eventos, revenda, e-book, logo y fotos.
- **Versión PHP probada** para Hostinger Premium: 19/19 pruebas de API y flujo completo en el navegador. El ZIP se genera con `tools/make-zip.ps1` y la guía es [DEPLOY-HOSTINGER.md](DEPLOY-HOSTINGER.md).
- Demo en Render (`minipizzajunior.onrender.com`) **actualizada el 10/11/2026** con la última versión, lista para mandarle al cliente y que apruebe el diseño.

## Pendientes
- [ ] **Cliente:** contratar **Hostinger Premium a 12 meses** con dominio incluido. Confirmar en el carrito que el dominio sale gratis; `.com.br` probablemente se registre aparte, en Registro.br.
- [ ] **Subir a Hostinger** siguiendo DEPLOY-HOSTINGER.md y correr `bash tools/test-api.sh https://dominio-del-cliente` contra la dirección real.
- [x] **Link de Hotmart del e-book:** configurado (https://go.hotmart.com/R108434856U). Se puede cambiar en el panel, en Configurações → E-book.
- [ ] **Depoimentos:** hoy son de ejemplo. Pedir 3 o 4 reales al cliente o quitar la sección.
- [ ] **Avisos por WhatsApp (propuesta, sin decidir):** botón "📲 Avisar cliente" en el panel con un mensaje listo según el estado (confirmado / en preparo / salió / entregado). Opcional: aviso de pedido nuevo al dueño.
- [ ] Antes de entregar: borrar los pedidos de prueba en el panel.
- [ ] **Render (demo):** el último deploy (8e1996a) quedó "Live" pero sigue sirviendo archivos del 10/11. Cuando el dashboard cargue, hacer **Manual Deploy → Clear build cache & deploy**. Mientras tanto, el link de Hotmart de la demo se cargó desde el panel.

## Para retomar el trabajo
- Abrir esta carpeta en Claude Code y pedir: _"sigamos con Mini Pizza Junior, lee PENDIENTES.md"_.
- Correr en local: `npm start` (Node, http://localhost:3000). La versión PHP necesita PHP 8.1+:
  `php -S localhost:8080 -t public tools/php-router.php`
