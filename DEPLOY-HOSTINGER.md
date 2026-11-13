# Publicar en Hostinger (plan Premium, PHP)

El sitio funciona en cualquier hosting con **PHP 8.1 o superior** y Apache, como el Premium de Hostinger. No necesita base de datos: los datos se guardan en archivos JSON **fuera** de la carpeta pública.

## 1. Preparar el paquete
En la carpeta del proyecto:

```bash
node tools/export-catalog.js
```

```bash
powershell -ExecutionPolicy Bypass -File tools/make-zip.ps1
```

Esto genera `deploy/minipizzajunior-hostinger.zip`, con el **contenido** de `public/` listo para subir.

## 2. En el hPanel de Hostinger
1. **Sitios web → Administrar → Avanzado → Configuración PHP**: elige **PHP 8.2** o superior.
2. **Administrador de archivos** → entra a `public_html` y borra el `default.php` si existe.
3. Sube `minipizzajunior-hostinger.zip` dentro de `public_html` y usa **Extraer**. Quedan `index.html`, `.htaccess`, `api/`, `admin/`, `img/` y `js/` directamente en `public_html`.
4. Sube **un nivel** (la carpeta que contiene `public_html`, por ejemplo `domains/tudominio.com/`) y crea un archivo llamado **`.env`** con:
   ```
   ADMIN_PASSWORD=una-contraseña-fuerte-de-al-menos-8-caracteres
   ```
   Si el administrador de archivos no deja crear archivos ahí, puedes crear el `.env` dentro de `public_html`: el `.htaccess` bloquea el acceso a él desde internet.
5. **Seguridad → SSL**: activa el certificado gratuito, para que el sitio abra con `https://`.

## 3. Probar
- `https://tudominio.com`: el sitio.
- `https://tudominio.com/admin`: el panel (con la contraseña del `.env`).
- Haz un pedido de prueba y comprueba que aparece en el panel. Después bórralo.

La primera vez, la API crea sola la carpeta `data/` junto al `.env`, con los datos iniciales (cardápio, testimonios y configuración).

## 4. Actualizar el sitio después
Vuelve a subir el zip y extráelo **encima**. Los datos (`data/`) y el `.env` quedan fuera de `public_html`, así que no se tocan.

## Seguridad (ya incluida)
- **Contraseña:** usa una larga y difícil de adivinar (12 caracteres o más, con números y símbolos). Si la cambias en el `.env`, se cierran todas las sesiones abiertas.
- **"Sair" en el panel** cierra todas las sesiones, incluso si alguien copió la cookie.
- **Límites contra ataques:**
  - **Login:** 5 intentos por IP cada 15 min y 30 fallos en total cada 15 min. Si atacan con muchas IPs, el login se bloquea 15 minutos también para la dueña; después vuelve solo.
  - **Pedidos:** 5 por IP cada 10 min, 60 en total por hora y 5000 guardados como máximo. Si se llena, borra pedidos viejos en el panel.
- `.htaccess` bloquea archivos ocultos y de datos, y cualquier PHP que no sea la API. También envía cabeceras de seguridad: CSP, HSTS y protección contra clickjacking.

## Copia de seguridad
Descarga de vez en cuando la carpeta `data/`: `db.json` tiene sabores y configuración; `orders.json` tiene los pedidos, con datos personales de los clientes.
