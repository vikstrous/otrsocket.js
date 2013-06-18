mocha.setup('bdd');


describe('OTRSocketServer', function() {
  describe('works', function() {
    it('should be possible to create one', function() {
      this.server = new OTRSocketServer('127.0.0.1', 8088);
      expect(this.server).to.be.a(OTRSocketServer);
    });
    it('should be able to listen', function(done) {
      this.server.listen(done);
    });
    it('should be able to register connection handlers', function() {
      var cb = function (){};
      this.server.on('connection', cb);
      this.server.off('connection', cb);
    });
    it('should be able to hear a manually triggered connection', function(done) {
      var cb = function (conn) {
        expect(conn).to.be.an(OTRSocket);
        done();
      }.bind(this);
      this.server.on('connection', cb);
      this.server.emit('connection', new OTRSocket());
      this.server.off('connection', cb);
    });
    it('should be able to hear a connection (live test)', function(done) {
      var cb = function (conn) {
        expect(conn).to.be.an(OTRSocket);
        this.server.off('connection', cb);
        done();
      }.bind(this);
      this.server.on('connection', cb);
      var client = new OTRSocket('127.0.0.1', 8088);
      client.connect(function(err) {
        expect(err).to.be(undefined);
        client.send('derp', 'test', function(err){
          expect(err).to.be(undefined);
          client.disconnect();
        });
      });
    });
    it('should stop', function() {
      this.server.stop();
    });
  });
});

describe('OTRSocket', function() {
  describe('works', function() {
    before(function(done) {
      this.server = new OTRSocketServer('127.0.0.1', 8089);
      this.server.listen(done);
    });
    it('should be possible to create one', function() {
      this.client = new OTRSocket('127.0.0.1', 8089);
    });
    it('should be able to connect and disconnect', function(done) {
      this.client.connect(function(err){
        expect(err).to.be(undefined);
        this.client.disconnect();
        done();
      }.bind(this));
    });
    it('should be able to connect and disconnect twice fast', function(done) {
      this.client.connect(function(err){
        expect(err).to.be(undefined);
        this.client.disconnect();
        this.client.connect(function(err){
          expect(err).to.be(undefined);
          this.client.disconnect();
          done();
        }.bind(this));
      }.bind(this));
    });
    it('should know when it\'s connected', function(done) {
      this.client.connect(function(err){
        expect(err).to.be(undefined);
        this.client.info(function(err, res){
          expect(res.socketType).to.be('tcp');
          expect(res.connected).to.be(true);
          this.client.disconnect();
          this.client.info(function(err, res){
            expect(res.socketType).to.be('tcp');
            expect(res.connected).to.be(false);
            done();
          }.bind(this));
        }.bind(this));
      }.bind(this));
    });
    it('should know when it\'s connected twice fast', function(done) {
      this.client.connect(function(err){
        expect(err).to.be(undefined);
        this.client.info(function(err, res){
          expect(res.socketType).to.be('tcp');
          expect(res.connected).to.be(true);
          this.client.disconnect();
          this.client.info(function(err, res){
            expect(res.socketType).to.be('tcp');
            expect(res.connected).to.be(false);
            this.client.connect(function(err){
              expect(err).to.be(undefined);
              this.client.info(function(err, res){
                expect(res.socketType).to.be('tcp');
                expect(res.connected).to.be(true);
                this.client.disconnect();
                this.client.info(function(err, res){
                  expect(res.socketType).to.be('tcp');
                  expect(res.connected).to.be(false);
                  done();
                }.bind(this));
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    });
    it('should be able to connect (live)', function(done) {
      this.server.stop();
      this.server.listen(function(err){
        expect(err).to.be(undefined);
        this.server.on('connection', function(conn){
          expect(conn).to.be.an(OTRSocket);
          done();
        });
        this.client.disconnect();
        this.client.connect(function(err){
          expect(err).to.be(undefined);
          this.client.disconnect();
        }.bind(this));
      }.bind(this));
    });
    it('should be able to send', function(done){
      this.server.stop();
      this.server.listen(function(err){
        this.server.on('connection', function(conn){
          conn.on('derp', function(data){
            expect(data).to.be('test');
            done();
          });
        });
        this.client.connect(function(err){
          expect(err).to.be(undefined);
          this.client.send('derp', 'test', function(err){
            expect(err).to.be(undefined);
            this.client.disconnect();
          }.bind(this));
        }.bind(this));
      }.bind(this));
    });
    after(function() {
      this.client.destroy();
      this.server.stop();
    });
  });
});


mocha.checkLeaks();
mocha.globals(['jQuery']);
mocha.run();