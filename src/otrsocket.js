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
  console.log(arguments);
}

function OTRUser(host, port, myKey, server, socket) {
  if (!myKey) this.myKey = new DSA();
  else if (typeof myKey === 'string') this.myKey = DSA.parsePrivate(myKey);
  else this.myKey = myKey;
  if (server) {
    this.isServer = false;
    this.socket = socket;
  } else {
    this.isServer = true;
    this.server = new OTRSocketServer(host, port, this.myKey);
    this.server.on('connection', this.onconnection.bind(this));
  }
  this.friends = [];
  this.friends_by_key = {};
}

util.inherits(OTRUser, EventEmitter);

OTRUser.prototype.onconnection = function(otr_socket) {
  var fg = otr_socket.myKey.fingerprint();
  if(!this.friends[this.friends_by_key[fg]]){
    var id = this.friends.length;
    this.friends.push({
      host: otr_socket.host,
      port: otr_socket.port,
      key: otr_socket.myKey,
      socket: otr_socket
    });
    this.friends_by_key[fg] = id;
    this.emit('new_friend', this.friends[id]);
  } else {
    this.friends[this.friends_by_key[fg]].socket = otr_socket;
    this.emit('connection', this.friends[this.friends_by_key[fg]]);
  }
};

OTRUser.prototype.listen = function(cb) {
  this.server.listen(cb);
};

OTRUser.prototype.send = function(msg) {
  if(this.isServer) { throw new Error('Cannot send to self?'); }
  this.socket.connect(function(){
    this.socket.send(msg);
  }.bind(this));
};

OTRUser.prototype.addFriend = function(host, port, key) {
  var id = this.friends.length;
  this.friends.push({
    host: host,
    port: port,
    key: key,
    user: new OTRUser(host, port, this.myKey, true, new OTRSocket(host, port, this.myKey))
  });
  this.friends_by_key[key.fingerprint()] = id;
};


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