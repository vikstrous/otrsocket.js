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
});
client.connect(function(err) {
  if (err) throw err;
});
```

OTRSocketServer
---
```javascript
var myKey = new DSA();
var server = new OTRSocketServer('127.0.0.1', 8080, myKey);
server.listen(function(err) {
  if (err) throw err;
});
server.on('connection', function(socket) {
  socket.on('ping', function(data) {
    socket.send('pong', data);
  });
});
```

OTRSocketClient
---
```javascript
var myKey = new DSA();
var client = new OTRSocket('127.0.0.1', 8080, myKey);
client.connect(function(err) {
  if (err) throw err;
  client.on('pong', function(data) {
    console.log(data);
  });
  client.send('ping', 'If at first you don\'t succeed at breaking a cipher, you\'re not Bruce Schneier.');
});
```

Disclaimer
---
Use at your own risk. No guarantees that this library works and/or will not lead to a slow and painful death due the interrogation by three letter agencies. This library in the very early stages. Some APIs may not have sufficient error handling features or adequate disconnection handling.

License
---
```
        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
                    Version 2, December 2004 

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net> 

 Everyone is permitted to copy and distribute verbatim or modified 
 copies of this license document, and changing it is allowed as long 
 as the name is changed. 

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 

  0. You just DO WHAT THE FUCK YOU WANT TO.
```
