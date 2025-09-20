// server.js
// npm install para descargar los paquetes...

// librerías
const validation = require('./libs/unalib');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const { escapeHtml, validateMessage } = validation;
const io = require('socket.io')(http, { /* cors si hace falta */ });
const port = process.env.PORT || 3000;

// root: presentar html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// escuchar una conexión por socket
io.on('connection', function (socket) {

  socket.on('Evento-Mensaje-Server', function (raw) {
    try {
      // raw viene como string JSON desde el cliente
      const inMsg = JSON.parse(raw);

      // Normalizar/limitar nombre y color
      const nombre =
        (inMsg?.nombre ?? 'Anónimo').toString().trim().slice(0, 32);
      const color =
        (inMsg?.color ?? '#333333').toString().trim().slice(0, 16);

      // Clasificar y sanear el contenido del mensaje
      // validateMessage acepta string u objeto; aquí le pasamos un objeto
      const clasificado = JSON.parse(
        validateMessage({ mensaje: inMsg?.mensaje ?? '' })
      ).mensaje; // -> { kind:'text'|'image'|'video', ... }

      // Construimos payload seguro (nombre escapado)
      const safePayload = {
        nombre: escapeHtml(nombre),
        color,
        mensaje: clasificado
      };

      // Emitimos SIEMPRE string JSON
      io.emit('Evento-Mensaje-Server', JSON.stringify(safePayload));
    } catch (e) {
      // Si el mensaje no es JSON válido o falla algo, lo ignoramos
      // (opcional) podrías emitir un aviso al cliente, pero no es necesario para el lab
    }
  });

});

http.listen(port, function () {
  console.log('listening on *:' + port);
});
