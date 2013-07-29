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
client.connect(function(){
  client.send('msg', 'ping', function(data) {
    if (data == 'pong') {
      console.log('Got pong!');
    }
  });
}});
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
Use at your own risk. No guarantees that this library works and/or will not lead to a slow and painful death due the interrogation by three letter agencies. This library is in the very early stages of development. Some APIs may not have sufficient error handling features or adequate disconnection handling.


Warranty
---
This program is free software. It comes without any warranty, to
the extent permitted by applicable law. You can redistribute it
and/or modify it under the terms of the Do What The Fuck You Want
To Public License, Version 2, as published by Sam Hocevar. See
http://www.wtfpl.net/ for more details.

Copyright
---
Copyright © 2000 Viktor Stanchev <me@viktorstanchev.com>
This work is free. You can redistribute it and/or modify it under the
terms of the Do What The Fuck You Want To Public License, Version 2,
as published by Sam Hocevar. See the COPYING file for more details.
