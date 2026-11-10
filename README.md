# Mini Pizza Junior — sitio + panel admin

> **Producción (Hostinger Premium): versión PHP.** La API está en `public/api/index.php` y tiene las mismas rutas que `server.js`. Para publicarla, ver **[DEPLOY-HOSTINGER.md](DEPLOY-HOSTINGER.md)**. `server.js` (Node) queda para desarrollo local y para la demo en Render.
> Pruebas de la API (sirven para las dos versiones): `bash tools/test-api.sh http://localhost:3000` (Node) o `http://localhost:8080` (PHP).
> Si cambias ingredientes o datos iniciales en `public/js/pizza.js`, ejecuta `node tools/export-catalog.js` para actualizar `public/api/catalog.json`.

## Ejecutar en local

```bash
npm install
```

```bash
npm start
```

- Sitio: http://localhost:3000
- Panel: http://localhost:3000/admin (la contraseña está en `.env`, `ADMIN_PASSWORD`)

Si `.env` no existe, copia `.env.example` a `.env` y cambia los valores.

## Estructura

| Archivo | Qué hace |
|---|---|
| `server.js` | Servidor Express: API pública, login, API del panel y archivos estáticos |
| `data/db.json` | Los datos (sabores, testimonios, configuración). Se crea solo la primera vez |
| `public/index.html` | El sitio. Lee todo de `/api/public` |
| `public/js/pizza.js` | Generador de pizzas: dibuja cada pizza a partir de sus ingredientes y la anima |
| `public/admin/` | Panel del cliente |

## Cómo funciona la pizza que se arma

Ninguna pizza es una imagen fija. Cada sabor se guarda como una receta:

```json
{ "name": "Calabresa", "base": "tomate", "cheese": true,
  "toppings": [{ "k": "calabresa", "n": 10 }, { "k": "cebola", "n": 1 }],
  "drizzle": "catupiry", "center": "azeitona_preta", "oregano": true }
```

`pizza.js` convierte esa receta en un dibujo SVG. Cada ingrediente queda marcado para la animación, y así los ingredientes caen sobre la pizza y el hilo de catupiry se dibuja.

Cuando el cliente crea un sabor en el panel, elige la base, los ingredientes y la cantidad de cada uno. Ve la pizza armándose en vivo y, al guardar, el sitio ya la muestra con la misma animación.

Para agregar un ingrediente nuevo al catálogo, añade su forma en `SHAPE` y su entrada en `TOPPINGS` dentro de `public/js/pizza.js`.

## Pedidos

- En el sitio, el cliente agrega sabores al carrito y completa sus datos: nombre, WhatsApp, entrega o retiro, dirección, pago, cambio y observaciones.
- `POST /api/orders` valida el pedido, toma los precios del servidor (nunca los del navegador) y lo guarda en `data/orders.json`. Acepta como máximo 5 pedidos cada 10 min por IP y tiene una trampa para robots.
- En el panel, la pestaña **Pedidos** se actualiza cada 15 s y avisa con sonido cuando llega uno nuevo. Desde ahí se cambia el estado (Novo → Confirmado → Em preparo → Saiu/Pronto → Entregue, o Cancelado). También hay enlaces a WhatsApp, llamada y mapa, una nota interna, botones para imprimir o copiar, y el historial.
- En Configuraciones: activar o desactivar los pedidos por el sitio, la tarifa de envío y el pedido mínimo.

## Publicar

Necesita un hosting que ejecute Node.js y tenga disco persistente para `data/db.json`, como un VPS, Railway, Render con disco o Hostinger con Node.

En producción:
- Define `NODE_ENV=production`, para que la cookie de sesión solo viaje por HTTPS.
- Usa una contraseña fuerte en `ADMIN_PASSWORD`.
- Haz copia de seguridad de `data/db.json` y `data/orders.json`. Los pedidos tienen datos personales de los clientes: nombre, teléfono y dirección.
