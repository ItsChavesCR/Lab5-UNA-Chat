var val = require('../libs/unalib');
var assert = require('assert');

describe('unalib', function(){

  describe('funcion is_valid_phone', function(){

    it('deberia devolver true para 8297-8547', function(){
      assert.equal(val.is_valid_phone('8297-8547'), true);
    });

    it('deberia devolver false para 8297p-8547', function(){
      assert.equal(val.is_valid_phone('8297p-8547'), false);
    });

  });

  describe('funcion is_valid_url_image', function(){

    it('deberia devolver true para http://image.com/image.jpg', function(){
      assert.equal(val.is_valid_url_image('http://image.com/image.jpg'), true);
    });

    it('deberia devolver true para http://image.com/image.gif', function(){
      assert.equal(val.is_valid_url_image('http://image.com/image.gif'), true);
    });

  });

  describe('funcion is_valid_yt_video', function(){

    it('deberia devolver true para http://image.com/image.jpg', function(){
      assert.equal(val.is_valid_yt_video('https://www.youtube.com/watch?v=qYwlqx-JLok'), true);
    });

  });

  describe('is_valid_url_image (extra)', function(){

    it('deberia aceptar https y mayúsculas en extensión', function(){
      assert.equal(val.is_valid_url_image('https://site.com/foto.JPG'), true);
    });

    it('deberia aceptar querystring', function(){
      assert.equal(val.is_valid_url_image('https://site.com/foto.png?x=1&y=2'), true);
    });

    it('deberia rechazar javascript: aun con .png', function(){
      assert.equal(val.is_valid_url_image('javascript:alert(1).png'), false);
    });

    it('deberia rechazar sin protocolo', function(){
      assert.equal(val.is_valid_url_image('www.site.com/foto.jpg'), false);
    });

  });

  describe('is_valid_yt_video (extra)', function(){

    it('deberia devolver true para youtu.be', function(){
      assert.equal(val.is_valid_yt_video('https://youtu.be/abc123DEF45'), true);
    });

    it('deberia devolver true para shorts', function(){
      assert.equal(val.is_valid_yt_video('https://www.youtube.com/shorts/abc123DEF45'), true);
    });

    it('deberia devolver false para URL no youtube', function(){
      assert.equal(val.is_valid_yt_video('https://example.com/watch?v=abc123DEF45'), false);
    });

  });

  describe('validateMessage (Paso 5: sanitización y clasificación)', function(){

    it('bloquea <script> y lo escapa como texto', function(){
      const out = JSON.parse(val.validateMessage({ mensaje: '<script>alert(1)</script>' }));
      assert.equal(out.mensaje.kind, 'text');
      assert.ok(out.mensaje.text.includes('&lt;script&gt;'));
      assert.ok(!out.mensaje.text.includes('<script>'));
    });

    it('bloquea onerror inline y lo trata como texto', function(){
      const payload = '<img src=x onerror=alert(1)>';
      const out = JSON.parse(val.validateMessage({ mensaje: payload }));
      assert.equal(out.mensaje.kind, 'text');
      assert.ok(!out.mensaje.text.includes('onerror='));
    });

    it('detecta imagen válida y retorna kind:image', function(){
      const out = JSON.parse(val.validateMessage({ mensaje: 'http://image.com/image.jpg' }));
      assert.equal(out.mensaje.kind, 'image');
      assert.equal(out.mensaje.url, 'http://image.com/image.jpg');
    });

    it('detecta video de archivo (.mp4) y retorna kind:video file', function(){
      const out = JSON.parse(val.validateMessage({ mensaje: 'https://site.com/video.mp4' }));
      assert.equal(out.mensaje.kind, 'video');
      assert.equal(out.mensaje.provider, 'file');
      assert.equal(out.mensaje.url, 'https://site.com/video.mp4');
    });

    it('detecta video YouTube (watch) y normaliza a /embed/', function(){
      const out = JSON.parse(val.validateMessage({ mensaje: 'https://www.youtube.com/watch?v=qYwlqx-JLok' }));
      assert.equal(out.mensaje.kind, 'video');
      assert.equal(out.mensaje.provider, 'youtube');
      assert.ok(out.mensaje.url.startsWith('https://www.youtube.com/embed/'));
    });

    it('detecta video YouTube (shorts) y normaliza a /embed/', function(){
      const out = JSON.parse(val.validateMessage({ mensaje: 'https://www.youtube.com/shorts/abc123DEF45' }));
      assert.equal(out.mensaje.kind, 'video');
      assert.equal(out.mensaje.provider, 'youtube');
      assert.ok(out.mensaje.url.includes('/embed/'));
    });

    it('rechaza javascript: URL y lo trata como texto', function(){
      const out = JSON.parse(val.validateMessage({ mensaje: 'javascript:alert(1)' }));
      assert.equal(out.mensaje.kind, 'text');
    });

    it('si recibe string JSON o string plano funciona igual', function(){
      const out1 = JSON.parse(val.validateMessage({ mensaje: 'https://site.com/foto.png' }));
      const out2 = JSON.parse(val.validateMessage('{"mensaje":"https://site.com/foto.png"}'));
      assert.deepEqual(out1.mensaje, out2.mensaje);
    });

    it('cuando no coincide nada válido, retorna texto escapado', function(){
      const out = JSON.parse(val.validateMessage({ mensaje: 'hola <b>mundo</b>' }));
      assert.equal(out.mensaje.kind, 'text');
      assert.equal(out.mensaje.text, 'hola &lt;b&gt;mundo&lt;/b&gt;');
    });

    it('entrada nula/indefinida produce texto vacío', function(){
      const out = JSON.parse(val.validateMessage(null));
      assert.equal(out.mensaje.kind, 'text');
      assert.equal(out.mensaje.text, '');
    });

  });

});
