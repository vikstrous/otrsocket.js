OTRSocket.js
===

A library that provides an abstraction on top of Off The Record and Chrome's socket API

Sockets
===

Server
---

```javascript
var server = new SocketServer('0.0.0.0', 8080);
server.listen(function(err) {
  if (err) throw err;
  server.on('connection', function(socket) {
    socket.send('message', 'Hello World');
  });
});
```

Client
---
```javascript
var client = new Socket('127.0.0.1', 8080);
client.on('message', function(data) {
  console.log(data);
})
client.connect(function(err) {
  if (err) throw err;
});
```

Disclaimer
---
This library in the very early stages. Some APIs may not have sufficient error handling features or adequate disconnection handling.
