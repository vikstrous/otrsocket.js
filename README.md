OTRSocket.js
===

A library that provides an abstraction on top of Off The Record and Chrome's socket API

Non-Encrypted Sockets
---

Example 1:

SocketServer

```javascript
var server = new SocketServer('0.0.0.0', 8080);
server.listen();
server.on('connection', function(socket) {
  socket.send('message', 'Hello World');
});
```

Socket

```javascript
var client = new Socket('127.0.0.1', 8080);
client.connect();
client.on('message', function(data) {
  console.log(data);
});
```

Example 2:

SocketServer

```javascript
var server = new SocketServer('0.0.0.0', 8080);
server.listen();
server.on('connection', function(socket) {
  socket.on('msg', function(data, cb){
    if(data == 'ping') cb('pong');
  });
});
```

Socket

```javascript
var client = new Socket('127.0.0.1', 8080);
client.connect();
client.send('msg', 'ping', function(data) {
  if (data == 'pong') {
    console.log('Got pong!');
  }
});
```

Encrypted Sockets
---

Create a pipeline generating function like this and pass it to the server/client socket in the constructor:

```javascript
var myKey = new DSA();
var pipeline = function(){
  return [new EventToObject(), new ObjectToString(), new OTRPipe(myKey), new BufferDefragmenterStage1(), new StringToBuffer(), new BufferDefragmenter2()];
};
```

Example constructors:

```
new SocketServer('127.0.0.1', 8088, pipeline);
new Socket('127.0.0.1', 8088, pipeline);
```

(Pipeline interface may change in later versions...)

Disclaimer
---
Use at your own risk. No guarantees that this library works and/or will not lead to a slow and painful death due the interrogation by three letter agencies. This library in the very early stages. Some APIs may not have sufficient error handling features or adequate disconnection handling.

License
---
```
        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
                    Version 2, December 2004 

 Copyright (C) 2013 Viktor Stanchev <me@viktorstanchev.com> 

 Everyone is permitted to copy and distribute verbatim or modified 
 copies of this license document, and changing it is allowed as long 
 as the name is changed. 

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 

  0. You just DO WHAT THE FUCK YOU WANT TO.
```
