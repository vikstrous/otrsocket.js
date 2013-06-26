mocha.setup('bdd');

function debug() {
  console.log(arguments);
}

describe('SocketServer', function() {
  describe('works', function() {
    it('should be possible to create one', function() {
      this.server = new SocketServer('127.0.0.1', 8088);
      expect(this.server).to.be.a(SocketServer);
    });
    it('should be able to listen', function(done) {
      this.server.listen(done);
    });
    it('should be able to register connection handlers', function() {
      var cb = function() {};
      this.server.on('connection', cb);
      this.server.off('connection', cb);
    });
    it('should be able to hear a manually triggered connection', function(done) {
      var cb = function(conn) {
        expect(conn).to.be.an(Socket);
        done();
      }.bind(this);
      this.server.on('connection', cb);
      this.server.emit('connection', new Socket());
      this.server.off('connection', cb);
    });
    it('should be able to hear a connection (live test)', function(done) {
      var cb = function(conn) {
        expect(conn).to.be.an(Socket);
        this.server.off('connection', cb);
        done();
      }.bind(this);
      this.server.on('connection', cb);
      var client = new Socket('127.0.0.1', 8088);
      client.connect(function(err) {
        expect(err).to.be(undefined);
        client.send('derp', 'test', function(err) {
          expect(err).to.be(undefined);
          client.disconnect();
          client.destroy();
        });
      });
    });
    it('should stop', function() {
      this.server.stop();
    });
  });
});

