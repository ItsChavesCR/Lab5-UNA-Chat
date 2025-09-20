# Chat Socket.IO UNA — Laboratorio de Seguridad Informática

Sistema de chat en tiempo real con Socket.IO y Express que permite enviar texto y URLs de forma segura, con detección automática de imágenes y videos, y protección contra XSS.

## ✨ Características

- **Chat en tiempo real** con Socket.IO
- **Detección inteligente de contenido**: URLs de imágenes y videos (YouTube, archivos .mp4/.webm/.ogg)
- **Seguridad robusta**: Sanitización de entradas para prevenir ataques XSS
- **Renderizado seguro**: Sin uso de `innerHTML`, creación de nodos DOM seguros
- **Pruebas automatizadas** con Mocha

## 🧭 Estructura del proyecto

```
LABORATORIO 5/
├─ libs/
│  └─ unalib.js           # Validadores y sanitización (validateMessage, etc.)
├─ test/
│  └─ test.js             # Pruebas con Mocha
├─ index.html             # UI del chat (render seguro, sin innerHTML)
├─ server.js              # Servidor Express + Socket.IO (emite mensajes saneados)
├─ package.json
└─ package-lock.json
```

## 🚀 Requisitos

- Node.js 18+ (recomendado)
- NPM

## ⚙️ Instalación

```bash
npm install
```

Si no tienes configurado el script de test, añade esto a tu `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "test": "mocha"
  },
  "devDependencies": {
    "mocha": "^10.7.0"
  },
  "dependencies": {
    "express": "^4.19.2",
    "socket.io": "^4.7.5"
  }
}
```

## ▶️ Uso

```bash
npm start
```

Abre en tu navegador: **http://localhost:3000**

## 🧪 Pruebas

```bash
npm test
```

Las pruebas cubren:
- `is_valid_phone`
- `is_valid_url_image`
- `is_valid_yt_video`
- `validateMessage` (bloquea `<script>`, `onerror=`, `javascript:`, etc.; y clasifica imagen/video)

## 🧱 Arquitectura y flujo

### Cliente (index.html)
- Envía `{ nombre, mensaje, color }` al servidor
- Recibe payload saneado y renderiza **sin `innerHTML`** creando nodos:
  - **Texto** → `textContent`
  - **Imagen** → `<img>`
  - **Video YouTube** → `<iframe src="https://www.youtube.com/embed/ID">`
  - **Video archivo** → `<video controls>`

### Servidor (server.js)
- Parsea el JSON entrante
- Llama a `validateMessage` (de `libs/unalib.js`) para clasificar y sanear
- Escapa el nombre del usuario
- Emite a todos los clientes un JSON tipado:

```json
{
  "nombre": "Anónimo",
  "color": "#A1B2C3",
  "mensaje": {
    "kind": "text | image | video",
    "text": "...",
    "url": "...",
    "provider": "youtube | file"
  }
}
```

## 🔐 Seguridad (Integrada)

Toda la lógica de seguridad está en `libs/unalib.js`.

### ✅ Se permite:
- Solo URLs `http`/`https`
- **Imágenes** por extensión: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.bmp`
- **Videos:**
  - YouTube (`watch`, `youtu.be`, `embed`, `shorts`) → se normaliza a `https://www.youtube.com/embed/ID`
  - Archivos: `.mp4`, `.webm`, `.ogg`

### ❌ Se bloquea/limpia:
- Etiquetas y atributos peligrosos: `<script>`, `<iframe>`, `<svg>`, y cualquier `on...=`
- Esquemas: `javascript:`, `vbscript:` (eliminados)
- `data:` se neutraliza a `data-` en texto
- Todo lo que no sea URL válida aprobada → texto escapado (`escapeHtml`)

### 🔑 Funciones clave:
- `validateMessage(input)` → devuelve string JSON con `{ mensaje: { kind, ... } }`
- `is_valid_url_image(url)`, `is_valid_yt_video(url)`, `is_valid_phone(phone)`
- `stripDangerousTokens(str)`, `escapeHtml(str)`, `extract_youtube_id(url)`

## 💬 Ejemplos para probar

| Tipo | Ejemplo |
|------|---------|
| **Texto** | `Hola mundo` |
| **Imagen** | `https://via.placeholder.com/300.png` |
| **YouTube** | `https://www.youtube.com/watch?v=qYwlqx-JLok` |
| **Video archivo** | `https://www.w3schools.com/html/mov_bbb.mp4` |
| **XSS (bloqueado)** | `<script>alert(1)</script>` |
| **Handler inline (bloqueado)** | `<img src=x onerror=alert(1)>` |

## 🖼️ Evidencias para entrega

- ✅ Captura mostrando un intento XSS bloqueado (aparece como texto escapado)
- ✅ Captura de `npm test` con todos los tests en verde
- ✅ Opcional: captura mostrando una imagen y un video (YouTube/archivo) funcionando

## 🛠️ Solución de problemas

### No carga el chat
Asegúrate de que el servidor está corriendo (`npm start`) y abre http://localhost:3000

### No se ve el video de YouTube
Verifica que la URL sea válida (`watch` / `youtu.be` / `shorts`) y que no haya bloqueadores

### Las imágenes no aparecen
Deben ser `http`/`https` y tener extensión permitida. Algunos sitios bloquean hotlinking

### `npm test` falla
Asegúrate de tener `mocha` instalado como `devDependency` y que `libs/unalib.js` esté actualizado

### Puerto ocupado
Cambia `PORT` en `server.js` o exporta `PORT=3001` antes de ejecutar

## 🧩 Extensiones futuras (opcional)

- Whitelist de dominios (p. ej., solo youtube.com y tu CDN)
- Verificación de MIME por HEAD en el servidor
- Límites de longitud/tamaño y logging de intentos de payload malicioso

## 📄 Licencia

Uso académico.
