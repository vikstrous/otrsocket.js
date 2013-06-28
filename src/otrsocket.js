(function(exports){
  var util = {
    inherits: function(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    },
    _errorMap: {},
    errorName: function(code) {
      return util._errorMap[code] ? util._errorMap[code] : code;
    }
  };

  function debug() {
    // console.log(arguments);
  }

  function OTRSocketServer(host, port, myKey) {
    this.socketServer = new SocketServer(host, port);
    this.socketServer.on('connection', this.onconnection.bind(this));
    if (!myKey) this.myKey = new DSA();
    else if (typeof myKey === 'string') this.myKey = DSA.parsePrivate(myKey);
    else this.myKey = myKey;
  }

  util.inherits(OTRSocketServer, EventEmitter);

  OTRSocketServer.prototype.listen = function(cb) {
    this.socketServer.listen(cb);
  };


  OTRSocketServer.prototype.stop = function() {
    this.socketServer.stop();
  };

  OTRSocketServer.prototype.onconnection = function(socket) {
    this.emit('connection', new OTRSocket(socket.ip, socket.port, this.myKey, true, socket));
  };


  //TODO: improve interface

  function OTRSocket(host, port, myKey, server, socket) {
    if (!myKey) this.myKey = new DSA();
    else if (typeof myKey === 'string') this.myKey = DSA.parsePrivate(myKey);
    else this.myKey = myKey;

    var options = {
      fragment_size: 1400,
      send_interval: 0,
      priv: this.myKey
    };

    this.buddy = new OTR(options);
    this.buddy.REQUIRE_ENCRYPTION = true;
    this.socket = socket || new Socket(host, port);

    this.buddy.on('ui', function(msg) {
      this.emit('msg', msg);
    }.bind(this));

    this.buddy.on('error', function(err) {
      this.emit('err', err);
    }.bind(this));

    if (server) {
      this.buddy.on('io', function(msg) {
        this.socket.send('msg', msg);
      }.bind(this));
      this.socket.on('msg', function(data) {
        this.buddy.receiveMsg(data);
      }.bind(this));
    }
  }

  util.inherits(OTRSocket, EventEmitter);

  OTRSocket.prototype.send = function(msg) {
    this.buddy.sendMsg(msg);
  };

  OTRSocket.prototype.disconnect = function() {
    this.socket.disconnect();
  };

  OTRSocket.prototype.connect = function(cb) {
    debug("connecting");
    this.socket.connect(function(err) {
      if (!err) {
        this.buddy.on('io', function(msg) {
          this.socket.send('msg', msg);
        }.bind(this));
        this.socket.on('msg', function(data) {
          this.buddy.receiveMsg(data);
        }.bind(this));
      }
      cb(err);
    }.bind(this));
  };
  exports.OTRSocket = OTRSocket;
  exports.OTRSocketServer = OTRSocketServer;
})(window);