describe('Socket', function() {
  describe('works', function() {
    before(function(done) {
      this.server = new SocketServer('127.0.0.1', 8089);
      this.server.listen(done);
    });
    it('should be possible to create one', function() {
      this.client = new Socket('127.0.0.1', 8089);
    });
    it('should be able to connect and disconnect', function(done) {
      debug('test 1');
      this.client.connect(function(err) {
        expect(err).to.be(undefined);
        this.client.disconnect();
        done();
      }.bind(this));
    });
    it('should be able to connect and disconnect twice fast', function(done) {
      debug('test 2');
      this.client.connect(function(err) {
        expect(err).to.be(undefined);
        this.client.disconnect();
        this.client.connect(function(err) {
          expect(err).to.be(undefined);
          this.client.disconnect();
          done();
        }.bind(this));
      }.bind(this));
    });
    it('should know when it\'s connected', function(done) {
      debug('test 3');
      this.client.connect(function(err) {
        expect(err).to.be(undefined);
        this.client.info(function(err, res) {
          expect(res.socketType).to.be('tcp');
          expect(res.connected).to.be(true);
          this.client.disconnect();
          this.client.info(function(err, res) {
            expect(err).to.be('No socket'); //TODO: ideally, there will be a socket after disconnecting, but because of a chromium error, we can't reuse sockets
            done();
          }.bind(this));
        }.bind(this));
      }.bind(this));
    });
    it('should know when it\'s connected twice fast', function(done) {
      debug('test 4');
      this.client.connect(function(err) {
        expect(err).to.be(undefined);
        this.client.info(function(err, res) {
          expect(res.socketType).to.be('tcp');
          expect(res.connected).to.be(true);
          this.client.disconnect();
          this.client.info(function(err, res) {
            expect(err).to.be('No socket'); //TODO: ideally, there will be a socket after disconnecting, but because of a chromium error, we can't reuse sockets
            this.client.connect(function(err) {
              expect(err).to.be(undefined);
              this.client.info(function(err, res) {
                expect(res.socketType).to.be('tcp');
                expect(res.connected).to.be(true);
                this.client.disconnect();
                this.client.info(function(err, res) {
                  expect(err).to.be('No socket'); //TODO: ideally, there will be a socket after disconnecting, but because of a chromium error, we can't reuse sockets
                  done();
                }.bind(this));
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    });
    it('should be able to connect (live)', function(done) {
      debug('test 5');
      this.server.stop();
      this.server.listen(function(err) {
        expect(err).to.be(undefined);
        var cb = function(conn) {
          expect(conn).to.be.an(Socket);
          this.client.disconnect();
          this.server.off('connection', cb);
          done();
        }.bind(this);
        this.server.on('connection', cb);
        this.client.disconnect();
        this.client.connect(function(err) {
          expect(err).to.be(undefined);
          // if we disconnect here, it will never create the connection
        }.bind(this));
      }.bind(this));
    });
    it('should be able to send', function(done) {
      debug('test 6');
      this.server.stop();
      this.server.listen(function(err) {
        var cb2 = function(conn) {
          var cb = function(data) {
            expect(data).to.be('test');
            conn.off('derp', cb);
            this.client.disconnect();
            done();
          }.bind(this);
          conn.on('derp', cb);
          conn.off('connection', cb2);
        }.bind(this);
        this.server.on('connection', cb2);
        this.client.disconnect();
        this.client.connect(function(err) {
          expect(err).to.be(undefined);
          this.client.send('derp', 'test', function(err) {
            expect(err).to.be(undefined);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    });
    it('should be able to send 2', function(done) {
      debug('test 6');
      this.server.stop();
      this.server.listen(function(err) {
        var cb2 = function(conn) {
          var almost_done = false;
          var cb = function(data) {
            expect(data).to.be('test');
            conn.off('derp', cb);
            this.client.disconnect();
            if (almost_done)
              done();
            else
              almost_done = true;
          }.bind(this);
          var cb3 = function(data) {
            expect(data).to.be('test2');
            conn.off('derp2', cb3);
            this.client.disconnect();
            if (almost_done)
              done();
            else
              almost_done = true;
          }.bind(this);
          conn.on('derp', cb);
          conn.on('derp2', cb3);
          conn.off('connection', cb2);
        }.bind(this);
        this.server.on('connection', cb2);
        this.client.disconnect();
        this.client.connect(function(err) {
          expect(err).to.be(undefined);
          this.client.send('derp', 'test', function(err) {
            expect(err).to.be(undefined);
          }.bind(this));
          this.client.send('derp2', 'test2', function(err) {
            expect(err).to.be(undefined);
          }.bind(this));
        }.bind(this));
      }.bind(this));
    });
    it('should be able to receive', function(done) {
      debug('test 7');
      this.client.disconnect();
      this.server.stop();
      this.server.listen(function(err) {
        expect(err).to.be(undefined);
        var cb = function(conn) {
          debug("send");
          conn.send('derp', 'test');
          conn.off('connection', cb);
        };
        this.server.on('connection', cb);
        this.client.connect(function(err) {
          expect(err).to.be(undefined);
          var cb2 = function(data) {
            expect(data).to.be('test');
            this.client.off('derp', cb2);
            done();
          }.bind(this);
          this.client.on('derp', cb2);
        }.bind(this));
      }.bind(this));
    });
    it('should be able to receive big', function(done) {
      var big = "";
      for (var i = 0; i < 10000; i++) {
        big += ".";
      }
      debug('test 7');
      this.client.disconnect();
      this.server.stop();
      this.server.listen(function(err) {
        expect(err).to.be(undefined);
        var cb = function(conn) {
          debug("send");
          conn.send('derp', big);
          conn.off('connection', cb);
        };
        this.server.on('connection', cb);
        this.client.connect(function(err) {
          expect(err).to.be(undefined);
          var cb2 = function(data) {
            expect(data).to.be(big);
            this.client.off('derp', cb2);
            done();
          }.bind(this);
          this.client.on('derp', cb2);
        }.bind(this));
      }.bind(this));
    });

    after(function() {
      this.client.destroy();
      this.server.stop();
    });
  });
});


describe('OTRSocketServer', function() {
  describe('works', function() {
    before(function(done){
      // speed up testing:
      chrome.storage.local.get('dsaKey', function(data) {
        if (data['dsaKey']) {
          this.myKey = DSA.parsePrivate(data['dsaKey']);
        } else {
          this.myKey = new DSA();
          var data2 = {};
          data2['dsaKey'] = this.myKey.packPrivate();
          chrome.storage.local.set(data2, function() {console.log(arguments);});
        }
        done();
      }.bind(this));
    });
    it('should be possible to create one', function() {
      this.server = new OTRSocketServer('127.0.0.1', 8089, this.myKey);
    });
    it('should be able to listen', function(done){
      this.server.listen(function(res){
        expect(res).to.be(undefined);
        done();
      });
    });
    it('should be able to stop', function(){
      this.server.stop();
    });
  });
});

describe('OTRSocket', function() {
  describe('works', function() {
    before(function(done){
      // speed up testing:
      chrome.storage.local.get('dsaKey', function(data) {
        if (data['dsaKey']) {
          this.myKey = DSA.parsePrivate(data['dsaKey']);
        } else {
          this.myKey = new DSA();
          var data2 = {};
          data2['dsaKey'] = this.myKey.packPrivate();
          chrome.storage.local.set(data2, function() {console.log(arguments);});
        }
        this.server = new OTRSocketServer('127.0.0.1', 8089, this.myKey);
        this.server.listen(function(res){
          expect(res).to.be(undefined);
          done();
        });
      }.bind(this));
    });
    it('should be possible to create one', function() {
      this.client = new OTRSocket('127.0.0.1', 8089, this.myKey);
      console.log(this.client);
    });
    it('should be able to connect', function(done) {
      var cb = function(){
        this.server.off('connection', cb);
        done();
      }.bind(this);
      this.server.on('connection', cb);
      this.client.connect(function(res){
        expect(res).to.be(undefined);
      });
    });
    it('should be able to send', function(done) {
      this.client.disconnect();
      var cb = function(conn){
        var cb2 = function(msg){
          expect(msg).to.be("hello");
          done();
        };
        conn.on('msg', cb2);
        this.server.off('connection', cb);
      }.bind(this);
      this.server.on('connection', cb);
      this.client.connect(function(res){
        expect(res).to.be(undefined);
        this.client.send("hello");
      }.bind(this));
    });
  });
});


describe('OTRUser', function() {
  describe('works', function() {
  });
});

mocha.checkLeaks();
mocha.globals(['jQuery']);
mocha.run();