all:
	mkdir -p build
	git submodule init
	git submodule update
	cat otr/vendor/salsa20.js otr/vendor/bigint.js otr/vendor/crypto.js otr/vendor/eventemitter.js otr/build/otr.js src/socket.js > build/otrsocket.js
