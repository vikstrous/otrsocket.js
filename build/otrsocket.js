// Salsa20 implementation
// Contributed to Cryptocat by Dmitry Chestnykh
// 21-01-2013

;(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory)
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory()
  } else {
    root.Salsa20 = factory()
  }

}(this, function () {

    function Salsa20(key, nonce) {
        // Constants.
        this.rounds = 20; // number of Salsa rounds
        this.sigmaWords = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];

        // State.
        this.keyWords = [];           // key words
        this.nonceWords = [0, 0];     // nonce words
        this.counterWords = [0, 0];   // block counter words

        // Output buffer.
        this.block = [];        // output block of 64 bytes
        this.blockUsed = 64;     // number of block bytes used

        this.setKey(key);
        this.setNonce(nonce);
    }

    // setKey sets the key to the given 32-byte array.
    Salsa20.prototype.setKey = function(key) {
        for (var i = 0, j = 0; i < 8; i++, j += 4) {
            this.keyWords[i] = (key[j] & 0xff)        |
                              ((key[j+1] & 0xff)<<8)  |
                              ((key[j+2] & 0xff)<<16) |
                              ((key[j+3] & 0xff)<<24);
        }
        this._reset();
    };

    // setNonce sets the nonce to the given 8-byte array.
    Salsa20.prototype.setNonce = function(nonce) {
        this.nonceWords[0] = (nonce[0] & 0xff)      |
                            ((nonce[1] & 0xff)<<8)  |
                            ((nonce[2] & 0xff)<<16) |
                            ((nonce[3] & 0xff)<<24);
        this.nonceWords[1] = (nonce[4] & 0xff)      |
                            ((nonce[5] & 0xff)<<8)  |
                            ((nonce[6] & 0xff)<<16) |
                            ((nonce[7] & 0xff)<<24);
        this._reset();
    };

    // getBytes returns the next numberOfBytes bytes of stream.
    Salsa20.prototype.getBytes = function(numberOfBytes) {
        var out = new Array(numberOfBytes);
        for (var i = 0; i < numberOfBytes; i++) {
            if (this.blockUsed == 64) {
                this._generateBlock();
                this._incrementCounter();
                this.blockUsed = 0;
            }
            out[i] = this.block[this.blockUsed];
            this.blockUsed++;
        }
        return out;
    };

    Salsa20.prototype.getHexString = function(numberOfBytes) {
        var hex=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
        var out = [];
        var bytes = this.getBytes(numberOfBytes);
        for(var i = 0; i < bytes.length; i++) {
            out.push(hex[(bytes[i] >> 4) & 15]);
            out.push(hex[bytes[i] & 15]);
        }
        return out.join('');
    };

    // Private methods.

    Salsa20.prototype._reset = function() {
        this.counterWords[0] = 0;
        this.counterWords[1] = 0;
        this.blockUsed = 64;
    };

    // _incrementCounter increments block counter.
    Salsa20.prototype._incrementCounter = function() {
        // Note: maximum 2^64 blocks.
        this.counterWords[0] = (this.counterWords[0] + 1) & 0xffffffff;
        if (this.counterWords[0] == 0) {
            this.counterWords[1] = (this.counterWords[1] + 1) & 0xffffffff;
        }
    };

    // _generateBlock generates 64 bytes from key, nonce, and counter,
    // and puts the result into this.block.
    Salsa20.prototype._generateBlock = function() {
        var j0 = this.sigmaWords[0],
            j1 = this.keyWords[0],
            j2 = this.keyWords[1],
            j3 = this.keyWords[2],
            j4 = this.keyWords[3],
            j5 = this.sigmaWords[1],
            j6 = this.nonceWords[0],
            j7 = this.nonceWords[1],
            j8 = this.counterWords[0],
            j9 = this.counterWords[1],
            j10 = this.sigmaWords[2],
            j11 = this.keyWords[4],
            j12 = this.keyWords[5],
            j13 = this.keyWords[6],
            j14 = this.keyWords[7],
            j15 = this.sigmaWords[3];

            var x0 = j0, x1 = j1, x2 = j2, x3 = j3, x4 = j4, x5 = j5, x6 = j6, x7 = j7,
                x8 = j8, x9 = j9, x10 = j10, x11 = j11, x12 = j12, x13 = j13, x14 = j14, x15 = j15;

            var u;

            for (var i = 0; i < this.rounds; i += 2) {
                u = x0 + x12;
                x4 ^= (u<<7) | (u>>>(32-7));
                u = x4 + x0;
                x8 ^= (u<<9) | (u>>>(32-9));
                u = x8 + x4;
                x12 ^= (u<<13) | (u>>>(32-13));
                u = x12 + x8;
                x0 ^= (u<<18) | (u>>>(32-18));

                u = x5 + x1;
                x9 ^= (u<<7) | (u>>>(32-7));
                u = x9 + x5;
                x13 ^= (u<<9) | (u>>>(32-9));
                u = x13 + x9;
                x1 ^= (u<<13) | (u>>>(32-13));
                u = x1 + x13;
                x5 ^= (u<<18) | (u>>>(32-18));

                u = x10 + x6;
                x14 ^= (u<<7) | (u>>>(32-7));
                u = x14 + x10;
                x2 ^= (u<<9) | (u>>>(32-9));
                u = x2 + x14;
                x6 ^= (u<<13) | (u>>>(32-13));
                u = x6 + x2;
                x10 ^= (u<<18) | (u>>>(32-18));

                u = x15 + x11;
                x3 ^= (u<<7) | (u>>>(32-7));
                u = x3 + x15;
                x7 ^= (u<<9) | (u>>>(32-9));
                u = x7 + x3;
                x11 ^= (u<<13) | (u>>>(32-13));
                u = x11 + x7;
                x15 ^= (u<<18) | (u>>>(32-18));

                u = x0 + x3;
                x1 ^= (u<<7) | (u>>>(32-7));
                u = x1 + x0;
                x2 ^= (u<<9) | (u>>>(32-9));
                u = x2 + x1;
                x3 ^= (u<<13) | (u>>>(32-13));
                u = x3 + x2;
                x0 ^= (u<<18) | (u>>>(32-18));

                u = x5 + x4;
                x6 ^= (u<<7) | (u>>>(32-7));
                u = x6 + x5;
                x7 ^= (u<<9) | (u>>>(32-9));
                u = x7 + x6;
                x4 ^= (u<<13) | (u>>>(32-13));
                u = x4 + x7;
                x5 ^= (u<<18) | (u>>>(32-18));

                u = x10 + x9;
                x11 ^= (u<<7) | (u>>>(32-7));
                u = x11 + x10;
                x8 ^= (u<<9) | (u>>>(32-9));
                u = x8 + x11;
                x9 ^= (u<<13) | (u>>>(32-13));
                u = x9 + x8;
                x10 ^= (u<<18) | (u>>>(32-18));

                u = x15 + x14;
                x12 ^= (u<<7) | (u>>>(32-7));
                u = x12 + x15;
                x13 ^= (u<<9) | (u>>>(32-9));
                u = x13 + x12;
                x14 ^= (u<<13) | (u>>>(32-13));
                u = x14 + x13;
                x15 ^= (u<<18) | (u>>>(32-18));
            }

            x0 += j0;
            x1 += j1;
            x2 += j2;
            x3 += j3;
            x4 += j4;
            x5 += j5;
            x6 += j6;
            x7 += j7;
            x8 += j8;
            x9 += j9;
            x10 += j10;
            x11 += j11;
            x12 += j12;
            x13 += j13;
            x14 += j14;
            x15 += j15;

            this.block[ 0] = ( x0 >>>  0) & 0xff; this.block[ 1] = ( x0 >>>  8) & 0xff;
            this.block[ 2] = ( x0 >>> 16) & 0xff; this.block[ 3] = ( x0 >>> 24) & 0xff;
            this.block[ 4] = ( x1 >>>  0) & 0xff; this.block[ 5] = ( x1 >>>  8) & 0xff;
            this.block[ 6] = ( x1 >>> 16) & 0xff; this.block[ 7] = ( x1 >>> 24) & 0xff;
            this.block[ 8] = ( x2 >>>  0) & 0xff; this.block[ 9] = ( x2 >>>  8) & 0xff;
            this.block[10] = ( x2 >>> 16) & 0xff; this.block[11] = ( x2 >>> 24) & 0xff;
            this.block[12] = ( x3 >>>  0) & 0xff; this.block[13] = ( x3 >>>  8) & 0xff;
            this.block[14] = ( x3 >>> 16) & 0xff; this.block[15] = ( x3 >>> 24) & 0xff;
            this.block[16] = ( x4 >>>  0) & 0xff; this.block[17] = ( x4 >>>  8) & 0xff;
            this.block[18] = ( x4 >>> 16) & 0xff; this.block[19] = ( x4 >>> 24) & 0xff;
            this.block[20] = ( x5 >>>  0) & 0xff; this.block[21] = ( x5 >>>  8) & 0xff;
            this.block[22] = ( x5 >>> 16) & 0xff; this.block[23] = ( x5 >>> 24) & 0xff;
            this.block[24] = ( x6 >>>  0) & 0xff; this.block[25] = ( x6 >>>  8) & 0xff;
            this.block[26] = ( x6 >>> 16) & 0xff; this.block[27] = ( x6 >>> 24) & 0xff;
            this.block[28] = ( x7 >>>  0) & 0xff; this.block[29] = ( x7 >>>  8) & 0xff;
            this.block[30] = ( x7 >>> 16) & 0xff; this.block[31] = ( x7 >>> 24) & 0xff;
            this.block[32] = ( x8 >>>  0) & 0xff; this.block[33] = ( x8 >>>  8) & 0xff;
            this.block[34] = ( x8 >>> 16) & 0xff; this.block[35] = ( x8 >>> 24) & 0xff;
            this.block[36] = ( x9 >>>  0) & 0xff; this.block[37] = ( x9 >>>  8) & 0xff;
            this.block[38] = ( x9 >>> 16) & 0xff; this.block[39] = ( x9 >>> 24) & 0xff;
            this.block[40] = (x10 >>>  0) & 0xff; this.block[41] = (x10 >>>  8) & 0xff;
            this.block[42] = (x10 >>> 16) & 0xff; this.block[43] = (x10 >>> 24) & 0xff;
            this.block[44] = (x11 >>>  0) & 0xff; this.block[45] = (x11 >>>  8) & 0xff;
            this.block[46] = (x11 >>> 16) & 0xff; this.block[47] = (x11 >>> 24) & 0xff;
            this.block[48] = (x12 >>>  0) & 0xff; this.block[49] = (x12 >>>  8) & 0xff;
            this.block[50] = (x12 >>> 16) & 0xff; this.block[51] = (x12 >>> 24) & 0xff;
            this.block[52] = (x13 >>>  0) & 0xff; this.block[53] = (x13 >>>  8) & 0xff;
            this.block[54] = (x13 >>> 16) & 0xff; this.block[55] = (x13 >>> 24) & 0xff;
            this.block[56] = (x14 >>>  0) & 0xff; this.block[57] = (x14 >>>  8) & 0xff;
            this.block[58] = (x14 >>> 16) & 0xff; this.block[59] = (x14 >>> 24) & 0xff;
            this.block[60] = (x15 >>>  0) & 0xff; this.block[61] = (x15 >>>  8) & 0xff;
            this.block[62] = (x15 >>> 16) & 0xff; this.block[63] = (x15 >>> 24) & 0xff;
    };

  return Salsa20

}));(function (root, factory) {

  var Salsa20, crypto
  if (typeof define === 'function' && define.amd) {
    define(['./salsa20'], factory.bind(root, root.crypto))
  } else if (typeof module !== 'undefined' && module.exports) {
    Salsa20 = require('./salsa20.js')
    crypto = require('crypto')
    module.exports = factory(crypto, Salsa20)
  } else {
    root.BigInt = factory(root.crypto, root.Salsa20)
  }

}(this, function (crypto, Salsa20) {

  ////////////////////////////////////////////////////////////////////////////////////////
  // Big Integer Library v. 5.5
  // Created 2000, last modified 2013
  // Leemon Baird
  // www.leemon.com
  //
  // Version history:
  // v 5.5  17 Mar 2013
  //   - two lines of a form like "if (x<0) x+=n" had the "if" changed to "while" to
  //     handle the case when x<-n. (Thanks to James Ansell for finding that bug)
  // v 5.4  3 Oct 2009
  //   - added "var i" to greaterShift() so i is not global. (Thanks to Péter Szabó for finding that bug)
  //
  // v 5.3  21 Sep 2009
  //   - added randProbPrime(k) for probable primes
  //   - unrolled loop in mont_ (slightly faster)
  //   - millerRabin now takes a bigInt parameter rather than an int
  //
  // v 5.2  15 Sep 2009
  //   - fixed capitalization in call to int2bigInt in randBigInt
  //     (thanks to Emili Evripidou, Reinhold Behringer, and Samuel Macaleese for finding that bug)
  //
  // v 5.1  8 Oct 2007 
  //   - renamed inverseModInt_ to inverseModInt since it doesn't change its parameters
  //   - added functions GCD and randBigInt, which call GCD_ and randBigInt_
  //   - fixed a bug found by Rob Visser (see comment with his name below)
  //   - improved comments
  //
  // This file is public domain.   You can use it for any purpose without restriction.
  // I do not guarantee that it is correct, so use it at your own risk.  If you use 
  // it for something interesting, I'd appreciate hearing about it.  If you find 
  // any bugs or make any improvements, I'd appreciate hearing about those too.
  // It would also be nice if my name and URL were left in the comments.  But none 
  // of that is required.
  //
  // This code defines a bigInt library for arbitrary-precision integers.
  // A bigInt is an array of integers storing the value in chunks of bpe bits, 
  // little endian (buff[0] is the least significant word).
  // Negative bigInts are stored two's complement.  Almost all the functions treat
  // bigInts as nonnegative.  The few that view them as two's complement say so
  // in their comments.  Some functions assume their parameters have at least one 
  // leading zero element. Functions with an underscore at the end of the name put
  // their answer into one of the arrays passed in, and have unpredictable behavior 
  // in case of overflow, so the caller must make sure the arrays are big enough to 
  // hold the answer.  But the average user should never have to call any of the 
  // underscored functions.  Each important underscored function has a wrapper function 
  // of the same name without the underscore that takes care of the details for you.  
  // For each underscored function where a parameter is modified, that same variable 
  // must not be used as another argument too.  So, you cannot square x by doing 
  // multMod_(x,x,n).  You must use squareMod_(x,n) instead, or do y=dup(x); multMod_(x,y,n).
  // Or simply use the multMod(x,x,n) function without the underscore, where
  // such issues never arise, because non-underscored functions never change
  // their parameters; they always allocate new memory for the answer that is returned.
  //
  // These functions are designed to avoid frequent dynamic memory allocation in the inner loop.
  // For most functions, if it needs a BigInt as a local variable it will actually use
  // a global, and will only allocate to it only when it's not the right size.  This ensures
  // that when a function is called repeatedly with same-sized parameters, it only allocates
  // memory on the first call.
  //
  // Note that for cryptographic purposes, the calls to Math.random() must 
  // be replaced with calls to a better pseudorandom number generator.
  //
  // In the following, "bigInt" means a bigInt with at least one leading zero element,
  // and "integer" means a nonnegative integer less than radix.  In some cases, integer 
  // can be negative.  Negative bigInts are 2s complement.
  // 
  // The following functions do not modify their inputs.
  // Those returning a bigInt, string, or Array will dynamically allocate memory for that value.
  // Those returning a boolean will return the integer 0 (false) or 1 (true).
  // Those returning boolean or int will not allocate memory except possibly on the first 
  // time they're called with a given parameter size.
  // 
  // bigInt  add(x,y)               //return (x+y) for bigInts x and y.  
  // bigInt  addInt(x,n)            //return (x+n) where x is a bigInt and n is an integer.
  // string  bigInt2str(x,base)     //return a string form of bigInt x in a given base, with 2 <= base <= 95
  // int     bitSize(x)             //return how many bits long the bigInt x is, not counting leading zeros
  // bigInt  dup(x)                 //return a copy of bigInt x
  // boolean equals(x,y)            //is the bigInt x equal to the bigint y?
  // boolean equalsInt(x,y)         //is bigint x equal to integer y?
  // bigInt  expand(x,n)            //return a copy of x with at least n elements, adding leading zeros if needed
  // Array   findPrimes(n)          //return array of all primes less than integer n
  // bigInt  GCD(x,y)               //return greatest common divisor of bigInts x and y (each with same number of elements).
  // boolean greater(x,y)           //is x>y?  (x and y are nonnegative bigInts)
  // boolean greaterShift(x,y,shift)//is (x <<(shift*bpe)) > y?
  // bigInt  int2bigInt(t,n,m)      //return a bigInt equal to integer t, with at least n bits and m array elements
  // bigInt  inverseMod(x,n)        //return (x**(-1) mod n) for bigInts x and n.  If no inverse exists, it returns null
  // int     inverseModInt(x,n)     //return x**(-1) mod n, for integers x and n.  Return 0 if there is no inverse
  // boolean isZero(x)              //is the bigInt x equal to zero?
  // boolean millerRabin(x,b)       //does one round of Miller-Rabin base integer b say that bigInt x is possibly prime? (b is bigInt, 1<b<x)
  // boolean millerRabinInt(x,b)    //does one round of Miller-Rabin base integer b say that bigInt x is possibly prime? (b is int,    1<b<x)
  // bigInt  mod(x,n)               //return a new bigInt equal to (x mod n) for bigInts x and n.
  // int     modInt(x,n)            //return x mod n for bigInt x and integer n.
  // bigInt  mult(x,y)              //return x*y for bigInts x and y. This is faster when y<x.
  // bigInt  multMod(x,y,n)         //return (x*y mod n) for bigInts x,y,n.  For greater speed, let y<x.
  // boolean negative(x)            //is bigInt x negative?
  // bigInt  powMod(x,y,n)          //return (x**y mod n) where x,y,n are bigInts and ** is exponentiation.  0**0=1. Faster for odd n.
  // bigInt  randBigInt(n,s)        //return an n-bit random BigInt (n>=1).  If s=1, then the most significant of those n bits is set to 1.
  // bigInt  randTruePrime(k)       //return a new, random, k-bit, true prime bigInt using Maurer's algorithm.
  // bigInt  randProbPrime(k)       //return a new, random, k-bit, probable prime bigInt (probability it's composite less than 2^-80).
  // bigInt  str2bigInt(s,b,n,m)    //return a bigInt for number represented in string s in base b with at least n bits and m array elements
  // bigInt  sub(x,y)               //return (x-y) for bigInts x and y.  Negative answers will be 2s complement
  // bigInt  trim(x,k)              //return a copy of x with exactly k leading zero elements
  //
  //
  // The following functions each have a non-underscored version, which most users should call instead.
  // These functions each write to a single parameter, and the caller is responsible for ensuring the array 
  // passed in is large enough to hold the result. 
  //
  // void    addInt_(x,n)          //do x=x+n where x is a bigInt and n is an integer
  // void    add_(x,y)             //do x=x+y for bigInts x and y
  // void    copy_(x,y)            //do x=y on bigInts x and y
  // void    copyInt_(x,n)         //do x=n on bigInt x and integer n
  // void    GCD_(x,y)             //set x to the greatest common divisor of bigInts x and y, (y is destroyed).  (This never overflows its array).
  // boolean inverseMod_(x,n)      //do x=x**(-1) mod n, for bigInts x and n. Returns 1 (0) if inverse does (doesn't) exist
  // void    mod_(x,n)             //do x=x mod n for bigInts x and n. (This never overflows its array).
  // void    mult_(x,y)            //do x=x*y for bigInts x and y.
  // void    multMod_(x,y,n)       //do x=x*y  mod n for bigInts x,y,n.
  // void    powMod_(x,y,n)        //do x=x**y mod n, where x,y,n are bigInts (n is odd) and ** is exponentiation.  0**0=1.
  // void    randBigInt_(b,n,s)    //do b = an n-bit random BigInt. if s=1, then nth bit (most significant bit) is set to 1. n>=1.
  // void    randTruePrime_(ans,k) //do ans = a random k-bit true random prime (not just probable prime) with 1 in the msb.
  // void    sub_(x,y)             //do x=x-y for bigInts x and y. Negative answers will be 2s complement.
  //
  // The following functions do NOT have a non-underscored version. 
  // They each write a bigInt result to one or more parameters.  The caller is responsible for
  // ensuring the arrays passed in are large enough to hold the results. 
  //
  // void addShift_(x,y,ys)       //do x=x+(y<<(ys*bpe))
  // void carry_(x)               //do carries and borrows so each element of the bigInt x fits in bpe bits.
  // void divide_(x,y,q,r)        //divide x by y giving quotient q and remainder r
  // int  divInt_(x,n)            //do x=floor(x/n) for bigInt x and integer n, and return the remainder. (This never overflows its array).
  // int  eGCD_(x,y,d,a,b)        //sets a,b,d to positive bigInts such that d = GCD_(x,y) = a*x-b*y
  // void halve_(x)               //do x=floor(|x|/2)*sgn(x) for bigInt x in 2's complement.  (This never overflows its array).
  // void leftShift_(x,n)         //left shift bigInt x by n bits.  n<bpe.
  // void linComb_(x,y,a,b)       //do x=a*x+b*y for bigInts x and y and integers a and b
  // void linCombShift_(x,y,b,ys) //do x=x+b*(y<<(ys*bpe)) for bigInts x and y, and integers b and ys
  // void mont_(x,y,n,np)         //Montgomery multiplication (see comments where the function is defined)
  // void multInt_(x,n)           //do x=x*n where x is a bigInt and n is an integer.
  // void rightShift_(x,n)        //right shift bigInt x by n bits.  0 <= n < bpe. (This never overflows its array).
  // void squareMod_(x,n)         //do x=x*x  mod n for bigInts x,n
  // void subShift_(x,y,ys)       //do x=x-(y<<(ys*bpe)). Negative answers will be 2s complement.
  //
  // The following functions are based on algorithms from the _Handbook of Applied Cryptography_
  //    powMod_()           = algorithm 14.94, Montgomery exponentiation
  //    eGCD_,inverseMod_() = algorithm 14.61, Binary extended GCD_
  //    GCD_()              = algorothm 14.57, Lehmer's algorithm
  //    mont_()             = algorithm 14.36, Montgomery multiplication
  //    divide_()           = algorithm 14.20  Multiple-precision division
  //    squareMod_()        = algorithm 14.16  Multiple-precision squaring
  //    randTruePrime_()    = algorithm  4.62, Maurer's algorithm
  //    millerRabin()       = algorithm  4.24, Miller-Rabin algorithm
  //
  // Profiling shows:
  //     randTruePrime_() spends:
  //         10% of its time in calls to powMod_()
  //         85% of its time in calls to millerRabin()
  //     millerRabin() spends:
  //         99% of its time in calls to powMod_()   (always with a base of 2)
  //     powMod_() spends:
  //         94% of its time in calls to mont_()  (almost always with x==y)
  //
  // This suggests there are several ways to speed up this library slightly:
  //     - convert powMod_ to use a Montgomery form of k-ary window (or maybe a Montgomery form of sliding window)
  //         -- this should especially focus on being fast when raising 2 to a power mod n
  //     - convert randTruePrime_() to use a minimum r of 1/3 instead of 1/2 with the appropriate change to the test
  //     - tune the parameters in randTruePrime_(), including c, m, and recLimit
  //     - speed up the single loop in mont_() that takes 95% of the runtime, perhaps by reducing checking
  //       within the loop when all the parameters are the same length.
  //
  // There are several ideas that look like they wouldn't help much at all:
  //     - replacing trial division in randTruePrime_() with a sieve (that speeds up something taking almost no time anyway)
  //     - increase bpe from 15 to 30 (that would help if we had a 32*32->64 multiplier, but not with JavaScript's 32*32->32)
  //     - speeding up mont_(x,y,n,np) when x==y by doing a non-modular, non-Montgomery square
  //       followed by a Montgomery reduction.  The intermediate answer will be twice as long as x, so that
  //       method would be slower.  This is unfortunate because the code currently spends almost all of its time
  //       doing mont_(x,x,...), both for randTruePrime_() and powMod_().  A faster method for Montgomery squaring
  //       would have a large impact on the speed of randTruePrime_() and powMod_().  HAC has a couple of poorly-worded
  //       sentences that seem to imply it's faster to do a non-modular square followed by a single
  //       Montgomery reduction, but that's obviously wrong.
  ////////////////////////////////////////////////////////////////////////////////////////

  //globals
  var bpe = 0        // bits stored per array element
  var mask=0;        //AND this with an array element to chop it down to bpe bits
  var radix=mask+1;  //equals 2^bpe.  A single 1 bit to the left of the last bit of mask.

  //the digits for converting to different bases
  var digitsStr='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_=!@#$%^&*()[]{}|;:,.<>/?`~ \\\'\"+-';

  //initialize the global variables
  for (bpe = 0; (1<<(bpe+1)) > (1<<bpe); bpe++);  // bpe = number of bits in the mantissa on this platform
  bpe>>=1;                   // bpe = number of bits in one element of the array representing the bigInt
  mask=(1<<bpe)-1;           //AND the mask with an integer to get its bpe least significant bits
  radix=mask+1;              //2^bpe.  a single 1 bit to the left of the first bit of mask
  var one=int2bigInt(1,1,1);     //constant used in powMod_()

  //the following global variables are scratchpad memory to 
  //reduce dynamic memory allocation in the inner loop
  var t=new Array(0);
  var ss=t;       //used in mult_()
  var s0=t;       //used in multMod_(), squareMod_()
  var s1=t;       //used in powMod_(), multMod_(), squareMod_()
  var s2=t;       //used in powMod_(), multMod_()
  var s3=t;       //used in powMod_()
  var s4=t, s5=t; //used in mod_()
  var s6=t;       //used in bigInt2str()
  var s7=t;       //used in powMod_()
  var T=t;        //used in GCD_()
  var sa=t;       //used in mont_()
  var mr_x1=t, mr_r=t, mr_a=t;                                      //used in millerRabin()
  var eg_v=t, eg_u=t, eg_A=t, eg_B=t, eg_C=t, eg_D=t;               //used in eGCD_(), inverseMod_()
  var md_q1=t, md_q2=t, md_q3=t, md_r=t, md_r1=t, md_r2=t, md_tt=t; //used in mod_()

  var primes=t, pows=t, s_i=t, s_i2=t, s_R=t, s_rm=t, s_q=t, s_n1=t;
  var s_a=t, s_r2=t, s_n=t, s_b=t, s_d=t, s_x1=t, s_x2=t, s_aa=t; //used in randTruePrime_()
    
  var rpprb=t; //used in randProbPrimeRounds() (which also uses "primes")

  ////////////////////////////////////////////////////////////////////////////////////////


  //return array of all primes less than integer n
  function findPrimes(n) {
    var i,s,p,ans;
    s=new Array(n);
    for (i=0;i<n;i++)
      s[i]=0;
    s[0]=2;
    p=0;    //first p elements of s are primes, the rest are a sieve
    for(;s[p]<n;) {                  //s[p] is the pth prime
      for(i=s[p]*s[p]; i<n; i+=s[p]) //mark multiples of s[p]
        s[i]=1;
      p++;
      s[p]=s[p-1]+1;
      for(; s[p]<n && s[s[p]]; s[p]++); //find next prime (where s[p]==0)
    }
    ans=new Array(p);
    for(i=0;i<p;i++)
      ans[i]=s[i];
    return ans;
  }


  //does a single round of Miller-Rabin base b consider x to be a possible prime?
  //x is a bigInt, and b is an integer, with b<x
  function millerRabinInt(x,b) {
    if (mr_x1.length!=x.length) {
      mr_x1=dup(x);
      mr_r=dup(x);
      mr_a=dup(x);
    }

    copyInt_(mr_a,b);
    return millerRabin(x,mr_a);
  }

  //does a single round of Miller-Rabin base b consider x to be a possible prime?
  //x and b are bigInts with b<x
  function millerRabin(x,b) {
    var i,j,k,s;

    if (mr_x1.length!=x.length) {
      mr_x1=dup(x);
      mr_r=dup(x);
      mr_a=dup(x);
    }

    copy_(mr_a,b);
    copy_(mr_r,x);
    copy_(mr_x1,x);

    addInt_(mr_r,-1);
    addInt_(mr_x1,-1);

    //s=the highest power of two that divides mr_r

    /*
    k=0;
    for (i=0;i<mr_r.length;i++)
      for (j=1;j<mask;j<<=1)
        if (x[i] & j) {
          s=(k<mr_r.length+bpe ? k : 0); 
           i=mr_r.length;
           j=mask;
        } else
          k++;
    */

    /* http://www.javascripter.net/math/primes/millerrabinbug-bigint54.htm */
    if (isZero(mr_r)) return 0;
    for (k=0; mr_r[k]==0; k++);
    for (i=1,j=2; mr_r[k]%j==0; j*=2,i++ );
    s = k*bpe + i - 1;
    /* end */

    if (s)                
      rightShift_(mr_r,s);

    powMod_(mr_a,mr_r,x);

    if (!equalsInt(mr_a,1) && !equals(mr_a,mr_x1)) {
      j=1;
      while (j<=s-1 && !equals(mr_a,mr_x1)) {
        squareMod_(mr_a,x);
        if (equalsInt(mr_a,1)) {
          return 0;
        }
        j++;
      }
      if (!equals(mr_a,mr_x1)) {
        return 0;
      }
    }
    return 1;  
  }

  //returns how many bits long the bigInt is, not counting leading zeros.
  function bitSize(x) {
    var j,z,w;
    for (j=x.length-1; (x[j]==0) && (j>0); j--);
    for (z=0,w=x[j]; w; (w>>=1),z++);
    z+=bpe*j;
    return z;
  }

  //return a copy of x with at least n elements, adding leading zeros if needed
  function expand(x,n) {
    var ans=int2bigInt(0,(x.length>n ? x.length : n)*bpe,0);
    copy_(ans,x);
    return ans;
  }

  //return a k-bit true random prime using Maurer's algorithm.
  function randTruePrime(k) {
    var ans=int2bigInt(0,k,0);
    randTruePrime_(ans,k);
    return trim(ans,1);
  }

  //return a k-bit random probable prime with probability of error < 2^-80
  function randProbPrime(k) {
    if (k>=600) return randProbPrimeRounds(k,2); //numbers from HAC table 4.3
    if (k>=550) return randProbPrimeRounds(k,4);
    if (k>=500) return randProbPrimeRounds(k,5);
    if (k>=400) return randProbPrimeRounds(k,6);
    if (k>=350) return randProbPrimeRounds(k,7);
    if (k>=300) return randProbPrimeRounds(k,9);
    if (k>=250) return randProbPrimeRounds(k,12); //numbers from HAC table 4.4
    if (k>=200) return randProbPrimeRounds(k,15);
    if (k>=150) return randProbPrimeRounds(k,18);
    if (k>=100) return randProbPrimeRounds(k,27);
                return randProbPrimeRounds(k,40); //number from HAC remark 4.26 (only an estimate)
  }

  //return a k-bit probable random prime using n rounds of Miller Rabin (after trial division with small primes)
  function randProbPrimeRounds(k,n) {
    var ans, i, divisible, B; 
    B=30000;  //B is largest prime to use in trial division
    ans=int2bigInt(0,k,0);
    
    //optimization: try larger and smaller B to find the best limit.
    
    if (primes.length==0)
      primes=findPrimes(30000);  //check for divisibility by primes <=30000

    if (rpprb.length!=ans.length)
      rpprb=dup(ans);

    for (;;) { //keep trying random values for ans until one appears to be prime
      //optimization: pick a random number times L=2*3*5*...*p, plus a 
      //   random element of the list of all numbers in [0,L) not divisible by any prime up to p.
      //   This can reduce the amount of random number generation.
      
      randBigInt_(ans,k,0); //ans = a random odd number to check
      ans[0] |= 1; 
      divisible=0;
    
      //check ans for divisibility by small primes up to B
      for (i=0; (i<primes.length) && (primes[i]<=B); i++)
        if (modInt(ans,primes[i])==0 && !equalsInt(ans,primes[i])) {
          divisible=1;
          break;
        }      
      
      //optimization: change millerRabin so the base can be bigger than the number being checked, then eliminate the while here.
      
      //do n rounds of Miller Rabin, with random bases less than ans
      for (i=0; i<n && !divisible; i++) {
        randBigInt_(rpprb,k,0);
        while(!greater(ans,rpprb)) //pick a random rpprb that's < ans
          randBigInt_(rpprb,k,0);
        if (!millerRabin(ans,rpprb))
          divisible=1;
      }
      
      if(!divisible)
        return ans;
    }  
  }

  //return a new bigInt equal to (x mod n) for bigInts x and n.
  function mod(x,n) {
    var ans=dup(x);
    mod_(ans,n);
    return trim(ans,1);
  }

  //return (x+n) where x is a bigInt and n is an integer.
  function addInt(x,n) {
    var ans=expand(x,x.length+1);
    addInt_(ans,n);
    return trim(ans,1);
  }

  //return x*y for bigInts x and y. This is faster when y<x.
  function mult(x,y) {
    var ans=expand(x,x.length+y.length);
    mult_(ans,y);
    return trim(ans,1);
  }

  //return (x**y mod n) where x,y,n are bigInts and ** is exponentiation.  0**0=1. Faster for odd n.
  function powMod(x,y,n) {
    var ans=expand(x,n.length);  
    powMod_(ans,trim(y,2),trim(n,2),0);  //this should work without the trim, but doesn't
    return trim(ans,1);
  }

  //return (x-y) for bigInts x and y.  Negative answers will be 2s complement
  function sub(x,y) {
    var ans=expand(x,(x.length>y.length ? x.length+1 : y.length+1)); 
    sub_(ans,y);
    return trim(ans,1);
  }

  //return (x+y) for bigInts x and y.  
  function add(x,y) {
    var ans=expand(x,(x.length>y.length ? x.length+1 : y.length+1)); 
    add_(ans,y);
    return trim(ans,1);
  }

  //return (x**(-1) mod n) for bigInts x and n.  If no inverse exists, it returns null
  function inverseMod(x,n) {
    var ans=expand(x,n.length); 
    var s;
    s=inverseMod_(ans,n);
    return s ? trim(ans,1) : null;
  }

  //return (x*y mod n) for bigInts x,y,n.  For greater speed, let y<x.
  function multMod(x,y,n) {
    var ans=expand(x,n.length);
    multMod_(ans,y,n);
    return trim(ans,1);
  }

  //generate a k-bit true random prime using Maurer's algorithm,
  //and put it into ans.  The bigInt ans must be large enough to hold it.
  function randTruePrime_(ans,k) {
    var c,w,m,pm,dd,j,r,B,divisible,z,zz,recSize,recLimit;

    if (primes.length==0)
      primes=findPrimes(30000);  //check for divisibility by primes <=30000

    if (pows.length==0) {
      pows=new Array(512);
      for (j=0;j<512;j++) {
        pows[j]=Math.pow(2,j/511.0-1.0);
      }
    }

    //c and m should be tuned for a particular machine and value of k, to maximize speed
    c=0.1;  //c=0.1 in HAC
    m=20;   //generate this k-bit number by first recursively generating a number that has between k/2 and k-m bits
    recLimit=20; //stop recursion when k <=recLimit.  Must have recLimit >= 2

    if (s_i2.length!=ans.length) {
      s_i2=dup(ans);
      s_R =dup(ans);
      s_n1=dup(ans);
      s_r2=dup(ans);
      s_d =dup(ans);
      s_x1=dup(ans);
      s_x2=dup(ans);
      s_b =dup(ans);
      s_n =dup(ans);
      s_i =dup(ans);
      s_rm=dup(ans);
      s_q =dup(ans);
      s_a =dup(ans);
      s_aa=dup(ans);
    }

    if (k <= recLimit) {  //generate small random primes by trial division up to its square root
      pm=(1<<((k+2)>>1))-1; //pm is binary number with all ones, just over sqrt(2^k)
      copyInt_(ans,0);
      for (dd=1;dd;) {
        dd=0;
        ans[0]= 1 | (1<<(k-1)) | Math.floor(Math.random()*(1<<k));  //random, k-bit, odd integer, with msb 1
        for (j=1;(j<primes.length) && ((primes[j]&pm)==primes[j]);j++) { //trial division by all primes 3...sqrt(2^k)
          if (0==(ans[0]%primes[j])) {
            dd=1;
            break;
          }
        }
      }
      carry_(ans);
      return;
    }

    B=c*k*k;    //try small primes up to B (or all the primes[] array if the largest is less than B).
    if (k>2*m)  //generate this k-bit number by first recursively generating a number that has between k/2 and k-m bits
      for (r=1; k-k*r<=m; )
        r=pows[Math.floor(Math.random()*512)];   //r=Math.pow(2,Math.random()-1);
    else
      r=0.5;

    //simulation suggests the more complex algorithm using r=.333 is only slightly faster.

    recSize=Math.floor(r*k)+1;

    randTruePrime_(s_q,recSize);
    copyInt_(s_i2,0);
    s_i2[Math.floor((k-2)/bpe)] |= (1<<((k-2)%bpe));   //s_i2=2^(k-2)
    divide_(s_i2,s_q,s_i,s_rm);                        //s_i=floor((2^(k-1))/(2q))

    z=bitSize(s_i);

    for (;;) {
      for (;;) {  //generate z-bit numbers until one falls in the range [0,s_i-1]
        randBigInt_(s_R,z,0);
        if (greater(s_i,s_R))
          break;
      }                //now s_R is in the range [0,s_i-1]
      addInt_(s_R,1);  //now s_R is in the range [1,s_i]
      add_(s_R,s_i);   //now s_R is in the range [s_i+1,2*s_i]

      copy_(s_n,s_q);
      mult_(s_n,s_R); 
      multInt_(s_n,2);
      addInt_(s_n,1);    //s_n=2*s_R*s_q+1
      
      copy_(s_r2,s_R);
      multInt_(s_r2,2);  //s_r2=2*s_R

      //check s_n for divisibility by small primes up to B
      for (divisible=0,j=0; (j<primes.length) && (primes[j]<B); j++)
        if (modInt(s_n,primes[j])==0 && !equalsInt(s_n,primes[j])) {
          divisible=1;
          break;
        }      

      if (!divisible)    //if it passes small primes check, then try a single Miller-Rabin base 2
        if (!millerRabinInt(s_n,2)) //this line represents 75% of the total runtime for randTruePrime_ 
          divisible=1;

      if (!divisible) {  //if it passes that test, continue checking s_n
        addInt_(s_n,-3);
        for (j=s_n.length-1;(s_n[j]==0) && (j>0); j--);  //strip leading zeros
        for (zz=0,w=s_n[j]; w; (w>>=1),zz++);
        zz+=bpe*j;                             //zz=number of bits in s_n, ignoring leading zeros
        for (;;) {  //generate z-bit numbers until one falls in the range [0,s_n-1]
          randBigInt_(s_a,zz,0);
          if (greater(s_n,s_a))
            break;
        }                //now s_a is in the range [0,s_n-1]
        addInt_(s_n,3);  //now s_a is in the range [0,s_n-4]
        addInt_(s_a,2);  //now s_a is in the range [2,s_n-2]
        copy_(s_b,s_a);
        copy_(s_n1,s_n);
        addInt_(s_n1,-1);
        powMod_(s_b,s_n1,s_n);   //s_b=s_a^(s_n-1) modulo s_n
        addInt_(s_b,-1);
        if (isZero(s_b)) {
          copy_(s_b,s_a);
          powMod_(s_b,s_r2,s_n);
          addInt_(s_b,-1);
          copy_(s_aa,s_n);
          copy_(s_d,s_b);
          GCD_(s_d,s_n);  //if s_b and s_n are relatively prime, then s_n is a prime
          if (equalsInt(s_d,1)) {
            copy_(ans,s_aa);
            return;     //if we've made it this far, then s_n is absolutely guaranteed to be prime
          }
        }
      }
    }
  }

  //Return an n-bit random BigInt (n>=1).  If s=1, then the most significant of those n bits is set to 1.
  function randBigInt(n,s) {
    var a,b;
    a=Math.floor((n-1)/bpe)+2; //# array elements to hold the BigInt with a leading 0 element
    b=int2bigInt(0,0,a);
    randBigInt_(b,n,s);
    return b;
  }

  //Set b to an n-bit random BigInt.  If s=1, then the most significant of those n bits is set to 1.
  //Array b must be big enough to hold the result. Must have n>=1
  function randBigInt_(b,n,s) {
    var i,a;
    for (i=0;i<b.length;i++)
      b[i]=0;
    a=Math.floor((n-1)/bpe)+1; //# array elements to hold the BigInt
    for (i=0;i<a;i++) {
      b[i]=Math.floor(Math.random()*(1<<(bpe-1)));
    }
    b[a-1] &= (2<<((n-1)%bpe))-1;
    if (s==1)
      b[a-1] |= (1<<((n-1)%bpe));
  }

  //Return the greatest common divisor of bigInts x and y (each with same number of elements).
  function GCD(x,y) {
    var xc,yc;
    xc=dup(x);
    yc=dup(y);
    GCD_(xc,yc);
    return xc;
  }

  //set x to the greatest common divisor of bigInts x and y (each with same number of elements).
  //y is destroyed.
  function GCD_(x,y) {
    var i,xp,yp,A,B,C,D,q,sing,qp;
    if (T.length!=x.length)
      T=dup(x);

    sing=1;
    while (sing) { //while y has nonzero elements other than y[0]
      sing=0;
      for (i=1;i<y.length;i++) //check if y has nonzero elements other than 0
        if (y[i]) {
          sing=1;
          break;
        }
      if (!sing) break; //quit when y all zero elements except possibly y[0]

      for (i=x.length;!x[i] && i>=0;i--);  //find most significant element of x
      xp=x[i];
      yp=y[i];
      A=1; B=0; C=0; D=1;
      while ((yp+C) && (yp+D)) {
        q =Math.floor((xp+A)/(yp+C));
        qp=Math.floor((xp+B)/(yp+D));
        if (q!=qp)
          break;
        t= A-q*C;   A=C;   C=t;    //  do (A,B,xp, C,D,yp) = (C,D,yp, A,B,xp) - q*(0,0,0, C,D,yp)      
        t= B-q*D;   B=D;   D=t;
        t=xp-q*yp; xp=yp; yp=t;
      }
      if (B) {
        copy_(T,x);
        linComb_(x,y,A,B); //x=A*x+B*y
        linComb_(y,T,D,C); //y=D*y+C*T
      } else {
        mod_(x,y);
        copy_(T,x);
        copy_(x,y);
        copy_(y,T);
      } 
    }
    if (y[0]==0)
      return;
    t=modInt(x,y[0]);
    copyInt_(x,y[0]);
    y[0]=t;
    while (y[0]) {
      x[0]%=y[0];
      t=x[0]; x[0]=y[0]; y[0]=t;
    }
  }

  //do x=x**(-1) mod n, for bigInts x and n.
  //If no inverse exists, it sets x to zero and returns 0, else it returns 1.
  //The x array must be at least as large as the n array.
  function inverseMod_(x,n) {
    var k=1+2*Math.max(x.length,n.length);

    if(!(x[0]&1)  && !(n[0]&1)) {  //if both inputs are even, then inverse doesn't exist
      copyInt_(x,0);
      return 0;
    }

    if (eg_u.length!=k) {
      eg_u=new Array(k);
      eg_v=new Array(k);
      eg_A=new Array(k);
      eg_B=new Array(k);
      eg_C=new Array(k);
      eg_D=new Array(k);
    }

    copy_(eg_u,x);
    copy_(eg_v,n);
    copyInt_(eg_A,1);
    copyInt_(eg_B,0);
    copyInt_(eg_C,0);
    copyInt_(eg_D,1);
    for (;;) {
      while(!(eg_u[0]&1)) {  //while eg_u is even
        halve_(eg_u);
        if (!(eg_A[0]&1) && !(eg_B[0]&1)) { //if eg_A==eg_B==0 mod 2
          halve_(eg_A);
          halve_(eg_B);      
        } else {
          add_(eg_A,n);  halve_(eg_A);
          sub_(eg_B,x);  halve_(eg_B);
        }
      }

      while (!(eg_v[0]&1)) {  //while eg_v is even
        halve_(eg_v);
        if (!(eg_C[0]&1) && !(eg_D[0]&1)) { //if eg_C==eg_D==0 mod 2
          halve_(eg_C);
          halve_(eg_D);      
        } else {
          add_(eg_C,n);  halve_(eg_C);
          sub_(eg_D,x);  halve_(eg_D);
        }
      }

      if (!greater(eg_v,eg_u)) { //eg_v <= eg_u
        sub_(eg_u,eg_v);
        sub_(eg_A,eg_C);
        sub_(eg_B,eg_D);
      } else {                   //eg_v > eg_u
        sub_(eg_v,eg_u);
        sub_(eg_C,eg_A);
        sub_(eg_D,eg_B);
      }

      if (equalsInt(eg_u,0)) {
        while (negative(eg_C)) //make sure answer is nonnegative
          add_(eg_C,n);
        copy_(x,eg_C);

        if (!equalsInt(eg_v,1)) { //if GCD_(x,n)!=1, then there is no inverse
          copyInt_(x,0);
          return 0;
        }
        return 1;
      }
    }
  }

  //return x**(-1) mod n, for integers x and n.  Return 0 if there is no inverse
  function inverseModInt(x,n) {
    var a=1,b=0,t;
    for (;;) {
      if (x==1) return a;
      if (x==0) return 0;
      b-=a*Math.floor(n/x);
      n%=x;

      if (n==1) return b; //to avoid negatives, change this b to n-b, and each -= to +=
      if (n==0) return 0;
      a-=b*Math.floor(x/n);
      x%=n;
    }
  }

  //this deprecated function is for backward compatibility only. 
  function inverseModInt_(x,n) {
     return inverseModInt(x,n);
  }


  //Given positive bigInts x and y, change the bigints v, a, and b to positive bigInts such that:
  //     v = GCD_(x,y) = a*x-b*y
  //The bigInts v, a, b, must have exactly as many elements as the larger of x and y.
  function eGCD_(x,y,v,a,b) {
    var g=0;
    var k=Math.max(x.length,y.length);
    if (eg_u.length!=k) {
      eg_u=new Array(k);
      eg_A=new Array(k);
      eg_B=new Array(k);
      eg_C=new Array(k);
      eg_D=new Array(k);
    }
    while(!(x[0]&1)  && !(y[0]&1)) {  //while x and y both even
      halve_(x);
      halve_(y);
      g++;
    }
    copy_(eg_u,x);
    copy_(v,y);
    copyInt_(eg_A,1);
    copyInt_(eg_B,0);
    copyInt_(eg_C,0);
    copyInt_(eg_D,1);
    for (;;) {
      while(!(eg_u[0]&1)) {  //while u is even
        halve_(eg_u);
        if (!(eg_A[0]&1) && !(eg_B[0]&1)) { //if A==B==0 mod 2
          halve_(eg_A);
          halve_(eg_B);      
        } else {
          add_(eg_A,y);  halve_(eg_A);
          sub_(eg_B,x);  halve_(eg_B);
        }
      }

      while (!(v[0]&1)) {  //while v is even
        halve_(v);
        if (!(eg_C[0]&1) && !(eg_D[0]&1)) { //if C==D==0 mod 2
          halve_(eg_C);
          halve_(eg_D);      
        } else {
          add_(eg_C,y);  halve_(eg_C);
          sub_(eg_D,x);  halve_(eg_D);
        }
      }

      if (!greater(v,eg_u)) { //v<=u
        sub_(eg_u,v);
        sub_(eg_A,eg_C);
        sub_(eg_B,eg_D);
      } else {                //v>u
        sub_(v,eg_u);
        sub_(eg_C,eg_A);
        sub_(eg_D,eg_B);
      }
      if (equalsInt(eg_u,0)) {
        while (negative(eg_C)) {   //make sure a (C) is nonnegative
          add_(eg_C,y);
          sub_(eg_D,x);
        }
        multInt_(eg_D,-1);  ///make sure b (D) is nonnegative
        copy_(a,eg_C);
        copy_(b,eg_D);
        leftShift_(v,g);
        return;
      }
    }
  }


  //is bigInt x negative?
  function negative(x) {
    return ((x[x.length-1]>>(bpe-1))&1);
  }


  //is (x << (shift*bpe)) > y?
  //x and y are nonnegative bigInts
  //shift is a nonnegative integer
  function greaterShift(x,y,shift) {
    var i, kx=x.length, ky=y.length;
    var k=((kx+shift)<ky) ? (kx+shift) : ky;
    for (i=ky-1-shift; i<kx && i>=0; i++) 
      if (x[i]>0)
        return 1; //if there are nonzeros in x to the left of the first column of y, then x is bigger
    for (i=kx-1+shift; i<ky; i++)
      if (y[i]>0)
        return 0; //if there are nonzeros in y to the left of the first column of x, then x is not bigger
    for (i=k-1; i>=shift; i--)
      if      (x[i-shift]>y[i]) return 1;
      else if (x[i-shift]<y[i]) return 0;
    return 0;
  }

  //is x > y? (x and y both nonnegative)
  function greater(x,y) {
    var i;
    var k=(x.length<y.length) ? x.length : y.length;

    for (i=x.length;i<y.length;i++)
      if (y[i])
        return 0;  //y has more digits

    for (i=y.length;i<x.length;i++)
      if (x[i])
        return 1;  //x has more digits

    for (i=k-1;i>=0;i--)
      if (x[i]>y[i])
        return 1;
      else if (x[i]<y[i])
        return 0;
    return 0;
  }

  //divide x by y giving quotient q and remainder r.  (q=floor(x/y),  r=x mod y).  All 4 are bigints.
  //x must have at least one leading zero element.
  //y must be nonzero.
  //q and r must be arrays that are exactly the same length as x. (Or q can have more).
  //Must have x.length >= y.length >= 2.
  function divide_(x,y,q,r) {
    var kx, ky;
    var i,j,y1,y2,c,a,b;
    copy_(r,x);
    for (ky=y.length;y[ky-1]==0;ky--); //ky is number of elements in y, not including leading zeros

    //normalize: ensure the most significant element of y has its highest bit set  
    b=y[ky-1];
    for (a=0; b; a++)
      b>>=1;  
    a=bpe-a;  //a is how many bits to shift so that the high order bit of y is leftmost in its array element
    leftShift_(y,a);  //multiply both by 1<<a now, then divide both by that at the end
    leftShift_(r,a);

    //Rob Visser discovered a bug: the following line was originally just before the normalization.
    for (kx=r.length;r[kx-1]==0 && kx>ky;kx--); //kx is number of elements in normalized x, not including leading zeros

    copyInt_(q,0);                      // q=0
    while (!greaterShift(y,r,kx-ky)) {  // while (leftShift_(y,kx-ky) <= r) {
      subShift_(r,y,kx-ky);             //   r=r-leftShift_(y,kx-ky)
      q[kx-ky]++;                       //   q[kx-ky]++;
    }                                   // }

    for (i=kx-1; i>=ky; i--) {
      if (r[i]==y[ky-1])
        q[i-ky]=mask;
      else
        q[i-ky]=Math.floor((r[i]*radix+r[i-1])/y[ky-1]);

      //The following for(;;) loop is equivalent to the commented while loop, 
      //except that the uncommented version avoids overflow.
      //The commented loop comes from HAC, which assumes r[-1]==y[-1]==0
      //  while (q[i-ky]*(y[ky-1]*radix+y[ky-2]) > r[i]*radix*radix+r[i-1]*radix+r[i-2])
      //    q[i-ky]--;    
      for (;;) {
        y2=(ky>1 ? y[ky-2] : 0)*q[i-ky];
        c=y2>>bpe;
        y2=y2 & mask;
        y1=c+q[i-ky]*y[ky-1];
        c=y1>>bpe;
        y1=y1 & mask;

        if (c==r[i] ? y1==r[i-1] ? y2>(i>1 ? r[i-2] : 0) : y1>r[i-1] : c>r[i]) 
          q[i-ky]--;
        else
          break;
      }

      linCombShift_(r,y,-q[i-ky],i-ky);    //r=r-q[i-ky]*leftShift_(y,i-ky)
      if (negative(r)) {
        addShift_(r,y,i-ky);         //r=r+leftShift_(y,i-ky)
        q[i-ky]--;
      }
    }

    rightShift_(y,a);  //undo the normalization step
    rightShift_(r,a);  //undo the normalization step
  }

  //do carries and borrows so each element of the bigInt x fits in bpe bits.
  function carry_(x) {
    var i,k,c,b;
    k=x.length;
    c=0;
    for (i=0;i<k;i++) {
      c+=x[i];
      b=0;
      if (c<0) {
        b=-(c>>bpe);
        c+=b*radix;
      }
      x[i]=c & mask;
      c=(c>>bpe)-b;
    }
  }

  //return x mod n for bigInt x and integer n.
  function modInt(x,n) {
    var i,c=0;
    for (i=x.length-1; i>=0; i--)
      c=(c*radix+x[i])%n;
    return c;
  }

  //convert the integer t into a bigInt with at least the given number of bits.
  //the returned array stores the bigInt in bpe-bit chunks, little endian (buff[0] is least significant word)
  //Pad the array with leading zeros so that it has at least minSize elements.
  //There will always be at least one leading 0 element.
  function int2bigInt(t,bits,minSize) {   
    var i,k, buff;
    k=Math.ceil(bits/bpe)+1;
    k=minSize>k ? minSize : k;
    buff=new Array(k);
    copyInt_(buff,t);
    return buff;
  }

  //return the bigInt given a string representation in a given base.  
  //Pad the array with leading zeros so that it has at least minSize elements.
  //If base=-1, then it reads in a space-separated list of array elements in decimal.
  //The array will always have at least one leading zero, unless base=-1.
  function str2bigInt(s,base,minSize) {
    var d, i, j, x, y, kk;
    var k=s.length;
    if (base==-1) { //comma-separated list of array elements in decimal
      x=new Array(0);
      for (;;) {
        y=new Array(x.length+1);
        for (i=0;i<x.length;i++)
          y[i+1]=x[i];
        y[0]=parseInt(s,10);
        x=y;
        d=s.indexOf(',',0);
        if (d<1) 
          break;
        s=s.substring(d+1);
        if (s.length==0)
          break;
      }
      if (x.length<minSize) {
        y=new Array(minSize);
        copy_(y,x);
        return y;
      }
      return x;
    }

    x=int2bigInt(0,base*k,0);
    for (i=0;i<k;i++) {
      d=digitsStr.indexOf(s.substring(i,i+1),0);
      if (base<=36 && d>=36)  //convert lowercase to uppercase if base<=36
        d-=26;
      if (d>=base || d<0) {   //stop at first illegal character
        break;
      }
      multInt_(x,base);
      addInt_(x,d);
    }

    for (k=x.length;k>0 && !x[k-1];k--); //strip off leading zeros
    k=minSize>k+1 ? minSize : k+1;
    y=new Array(k);
    kk=k<x.length ? k : x.length;
    for (i=0;i<kk;i++)
      y[i]=x[i];
    for (;i<k;i++)
      y[i]=0;
    return y;
  }

  //is bigint x equal to integer y?
  //y must have less than bpe bits
  function equalsInt(x,y) {
    var i;
    if (x[0]!=y)
      return 0;
    for (i=1;i<x.length;i++)
      if (x[i])
        return 0;
    return 1;
  }

  //are bigints x and y equal?
  //this works even if x and y are different lengths and have arbitrarily many leading zeros
  function equals(x,y) {
    var i;
    var k=x.length<y.length ? x.length : y.length;
    for (i=0;i<k;i++)
      if (x[i]!=y[i])
        return 0;
    if (x.length>y.length) {
      for (;i<x.length;i++)
        if (x[i])
          return 0;
    } else {
      for (;i<y.length;i++)
        if (y[i])
          return 0;
    }
    return 1;
  }

  //is the bigInt x equal to zero?
  function isZero(x) {
    var i;
    for (i=0;i<x.length;i++)
      if (x[i])
        return 0;
    return 1;
  }

  //convert a bigInt into a string in a given base, from base 2 up to base 95.
  //Base -1 prints the contents of the array representing the number.
  function bigInt2str(x,base) {
    var i,t,s="";

    if (s6.length!=x.length) 
      s6=dup(x);
    else
      copy_(s6,x);

    if (base==-1) { //return the list of array contents
      for (i=x.length-1;i>0;i--)
        s+=x[i]+',';
      s+=x[0];
    }
    else { //return it in the given base
      while (!isZero(s6)) {
        t=divInt_(s6,base);  //t=s6 % base; s6=floor(s6/base);
        s=digitsStr.substring(t,t+1)+s;
      }
    }
    if (s.length==0)
      s="0";
    return s;
  }

  //returns a duplicate of bigInt x
  function dup(x) {
    var i, buff;
    buff=new Array(x.length);
    copy_(buff,x);
    return buff;
  }

  //do x=y on bigInts x and y.  x must be an array at least as big as y (not counting the leading zeros in y).
  function copy_(x,y) {
    var i;
    var k=x.length<y.length ? x.length : y.length;
    for (i=0;i<k;i++)
      x[i]=y[i];
    for (i=k;i<x.length;i++)
      x[i]=0;
  }

  //do x=y on bigInt x and integer y.  
  function copyInt_(x,n) {
    var i,c;
    for (c=n,i=0;i<x.length;i++) {
      x[i]=c & mask;
      c>>=bpe;
    }
  }

  //do x=x+n where x is a bigInt and n is an integer.
  //x must be large enough to hold the result.
  function addInt_(x,n) {
    var i,k,c,b;
    x[0]+=n;
    k=x.length;
    c=0;
    for (i=0;i<k;i++) {
      c+=x[i];
      b=0;
      if (c<0) {
        b=-(c>>bpe);
        c+=b*radix;
      }
      x[i]=c & mask;
      c=(c>>bpe)-b;
      if (!c) return; //stop carrying as soon as the carry is zero
    }
  }

  //right shift bigInt x by n bits.  0 <= n < bpe.
  function rightShift_(x,n) {
    var i;
    var k=Math.floor(n/bpe);
    if (k) {
      for (i=0;i<x.length-k;i++) //right shift x by k elements
        x[i]=x[i+k];
      for (;i<x.length;i++)
        x[i]=0;
      n%=bpe;
    }
    for (i=0;i<x.length-1;i++) {
      x[i]=mask & ((x[i+1]<<(bpe-n)) | (x[i]>>n));
    }
    x[i]>>=n;
  }

  //do x=floor(|x|/2)*sgn(x) for bigInt x in 2's complement
  function halve_(x) {
    var i;
    for (i=0;i<x.length-1;i++) {
      x[i]=mask & ((x[i+1]<<(bpe-1)) | (x[i]>>1));
    }
    x[i]=(x[i]>>1) | (x[i] & (radix>>1));  //most significant bit stays the same
  }

  //left shift bigInt x by n bits.
  function leftShift_(x,n) {
    var i;
    var k=Math.floor(n/bpe);
    if (k) {
      for (i=x.length; i>=k; i--) //left shift x by k elements
        x[i]=x[i-k];
      for (;i>=0;i--)
        x[i]=0;  
      n%=bpe;
    }
    if (!n)
      return;
    for (i=x.length-1;i>0;i--) {
      x[i]=mask & ((x[i]<<n) | (x[i-1]>>(bpe-n)));
    }
    x[i]=mask & (x[i]<<n);
  }

  //do x=x*n where x is a bigInt and n is an integer.
  //x must be large enough to hold the result.
  function multInt_(x,n) {
    var i,k,c,b;
    if (!n)
      return;
    k=x.length;
    c=0;
    for (i=0;i<k;i++) {
      c+=x[i]*n;
      b=0;
      if (c<0) {
        b=-(c>>bpe);
        c+=b*radix;
      }
      x[i]=c & mask;
      c=(c>>bpe)-b;
    }
  }

  //do x=floor(x/n) for bigInt x and integer n, and return the remainder
  function divInt_(x,n) {
    var i,r=0,s;
    for (i=x.length-1;i>=0;i--) {
      s=r*radix+x[i];
      x[i]=Math.floor(s/n);
      r=s%n;
    }
    return r;
  }

  //do the linear combination x=a*x+b*y for bigInts x and y, and integers a and b.
  //x must be large enough to hold the answer.
  function linComb_(x,y,a,b) {
    var i,c,k,kk;
    k=x.length<y.length ? x.length : y.length;
    kk=x.length;
    for (c=0,i=0;i<k;i++) {
      c+=a*x[i]+b*y[i];
      x[i]=c & mask;
      c>>=bpe;
    }
    for (i=k;i<kk;i++) {
      c+=a*x[i];
      x[i]=c & mask;
      c>>=bpe;
    }
  }

  //do the linear combination x=a*x+b*(y<<(ys*bpe)) for bigInts x and y, and integers a, b and ys.
  //x must be large enough to hold the answer.
  function linCombShift_(x,y,b,ys) {
    var i,c,k,kk;
    k=x.length<ys+y.length ? x.length : ys+y.length;
    kk=x.length;
    for (c=0,i=ys;i<k;i++) {
      c+=x[i]+b*y[i-ys];
      x[i]=c & mask;
      c>>=bpe;
    }
    for (i=k;c && i<kk;i++) {
      c+=x[i];
      x[i]=c & mask;
      c>>=bpe;
    }
  }

  //do x=x+(y<<(ys*bpe)) for bigInts x and y, and integers a,b and ys.
  //x must be large enough to hold the answer.
  function addShift_(x,y,ys) {
    var i,c,k,kk;
    k=x.length<ys+y.length ? x.length : ys+y.length;
    kk=x.length;
    for (c=0,i=ys;i<k;i++) {
      c+=x[i]+y[i-ys];
      x[i]=c & mask;
      c>>=bpe;
    }
    for (i=k;c && i<kk;i++) {
      c+=x[i];
      x[i]=c & mask;
      c>>=bpe;
    }
  }

  //do x=x-(y<<(ys*bpe)) for bigInts x and y, and integers a,b and ys.
  //x must be large enough to hold the answer.
  function subShift_(x,y,ys) {
    var i,c,k,kk;
    k=x.length<ys+y.length ? x.length : ys+y.length;
    kk=x.length;
    for (c=0,i=ys;i<k;i++) {
      c+=x[i]-y[i-ys];
      x[i]=c & mask;
      c>>=bpe;
    }
    for (i=k;c && i<kk;i++) {
      c+=x[i];
      x[i]=c & mask;
      c>>=bpe;
    }
  }

  //do x=x-y for bigInts x and y.
  //x must be large enough to hold the answer.
  //negative answers will be 2s complement
  function sub_(x,y) {
    var i,c,k,kk;
    k=x.length<y.length ? x.length : y.length;
    for (c=0,i=0;i<k;i++) {
      c+=x[i]-y[i];
      x[i]=c & mask;
      c>>=bpe;
    }
    for (i=k;c && i<x.length;i++) {
      c+=x[i];
      x[i]=c & mask;
      c>>=bpe;
    }
  }

  //do x=x+y for bigInts x and y.
  //x must be large enough to hold the answer.
  function add_(x,y) {
    var i,c,k,kk;
    k=x.length<y.length ? x.length : y.length;
    for (c=0,i=0;i<k;i++) {
      c+=x[i]+y[i];
      x[i]=c & mask;
      c>>=bpe;
    }
    for (i=k;c && i<x.length;i++) {
      c+=x[i];
      x[i]=c & mask;
      c>>=bpe;
    }
  }

  //do x=x*y for bigInts x and y.  This is faster when y<x.
  function mult_(x,y) {
    var i;
    if (ss.length!=2*x.length)
      ss=new Array(2*x.length);
    copyInt_(ss,0);
    for (i=0;i<y.length;i++)
      if (y[i])
        linCombShift_(ss,x,y[i],i);   //ss=1*ss+y[i]*(x<<(i*bpe))
    copy_(x,ss);
  }

  //do x=x mod n for bigInts x and n.
  function mod_(x,n) {
    if (s4.length!=x.length)
      s4=dup(x);
    else
      copy_(s4,x);
    if (s5.length!=x.length)
      s5=dup(x);  
    divide_(s4,n,s5,x);  //x = remainder of s4 / n
  }

  //do x=x*y mod n for bigInts x,y,n.
  //for greater speed, let y<x.
  function multMod_(x,y,n) {
    var i;
    if (s0.length!=2*x.length)
      s0=new Array(2*x.length);
    copyInt_(s0,0);
    for (i=0;i<y.length;i++)
      if (y[i])
        linCombShift_(s0,x,y[i],i);   //s0=1*s0+y[i]*(x<<(i*bpe))
    mod_(s0,n);
    copy_(x,s0);
  }

  //do x=x*x mod n for bigInts x,n.
  function squareMod_(x,n) {
    var i,j,d,c,kx,kn,k;
    for (kx=x.length; kx>0 && !x[kx-1]; kx--);  //ignore leading zeros in x
    k=kx>n.length ? 2*kx : 2*n.length; //k=# elements in the product, which is twice the elements in the larger of x and n
    if (s0.length!=k) 
      s0=new Array(k);
    copyInt_(s0,0);
    for (i=0;i<kx;i++) {
      c=s0[2*i]+x[i]*x[i];
      s0[2*i]=c & mask;
      c>>=bpe;
      for (j=i+1;j<kx;j++) {
        c=s0[i+j]+2*x[i]*x[j]+c;
        s0[i+j]=(c & mask);
        c>>=bpe;
      }
      s0[i+kx]=c;
    }
    mod_(s0,n);
    copy_(x,s0);
  }

  //return x with exactly k leading zero elements
  function trim(x,k) {
    var i,y;
    for (i=x.length; i>0 && !x[i-1]; i--);
    y=new Array(i+k);
    copy_(y,x);
    return y;
  }

  //do x=x**y mod n, where x,y,n are bigInts and ** is exponentiation.  0**0=1.
  //this is faster when n is odd.  x usually needs to have as many elements as n.
  function powMod_(x,y,n) {
    var k1,k2,kn,np;
    if(s7.length!=n.length)
      s7=dup(n);

    //for even modulus, use a simple square-and-multiply algorithm,
    //rather than using the more complex Montgomery algorithm.
    if ((n[0]&1)==0) {
      copy_(s7,x);
      copyInt_(x,1);
      while(!equalsInt(y,0)) {
        if (y[0]&1)
          multMod_(x,s7,n);
        divInt_(y,2);
        squareMod_(s7,n); 
      }
      return;
    }

    //calculate np from n for the Montgomery multiplications
    copyInt_(s7,0);
    for (kn=n.length;kn>0 && !n[kn-1];kn--);
    np=radix-inverseModInt(modInt(n,radix),radix);
    s7[kn]=1;
    multMod_(x ,s7,n);   // x = x * 2**(kn*bp) mod n

    if (s3.length!=x.length)
      s3=dup(x);
    else
      copy_(s3,x);

    for (k1=y.length-1;k1>0 & !y[k1]; k1--);  //k1=first nonzero element of y
    if (y[k1]==0) {  //anything to the 0th power is 1
      copyInt_(x,1);
      return;
    }
    for (k2=1<<(bpe-1);k2 && !(y[k1] & k2); k2>>=1);  //k2=position of first 1 bit in y[k1]
    for (;;) {
      if (!(k2>>=1)) {  //look at next bit of y
        k1--;
        if (k1<0) {
          mont_(x,one,n,np);
          return;
        }
        k2=1<<(bpe-1);
      }    
      mont_(x,x,n,np);

      if (k2 & y[k1]) //if next bit is a 1
        mont_(x,s3,n,np);
    }
  }


  //do x=x*y*Ri mod n for bigInts x,y,n, 
  //  where Ri = 2**(-kn*bpe) mod n, and kn is the 
  //  number of elements in the n array, not 
  //  counting leading zeros.  
  //x array must have at least as many elemnts as the n array
  //It's OK if x and y are the same variable.
  //must have:
  //  x,y < n
  //  n is odd
  //  np = -(n^(-1)) mod radix
  function mont_(x,y,n,np) {
    var i,j,c,ui,t,ks;
    var kn=n.length;
    var ky=y.length;

    if (sa.length!=kn)
      sa=new Array(kn);
      
    copyInt_(sa,0);

    for (;kn>0 && n[kn-1]==0;kn--); //ignore leading zeros of n
    for (;ky>0 && y[ky-1]==0;ky--); //ignore leading zeros of y
    ks=sa.length-1; //sa will never have more than this many nonzero elements.  

    //the following loop consumes 95% of the runtime for randTruePrime_() and powMod_() for large numbers
    for (i=0; i<kn; i++) {
      t=sa[0]+x[i]*y[0];
      ui=((t & mask) * np) & mask;  //the inner "& mask" was needed on Safari (but not MSIE) at one time
      c=(t+ui*n[0]) >> bpe;
      t=x[i];
      
      //do sa=(sa+x[i]*y+ui*n)/b   where b=2**bpe.  Loop is unrolled 5-fold for speed
      j=1;
      for (;j<ky-4;) { c+=sa[j]+ui*n[j]+t*y[j];   sa[j-1]=c & mask;   c>>=bpe;   j++;
                       c+=sa[j]+ui*n[j]+t*y[j];   sa[j-1]=c & mask;   c>>=bpe;   j++;
                       c+=sa[j]+ui*n[j]+t*y[j];   sa[j-1]=c & mask;   c>>=bpe;   j++;
                       c+=sa[j]+ui*n[j]+t*y[j];   sa[j-1]=c & mask;   c>>=bpe;   j++;
                       c+=sa[j]+ui*n[j]+t*y[j];   sa[j-1]=c & mask;   c>>=bpe;   j++; }    
      for (;j<ky;)   { c+=sa[j]+ui*n[j]+t*y[j];   sa[j-1]=c & mask;   c>>=bpe;   j++; }
      for (;j<kn-4;) { c+=sa[j]+ui*n[j];          sa[j-1]=c & mask;   c>>=bpe;   j++;
                       c+=sa[j]+ui*n[j];          sa[j-1]=c & mask;   c>>=bpe;   j++;
                       c+=sa[j]+ui*n[j];          sa[j-1]=c & mask;   c>>=bpe;   j++;
                       c+=sa[j]+ui*n[j];          sa[j-1]=c & mask;   c>>=bpe;   j++;
                       c+=sa[j]+ui*n[j];          sa[j-1]=c & mask;   c>>=bpe;   j++; }  
      for (;j<kn;)   { c+=sa[j]+ui*n[j];          sa[j-1]=c & mask;   c>>=bpe;   j++; }   
      for (;j<ks;)   { c+=sa[j];                  sa[j-1]=c & mask;   c>>=bpe;   j++; }  
      sa[j-1]=c & mask;
    }

    if (!greater(n,sa))
      sub_(sa,n);
    copy_(x,sa);
  }


  // otr.js stuff

  var BigInt = {
      str2bigInt    : str2bigInt
    , bigInt2str    : bigInt2str
    , int2bigInt    : int2bigInt
    , multMod       : multMod
    , powMod        : powMod
    , inverseMod    : inverseMod
    , randBigInt    : randBigInt
    , equals        : equals
    , sub           : sub
    , mod           : mod
    , mod_          : mod_
    , modInt        : modInt
    , mult          : mult
    , divInt_       : divInt_
    , rightShift_   : rightShift_
    , leftShift_    : leftShift_
    , dup           : dup
    , greater       : greater
    , add           : add
    , addInt        : addInt
    , addInt_       : addInt_
    , isZero        : isZero
    , bitSize       : bitSize
    , randTruePrime : randTruePrime
    , millerRabin   : millerRabin
    , divide_       : divide_
    , trim          : trim
    , expand        : expand
    , bpe           : bpe
  }

  function seedRand(state) {
    return function () {
      var x, o = ''
      while (o.length < 16) {
        x = state.getBytes(1)
        if (x[0] <= 250) o += x[0] % 10
      }
      return parseFloat('0.' + o)
    }
  }

  ;(function seed() {

    var buf
    if ( (typeof crypto !== 'undefined') &&
         (typeof crypto.randomBytes === 'function')
    ) {
      try {
        buf = crypto.randomBytes(40)
      } catch (e) { throw e }
    } else if ( (typeof crypto !== 'undefined') &&
                (typeof crypto.getRandomValues === 'function')
    ) {
      buf = new Uint8Array(40)
      crypto.getRandomValues(buf)
    } else {
      throw new Error('Keys should not be generated without CSPRNG.')
    }

    var state = new Salsa20([
      buf[00], buf[01], buf[02], buf[03], buf[04], buf[05], buf[06], buf[07],
      buf[08], buf[09], buf[10], buf[11], buf[12], buf[13], buf[14], buf[15],
      buf[16], buf[17], buf[18], buf[19], buf[20], buf[21], buf[22], buf[23],
      buf[24], buf[25], buf[26], buf[27], buf[28], buf[29], buf[30], buf[31]
    ],[
      buf[32], buf[33], buf[34], buf[35], buf[36], buf[37], buf[38], buf[39]
    ])

    Math.random = seedRand(state)

    // reseed every 5 mins
    setTimeout(seed, 5 * 60 * 1000)

  }())

  return BigInt

}));(function (root, factory) {

  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory()
  } else {
    root.CryptoJS = factory()
  }

}(this, function () {

/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/**
 * CryptoJS core components.
 */
var CryptoJS = CryptoJS || (function (Math, undefined) {
    /**
     * CryptoJS namespace.
     */
    var C = {};

    /**
     * Library namespace.
     */
    var C_lib = C.lib = {};

    /**
     * Base object for prototypal inheritance.
     */
    var Base = C_lib.Base = (function () {
        function F() {}

        return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function (overrides) {
                // Spawn
                F.prototype = this;
                var subtype = new F();

                // Augment
                if (overrides) {
                    subtype.mixIn(overrides);
                }

                // Reference supertype
                subtype.$super = this;

                return subtype;
            },

            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function () {
                var instance = this.extend();
                instance.init.apply(instance, arguments);

                return instance;
            },

            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function () {
            },

            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function (properties) {
                for (var propertyName in properties) {
                    if (properties.hasOwnProperty(propertyName)) {
                        this[propertyName] = properties[propertyName];
                    }
                }

                // IE won't copy toString using the loop above
                // Other non-enumerable properties are:
                //   hasOwnProperty, isPrototypeOf, propertyIsEnumerable,
                //   toLocaleString, valueOf
                if (properties.hasOwnProperty('toString')) {
                    this.toString = properties.toString;
                }
            },

            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function () {
                return this.$super.extend(this);
            }
        };
    }());

    /**
     * An array of 32-bit words.
     *
     * @property {Array} words The array of 32-bit words.
     * @property {number} sigBytes The number of significant bytes in this word array.
     */
    var WordArray = C_lib.WordArray = Base.extend({
        /**
         * Initializes a newly created word array.
         *
         * @param {Array} words (Optional) An array of 32-bit words.
         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.create();
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
         */
        init: function (words, sigBytes) {
            words = this.words = words || [];

            if (sigBytes != undefined) {
                this.sigBytes = sigBytes;
            } else {
                this.sigBytes = words.length * 4;
            }
        },

        /**
         * Converts this word array to a string.
         *
         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
         *
         * @return {string} The stringified word array.
         *
         * @example
         *
         *     var string = wordArray + '';
         *     var string = wordArray.toString();
         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
         */
        toString: function (encoder) {
            return (encoder || Hex).stringify(this);
        },

        /**
         * Concatenates a word array to this word array.
         *
         * @param {WordArray} wordArray The word array to append.
         *
         * @return {WordArray} This word array.
         *
         * @example
         *
         *     wordArray1.concat(wordArray2);
         */
        concat: function (wordArray) {
            // Shortcuts
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;

            // Clamp excess bits
            this.clamp();

            // Concat
            if (thisSigBytes % 4) {
                // Copy one byte at a time
                for (var i = 0; i < thatSigBytes; i++) {
                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
                }
            } else if (thatWords.length > 0xffff) {
                // Copy one word at a time
                for (var i = 0; i < thatSigBytes; i += 4) {
                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
                }
            } else {
                // Copy all words at once
                thisWords.push.apply(thisWords, thatWords);
            }
            this.sigBytes += thatSigBytes;

            // Chainable
            return this;
        },

        /**
         * Removes insignificant bits.
         *
         * @example
         *
         *     wordArray.clamp();
         */
        clamp: function () {
            // Shortcuts
            var words = this.words;
            var sigBytes = this.sigBytes;

            // Clamp
            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
            words.length = Math.ceil(sigBytes / 4);
        },

        /**
         * Creates a copy of this word array.
         *
         * @return {WordArray} The clone.
         *
         * @example
         *
         *     var clone = wordArray.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);

            return clone;
        },

        /**
         * Creates a word array filled with random bytes.
         *
         * @param {number} nBytes The number of random bytes to generate.
         *
         * @return {WordArray} The random word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.lib.WordArray.random(16);
         */
        random: function (nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
                words.push((Math.random() * 0x100000000) | 0);
            }

            return WordArray.create(words, nBytes);
        }
    });

    /**
     * Encoder namespace.
     */
    var C_enc = C.enc = {};

    /**
     * Hex encoding strategy.
     */
    var Hex = C_enc.Hex = {
        /**
         * Converts a word array to a hex string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The hex string.
         *
         * @static
         *
         * @example
         *
         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                hexChars.push((bite >>> 4).toString(16));
                hexChars.push((bite & 0x0f).toString(16));
            }

            return hexChars.join('');
        },

        /**
         * Converts a hex string to a word array.
         *
         * @param {string} hexStr The hex string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
         */
        parse: function (hexStr) {
            // Shortcut
            var hexStrLength = hexStr.length;

            // Convert
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
            }

            return WordArray.create(words, hexStrLength / 2);
        }
    };

    /**
     * Latin1 encoding strategy.
     */
    var Latin1 = C_enc.Latin1 = {
        /**
         * Converts a word array to a Latin1 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Latin1 string.
         *
         * @static
         *
         * @example
         *
         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                latin1Chars.push(String.fromCharCode(bite));
            }

            return latin1Chars.join('');
        },

        /**
         * Converts a Latin1 string to a word array.
         *
         * @param {string} latin1Str The Latin1 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
         */
        parse: function (latin1Str) {
            // Shortcut
            var latin1StrLength = latin1Str.length;

            // Convert
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
            }

            return WordArray.create(words, latin1StrLength);
        }
    };

    /**
     * UTF-8 encoding strategy.
     */
    var Utf8 = C_enc.Utf8 = {
        /**
         * Converts a word array to a UTF-8 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The UTF-8 string.
         *
         * @static
         *
         * @example
         *
         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
         */
        stringify: function (wordArray) {
            try {
                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
                throw new Error('Malformed UTF-8 data');
            }
        },

        /**
         * Converts a UTF-8 string to a word array.
         *
         * @param {string} utf8Str The UTF-8 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
         */
        parse: function (utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }
    };

    /**
     * Abstract buffered block algorithm template.
     * The property blockSize must be implemented in a concrete subtype.
     *
     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
     */
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
        /**
         * Resets this block algorithm's data buffer to its initial state.
         *
         * @example
         *
         *     bufferedBlockAlgorithm.reset();
         */
        reset: function () {
            // Initial values
            this._data = WordArray.create();
            this._nDataBytes = 0;
        },

        /**
         * Adds new data to this block algorithm's buffer.
         *
         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
         *
         * @example
         *
         *     bufferedBlockAlgorithm._append('data');
         *     bufferedBlockAlgorithm._append(wordArray);
         */
        _append: function (data) {
            // Convert string to WordArray, else assume WordArray already
            if (typeof data == 'string') {
                data = Utf8.parse(data);
            }

            // Append
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
        },

        /**
         * Processes available data blocks.
         * This method invokes _doProcessBlock(dataWords, offset), which must be implemented by a concrete subtype.
         *
         * @param {boolean} flush Whether all blocks and partial blocks should be processed.
         *
         * @return {WordArray} The data after processing.
         *
         * @example
         *
         *     var processedData = bufferedBlockAlgorithm._process();
         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
         */
        _process: function (flush) {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;

            // Count blocks ready
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (flush) {
                // Round up to include partial blocks
                nBlocksReady = Math.ceil(nBlocksReady);
            } else {
                // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }

            // Count words ready
            var nWordsReady = nBlocksReady * blockSize;

            // Count bytes ready
            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

            // Process blocks
            if (nWordsReady) {
                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                    // Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                }

                // Remove processed words
                var processedWords = dataWords.splice(0, nWordsReady);
                data.sigBytes -= nBytesReady;
            }

            // Return processed words
            return WordArray.create(processedWords, nBytesReady);
        },

        /**
         * Creates a copy of this object.
         *
         * @return {Object} The clone.
         *
         * @example
         *
         *     var clone = bufferedBlockAlgorithm.clone();
         */
        clone: function () {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();

            return clone;
        },

        _minBufferSize: 0
    });

    /**
     * Abstract hasher template.
     *
     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
     */
    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         */
        // cfg: Base.extend(),

        /**
         * Initializes a newly created hasher.
         *
         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
         *
         * @example
         *
         *     var hasher = CryptoJS.algo.SHA256.create();
         */
        init: function (cfg) {
            // Apply config defaults
            // this.cfg = this.cfg.extend(cfg);

            // Set initial values
            this.reset();
        },

        /**
         * Resets this hasher to its initial state.
         *
         * @example
         *
         *     hasher.reset();
         */
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-hasher logic
            this._doReset();
        },

        /**
         * Updates this hasher with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {Hasher} This hasher.
         *
         * @example
         *
         *     hasher.update('message');
         *     hasher.update(wordArray);
         */
        update: function (messageUpdate) {
            // Append
            this._append(messageUpdate);

            // Update the hash
            this._process();

            // Chainable
            return this;
        },

        /**
         * Finalizes the hash computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The hash.
         *
         * @example
         *
         *     var hash = hasher.finalize();
         *     var hash = hasher.finalize('message');
         *     var hash = hasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Final message update
            if (messageUpdate) {
                this._append(messageUpdate);
            }

            // Perform concrete-hasher logic
            this._doFinalize();

            return this._hash;
        },

        /**
         * Creates a copy of this object.
         *
         * @return {Object} The clone.
         *
         * @example
         *
         *     var clone = hasher.clone();
         */
        clone: function () {
            var clone = BufferedBlockAlgorithm.clone.call(this);
            clone._hash = this._hash.clone();

            return clone;
        },

        blockSize: 512/32,

        /**
         * Creates a shortcut function to a hasher's object interface.
         *
         * @param {Hasher} hasher The hasher to create a helper for.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
         */
        _createHelper: function (hasher) {
            return function (message, cfg) {
                return hasher.create(cfg).finalize(message);
            };
        },

        /**
         * Creates a shortcut function to the HMAC's object interface.
         *
         * @param {Hasher} hasher The hasher to use in this HMAC helper.
         *
         * @return {Function} The shortcut function.
         *
         * @static
         *
         * @example
         *
         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
         */
        _createHmacHelper: function (hasher) {
            return function (message, key) {
                return C_algo.HMAC.create(hasher, key).finalize(message);
            };
        }
    });

    /**
     * Algorithm namespace.
     */
    var C_algo = C.algo = {};

    return C;
}(Math));

/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var C_enc = C.enc;

    /**
     * Base64 encoding strategy.
     */
    var Base64 = C_enc.Base64 = {
        /**
         * Converts a word array to a Base64 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Base64 string.
         *
         * @static
         *
         * @example
         *
         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = this._map;

            // Clamp excess bits
            wordArray.clamp();

            // Convert
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
                }
            }

            // Add padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                while (base64Chars.length % 4) {
                    base64Chars.push(paddingChar);
                }
            }

            return base64Chars.join('');
        },

        /**
         * Converts a Base64 string to a word array.
         *
         * @param {string} base64Str The Base64 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
         */
        parse: function (base64Str) {
            // Ignore whitespaces
            base64Str = base64Str.replace(/\s/g, '');

            // Shortcuts
            var base64StrLength = base64Str.length;
            var map = this._map;

            // Ignore padding
            var paddingChar = map.charAt(64);
            if (paddingChar) {
                var paddingIndex = base64Str.indexOf(paddingChar);
                if (paddingIndex != -1) {
                    base64StrLength = paddingIndex;
                }
            }

            // Convert
            var words = [];
            var nBytes = 0;
            for (var i = 0; i < base64StrLength; i++) {
                if (i % 4) {
                    var bitsHigh = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
                    var bitsLow  = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
                    words[nBytes >>> 2] |= (bitsHigh | bitsLow) << (24 - (nBytes % 4) * 8);
                    nBytes++;
                }
            }

            return WordArray.create(words, nBytes);
        },

        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    };
}());

/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/**
 * Cipher core components.
 */
CryptoJS.lib.Cipher || (function (undefined) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var WordArray = C_lib.WordArray;
    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
    var C_enc = C.enc;
    var Utf8 = C_enc.Utf8;
    var Base64 = C_enc.Base64;
    var C_algo = C.algo;
    var EvpKDF = C_algo.EvpKDF;

    /**
     * Abstract base cipher template.
     *
     * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
     * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
     * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
     * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
     */
    var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
        /**
         * Configuration options.
         *
         * @property {WordArray} iv The IV to use for this operation.
         */
        cfg: Base.extend(),

        /**
         * Creates this cipher in encryption mode.
         *
         * @param {WordArray} key The key.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {Cipher} A cipher instance.
         *
         * @static
         *
         * @example
         *
         *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
         */
        createEncryptor: function (key, cfg) {
            return this.create(this._ENC_XFORM_MODE, key, cfg);
        },

        /**
         * Creates this cipher in decryption mode.
         *
         * @param {WordArray} key The key.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {Cipher} A cipher instance.
         *
         * @static
         *
         * @example
         *
         *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
         */
        createDecryptor: function (key, cfg) {
            return this.create(this._DEC_XFORM_MODE, key, cfg);
        },

        /**
         * Initializes a newly created cipher.
         *
         * @param {number} xformMode Either the encryption or decryption transormation mode constant.
         * @param {WordArray} key The key.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @example
         *
         *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
         */
        init: function (xformMode, key, cfg) {
            // Apply config defaults
            this.cfg = this.cfg.extend(cfg);

            // Store transform mode and key
            this._xformMode = xformMode;
            this._key = key;

            // Set initial values
            this.reset();
        },

        /**
         * Resets this cipher to its initial state.
         *
         * @example
         *
         *     cipher.reset();
         */
        reset: function () {
            // Reset data buffer
            BufferedBlockAlgorithm.reset.call(this);

            // Perform concrete-cipher logic
            this._doReset();
        },

        /**
         * Adds data to be encrypted or decrypted.
         *
         * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
         *
         * @return {WordArray} The data after processing.
         *
         * @example
         *
         *     var encrypted = cipher.process('data');
         *     var encrypted = cipher.process(wordArray);
         */
        process: function (dataUpdate) {
            // Append
            this._append(dataUpdate);

            // Process available blocks
            return this._process();
        },

        /**
         * Finalizes the encryption or decryption process.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
         *
         * @return {WordArray} The data after final processing.
         *
         * @example
         *
         *     var encrypted = cipher.finalize();
         *     var encrypted = cipher.finalize('data');
         *     var encrypted = cipher.finalize(wordArray);
         */
        finalize: function (dataUpdate) {
            // Final data update
            if (dataUpdate) {
                this._append(dataUpdate);
            }

            // Perform concrete-cipher logic
            var finalProcessedData = this._doFinalize();

            return finalProcessedData;
        },

        keySize: 128/32,

        ivSize: 128/32,

        _ENC_XFORM_MODE: 1,

        _DEC_XFORM_MODE: 2,

        /**
         * Creates shortcut functions to a cipher's object interface.
         *
         * @param {Cipher} cipher The cipher to create a helper for.
         *
         * @return {Object} An object with encrypt and decrypt shortcut functions.
         *
         * @static
         *
         * @example
         *
         *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
         */
        _createHelper: (function () {
            function selectCipherStrategy(key) {
                if (typeof key == 'string') {
                    return PasswordBasedCipher;
                } else {
                    return SerializableCipher;
                }
            }

            return function (cipher) {
                return {
                    encrypt: function (message, key, cfg) {
                        return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
                    },

                    decrypt: function (ciphertext, key, cfg) {
                        return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
                    }
                };
            };
        }())
    });

    /**
     * Abstract base stream cipher template.
     *
     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
     */
    var StreamCipher = C_lib.StreamCipher = Cipher.extend({
        _doFinalize: function () {
            // Process partial blocks
            var finalProcessedBlocks = this._process(!!'flush');

            return finalProcessedBlocks;
        },

        blockSize: 1
    });

    /**
     * Mode namespace.
     */
    var C_mode = C.mode = {};

    /**
     * Abstract base block cipher mode template.
     */
    var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
        /**
         * Creates this mode for encryption.
         *
         * @param {Cipher} cipher A block cipher instance.
         * @param {Array} iv The IV words.
         *
         * @static
         *
         * @example
         *
         *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
         */
        createEncryptor: function (cipher, iv) {
            return this.Encryptor.create(cipher, iv);
        },

        /**
         * Creates this mode for decryption.
         *
         * @param {Cipher} cipher A block cipher instance.
         * @param {Array} iv The IV words.
         *
         * @static
         *
         * @example
         *
         *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
         */
        createDecryptor: function (cipher, iv) {
            return this.Decryptor.create(cipher, iv);
        },

        /**
         * Initializes a newly created mode.
         *
         * @param {Cipher} cipher A block cipher instance.
         * @param {Array} iv The IV words.
         *
         * @example
         *
         *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
         */
        init: function (cipher, iv) {
            this._cipher = cipher;
            this._iv = iv;
        }
    });

    /**
     * Cipher Block Chaining mode.
     */
    var CBC = C_mode.CBC = (function () {
        /**
         * Abstract base CBC mode.
         */
        var CBC = BlockCipherMode.extend();

        /**
         * CBC encryptor.
         */
        CBC.Encryptor = CBC.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function (words, offset) {
                // Shortcuts
                var cipher = this._cipher;
                var blockSize = cipher.blockSize;

                // XOR and encrypt
                xorBlock.call(this, words, offset, blockSize);
                cipher.encryptBlock(words, offset);

                // Remember this block to use with next block
                this._prevBlock = words.slice(offset, offset + blockSize);
            }
        });

        /**
         * CBC decryptor.
         */
        CBC.Decryptor = CBC.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function (words, offset) {
                // Shortcuts
                var cipher = this._cipher;
                var blockSize = cipher.blockSize;

                // Remember this block to use with next block
                var thisBlock = words.slice(offset, offset + blockSize);

                // Decrypt and XOR
                cipher.decryptBlock(words, offset);
                xorBlock.call(this, words, offset, blockSize);

                // This block becomes the previous block
                this._prevBlock = thisBlock;
            }
        });

        function xorBlock(words, offset, blockSize) {
            // Shortcut
            var iv = this._iv;

            // Choose mixing block
            if (iv) {
                var block = iv;

                // Remove IV for subsequent blocks
                this._iv = undefined;
            } else {
                var block = this._prevBlock;
            }

            // XOR block
            for (var i = 0; i < blockSize; i++) {
                words[offset + i] ^= block[i];
            }
        }

        return CBC;
    }());

    /**
     * Padding namespace.
     */
    var C_pad = C.pad = {};

    /**
     * PKCS #5/7 padding strategy.
     */
    var Pkcs7 = C_pad.Pkcs7 = {
        /**
         * Pads data using the algorithm defined in PKCS #5/7.
         *
         * @param {WordArray} data The data to pad.
         * @param {number} blockSize The multiple that the data should be padded to.
         *
         * @static
         *
         * @example
         *
         *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
         */
        pad: function (data, blockSize) {
            // Shortcut
            var blockSizeBytes = blockSize * 4;

            // Count padding bytes
            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

            // Create padding word
            var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;

            // Create padding
            var paddingWords = [];
            for (var i = 0; i < nPaddingBytes; i += 4) {
                paddingWords.push(paddingWord);
            }
            var padding = WordArray.create(paddingWords, nPaddingBytes);

            // Add padding
            data.concat(padding);
        },

        /**
         * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
         *
         * @param {WordArray} data The data to unpad.
         *
         * @static
         *
         * @example
         *
         *     CryptoJS.pad.Pkcs7.unpad(wordArray);
         */
        unpad: function (data) {
            // Get number of padding bytes from last byte
            var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

            // Remove padding
            data.sigBytes -= nPaddingBytes;
        }
    };

    /**
     * Abstract base block cipher template.
     *
     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
     */
    var BlockCipher = C_lib.BlockCipher = Cipher.extend({
        /**
         * Configuration options.
         *
         * @property {Mode} mode The block mode to use. Default: CryptoJS.mode.CBC
         * @property {Padding} padding The padding strategy to use. Default: CryptoJS.pad.Pkcs7
         */
        cfg: Cipher.cfg.extend({
            mode: CBC,
            padding: Pkcs7
        }),

        reset: function () {
            // Reset cipher
            Cipher.reset.call(this);

            // Shortcuts
            var cfg = this.cfg;
            var iv = cfg.iv;
            var mode = cfg.mode;

            // Reset block mode
            if (this._xformMode == this._ENC_XFORM_MODE) {
                var modeCreator = mode.createEncryptor;
            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
                var modeCreator = mode.createDecryptor;

                // Keep at least one block in the buffer for unpadding
                this._minBufferSize = 1;
            }
            this._mode = modeCreator.call(mode, this, iv && iv.words);
        },

        _doProcessBlock: function (words, offset) {
            this._mode.processBlock(words, offset);
        },

        _doFinalize: function () {
            // Shortcut
            var padding = this.cfg.padding;

            // Finalize
            if (this._xformMode == this._ENC_XFORM_MODE) {
                // Pad data
                padding.pad(this._data, this.blockSize);

                // Process final blocks
                var finalProcessedBlocks = this._process(!!'flush');
            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
                // Process final blocks
                var finalProcessedBlocks = this._process(!!'flush');

                // Unpad data
                padding.unpad(finalProcessedBlocks);
            }

            return finalProcessedBlocks;
        },

        blockSize: 128/32
    });

    /**
     * A collection of cipher parameters.
     *
     * @property {WordArray} ciphertext The raw ciphertext.
     * @property {WordArray} key The key to this ciphertext.
     * @property {WordArray} iv The IV used in the ciphering operation.
     * @property {WordArray} salt The salt used with a key derivation function.
     * @property {Cipher} algorithm The cipher algorithm.
     * @property {Mode} mode The block mode used in the ciphering operation.
     * @property {Padding} padding The padding scheme used in the ciphering operation.
     * @property {number} blockSize The block size of the cipher.
     * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
     */
    var CipherParams = C_lib.CipherParams = Base.extend({
        /**
         * Initializes a newly created cipher params object.
         *
         * @param {Object} cipherParams An object with any of the possible cipher parameters.
         *
         * @example
         *
         *     var cipherParams = CryptoJS.lib.CipherParams.create({
         *         ciphertext: ciphertextWordArray,
         *         key: keyWordArray,
         *         iv: ivWordArray,
         *         salt: saltWordArray,
         *         algorithm: CryptoJS.algo.AES,
         *         mode: CryptoJS.mode.CBC,
         *         padding: CryptoJS.pad.PKCS7,
         *         blockSize: 4,
         *         formatter: CryptoJS.format.OpenSSL
         *     });
         */
        init: function (cipherParams) {
            this.mixIn(cipherParams);
        },

        /**
         * Converts this cipher params object to a string.
         *
         * @param {Format} formatter (Optional) The formatting strategy to use.
         *
         * @return {string} The stringified cipher params.
         *
         * @throws Error If neither the formatter nor the default formatter is set.
         *
         * @example
         *
         *     var string = cipherParams + '';
         *     var string = cipherParams.toString();
         *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
         */
        toString: function (formatter) {
            return (formatter || this.formatter).stringify(this);
        }
    });

    /**
     * Format namespace.
     */
    var C_format = C.format = {};

    /**
     * OpenSSL formatting strategy.
     */
    var OpenSSLFormatter = C_format.OpenSSL = {
        /**
         * Converts a cipher params object to an OpenSSL-compatible string.
         *
         * @param {CipherParams} cipherParams The cipher params object.
         *
         * @return {string} The OpenSSL-compatible string.
         *
         * @static
         *
         * @example
         *
         *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
         */
        stringify: function (cipherParams) {
            // Shortcuts
            var ciphertext = cipherParams.ciphertext;
            var salt = cipherParams.salt;

            // Format
            if (salt) {
                var wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
            } else {
                var wordArray = ciphertext;
            }
            var openSSLStr = wordArray.toString(Base64);

            // Limit lines to 64 characters
            openSSLStr = openSSLStr.replace(/(.{64})/g, '$1\n');

            return openSSLStr;
        },

        /**
         * Converts an OpenSSL-compatible string to a cipher params object.
         *
         * @param {string} openSSLStr The OpenSSL-compatible string.
         *
         * @return {CipherParams} The cipher params object.
         *
         * @static
         *
         * @example
         *
         *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
         */
        parse: function (openSSLStr) {
            // Parse base64
            var ciphertext = Base64.parse(openSSLStr);

            // Shortcut
            var ciphertextWords = ciphertext.words;

            // Test for salt
            if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
                // Extract salt
                var salt = WordArray.create(ciphertextWords.slice(2, 4));

                // Remove salt from ciphertext
                ciphertextWords.splice(0, 4);
                ciphertext.sigBytes -= 16;
            }

            return CipherParams.create({ ciphertext: ciphertext, salt: salt });
        }
    };

    /**
     * A cipher wrapper that returns ciphertext as a serializable cipher params object.
     */
    var SerializableCipher = C_lib.SerializableCipher = Base.extend({
        /**
         * Configuration options.
         *
         * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string.
         *   Default: CryptoJS.format.OpenSSL
         */
        cfg: Base.extend({
            format: OpenSSLFormatter
        }),

        /**
         * Encrypts a message.
         *
         * @param {Cipher} cipher The cipher algorithm to use.
         * @param {WordArray|string} message The message to encrypt.
         * @param {WordArray} key The key.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {CipherParams} A cipher params object.
         *
         * @static
         *
         * @example
         *
         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
         */
        encrypt: function (cipher, message, key, cfg) {
            // Apply config defaults
            cfg = this.cfg.extend(cfg);

            // Encrypt
            var encryptor = cipher.createEncryptor(key, cfg);
            var ciphertext = encryptor.finalize(message);

            // Shortcut
            var cipherCfg = encryptor.cfg;

            // Create and return serializable cipher params
            return CipherParams.create({
                ciphertext: ciphertext,
                key: key,
                iv: cipherCfg.iv,
                algorithm: cipher,
                mode: cipherCfg.mode,
                padding: cipherCfg.padding,
                blockSize: cipher.blockSize,
                formatter: cfg.format
            });
        },

        /**
         * Decrypts serialized ciphertext.
         *
         * @param {Cipher} cipher The cipher algorithm to use.
         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
         * @param {WordArray} key The key.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {WordArray} The plaintext.
         *
         * @static
         *
         * @example
         *
         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
         */
        decrypt: function (cipher, ciphertext, key, cfg) {
            // Apply config defaults
            cfg = this.cfg.extend(cfg);

            // Convert string to CipherParams
            ciphertext = this._parse(ciphertext, cfg.format);

            // Decrypt
            var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);

            return plaintext;
        },

        /**
         * Converts serialized ciphertext to CipherParams,
         * else assumes CipherParams already and returns ciphertext unchanged.
         *
         * @param {CipherParams|string} ciphertext The ciphertext.
         * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
         *
         * @return {CipherParams} The unserialized ciphertext.
         *
         * @static
         *
         * @example
         *
         *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
         */
        _parse: function (ciphertext, format) {
            if (typeof ciphertext == 'string') {
                return format.parse(ciphertext);
            } else {
                return ciphertext;
            }
        }
    });

    /**
     * Key derivation function namespace.
     */
    var C_kdf = C.kdf = {};

    /**
     * OpenSSL key derivation function.
     */
    var OpenSSLKdf = C_kdf.OpenSSL = {
        /**
         * Derives a key and IV from a password.
         *
         * @param {string} password The password to derive from.
         * @param {number} keySize The size in words of the key to generate.
         * @param {number} ivSize The size in words of the IV to generate.
         * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
         *
         * @return {CipherParams} A cipher params object with the key, IV, and salt.
         *
         * @static
         *
         * @example
         *
         *     var derivedParams = CryptoJS.kdf.OpenSSL.compute('Password', 256/32, 128/32);
         *     var derivedParams = CryptoJS.kdf.OpenSSL.compute('Password', 256/32, 128/32, 'saltsalt');
         */
        compute: function (password, keySize, ivSize, salt) {
            // Generate random salt
            if (!salt) {
                salt = WordArray.random(64/8);
            }

            // Derive key and IV
            var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);

            // Separate key and IV
            var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
            key.sigBytes = keySize * 4;

            // Return params
            return CipherParams.create({ key: key, iv: iv, salt: salt });
        }
    };

    /**
     * A serializable cipher wrapper that derives the key from a password,
     * and returns ciphertext as a serializable cipher params object.
     */
    var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
        /**
         * Configuration options.
         *
         * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password.
         *   Default: CryptoJS.kdf.OpenSSL
         */
        cfg: SerializableCipher.cfg.extend({
            kdf: OpenSSLKdf
        }),

        /**
         * Encrypts a message using a password.
         *
         * @param {Cipher} cipher The cipher algorithm to use.
         * @param {WordArray|string} message The message to encrypt.
         * @param {string} password The password.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {CipherParams} A cipher params object.
         *
         * @static
         *
         * @example
         *
         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
         */
        encrypt: function (cipher, message, password, cfg) {
            // Apply config defaults
            cfg = this.cfg.extend(cfg);

            // Derive key and other params
            var derivedParams = cfg.kdf.compute(password, cipher.keySize, cipher.ivSize);

            // Add IV to config
            cfg.iv = derivedParams.iv;

            // Encrypt
            var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);

            // Mix in derived params
            ciphertext.mixIn(derivedParams);

            return ciphertext;
        },

        /**
         * Decrypts serialized ciphertext using a password.
         *
         * @param {Cipher} cipher The cipher algorithm to use.
         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
         * @param {string} password The password.
         * @param {Object} cfg (Optional) The configuration options to use for this operation.
         *
         * @return {WordArray} The plaintext.
         *
         * @static
         *
         * @example
         *
         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
         */
        decrypt: function (cipher, ciphertext, password, cfg) {
            // Apply config defaults
            cfg = this.cfg.extend(cfg);

            // Convert string to CipherParams
            ciphertext = this._parse(ciphertext, cfg.format);

            // Derive key and other params
            var derivedParams = cfg.kdf.compute(password, cipher.keySize, cipher.ivSize, ciphertext.salt);

            // Add IV to config
            cfg.iv = derivedParams.iv;

            // Decrypt
            var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);

            return plaintext;
        }
    });
}());

/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var BlockCipher = C_lib.BlockCipher;
    var C_algo = C.algo;

    // Lookup tables
    var SBOX = [];
    var INV_SBOX = [];
    var SUB_MIX_0 = [];
    var SUB_MIX_1 = [];
    var SUB_MIX_2 = [];
    var SUB_MIX_3 = [];
    var INV_SUB_MIX_0 = [];
    var INV_SUB_MIX_1 = [];
    var INV_SUB_MIX_2 = [];
    var INV_SUB_MIX_3 = [];

    // Compute lookup tables
    (function () {
        // Compute double table
        var d = [];
        for (var i = 0; i < 256; i++) {
            if (i < 128) {
                d[i] = i << 1;
            } else {
                d[i] = (i << 1) ^ 0x11b;
            }
        }

        // Walk GF(2^8)
        var x = 0;
        var xi = 0;
        for (var i = 0; i < 256; i++) {
            // Compute sbox
            var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
            sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
            SBOX[x] = sx;
            INV_SBOX[sx] = x;

            // Compute multiplication
            var x2 = d[x];
            var x4 = d[x2];
            var x8 = d[x4];

            // Compute sub bytes, mix columns tables
            var t = (d[sx] * 0x101) ^ (sx * 0x1010100);
            SUB_MIX_0[x] = (t << 24) | (t >>> 8);
            SUB_MIX_1[x] = (t << 16) | (t >>> 16);
            SUB_MIX_2[x] = (t << 8)  | (t >>> 24);
            SUB_MIX_3[x] = t;

            // Compute inv sub bytes, inv mix columns tables
            var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
            INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
            INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
            INV_SUB_MIX_2[sx] = (t << 8)  | (t >>> 24);
            INV_SUB_MIX_3[sx] = t;

            // Compute next counter
            if (!x) {
                x = xi = 1;
            } else {
                x = x2 ^ d[d[d[x8 ^ x2]]];
                xi ^= d[d[xi]];
            }
        }
    }());

    // Precomputed Rcon lookup
    var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

    /**
     * AES block cipher algorithm.
     */
    var AES = C_algo.AES = BlockCipher.extend({
        _doReset: function () {
            // Shortcuts
            var key = this._key;
            var keyWords = key.words;
            var keySize = key.sigBytes / 4;

            // Compute number of rounds
            var nRounds = this._nRounds = keySize + 6

            // Compute number of key schedule rows
            var ksRows = (nRounds + 1) * 4;

            // Compute key schedule
            var keySchedule = this._keySchedule = [];
            for (var ksRow = 0; ksRow < ksRows; ksRow++) {
                if (ksRow < keySize) {
                    keySchedule[ksRow] = keyWords[ksRow];
                } else {
                    var t = keySchedule[ksRow - 1];

                    if (!(ksRow % keySize)) {
                        // Rot word
                        t = (t << 8) | (t >>> 24);

                        // Sub word
                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];

                        // Mix Rcon
                        t ^= RCON[(ksRow / keySize) | 0] << 24;
                    } else if (keySize > 6 && ksRow % keySize == 4) {
                        // Sub word
                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
                    }

                    keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
                }
            }

            // Compute inv key schedule
            var invKeySchedule = this._invKeySchedule = [];
            for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
                var ksRow = ksRows - invKsRow;

                if (invKsRow % 4) {
                    var t = keySchedule[ksRow];
                } else {
                    var t = keySchedule[ksRow - 4];
                }

                if (invKsRow < 4 || ksRow <= 4) {
                    invKeySchedule[invKsRow] = t;
                } else {
                    invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
                                               INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]];
                }
            }
        },

        encryptBlock: function (M, offset) {
            this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
        },

        decryptBlock: function (M, offset) {
            // Swap 2nd and 4th rows
            var t = M[offset + 1];
            M[offset + 1] = M[offset + 3];
            M[offset + 3] = t;

            this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);

            // Inv swap 2nd and 4th rows
            var t = M[offset + 1];
            M[offset + 1] = M[offset + 3];
            M[offset + 3] = t;
        },

        _doCryptBlock: function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
            // Shortcut
            var nRounds = this._nRounds;

            // Get input, add round key
            var s0 = M[offset]     ^ keySchedule[0];
            var s1 = M[offset + 1] ^ keySchedule[1];
            var s2 = M[offset + 2] ^ keySchedule[2];
            var s3 = M[offset + 3] ^ keySchedule[3];

            // Key schedule row counter
            var ksRow = 4;

            // Rounds
            for (var round = 1; round < nRounds; round++) {
                // Shift rows, sub bytes, mix columns, add round key
                var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 & 0xff] ^ keySchedule[ksRow++];
                var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 & 0xff] ^ keySchedule[ksRow++];
                var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 & 0xff] ^ keySchedule[ksRow++];
                var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 & 0xff] ^ keySchedule[ksRow++];

                // Update state
                s0 = t0;
                s1 = t1;
                s2 = t2;
                s3 = t3;
            }

            // Shift rows, sub bytes, add round key
            var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++];
            var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++];
            var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++];
            var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++];

            // Set output
            M[offset]     = t0;
            M[offset + 1] = t1;
            M[offset + 2] = t2;
            M[offset + 3] = t3;
        },

        keySize: 256/32
    });

    /**
     * Shortcut functions to the cipher's object interface.
     *
     * @example
     *
     *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
     *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
     */
    C.AES = BlockCipher._createHelper(AES);
}());

/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Reusable object
    var W = [];

    /**
     * SHA-1 hash algorithm.
     */
    var SHA1 = C_algo.SHA1 = Hasher.extend({
        _doReset: function () {
            this._hash = WordArray.create([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]);
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];

            // Computation
            for (var i = 0; i < 80; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                    W[i] = (n << 1) | (n >>> 31);
                }

                var t = ((a << 5) | (a >>> 27)) + e + W[i];
                if (i < 20) {
                    t += ((b & c) | (~b & d)) + 0x5a827999;
                } else if (i < 40) {
                    t += (b ^ c ^ d) + 0x6ed9eba1;
                } else if (i < 60) {
                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
                } else /* if (i < 80) */ {
                    t += (b ^ c ^ d) - 0x359d3e2a;
                }

                e = d;
                d = c;
                c = (b << 30) | (b >>> 2);
                b = a;
                a = t;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();
        }
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA1('message');
     *     var hash = CryptoJS.SHA1(wordArray);
     */
    C.SHA1 = Hasher._createHelper(SHA1);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA1(message, key);
     */
    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
}());

/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function (Math) {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var WordArray = C_lib.WordArray;
    var Hasher = C_lib.Hasher;
    var C_algo = C.algo;

    // Initialization and round constants tables
    var H = [];
    var K = [];

    // Compute constants
    (function () {
        function isPrime(n) {
            var sqrtN = Math.sqrt(n);
            for (var factor = 2; factor <= sqrtN; factor++) {
                if (!(n % factor)) {
                    return false;
                }
            }

            return true;
        }

        function getFractionalBits(n) {
            return ((n - (n | 0)) * 0x100000000) | 0;
        }

        var n = 2;
        var nPrime = 0;
        while (nPrime < 64) {
            if (isPrime(n)) {
                if (nPrime < 8) {
                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
                }
                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

                nPrime++;
            }

            n++;
        }
    }());

    // Reusable object
    var W = [];

    /**
     * SHA-256 hash algorithm.
     */
    var SHA256 = C_algo.SHA256 = Hasher.extend({
        _doReset: function () {
            this._hash = WordArray.create(H.slice(0));
        },

        _doProcessBlock: function (M, offset) {
            // Shortcut
            var H = this._hash.words;

            // Working variables
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            var f = H[5];
            var g = H[6];
            var h = H[7];

            // Computation
            for (var i = 0; i < 64; i++) {
                if (i < 16) {
                    W[i] = M[offset + i] | 0;
                } else {
                    var gamma0x = W[i - 15];
                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
                                   (gamma0x >>> 3);

                    var gamma1x = W[i - 2];
                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
                                   (gamma1x >>> 10);

                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
                }

                var ch  = (e & f) ^ (~e & g);
                var maj = (a & b) ^ (a & c) ^ (b & c);

                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

                var t1 = h + sigma1 + ch + K[i] + W[i];
                var t2 = sigma0 + maj;

                h = g;
                g = f;
                f = e;
                e = (d + t1) | 0;
                d = c;
                c = b;
                b = a;
                a = (t1 + t2) | 0;
            }

            // Intermediate hash value
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
        },

        _doFinalize: function () {
            // Shortcuts
            var data = this._data;
            var dataWords = data.words;

            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;

            // Add padding
            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;

            // Hash final blocks
            this._process();
        }
    });

    /**
     * Shortcut function to the hasher's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     *
     * @return {WordArray} The hash.
     *
     * @static
     *
     * @example
     *
     *     var hash = CryptoJS.SHA256('message');
     *     var hash = CryptoJS.SHA256(wordArray);
     */
    C.SHA256 = Hasher._createHelper(SHA256);

    /**
     * Shortcut function to the HMAC's object interface.
     *
     * @param {WordArray|string} message The message to hash.
     * @param {WordArray|string} key The secret key.
     *
     * @return {WordArray} The HMAC.
     *
     * @static
     *
     * @example
     *
     *     var hmac = CryptoJS.HmacSHA256(message, key);
     */
    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
}(Math));

/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
(function () {
    // Shortcuts
    var C = CryptoJS;
    var C_lib = C.lib;
    var Base = C_lib.Base;
    var C_enc = C.enc;
    var Utf8 = C_enc.Utf8;
    var C_algo = C.algo;

    /**
     * HMAC algorithm.
     */
    var HMAC = C_algo.HMAC = Base.extend({
        /**
         * Initializes a newly created HMAC.
         *
         * @param {Hasher} hasher The hash algorithm to use.
         * @param {WordArray|string} key The secret key.
         *
         * @example
         *
         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
         */
        init: function (hasher, key) {
            // Init hasher
            hasher = this._hasher = hasher.create();

            // Convert string to WordArray, else assume WordArray already
            if (typeof key == 'string') {
                key = Utf8.parse(key);
            }

            // Shortcuts
            var hasherBlockSize = hasher.blockSize;
            var hasherBlockSizeBytes = hasherBlockSize * 4;

            // Allow arbitrary length keys
            if (key.sigBytes > hasherBlockSizeBytes) {
                key = hasher.finalize(key);
            }

            // Clone key for inner and outer pads
            var oKey = this._oKey = key.clone();
            var iKey = this._iKey = key.clone();

            // Shortcuts
            var oKeyWords = oKey.words;
            var iKeyWords = iKey.words;

            // XOR keys with pad constants
            for (var i = 0; i < hasherBlockSize; i++) {
                oKeyWords[i] ^= 0x5c5c5c5c;
                iKeyWords[i] ^= 0x36363636;
            }
            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;

            // Set initial values
            this.reset();
        },

        /**
         * Resets this HMAC to its initial state.
         *
         * @example
         *
         *     hmacHasher.reset();
         */
        reset: function () {
            // Shortcut
            var hasher = this._hasher;

            // Reset
            hasher.reset();
            hasher.update(this._iKey);
        },

        /**
         * Updates this HMAC with a message.
         *
         * @param {WordArray|string} messageUpdate The message to append.
         *
         * @return {HMAC} This HMAC instance.
         *
         * @example
         *
         *     hmacHasher.update('message');
         *     hmacHasher.update(wordArray);
         */
        update: function (messageUpdate) {
            this._hasher.update(messageUpdate);

            // Chainable
            return this;
        },

        /**
         * Finalizes the HMAC computation.
         * Note that the finalize operation is effectively a destructive, read-once operation.
         *
         * @param {WordArray|string} messageUpdate (Optional) A final message update.
         *
         * @return {WordArray} The HMAC.
         *
         * @example
         *
         *     var hmac = hmacHasher.finalize();
         *     var hmac = hmacHasher.finalize('message');
         *     var hmac = hmacHasher.finalize(wordArray);
         */
        finalize: function (messageUpdate) {
            // Shortcut
            var hasher = this._hasher;

            // Compute HMAC
            var innerHash = hasher.finalize(messageUpdate);
            hasher.reset();
            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));

            return hmac;
        }
    });
}());

/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/**
 * A noop padding strategy.
 */
CryptoJS.pad.NoPadding = {
    pad: function () {
    },

    unpad: function () {
    }
};

/*
CryptoJS v3.0.2
code.google.com/p/crypto-js
(c) 2009-2012 by Jeff Mott. All rights reserved.
code.google.com/p/crypto-js/wiki/License
*/
/**
 * Counter block mode.
 */
CryptoJS.mode.CTR = (function () {
    var CTR = CryptoJS.lib.BlockCipherMode.extend();

    var Encryptor = CTR.Encryptor = CTR.extend({
        processBlock: function (words, offset) {
            // Shortcuts
            var cipher = this._cipher
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var counter = this._counter;

            // Generate keystream
            if (iv) {
                counter = this._counter = iv.slice(0);

                // Remove IV for subsequent blocks
                this._iv = undefined;
            }
            var keystream = counter.slice(0);
            cipher.encryptBlock(keystream, 0);

            // Increment counter
            counter[blockSize - 1] = (counter[blockSize - 1] + 1) | 0

            // Encrypt
            for (var i = 0; i < blockSize; i++) {
                words[offset + i] ^= keystream[i];
            }
        }
    });

    CTR.Decryptor = Encryptor;

    return CTR;
}());


  return CryptoJS

}))/**
 * EventEmitter v4.0.5 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

;(function(exports) {
    // JSHint config - http://www.jshint.com/
    /*jshint laxcomma:true*/
    /*global define:true*/

    // Place the script in strict mode
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class Manages event registering and emitting.
     */
    function EventEmitter(){}

    // Shortcuts to improve speed and size

        // Easy access to the prototype
    var proto = EventEmitter.prototype

      // Existence of a native indexOf
      , nativeIndexOf = Array.prototype.indexOf ? true : false;

    /**
     * Finds the index of the listener for the event in it's storage array
     *
     * @param {Function} listener Method to look for.
     * @param {Function[]} listeners Array of listeners to search through.
     * @return {Number} Index of the specified listener, -1 if not found
     */
    function indexOfListener(listener, listeners) {
        // Return the index via the native method if possible
        if(nativeIndexOf) {
            return listeners.indexOf(listener);
        }

        // There is no native method
        // Use a manual loop to find the index
        var i = listeners.length;
        while(i--) {
            // If the listener matches, return it's index
            if(listeners[i] === listener) {
                return i;
            }
        }

        // Default to returning -1
        return -1;
    }

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     */
    proto._getEvents = function() {
        return this._events || (this._events = {});
    };

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     *
     * @param {String} evt Name of the event to return the listeners from.
     * @return {Function[]} All listener functions for the event.
     * @doc
     */
    proto.getListeners = function(evt) {
        // Create a shortcut to the storage object
        // Initialise it if it does not exists yet
        var events = this._getEvents();

        // Return the listener array
        // Initialise it if it does not exist
        return events[evt] || (events[evt] = []);
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     *
     * @param {String} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     * @doc
     */
    proto.addListener = function(evt, listener) {
        // Fetch the listeners
        var listeners = this.getListeners(evt);

        // Push the listener into the array if it is not already there
        if(indexOfListener(listener, listeners) === -1) {
            listeners.push(listener);
        }

        // Return the instance of EventEmitter to allow chaining
        return this;
    };

    /**
     * Alias of addListener
     * @doc
     */
    proto.on = proto.addListener;

    /**
     * Removes a listener function from the specified event.
     *
     * @param {String} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     * @doc
     */
    proto.removeListener = function(evt, listener) {
        // Fetch the listeners
        // And get the index of the listener in the array
        var listeners = this.getListeners(evt)
          , index = indexOfListener(listener, listeners);

        // If the listener was found then remove it
        if(index !== -1) {
            listeners.splice(index, 1);

            // If there are no more listeners in this array then remove it
            if(listeners.length === 0) {
                this.removeEvent(evt);
            }
        }

        // Return the instance of EventEmitter to allow chaining
        return this;
    };

    /**
     * Alias of removeListener
     * @doc
     */
    proto.off = proto.removeListener;

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added.
     *
     * @param {String|Object} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     * @doc
     */
    proto.addListeners = function(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     *
     * @param {String|Object} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     * @doc
     */
    proto.removeListeners = function(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     * @doc
     */
    proto.manipulateListeners = function(remove, evt, listeners) {
        // Initialise any required variables
        var i
          , value
          , single = remove ? this.removeListener : this.addListener
          , multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of it's properties to this method
        if(typeof evt === 'object') {
            for(i in evt) {
                if(evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if(typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while(i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        // Return the instance of EventEmitter to allow chaining
        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     *
     * @param {String} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     * @doc
     */
    proto.removeEvent = function(evt) {
        // Remove different things depending on the state of evt
        if(evt) {
            // Remove all listeners for the specified event
            delete this._getEvents()[evt];
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        // Return the instance of EventEmitter to allow chaining
        return this;
    };

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     *
     * @param {String} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     * @doc
     */
    proto.emitEvent = function(evt, args) {
        // Get the listeners for the event
        // Also initialise any other required variables
        var listeners = this.getListeners(evt)
          , i = listeners.length
          , response;

        // Loop over all listeners assigned to the event
        // Apply the arguments array to each listener function
        while(i--) {
            // If the listener returns true then it shall be removed from the event
            // The function is executed either with a basic call or an apply if there is an args array
            response = args ? listeners[i].apply(null, args) : listeners[i]();
            if(response === true) {
                this.removeListener(evt, listeners[i]);
            }
        }

        // Return the instance of EventEmitter to allow chaining
        return this;
    };

    /**
     * Alias of emitEvent
     * @doc
     */
    proto.trigger = proto.emitEvent;

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as
     * opposed to taking a single array of arguments to pass on.
     *
     * @param {String} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     * @doc
     */
    proto.emit = function(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    // Expose the class either via AMD or the global object
    if(typeof define === 'function' && define.amd) {
        define(function() {
            return EventEmitter;
        });
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}(this));/*!

  otr.js v0.1.7 - 2013-06-14
  (c) 2013 - Arlo Breault <arlolra@gmail.com>
  Freely distributed under the MPL v2.0 license.

  This file is concatenated for the browser.
  Please see: https://github.com/arlolra/otr

*/

;(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define([
        "./dep/bigint"
      , "./dep/crypto"
      , "./dep/eventemitter"
    ], function (BigInt, CryptoJS, EventEmitter) {
      return factory({
          BigInt: BigInt
        , CryptoJS: CryptoJS
        , EventEmitter: EventEmitter
        , OTR: {}
        , DSA: {}
      })
    })
  } else {
    root.OTR = {}
    root.DSA = {}
    factory(root)
  }

}(this, function (root) {

;(function () {
  "use strict";

  var root = this

  var CONST = {

    // diffie-heilman
      N : 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA237327FFFFFFFFFFFFFFFF'
    , G : '2'

    // otr message states
    , MSGSTATE_PLAINTEXT : 0
    , MSGSTATE_ENCRYPTED : 1
    , MSGSTATE_FINISHED  : 2

    // otr auth states
    , AUTHSTATE_NONE               : 0
    , AUTHSTATE_AWAITING_DHKEY     : 1
    , AUTHSTATE_AWAITING_REVEALSIG : 2
    , AUTHSTATE_AWAITING_SIG       : 3

    // whitespace tags
    , WHITESPACE_TAG    : '\x20\x09\x20\x20\x09\x09\x09\x09\x20\x09\x20\x09\x20\x09\x20\x20'
    , WHITESPACE_TAG_V2 : '\x20\x20\x09\x09\x20\x20\x09\x20'
    , WHITESPACE_TAG_V3 : '\x20\x20\x09\x09\x20\x20\x09\x09'

    // otr tags
    , OTR_TAG       : '?OTR'
    , OTR_VERSION_1 : '\x00\x01'
    , OTR_VERSION_2 : '\x00\x02'
    , OTR_VERSION_3 : '\x00\x03'

    // smp machine states
    , SMPSTATE_EXPECT0 : 0
    , SMPSTATE_EXPECT1 : 1
    , SMPSTATE_EXPECT2 : 2
    , SMPSTATE_EXPECT3 : 3
    , SMPSTATE_EXPECT4 : 4

    // unstandard status codes
    , STATUS_SEND_QUERY  : 0
    , STATUS_AKE_INIT    : 1
    , STATUS_AKE_SUCCESS : 2
    , STATUS_SMP_INIT    : 3
    , STATUS_SMP_SECRET  : 4
    , STATUS_SMP_ANSWER  : 5
    , STATUS_END_OTR     : 6

  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONST
  } else {
    root.OTR.CONST = CONST
  }

}).call(this)
;(function () {
  "use strict";

  var root = this

  var HLP = {}, CryptoJS, BigInt
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HLP = {}
    CryptoJS = require('../vendor/crypto.js')
    BigInt = require('../vendor/bigint.js')
  } else {
    if (root.OTR) root.OTR.HLP = HLP
    if (root.DSA) root.DSA.HLP = HLP
    CryptoJS = root.CryptoJS
    BigInt = root.BigInt
  }

  // data types (byte lengths)
  var DTS = {
      BYTE  : 1
    , SHORT : 2
    , INT   : 4
    , CTR   : 8
    , MAC   : 20
    , SIG   : 40
  }

  // otr message wrapper begin and end
  var WRAPPER_BEGIN = "?OTR"
    , WRAPPER_END   = "."

  HLP.debug = function (msg) {
    // used as HLP.debug.call(ctx, msg)
    if ( this.debug &&
         typeof this.debug !== 'function' &&
         typeof console !== 'undefined'
    ) console.log(msg)
  }

  HLP.extend = function (child, parent) {
    for (var key in parent) {
      if (Object.hasOwnProperty.call(parent, key))
        child[key] = parent[key]
    }
    function Ctor() { this.constructor = child }
    Ctor.prototype = parent.prototype
    child.prototype = new Ctor()
    child.__super__ = parent.prototype
  }

  HLP.divMod = function (num, den, n) {
    return BigInt.multMod(num, BigInt.inverseMod(den, n), n)
  }

  HLP.subMod = function (one, two, n) {
    one = BigInt.mod(one, n)
    two = BigInt.mod(two, n)
    if (BigInt.greater(two, one)) one = BigInt.add(one, n)
    return BigInt.sub(one, two)
  }

  HLP.randomExponent = function () {
    return BigInt.randBigInt(1536)
  }

  HLP.randomValue = function () {
    return BigInt.randBigInt(128)
  }

  HLP.smpHash = function (version, fmpi, smpi) {
    var sha256 = CryptoJS.algo.SHA256.create()
    sha256.update(CryptoJS.enc.Latin1.parse(HLP.packBytes(version, DTS.BYTE)))
    sha256.update(CryptoJS.enc.Latin1.parse(HLP.packMPI(fmpi)))
    if (smpi) sha256.update(CryptoJS.enc.Latin1.parse(HLP.packMPI(smpi)))
    var hash = sha256.finalize()
    return HLP.bits2bigInt(hash.toString(CryptoJS.enc.Latin1))
  }

  HLP.makeMac = function (aesctr, m) {
    var pass = CryptoJS.enc.Latin1.parse(m)
    var mac = CryptoJS.HmacSHA256(CryptoJS.enc.Latin1.parse(aesctr), pass)
    return HLP.mask(mac.toString(CryptoJS.enc.Latin1), 0, 160)
  }

  HLP.make1Mac = function (aesctr, m) {
    var pass = CryptoJS.enc.Latin1.parse(m)
    var mac = CryptoJS.HmacSHA1(CryptoJS.enc.Latin1.parse(aesctr), pass)
    return mac.toString(CryptoJS.enc.Latin1)
  }

  HLP.encryptAes = function (msg, c, iv) {
    var opts = {
        mode: CryptoJS.mode.CTR
      , iv: CryptoJS.enc.Latin1.parse(iv)
      , padding: CryptoJS.pad.NoPadding
    }
    var aesctr = CryptoJS.AES.encrypt(
        msg
      , CryptoJS.enc.Latin1.parse(c)
      , opts
    )
    var aesctr_decoded = CryptoJS.enc.Base64.parse(aesctr.toString())
    return CryptoJS.enc.Latin1.stringify(aesctr_decoded)
  }

  HLP.decryptAes = function (msg, c, iv) {
    msg = CryptoJS.enc.Latin1.parse(msg)
    var opts = {
        mode: CryptoJS.mode.CTR
      , iv: CryptoJS.enc.Latin1.parse(iv)
      , padding: CryptoJS.pad.NoPadding
    }
    return CryptoJS.AES.decrypt(
        CryptoJS.enc.Base64.stringify(msg)
      , CryptoJS.enc.Latin1.parse(c)
      , opts
    )
  }

  HLP.multPowMod = function (a, b, c, d, e) {
    return BigInt.multMod(BigInt.powMod(a, b, e), BigInt.powMod(c, d, e), e)
  }

  HLP.ZKP = function (v, c, d, e) {
    return BigInt.equals(c, HLP.smpHash(v, d, e))
  }

  // greater than, or equal
  HLP.GTOE = function (a, b) {
    return (BigInt.equals(a, b) || BigInt.greater(a, b))
  }

  HLP.between = function (x, a, b) {
    return (BigInt.greater(x, a) && BigInt.greater(b, x))
  }

  HLP.checkGroup = function (g, N) {
    var TWO = BigInt.str2bigInt('2', 10)
    var N_MINUS_2 = BigInt.sub(N, TWO)
    return HLP.GTOE(g, TWO) && HLP.GTOE(N_MINUS_2, g)
  }

  var OPS = {
      'XOR': function (c, s) { return c ^ s }
    , 'OR': function (c, s) { return c | s }
    , 'AND': function (c, s) { return c & s }
  }
  HLP.bigBitWise = function (op, a, b) {
    var tf = (a.length > b.length)
      , short = tf ? b : a
      , long  = tf ? a : b
      , len = long.length
      , c = BigInt.expand(short, len)
      , i = 0
    for (; i < len; i++) {
      c[i] = OPS[op](c[i], long[i])
    }
    return c
  }

  HLP.h1 = function (b, secbytes) {
    var sha1 = CryptoJS.algo.SHA1.create()
    sha1.update(CryptoJS.enc.Latin1.parse(b))
    sha1.update(CryptoJS.enc.Latin1.parse(secbytes))
    return (sha1.finalize()).toString(CryptoJS.enc.Latin1)
  }

  HLP.h2 = function (b, secbytes) {
    var sha256 = CryptoJS.algo.SHA256.create()
    sha256.update(CryptoJS.enc.Latin1.parse(b))
    sha256.update(CryptoJS.enc.Latin1.parse(secbytes))
    return (sha256.finalize()).toString(CryptoJS.enc.Latin1)
  }

  HLP.mask = function (bytes, start, n) {
    return bytes.substr(start / 8, n / 8)
  }

  HLP.twotothe = function (g) {
    var ex = g % 4
    g = Math.floor(g / 4)
    var str = (Math.pow(2, ex)).toString()
    for (var i = 0; i < g; i++) str += '0'
    return BigInt.str2bigInt(str, 16)
  }

  HLP.packBytes = function (val, bytes) {
    var res = ''  // big-endian, unsigned long
    for (bytes -= 1; bytes > -1; bytes--) {
      res = _toString(val & 0xff) + res
      val >>= 8
    }
    return res
  }

  HLP.packINT = function (d) {
    return HLP.packBytes(d, DTS.INT)
  }

  HLP.packCtr = function (d) {
    return HLP.padCtr(HLP.packBytes(d, DTS.CTR))
  }

  HLP.padCtr = function (ctr) {
    return ctr + '\x00\x00\x00\x00\x00\x00\x00\x00'
  }

  HLP.unpackCtr = function (d) {
    d = HLP.toByteArray(d.substring(0, 8))
    return HLP.unpack(d)
  }

  HLP.unpack = function (arr) {
    arr.reverse()
    var val = 0, i = 0, len = arr.length
    for (; i < len; i++) {
      val += Math.pow(256, i) * arr[i]
    }
    return val
  }

  HLP.packData = function (d) {
    return HLP.packINT(d.length) + d
  }

  HLP.bigInt2bits = function (bi, pad) {
    pad || (pad = 0)
    bi = BigInt.dup(bi)
    var ba = ''
    while (!BigInt.isZero(bi)) {
      ba = _num2bin[bi[0] & 0xff] + ba
      BigInt.rightShift_(bi, 8)
    }
    while (ba.length < pad) {
      ba = '\x00' + ba
    }
    return ba
  }

  HLP.bits2bigInt = function (bits) {
    bits = HLP.toByteArray(bits)
    return HLP.retMPI(bits)
  }

  HLP.packMPI = function (mpi) {
    return HLP.packData(HLP.bigInt2bits(BigInt.trim(mpi, 0)))
  }

  HLP.packSHORT = function (short) {
    return HLP.packBytes(short, DTS.SHORT)
  }

  HLP.unpackSHORT = function (short) {
    short = HLP.toByteArray(short)
    return HLP.unpack(short)
  }

  HLP.packTLV = function (type, value) {
    return HLP.packSHORT(type) + HLP.packSHORT(value.length) + value
  }

  HLP.readLen = function (msg) {
    msg = HLP.toByteArray(msg.substring(0, 4))
    return HLP.unpack(msg)
  }

  HLP.readData = function (data) {
    var n = HLP.unpack(data.splice(0, 4))
    return [n, data]
  }

  HLP.retMPI = function (data) {
    var mpi = BigInt.str2bigInt('0', 10, data.length)
    data.forEach(function (d, i) {
      if (i) BigInt.leftShift_(mpi, 8)
      mpi[0] |= d
    })
    return mpi
  }

  HLP.readMPI = function (data) {
    data = HLP.toByteArray(data)
    data = HLP.readData(data)
    return HLP.retMPI(data[1])
  }

  HLP.packMPIs = function (arr) {
    return arr.reduce(function (prv, cur) {
      return prv + HLP.packMPI(cur)
    }, '')
  }

  HLP.unpackMPIs = function (num, mpis) {
    var i = 0, arr = []
    for (; i < num; i++) arr.push('MPI')
    return (HLP.splitype(arr, mpis)).map(function (m) {
      return HLP.readMPI(m)
    })
  }

  HLP.wrapMsg = function (msg, fs, v3, our_it, their_it) {
    msg = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Latin1.parse(msg))
    msg = WRAPPER_BEGIN + ":" + msg + WRAPPER_END

    var its
    if (v3) {
      its = '|'
      its += (HLP.readLen(our_it)).toString(16)
      its += '|'
      its += (HLP.readLen(their_it)).toString(16)
    }

    if (!fs) return [null, msg]

    var n = Math.ceil(msg.length / fs)
    if (n > 65535) return ['Too many fragments']
    if (n == 1) return [null, msg]

    var k, bi, ei, frag, mf, mfs = []
    for (k = 1; k <= n; k++) {
      bi = (k - 1) * fs
      ei = k * fs
      frag = msg.slice(bi, ei)
      mf = WRAPPER_BEGIN
      if (v3) mf += its
      mf += ',' + k + ','
      mf += n + ','
      mf += frag + ','
      mfs.push(mf)
    }

    return [null, mfs]
  }

  HLP.splitype = function splitype(arr, msg) {
    var data = []
    arr.forEach(function (a) {
      var str
      switch (a) {
        case 'PUBKEY':
          str = splitype(['SHORT', 'MPI', 'MPI', 'MPI', 'MPI'], msg).join('')
          break
        case 'DATA':  // falls through
        case 'MPI':
          str = msg.substring(0, HLP.readLen(msg) + 4)
          break
        default:
          str = msg.substring(0, DTS[a])
      }
      data.push(str)
      msg = msg.substring(str.length)
    })
    return data
  }

  // https://github.com/msgpack/msgpack-javascript/blob/master/msgpack.js

  var _bin2num = {}
    , _num2bin = {}
    , _toString = String.fromCharCode

  var i = 0, v

  for (; i < 0x100; ++i) {
    v = _toString(i)
    _bin2num[v] = i  // "\00" -> 0x00
    _num2bin[i] = v  //     0 -> "\00"
  }

  for (i = 0x80; i < 0x100; ++i) {  // [Webkit][Gecko]
    _bin2num[_toString(0xf700 + i)] = i  // "\f780" -> 0x80
  }

  HLP.toByteArray = function (data) {
    var rv = [], bin2num = _bin2num, remain
      , ary = data.split("")
      , i = -1
      , iz

    iz = ary.length
    remain = iz % 8

    while (remain--) {
      ++i
      rv[i] = bin2num[ary[i]]
    }
    remain = iz >> 3
    while (remain--) {
      rv.push(bin2num[ary[++i]], bin2num[ary[++i]],
              bin2num[ary[++i]], bin2num[ary[++i]],
              bin2num[ary[++i]], bin2num[ary[++i]],
              bin2num[ary[++i]], bin2num[ary[++i]])
    }
    return rv
  }

}).call(this)
// DSA
// http://www.itl.nist.gov/fipspubs/fip186.htm

;(function () {
  "use strict";

  var root = this

  var CryptoJS, BigInt, HLP
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DSA
    CryptoJS = require('../vendor/crypto.js')
    BigInt = require('../vendor/bigint.js')
    HLP = require('./helpers.js')
  } else {
    // copy over and expose internals
    Object.keys(root.DSA).forEach(function (k) {
      DSA[k] = root.DSA[k]
    })
    root.DSA = DSA
    CryptoJS = root.CryptoJS
    BigInt = root.BigInt
    HLP = DSA.HLP
  }

  var ZERO = BigInt.str2bigInt('0', 10)
    , ONE = BigInt.str2bigInt('1', 10)
    , TWO = BigInt.str2bigInt('2', 10)
    , KEY_TYPE = '\x00\x00'

  var DEBUG = false
  function timer() {
    var start = (new Date()).getTime()
    return function (s) {
      if (!DEBUG || typeof console === 'undefined') return
      var t = (new Date()).getTime()
      console.log(s + ': ' + (t - start))
      start = t
    }
  }

  function makeRandom(min, max) {
    var c = BigInt.randBigInt(BigInt.bitSize(max))
    if (!HLP.between(c, min, max)) return makeRandom(min, max)
    return c
  }

  // http://www-cs-students.stanford.edu/~tjw/jsbn/jsbn2.js

  var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997]
  var lplim = (1 << 26) / lowprimes[lowprimes.length - 1]

  function isProbablePrime(x, repeat) {
    var t = x.length - 1
    for (; t >= 0 && x[t] === 0; t--) ;

    var i
    if (t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
      for (i = 0; i < lowprimes.length; ++i)
        if (x[0] == lowprimes[i]) return true
      return false
    }

    // even
    if ((x[0] % 2) === 0) return false

    i = 1
    var m, j
    while (i < lowprimes.length) {
      m = lowprimes[i]
      j = i + 1
      while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
      m = BigInt.modInt(x, m)
      while (i < j) if (m % lowprimes[i++] === 0) return false
    }

    return millerRabin(x, repeat)
  }

  function lbit(x) {
    if (x === 0) return -1
    var k = 0
    while ((x & 1) === 0) x >>= 1, k++
    return k
  }

  function lowestSetBit(x) {
    var t = x.length - 1
    for (; t >= 0 && x[t] === 0; t--) ;
    var i = 0
    for (; i < t; i++)
      if (x[i] !== 0) return (i * BigInt.bpe) + lbit(x[i])
    return -1
  }

  function millerRabin(x, repeat) {
    var n1 = BigInt.sub(x, ONE)

    var k = lowestSetBit(n1)
    if (k <= 0) return false

    var r = BigInt.dup(n1)
    BigInt.rightShift_(r, k)

    if (repeat > lowprimes.length) repeat = lowprimes.length;

    var a, i, y, j, w, bases = []
    for (i = 0; i < repeat; i++) {

      // Pick bases at random from low primes, instead of starting at 2
      while (!a || ~bases.indexOf(a))
        a = lowprimes[Math.floor(Math.random() * lowprimes.length)]

      bases.push(a)
      y = BigInt.powMod(BigInt.int2bigInt(a, 0), r, x)

      if (BigInt.equals(y, ONE) || BigInt.equals(y, n1)) continue

      for (j = 1, w = false; j < k; j++) {
        y = BigInt.powMod(y, TWO, x)
        if (BigInt.equals(y, ONE)) return false
        if (BigInt.equals(y, n1)) {
          w = true
          break
        }
      }
      if (!w) return false

    }

    return true
  }

  var bit_lengths = {
      '1024': { N: 160, repeat: 40 }  // 40x should give 2^-80 confidence
    , '2048': { N: 224, repeat: 56 }
    , '3072': { N: 256, repeat: 64 }
  }

  var primes = {}

  function shaBigInt(bi) {
    bi = CryptoJS.enc.Latin1.parse(HLP.bigInt2bits(bi))
    bi = CryptoJS.SHA1(bi)
    return HLP.bits2bigInt(bi.toString(CryptoJS.enc.Latin1))
  }

  function inc_(bi, TN) {
    BigInt.addInt_(bi, 1)
    BigInt.mod_(bi, TN)
  }

  function generatePrimesFIPS(bit_length) {

    var t = timer()  // for debugging

    // number of MR tests to perform
    var repeat = bit_lengths[bit_length].repeat

    var N = bit_lengths[bit_length].N
    var TN = HLP.twotothe(N)

    var n = Math.floor((bit_length - 1) / N)
    var b = (bit_length - 1) % N

    var bl4 = 4 * bit_length
    var brk = false

    var q, p, seed, u, tmp, counter, offset, k, cspo, V, W, X, LM1, c
    for (;;) {

      seed = BigInt.randBigInt(N)

      tmp = BigInt.dup(seed)
      inc_(tmp, TN)
      tmp = shaBigInt(tmp)

      u = shaBigInt(seed)
      u = HLP.bigBitWise('XOR', u, tmp)

      q = HLP.bigBitWise('OR', u, HLP.twotothe(N - 1))
      q[0] |= 1

      if (!isProbablePrime(q, repeat)) continue

      t('q')
      offset = BigInt.dup(seed)
      inc_(offset, TN)

      for (counter = 0; counter < bl4; counter++) {
        W = ZERO
        cspo = BigInt.addInt(seed, offset)

        for (k = 0; k < (n + 1); k ++) {
          inc_(offset, TN)
          V = shaBigInt(offset)
          if (k === n) V = BigInt.mod(V, HLP.twotothe(b))
          V = BigInt.mult(V, HLP.twotothe(N * k))
          W = BigInt.add(W, V)
        }

        LM1 = HLP.twotothe(bit_length - 1)
        X = BigInt.add(W, LM1)

        c = BigInt.mod(X, BigInt.mult(q, TWO))
        p = BigInt.sub(X, BigInt.sub(c, ONE))

        if (BigInt.greater(LM1, p)) continue
        if (!isProbablePrime(p, repeat)) continue

        t('p')
        primes[bit_length] = { p: p, q: q }
        brk = true
        break
      }

      if (brk) break
    }

    var h = BigInt.dup(TWO)
    var pm1 = BigInt.sub(p, ONE)
    var e = BigInt.multMod(pm1, BigInt.inverseMod(q, p), p)

    var g
    for (;;) {
      g = BigInt.powMod(h, e, p)
      if (BigInt.equals(g, ONE)) {
        h = BigInt.add(h, ONE)
        continue
      }
      primes[bit_length].g = g
      t('g')
      return
    }

    throw new Error('Unreachable!')
  }

  function generatePrimesGO(bit_length) {

    var t = timer()  // for debugging

    // number of MR tests to perform
    var repeat = bit_lengths[bit_length].repeat

    var N = bit_lengths[bit_length].N

    var LM1 = HLP.twotothe(bit_length - 1)
    var bl4 = 4 * bit_length
    var brk = false

    // go lang http://golang.org/src/pkg/crypto/dsa/dsa.go

    var q, p, rem, counter
    for (;;) {

      q = BigInt.randBigInt(N, 1)
      q[0] |= 1

      if (!isProbablePrime(q, repeat)) continue
      t('q')

      for (counter = 0; counter < bl4; counter++) {
        p = BigInt.randBigInt(bit_length, 1)
        p[0] |= 1

        rem = BigInt.mod(p, q)
        rem = BigInt.sub(rem, ONE)
        p = BigInt.sub(p, rem)

        if (BigInt.greater(LM1, p)) continue
        if (!isProbablePrime(p, repeat)) continue

        t('p')
        primes[bit_length] = { p: p, q: q }
        brk = true
        break
      }

      if (brk) break
    }

    var h = BigInt.dup(TWO)
    var pm1 = BigInt.sub(p, ONE)
    var e = BigInt.multMod(pm1, BigInt.inverseMod(q, p), p)

    var g
    for (;;) {
      g = BigInt.powMod(h, e, p)
      if (BigInt.equals(g, ONE)) {
        h = BigInt.add(h, ONE)
        continue
      }
      primes[bit_length].g = g
      t('g')
      return
    }

    throw new Error('Unreachable!')
  }

  function DSA(obj, opts) {
    if (!(this instanceof DSA)) return new DSA(obj, opts)

    // options
    opts = opts || {}

    // inherit
    if (obj) {
      var self = this
      ;['p', 'q', 'g', 'y', 'x'].forEach(function (prop) {
        self[prop] = obj[prop]
      })
      this.type = obj.type || KEY_TYPE
      return
    }

    // default to 1024
    var bit_length = parseInt(opts.bit_length ? opts.bit_length : 1024, 10)

    if (!bit_lengths[bit_length])
      throw new Error('Unsupported bit length.')

    // set primes
    if (!primes[bit_length]) {
      if (opts.fips) generatePrimesFIPS(bit_length)
      else generatePrimesGO(bit_length)
    }

    this.p = primes[bit_length].p
    this.q = primes[bit_length].q
    this.g = primes[bit_length].g

    // key type
    this.type = KEY_TYPE

    // private key
    this.x = makeRandom(ZERO, this.q)

    // public keys (p, q, g, y)
    this.y = BigInt.powMod(this.g, this.x, this.p)

    // nocache?
    if (opts.nocache) primes[bit_length] = null
  }

  DSA.prototype = {

    constructor: DSA,

    packPublic: function () {
      var str = this.type
      str += HLP.packMPI(this.p)
      str += HLP.packMPI(this.q)
      str += HLP.packMPI(this.g)
      str += HLP.packMPI(this.y)
      return str
    },

    packPrivate: function () {
      var str = this.packPublic() + HLP.packMPI(this.x)
      str = CryptoJS.enc.Latin1.parse(str)
      return str.toString(CryptoJS.enc.Base64)
    },

    sign: function (m) {
      m = CryptoJS.enc.Latin1.parse(m)  // CryptoJS.SHA1(m)
      m = BigInt.str2bigInt(m.toString(CryptoJS.enc.Hex), 16)
      var k, r = ZERO, s = ZERO
      while (BigInt.isZero(s) || BigInt.isZero(r)) {
        k = makeRandom(ZERO, this.q)
        r = BigInt.mod(BigInt.powMod(this.g, k, this.p), this.q)
        if (BigInt.isZero(r)) continue
        s = BigInt.inverseMod(k, this.q)
        s = BigInt.mult(s, BigInt.add(m, BigInt.mult(this.x, r)))
        s = BigInt.mod(s, this.q)
      }
      return [r, s]
    },

    fingerprint: function () {
      var pk = this.packPublic()
      if (this.type === KEY_TYPE) pk = pk.substring(2)
      pk = CryptoJS.enc.Latin1.parse(pk)
      return CryptoJS.SHA1(pk).toString(CryptoJS.enc.Hex)
    }

  }

  DSA.parsePublic = function (str, priv) {
    var fields = ['SHORT', 'MPI', 'MPI', 'MPI', 'MPI']
    if (priv) fields.push('MPI')
    str = HLP.splitype(fields, str)
    var obj = {
        type: str[0]
      , p: HLP.readMPI(str[1])
      , q: HLP.readMPI(str[2])
      , g: HLP.readMPI(str[3])
      , y: HLP.readMPI(str[4])
    }
    if (priv) obj.x = HLP.readMPI(str[5])
    return new DSA(obj)
  }

  function tokenizeStr(str) {
    var start, end

    start = str.indexOf("(")
    end = str.lastIndexOf(")")

    if (start < 0 || end < 0)
      throw new Error("Malformed S-Expression")

    str = str.substring(start + 1, end)

    var splt = str.search(/\s/)
    var obj = {
        type: str.substring(0, splt)
      , val: []
    }

    str = str.substring(splt + 1, end)
    start = str.indexOf("(")

    if (start < 0) obj.val.push(str)
    else {

      var i, len, ss, es
      while (start > -1) {
        i = start + 1
        len = str.length
        for (ss = 1, es = 0; i < len && es < ss; i++) {
          if (str[i] === "(") ss++
          if (str[i] === ")") es++
        }
        obj.val.push(tokenizeStr(str.substring(start, ++i)))
        str = str.substring(++i)
        start = str.indexOf("(")
      }

    }
    return obj
  }

  function parseLibotr(obj) {
    if (!obj.type) throw new Error("Parse error.")

    var o, val
    if (obj.type === "privkeys") {
      o = []
      obj.val.forEach(function (i) {
        o.push(parseLibotr(i))
      })
      return o
    }

    o = {}
    obj.val.forEach(function (i) {

      val = i.val[0]
      if (typeof val === "string") {

        if (val.indexOf("#") === 0) {
          val = val.substring(1, val.lastIndexOf("#"))
          val = BigInt.str2bigInt(val, 16)
        }

      } else {
        val = parseLibotr(i)
      }

      o[i.type] = val
    })

    return o
  }

  DSA.parsePrivate = function (str, libotr) {
    if (!libotr) {
      str = CryptoJS.enc.Base64.parse(str)
      str = str.toString(CryptoJS.enc.Latin1)
      return DSA.parsePublic(str, true)
    }
    // only returning the first key found
    return parseLibotr(tokenizeStr(str))[0]["private-key"].dsa
  }

  DSA.verify = function (key, m, r, s) {
    if (!HLP.between(r, ZERO, key.q) || !HLP.between(s, ZERO, key.q))
      return false

    var hm = CryptoJS.enc.Latin1.parse(m)  // CryptoJS.SHA1(m)
    hm = BigInt.str2bigInt(hm.toString(CryptoJS.enc.Hex), 16)

    var w = BigInt.inverseMod(s, key.q)
    var u1 = BigInt.multMod(hm, w, key.q)
    var u2 = BigInt.multMod(r, w, key.q)

    u1 = BigInt.powMod(key.g, u1, key.p)
    u2 = BigInt.powMod(key.y, u2, key.p)

    var v = BigInt.mod(BigInt.multMod(u1, u2, key.p), key.q)

    return BigInt.equals(v, r)
  }

}).call(this)
;(function () {
  "use strict";

  var root = this

  var Parse = {}, CryptoJS, CONST, HLP
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Parse
    CryptoJS = require('../vendor/crypto.js')
    CONST = require('./const.js')
    HLP = require('./helpers.js')
  } else {
    root.OTR.Parse = Parse
    CryptoJS = root.CryptoJS
    CONST = root.OTR.CONST
    HLP = root.OTR.HLP
  }

  Parse.parseMsg = function (otr, msg) {

    var ver = []

    // is this otr?
    var start = msg.indexOf(CONST.OTR_TAG)
    if (!~start) {

      // restart fragments
      this.initFragment(otr)

      // whitespace tags
      ind = msg.indexOf(CONST.WHITESPACE_TAG)

      if (~ind) {

        msg = msg.split('')
        msg.splice(ind, 16)

        var tags = {}
        tags[CONST.WHITESPACE_TAG_V2] = CONST.OTR_VERSION_2
        tags[CONST.WHITESPACE_TAG_V3] = CONST.OTR_VERSION_3

        var tag, len = msg.length
        for (; ind < len;) {
          tag = msg.slice(ind, ind + 8).join('')
          if (Object.hasOwnProperty.call(tags, tag)) {
            msg.splice(ind, 8)
            ver.push(tags[tag])
            continue
          }
          ind += 8
        }

        msg = msg.join('')

      }

      return { msg: msg, ver: ver }
    }

    var ind = start + CONST.OTR_TAG.length
    var com = msg[ind]

    // message fragment
    if (com === ',' || com === '|') {
      return this.msgFragment(otr, msg.substring(ind + 1), (com === '|'))
    }

    this.initFragment(otr)

    // query message
    if (~['?', 'v'].indexOf(com)) {

      // version 1
      if (msg[ind] === '?') {
        ver.push(CONST.OTR_VERSION_1)
        ind += 1
      }

      // other versions
      var vers = {
          '2': CONST.OTR_VERSION_2
        , '3': CONST.OTR_VERSION_3
      }
      var qs = msg.substring(ind + 1)
      var qi = qs.indexOf('?')

      if (qi >= 1) {
        qs = qs.substring(0, qi).split('')
        if (msg[ind] === 'v') {
          qs.forEach(function (q) {
            if (Object.hasOwnProperty.call(vers, q)) ver.push(vers[q])
          })
        }
      }

      return { cls: 'query', ver: ver }
    }

    // otr message
    if (com === ':') {

      ind += 1

      var info = msg.substring(ind, ind + 4)
      if (info.length < 4) return { msg: msg }
      info = CryptoJS.enc.Base64.parse(info).toString(CryptoJS.enc.Latin1)

      var version = info.substring(0, 2)
      var type = info.substring(2)

      // supporting otr versions 2 and 3
      if (!otr['ALLOW_V' + HLP.unpackSHORT(version)]) return { msg: msg }

      ind += 4

      var end = msg.substring(ind).indexOf('.')
      if (!~end) return { msg: msg }

      msg = CryptoJS.enc.Base64.parse(msg.substring(ind, ind + end))
      msg = CryptoJS.enc.Latin1.stringify(msg)

      // instance tags
      var instance_tags
      if (version === CONST.OTR_VERSION_3) {
        instance_tags = msg.substring(0, 8)
        msg = msg.substring(8)
      }

      var cls
      if (~['\x02', '\x0a', '\x11', '\x12'].indexOf(type)) {
        cls = 'ake'
      } else if (type === '\x03') {
        cls = 'data'
      }

      return {
          version: version
        , type: type
        , msg: msg
        , cls: cls
        , instance_tags: instance_tags
      }
    }

    // error message
    if (msg.substring(ind, ind + 7) === ' Error:') {
      if (otr.ERROR_START_AKE) {
        otr.sendQueryMsg()
      }
      return { msg: msg.substring(ind + 7), cls: 'error' }
    }

    return { msg: msg }
  }

  Parse.initFragment = function (otr) {
    otr.fragment = { s: '', j: 0, k: 0 }
  }

  Parse.msgFragment = function (otr, msg, v3) {

    msg = msg.split(',')

    // instance tags
    if (v3) {
      var its = msg.shift().split('|')
      var their_it = HLP.packINT(parseInt(its[0], 16))
      var our_it = HLP.packINT(parseInt(its[1], 16))
      if (otr.checkInstanceTags(their_it + our_it)) return  // ignore
    }

    if (msg.length < 4 ||
      isNaN(parseInt(msg[0], 10)) ||
      isNaN(parseInt(msg[1], 10))
    ) return

    var k = parseInt(msg[0], 10)
    var n = parseInt(msg[1], 10)
    msg = msg[2]

    if (n < k || n === 0 || k === 0) {
      this.initFragment(otr)
      return
    }

    if (k === 1) {
      this.initFragment(otr)
      otr.fragment = { k: 1, n: n, s: msg }
    } else if (n === otr.fragment.n && k === (otr.fragment.k + 1)) {
      otr.fragment.s += msg
      otr.fragment.k += 1
    } else {
      this.initFragment(otr)
    }

    if (n === k) {
      msg = otr.fragment.s
      this.initFragment(otr)
      return this.parseMsg(otr, msg)
    }

    return
  }

}).call(this)
;(function () {
  "use strict";

  var root = this

  var CryptoJS, BigInt, CONST, HLP, DSA
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AKE
    CryptoJS = require('../vendor/crypto.js')
    BigInt = require('../vendor/bigint.js')
    CONST = require('./const.js')
    HLP = require('./helpers.js')
    DSA = require('./dsa.js')
  } else {
    root.OTR.AKE = AKE
    CryptoJS = root.CryptoJS
    BigInt = root.BigInt
    CONST = root.OTR.CONST
    HLP = root.OTR.HLP
    DSA = root.DSA
  }

  // diffie-hellman modulus
  // see group 5, RFC 3526
  var N = BigInt.str2bigInt(CONST.N, 16)

  function hMac(gx, gy, pk, kid, m) {
    var pass = CryptoJS.enc.Latin1.parse(m)
    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, pass)
    hmac.update(CryptoJS.enc.Latin1.parse(HLP.packMPI(gx)))
    hmac.update(CryptoJS.enc.Latin1.parse(HLP.packMPI(gy)))
    hmac.update(CryptoJS.enc.Latin1.parse(pk))
    hmac.update(CryptoJS.enc.Latin1.parse(kid))
    return (hmac.finalize()).toString(CryptoJS.enc.Latin1)
  }

  // AKE constructor
  function AKE(otr) {
    if (!(this instanceof AKE)) return new AKE(otr)

    // otr instance
    this.otr = otr

    // our keys
    this.our_dh = otr.our_old_dh
    this.our_keyid = otr.our_keyid - 1

    // their keys
    this.their_y = null
    this.their_keyid = null
    this.their_priv_pk = null

    // state
    this.ssid = null
    this.transmittedRS = false
    this.r = null
    this.priv = otr.priv

    // bind methods
    var self = this
    ;['sendMsg'].forEach(function (meth) {
      self[meth] = self[meth].bind(self)
    })
  }

  AKE.prototype = {

    constructor: AKE,

    createKeys: function(g) {
      var s = BigInt.powMod(g, this.our_dh.privateKey, N)
      var secbytes = HLP.packMPI(s)
      this.ssid = HLP.mask(HLP.h2('\x00', secbytes), 0, 64)  // first 64-bits
      var tmp = HLP.h2('\x01', secbytes)
      this.c = HLP.mask(tmp, 0, 128)  // first 128-bits
      this.c_prime = HLP.mask(tmp, 128, 128)  // second 128-bits
      this.m1 = HLP.h2('\x02', secbytes)
      this.m2 = HLP.h2('\x03', secbytes)
      this.m1_prime = HLP.h2('\x04', secbytes)
      this.m2_prime = HLP.h2('\x05', secbytes)
    },

    verifySignMac: function (mac, aesctr, m2, c, their_y, our_dh_pk, m1, ctr) {
      // verify mac
      var vmac = HLP.makeMac(aesctr, m2)
      if (mac !== vmac) return ['MACs do not match.']

      // decrypt x
      var x = HLP.decryptAes(aesctr.substring(4), c, ctr)
      x = HLP.splitype(['PUBKEY', 'INT', 'SIG'], x.toString(CryptoJS.enc.Latin1))

      var m = hMac(their_y, our_dh_pk, x[0], x[1], m1)
      var pub = DSA.parsePublic(x[0])

      var r = HLP.bits2bigInt(x[2].substring(0, 20))
      var s = HLP.bits2bigInt(x[2].substring(20))

      // verify sign m
      if (!DSA.verify(pub, m, r, s)) return ['Cannot verify signature of m.']

      return [null, HLP.readLen(x[1]), pub]
    },

    makeM: function (their_y, m1, c, m2) {
      var pk = this.priv.packPublic()
      var kid = HLP.packINT(this.our_keyid)
      var m = hMac(this.our_dh.publicKey, their_y, pk, kid, m1)
      m = this.priv.sign(m)
      var msg = pk + kid
      msg += HLP.bigInt2bits(m[0], 20)  // pad to 20 bytes
      msg += HLP.bigInt2bits(m[1], 20)
      msg = CryptoJS.enc.Latin1.parse(msg)
      var aesctr = HLP.packData(HLP.encryptAes(msg, c, HLP.packCtr(0)))
      var mac = HLP.makeMac(aesctr, m2)
      return aesctr + mac
    },

    akeSuccess: function (version) {
      HLP.debug.call(this.otr, 'success')

      if (BigInt.equals(this.their_y, this.our_dh.publicKey))
        return this.otr.error('equal keys - we have a problem.', true)

      if ( this.their_keyid !== this.otr.their_keyid &&
           this.their_keyid !== (this.otr.their_keyid - 1) ) {

        // our keys
        this.otr.our_old_dh = this.our_dh

        // their keys
        this.otr.their_y = this.their_y
        this.otr.their_old_y = null
        this.otr.their_keyid = this.their_keyid
        this.otr.their_priv_pk = this.their_priv_pk

        // rotate keys
        this.otr.sessKeys[0] = [ new this.otr.DHSession(
            this.otr.our_dh
          , this.otr.their_y
        ), null ]
        this.otr.sessKeys[1] = [ new this.otr.DHSession(
            this.otr.our_old_dh
          , this.otr.their_y
        ), null ]

      }

      // ake info
      this.otr.ssid = this.ssid
      this.otr.transmittedRS = this.transmittedRS
      this.otr._smInit()
      this.otr_version = version

      // go encrypted
      this.otr.authstate = CONST.AUTHSTATE_NONE
      this.otr.msgstate = CONST.MSGSTATE_ENCRYPTED

      // null out values
      this.r = null
      this.myhashed = null
      this.dhcommit = null
      this.encrypted = null
      this.hashed = null

      this.otr.trigger('status', [CONST.STATUS_AKE_SUCCESS])

      // send stored msgs
      this.otr.sendStored()
    },

    handleAKE: function (msg) {
      var send, vsm, type
      var version = msg.version

      switch (msg.type) {

        case '\x02':
          HLP.debug.call(this.otr, 'd-h key message')

          msg = HLP.splitype(['DATA', 'DATA'], msg.msg)

          if (this.otr.authstate === CONST.AUTHSTATE_AWAITING_DHKEY) {
            var ourHash = HLP.readMPI(this.myhashed)
            var theirHash = HLP.readMPI(msg[1])
            if (BigInt.greater(ourHash, theirHash)) {
              type = '\x02'
              send = this.dhcommit
              break  // ignore
            } else {
              // forget
              this.our_dh = this.otr.dh()
              this.otr.authstate = CONST.AUTHSTATE_NONE
              this.r = null
              this.myhashed = null
            }
          } else if (
            this.otr.authstate === CONST.AUTHSTATE_AWAITING_SIG
          ) this.our_dh = this.otr.dh()

          this.otr.authstate = CONST.AUTHSTATE_AWAITING_REVEALSIG

          this.encrypted = msg[0].substring(4)
          this.hashed = msg[1].substring(4)

          type = '\x0a'
          send = HLP.packMPI(this.our_dh.publicKey)
          break

        case '\x0a':
          HLP.debug.call(this.otr, 'reveal signature message')

          msg = HLP.splitype(['MPI'], msg.msg)

          if (this.otr.authstate !== CONST.AUTHSTATE_AWAITING_DHKEY) {
            if (this.otr.authstate === CONST.AUTHSTATE_AWAITING_SIG) {
              if (!BigInt.equals(this.their_y, HLP.readMPI(msg[0]))) return
            } else {
              return  // ignore
            }
          }

          this.otr.authstate = CONST.AUTHSTATE_AWAITING_SIG

          this.their_y = HLP.readMPI(msg[0])

          // verify gy is legal 2 <= gy <= N-2
          if (!HLP.checkGroup(this.their_y, N))
            return this.otr.error('Illegal g^y.', true)

          this.createKeys(this.their_y)

          type = '\x11'
          send = HLP.packMPI(this.r)
          send += this.makeM(this.their_y, this.m1, this.c, this.m2)

          this.m1 = null
          this.m2 = null
          this.c = null
          break

        case '\x11':
          HLP.debug.call(this.otr, 'signature message')

          if (this.otr.authstate !== CONST.AUTHSTATE_AWAITING_REVEALSIG)
            return  // ignore

          msg = HLP.splitype(['DATA', 'DATA', 'MAC'], msg.msg)

          this.r = HLP.readMPI(msg[0])

          // decrypt their_y
          var key = CryptoJS.enc.Hex.parse(BigInt.bigInt2str(this.r, 16))
          key = CryptoJS.enc.Latin1.stringify(key)

          var gxmpi = HLP.decryptAes(this.encrypted, key, HLP.packCtr(0))
          gxmpi = gxmpi.toString(CryptoJS.enc.Latin1)

          this.their_y = HLP.readMPI(gxmpi)

          // verify hash
          var hash = CryptoJS.SHA256(CryptoJS.enc.Latin1.parse(gxmpi))

          if (this.hashed !== hash.toString(CryptoJS.enc.Latin1))
            return this.otr.error('Hashed g^x does not match.', true)

          // verify gx is legal 2 <= g^x <= N-2
          if (!HLP.checkGroup(this.their_y, N))
            return this.otr.error('Illegal g^x.', true)

          this.createKeys(this.their_y)

          vsm = this.verifySignMac(
              msg[2]
            , msg[1]
            , this.m2
            , this.c
            , this.their_y
            , this.our_dh.publicKey
            , this.m1
            , HLP.packCtr(0)
          )
          if (vsm[0]) return this.otr.error(vsm[0], true)

          // store their key
          this.their_keyid = vsm[1]
          this.their_priv_pk = vsm[2]

          send = this.makeM(
              this.their_y
            , this.m1_prime
            , this.c_prime
            , this.m2_prime
          )

          this.m1 = null
          this.m2 = null
          this.m1_prime = null
          this.m2_prime = null
          this.c = null
          this.c_prime = null

          this.sendMsg(version, '\x12', send)
          this.akeSuccess(version)
          return

        case '\x12':
          HLP.debug.call(this.otr, 'data message')

          if (this.otr.authstate !== CONST.AUTHSTATE_AWAITING_SIG)
            return  // ignore

          msg = HLP.splitype(['DATA', 'MAC'], msg.msg)

          vsm = this.verifySignMac(
              msg[1]
            , msg[0]
            , this.m2_prime
            , this.c_prime
            , this.their_y
            , this.our_dh.publicKey
            , this.m1_prime
            , HLP.packCtr(0)
          )
          if (vsm[0]) return this.otr.error(vsm[0], true)

          // store their key
          this.their_keyid = vsm[1]
          this.their_priv_pk = vsm[2]

          this.m1_prime = null
          this.m2_prime = null
          this.c_prime = null

          this.transmittedRS = true
          this.akeSuccess(version)
          return

        default:
          return  // ignore

      }

      this.sendMsg(version, type, send)
    },

    sendMsg: function (version, type, msg) {
      var send = version + type
      var v3 = (version === CONST.OTR_VERSION_3)

      // instance tags for v3
      if (v3) {
        HLP.debug.call(this.otr, 'instance tags')
        send += this.otr.our_instance_tag
        send += this.otr.their_instance_tag
      }

      send += msg

      // fragment message if necessary
      send = HLP.wrapMsg(
          send
        , this.otr.fragment_size
        , v3
        , this.otr.our_instance_tag
        , this.otr.their_instance_tag
      )
      if (send[0]) return this.otr.error(send[0])

      this.otr._sendMsg(send[1], true)
    },

    initiateAKE: function (version) {
      HLP.debug.call(this.otr, 'd-h commit message')

      this.otr.trigger('status', [CONST.STATUS_AKE_INIT])

      this.otr.authstate = CONST.AUTHSTATE_AWAITING_DHKEY

      var gxmpi = HLP.packMPI(this.our_dh.publicKey)
      gxmpi = CryptoJS.enc.Latin1.parse(gxmpi)

      this.r = HLP.randomValue()
      var key = CryptoJS.enc.Hex.parse(BigInt.bigInt2str(this.r, 16))
      key = CryptoJS.enc.Latin1.stringify(key)

      this.myhashed = CryptoJS.SHA256(gxmpi)
      this.myhashed = HLP.packData(this.myhashed.toString(CryptoJS.enc.Latin1))

      this.dhcommit = HLP.packData(HLP.encryptAes(gxmpi, key, HLP.packCtr(0)))
      this.dhcommit += this.myhashed

      this.sendMsg(version, '\x02', this.dhcommit)
    }

  }

}).call(this)
;(function () {
  "use strict";

  var root = this

  var CryptoJS, BigInt, CONST, HLP, DSA
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SM
    CryptoJS = require('../vendor/crypto.js')
    BigInt = require('../vendor/bigint.js')
    CONST = require('./const.js')
    HLP = require('./helpers.js')
    DSA = require('./dsa.js')
  } else {
    root.OTR.SM = SM
    CryptoJS = root.CryptoJS
    BigInt = root.BigInt
    CONST = root.OTR.CONST
    HLP = root.OTR.HLP
    DSA = root.DSA
  }

  // diffie-hellman modulus and generator
  // see group 5, RFC 3526
  var G = BigInt.str2bigInt(CONST.G, 10)
  var N = BigInt.str2bigInt(CONST.N, 16)

  // to calculate D's for zero-knowledge proofs
  var Q = BigInt.sub(N, BigInt.str2bigInt('1', 10))
  BigInt.divInt_(Q, 2)  // meh

  function SM(otr) {
    if (!(this instanceof SM)) return new SM(otr)

    this.otr = otr
    this.version = '1'
    this.our_fp = otr.priv.fingerprint()
    this.their_fp = otr.their_priv_pk.fingerprint()

    // initial state
    this.init()
  }

  SM.prototype = {

    // set the constructor
    // because the prototype is being replaced
    constructor: SM,

    // set the initial values
    // also used when aborting
    init: function () {
      this.smpstate = CONST.SMPSTATE_EXPECT1
      this.secret = null
    },

    makeSecret: function (our, secret) {
      var sha256 = CryptoJS.algo.SHA256.create()
      sha256.update(CryptoJS.enc.Latin1.parse(HLP.packBytes(this.version, 1)))
      sha256.update(CryptoJS.enc.Hex.parse(our ? this.our_fp : this.their_fp))
      sha256.update(CryptoJS.enc.Hex.parse(our ? this.their_fp : this.our_fp))
      sha256.update(CryptoJS.enc.Latin1.parse(this.otr.ssid))
      sha256.update(CryptoJS.enc.Latin1.parse(secret))  // utf8?
      var hash = sha256.finalize()
      this.secret = HLP.bits2bigInt(hash.toString(CryptoJS.enc.Latin1))
    },

    makeG2s: function () {
      this.a2 = HLP.randomExponent()
      this.a3 = HLP.randomExponent()
      this.g2a = BigInt.powMod(G, this.a2, N)
      this.g3a = BigInt.powMod(G, this.a3, N)
      if ( !HLP.checkGroup(this.g2a, N) ||
           !HLP.checkGroup(this.g3a, N)
      ) this.makeG2s()
    },

    computeGs: function (g2a, g3a) {
      this.g2 = BigInt.powMod(g2a, this.a2, N)
      this.g3 = BigInt.powMod(g3a, this.a3, N)
    },

    computePQ: function (r) {
      this.p = BigInt.powMod(this.g3, r, N)
      this.q = HLP.multPowMod(G, r, this.g2, this.secret, N)
    },

    computeR: function () {
      this.r = BigInt.powMod(this.QoQ, this.a3, N)
    },

    computeRab: function (r) {
      return BigInt.powMod(r, this.a3, N)
    },

    computeC: function (v, r) {
      return HLP.smpHash(v, BigInt.powMod(G, r, N))
    },

    computeD: function (r, a, c) {
      return HLP.subMod(r, BigInt.multMod(a, c, Q), Q)
    },

    // the bulk of the work
    handleSM: function (msg) {
      var send, r2, r3, r7, t1, t2, t3, t4, rab, tmp2, cR, d7, ms

      var expectStates = {
          2: CONST.SMPSTATE_EXPECT1
        , 3: CONST.SMPSTATE_EXPECT2
        , 4: CONST.SMPSTATE_EXPECT3
        , 5: CONST.SMPSTATE_EXPECT4
        , 7: CONST.SMPSTATE_EXPECT1
      }

      if (msg.type === 6) {
        this.otr.trust = false
        this.init()
        this.otr.trigger('smp', ['trust', this.otr.trust])
        return
      }

      // abort! there was an error
      if ( this.smpstate !== expectStates[msg.type] ||
           this.otr.msgstate !== CONST.MSGSTATE_ENCRYPTED
      ) return this.abort()

      switch (this.smpstate) {

        case CONST.SMPSTATE_EXPECT1:
          HLP.debug.call(this.otr, 'smp tlv 2')

          // user specified question
          var ind, question
          if (msg.type === 7) {
            ind = msg.msg.indexOf('\x00')
            question = msg.msg.substring(0, ind)
            msg.msg = msg.msg.substring(ind + 1)
          }

          // 0:g2a, 1:c2, 2:d2, 3:g3a, 4:c3, 5:d3
          ms = HLP.readLen(msg.msg.substr(0, 4))
          if (ms !== 6) return this.abort()
          msg = HLP.unpackMPIs(6, msg.msg.substring(4))

          if ( !HLP.checkGroup(msg[0], N) ||
               !HLP.checkGroup(msg[3], N)
          ) return this.abort()

          // verify znp's
          if (!HLP.ZKP(1, msg[1], HLP.multPowMod(G, msg[2], msg[0], msg[1], N)))
            return this.abort()

          if (!HLP.ZKP(2, msg[4], HLP.multPowMod(G, msg[5], msg[3], msg[4], N)))
            return this.abort()

          this.g3ao = msg[3]  // save for later

          this.makeG2s()

          // zero-knowledge proof that the exponents
          // associated with g2a & g3a are known
          r2 = HLP.randomExponent()
          r3 = HLP.randomExponent()
          this.c2 = this.computeC(3, r2)
          this.c3 = this.computeC(4, r3)
          this.d2 = this.computeD(r2, this.a2, this.c2)
          this.d3 = this.computeD(r3, this.a3, this.c3)

          this.computeGs(msg[0], msg[3])

          this.smpstate = CONST.SMPSTATE_EXPECT0

          // invoke question
          this.otr.trigger('smp', ['question', question])
          return

        case CONST.SMPSTATE_EXPECT2:
          HLP.debug.call(this.otr, 'smp tlv 3')

          // 0:g2a, 1:c2, 2:d2, 3:g3a, 4:c3, 5:d3, 6:p, 7:q, 8:cP, 9:d5, 10:d6
          ms = HLP.readLen(msg.msg.substr(0, 4))
          if (ms !== 11) return this.abort()
          msg = HLP.unpackMPIs(11, msg.msg.substring(4))

          if ( !HLP.checkGroup(msg[0], N) ||
               !HLP.checkGroup(msg[3], N) ||
               !HLP.checkGroup(msg[6], N) ||
               !HLP.checkGroup(msg[7], N)
          ) return this.abort()

          // verify znp of c3 / c3
          if (!HLP.ZKP(3, msg[1], HLP.multPowMod(G, msg[2], msg[0], msg[1], N)))
            return this.abort()

          if (!HLP.ZKP(4, msg[4], HLP.multPowMod(G, msg[5], msg[3], msg[4], N)))
            return this.abort()

          this.g3ao = msg[3]  // save for later

          this.computeGs(msg[0], msg[3])

          // verify znp of cP
          t1 = HLP.multPowMod(this.g3, msg[9], msg[6], msg[8], N)
          t2 = HLP.multPowMod(G, msg[9], this.g2, msg[10], N)
          t2 = BigInt.multMod(t2, BigInt.powMod(msg[7], msg[8], N), N)

          if (!HLP.ZKP(5, msg[8], t1, t2))
            return this.abort()

          var r4 = HLP.randomExponent()
          this.computePQ(r4)

          // zero-knowledge proof that P & Q
          // were generated according to the protocol
          var r5 = HLP.randomExponent()
          var r6 = HLP.randomExponent()
          var tmp = HLP.multPowMod(G, r5, this.g2, r6, N)
          var cP = HLP.smpHash(6, BigInt.powMod(this.g3, r5, N), tmp)
          var d5 = this.computeD(r5, r4, cP)
          var d6 = this.computeD(r6, this.secret, cP)

          // store these
          this.QoQ = HLP.divMod(this.q, msg[7], N)
          this.PoP = HLP.divMod(this.p, msg[6], N)

          this.computeR()

          // zero-knowledge proof that R
          // was generated according to the protocol
          r7 = HLP.randomExponent()
          tmp2 = BigInt.powMod(this.QoQ, r7, N)
          cR = HLP.smpHash(7, BigInt.powMod(G, r7, N), tmp2)
          d7 = this.computeD(r7, this.a3, cR)

          this.smpstate = CONST.SMPSTATE_EXPECT4

          send = HLP.packINT(8) + HLP.packMPIs([
              this.p
            , this.q
            , cP
            , d5
            , d6
            , this.r
            , cR
            , d7
          ])

          // TLV
          send = HLP.packTLV(4, send)
          break

        case CONST.SMPSTATE_EXPECT3:
          HLP.debug.call(this.otr, 'smp tlv 4')

          // 0:p, 1:q, 2:cP, 3:d5, 4:d6, 5:r, 6:cR, 7:d7
          ms = HLP.readLen(msg.msg.substr(0, 4))
          if (ms !== 8) return this.abort()
          msg = HLP.unpackMPIs(8, msg.msg.substring(4))

          if ( !HLP.checkGroup(msg[0], N) ||
               !HLP.checkGroup(msg[1], N) ||
               !HLP.checkGroup(msg[5], N)
          ) return this.abort()

          // verify znp of cP
          t1 = HLP.multPowMod(this.g3, msg[3], msg[0], msg[2], N)
          t2 = HLP.multPowMod(G, msg[3], this.g2, msg[4], N)
          t2 = BigInt.multMod(t2, BigInt.powMod(msg[1], msg[2], N), N)

          if (!HLP.ZKP(6, msg[2], t1, t2))
            return this.abort()

          // verify znp of cR
          t3 = HLP.multPowMod(G, msg[7], this.g3ao, msg[6], N)
          this.QoQ = HLP.divMod(msg[1], this.q, N)  // save Q over Q
          t4 = HLP.multPowMod(this.QoQ, msg[7], msg[5], msg[6], N)

          if (!HLP.ZKP(7, msg[6], t3, t4))
            return this.abort()

          this.computeR()

          // zero-knowledge proof that R
          // was generated according to the protocol
          r7 = HLP.randomExponent()
          tmp2 = BigInt.powMod(this.QoQ, r7, N)
          cR = HLP.smpHash(8, BigInt.powMod(G, r7, N), tmp2)
          d7 = this.computeD(r7, this.a3, cR)

          rab = this.computeRab(msg[5])

          if (!BigInt.equals(rab, HLP.divMod(msg[0], this.p, N)))
            return this.abort()

          send = HLP.packINT(3) + HLP.packMPIs([ this.r, cR, d7 ])

          // TLV
          send = HLP.packTLV(5, send)

          this.otr.trust = true
          this.init()
          this.otr.trigger('smp', ['trust', this.otr.trust])
          break

        case CONST.SMPSTATE_EXPECT4:
          HLP.debug.call(this.otr, 'smp tlv 5')

          // 0:r, 1:cR, 2:d7
          ms = HLP.readLen(msg.msg.substr(0, 4))
          if (ms !== 3) return this.abort()
          msg = HLP.unpackMPIs(3, msg.msg.substring(4))

          if (!HLP.checkGroup(msg[0], N)) return this.abort()

          // verify znp of cR
          t3 = HLP.multPowMod(G, msg[2], this.g3ao, msg[1], N)
          t4 = HLP.multPowMod(this.QoQ, msg[2], msg[0], msg[1], N)
          if (!HLP.ZKP(8, msg[1], t3, t4))
            return this.abort()

          rab = this.computeRab(msg[0])

          if (!BigInt.equals(rab, this.PoP))
            return this.abort()

          this.otr.trust = true
          this.init()
          this.otr.trigger('smp', ['trust', this.otr.trust])
          return

      }

      this.sendMsg(send)
    },

    // send a message
    sendMsg: function (send) {
      this.otr._sendMsg('\x00' + send)
    },

    rcvSecret: function (secret, question) {
      HLP.debug.call(this.otr, 'receive secret')

      this.otr.trigger('status', [CONST.STATUS_SMP_SECRET])

      if (this.otr.msgstate !== CONST.MSGSTATE_ENCRYPTED)
        return this.otr.error('Not ready to send encrypted messages.')

      var fn, our = false
      if (this.smpstate === CONST.SMPSTATE_EXPECT0) {
        fn = this.answer
      } else {
        fn = this.initiate
        our = true
      }

      this.makeSecret(our, secret)
      fn.call(this, question)
    },

    answer: function () {
      HLP.debug.call(this.otr, 'smp answer')

      this.otr.trigger('status', [CONST.STATUS_SMP_ANSWER])

      var r4 = HLP.randomExponent()
      this.computePQ(r4)

      // zero-knowledge proof that P & Q
      // were generated according to the protocol
      var r5 = HLP.randomExponent()
      var r6 = HLP.randomExponent()
      var tmp = HLP.multPowMod(G, r5, this.g2, r6, N)
      var cP = HLP.smpHash(5, BigInt.powMod(this.g3, r5, N), tmp)
      var d5 = this.computeD(r5, r4, cP)
      var d6 = this.computeD(r6, this.secret, cP)

      this.smpstate = CONST.SMPSTATE_EXPECT3

      var send = HLP.packINT(11) + HLP.packMPIs([
          this.g2a
        , this.c2
        , this.d2
        , this.g3a
        , this.c3
        , this.d3
        , this.p
        , this.q
        , cP
        , d5
        , d6
      ])

      this.sendMsg(HLP.packTLV(3, send))
    },

    initiate: function (question) {
      HLP.debug.call(this.otr, 'smp initiate')

      this.otr.trigger('status', [CONST.STATUS_SMP_INIT])

      if (this.smpstate !== CONST.SMPSTATE_EXPECT1)
        this.abort()  // abort + restart

      this.makeG2s()

      // zero-knowledge proof that the exponents
      // associated with g2a & g3a are known
      var r2 = HLP.randomValue()
      var r3 = HLP.randomValue()
      this.c2 = this.computeC(1, r2)
      this.c3 = this.computeC(2, r3)
      this.d2 = this.computeD(r2, this.a2, this.c2)
      this.d3 = this.computeD(r3, this.a3, this.c3)

      // set the next expected state
      this.smpstate = CONST.SMPSTATE_EXPECT2

      var send = ''
      var type = 2

      if (question) {
        send += question
        send += '\x00'
        type = 7
      }

      send += HLP.packINT(6) + HLP.packMPIs([
          this.g2a
        , this.c2
        , this.d2
        , this.g3a
        , this.c3
        , this.d3
      ])

      this.sendMsg(HLP.packTLV(type, send))
    },

    abort: function () {
      this.otr.trust = false
      this.init()
      this.sendMsg(HLP.packTLV(6, ''))
      this.otr.trigger('smp', ['trust', this.otr.trust])
    }

  }

}).call(this)
;(function () {
  "use strict";

  var root = this

  var CryptoJS, BigInt, EventEmitter, CONST, HLP, Parse, AKE, SM, DSA
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = OTR
    CryptoJS = require('../vendor/crypto.js')
    BigInt = require('../vendor/bigint.js')
    EventEmitter = require('../vendor/eventemitter.js').EventEmitter
    CONST = require('./const.js')
    HLP = require('./helpers.js')
    Parse = require('./parse.js')
    AKE = require('./ake.js')
    SM = require('./sm.js')
    DSA = require('./dsa.js')
    // expose CONST for consistency with docs
    OTR.CONST = CONST
  } else {
    // copy over and expose internals
    Object.keys(root.OTR).forEach(function (k) {
      OTR[k] = root.OTR[k]
    })
    root.OTR = OTR
    CryptoJS = root.CryptoJS
    BigInt = root.BigInt
    EventEmitter = root.EventEmitter
    CONST = OTR.CONST
    HLP = OTR.HLP
    Parse = OTR.Parse
    AKE = OTR.AKE
    SM = OTR.SM
    DSA = root.DSA
  }

  // diffie-hellman modulus and generator
  // see group 5, RFC 3526
  var G = BigInt.str2bigInt(CONST.G, 10)
  var N = BigInt.str2bigInt(CONST.N, 16)

  // JavaScript integers
  var MAX_INT = Math.pow(2, 53) - 1  // doubles
  var MAX_UINT = Math.pow(2, 31) - 1  // bitwise operators

  // OTR contructor
  function OTR(options) {
    if (!(this instanceof OTR)) return new OTR(options)

    // options
    options = options || {}

    // private keys
    if (options.priv && !(options.priv instanceof DSA))
      throw new Error('Requires long-lived DSA key.')

    this.priv = options.priv ? options.priv : new DSA()

    this.fragment_size = options.fragment_size || 0
    if (!(this.fragment_size >= 0))
      throw new Error('Fragment size must be a positive integer.')

    this.send_interval = options.send_interval || 0
    if (!(this.send_interval >= 0))
      throw new Error('Send interval must be a positive integer.')

    this.outgoing = []

    // instance tag
    this.our_instance_tag = options.instance_tag || OTR.makeInstanceTag()

    // debug
    this.debug = !!options.debug

    // init vals
    this.init()

    // bind methods
    var self = this
    ;['sendMsg', 'receiveMsg'].forEach(function (meth) {
      self[meth] = self[meth].bind(self)
    })

    EventEmitter.call(this)
  }

  // inherit from EE
  HLP.extend(OTR, EventEmitter)

  // add to prototype
  OTR.prototype.init = function () {

    this.msgstate = CONST.MSGSTATE_PLAINTEXT
    this.authstate = CONST.AUTHSTATE_NONE

    this.ALLOW_V2 = true
    this.ALLOW_V3 = true

    this.REQUIRE_ENCRYPTION = false
    this.SEND_WHITESPACE_TAG = false
    this.WHITESPACE_START_AKE = false
    this.ERROR_START_AKE = false

    Parse.initFragment(this)

    // their keys
    this.their_y = null
    this.their_old_y = null
    this.their_keyid = 0
    this.their_priv_pk = null
    this.their_instance_tag = '\x00\x00\x00\x00'

    // our keys
    this.our_dh = this.dh()
    this.our_old_dh = this.dh()
    this.our_keyid = 2

    // session keys
    this.sessKeys = [ new Array(2), new Array(2) ]

    // saved
    this.storedMgs = []
    this.oldMacKeys = []

    // smp
    this.sm = null  // initialized after AKE
    this.trust = false  // will be true after successful smp

    // when ake is complete
    // save their keys and the session
    this._akeInit()

    // receive plaintext message since switching to plaintext
    // used to decide when to stop sending pt tags when SEND_WHITESPACE_TAG
    this.receivedPlaintext = false

  }

  OTR.prototype._akeInit = function () {
    this.ake = new AKE(this)
    this.transmittedRS = false
    this.ssid = null
  }

  OTR.prototype._smInit = function () {
    this.sm = new SM(this)
  }

  OTR.prototype.io = function (msg) {

    // buffer
    this.outgoing = this.outgoing.concat(msg)

    var self = this
    ;(function send(first) {
      if (!first) {
        if (!self.outgoing.length) return
        var msg = self.outgoing.shift()
        self.trigger('io', [msg])
      }
      setTimeout(send, first ? 0 : self.send_interval)
    }(true))

  }

  OTR.prototype.dh = function dh() {
    var keys = { privateKey: BigInt.randBigInt(320) }
    keys.publicKey = BigInt.powMod(G, keys.privateKey, N)
    return keys
  }

  // session constructor
  OTR.prototype.DHSession = function DHSession(our_dh, their_y) {
    if (!(this instanceof DHSession)) return new DHSession(our_dh, their_y)

    // shared secret
    var s = BigInt.powMod(their_y, our_dh.privateKey, N)
    var secbytes = HLP.packMPI(s)

    // session id
    this.id = HLP.mask(HLP.h2('\x00', secbytes), 0, 64)  // first 64-bits

    // are we the high or low end of the connection?
    var sq = BigInt.greater(our_dh.publicKey, their_y)
    var sendbyte = sq ? '\x01' : '\x02'
    var rcvbyte  = sq ? '\x02' : '\x01'

    // sending and receiving keys
    this.sendenc = HLP.mask(HLP.h1(sendbyte, secbytes), 0, 128)  // f16 bytes
    this.sendmac = CryptoJS.SHA1(CryptoJS.enc.Latin1.parse(this.sendenc))
    this.sendmac = this.sendmac.toString(CryptoJS.enc.Latin1)
    this.sendmacused = false
    this.rcvenc = HLP.mask(HLP.h1(rcvbyte, secbytes), 0, 128)
    this.rcvmac = CryptoJS.SHA1(CryptoJS.enc.Latin1.parse(this.rcvenc))
    this.rcvmac = this.rcvmac.toString(CryptoJS.enc.Latin1)
    this.rcvmacused = false

    // extra symmetric key
    this.extra_symkey = HLP.h2('\xff', secbytes)

    // counters
    this.send_counter = 0
    this.rcv_counter = 0
  }

  OTR.prototype.rotateOurKeys = function () {

    // reveal old mac keys
    var self = this
    this.sessKeys[1].forEach(function (sk) {
      if (sk && sk.sendmacused) self.oldMacKeys.push(sk.sendmac)
      if (sk && sk.rcvmacused) self.oldMacKeys.push(sk.rcvmac)
    })

    // rotate our keys
    this.our_old_dh = this.our_dh
    this.our_dh = this.dh()
    this.our_keyid += 1

    this.sessKeys[1][0] = this.sessKeys[0][0]
    this.sessKeys[1][1] = this.sessKeys[0][1]
    this.sessKeys[0] = [
        this.their_y ?
            new this.DHSession(this.our_dh, this.their_y) : null
      , this.their_old_y ?
            new this.DHSession(this.our_dh, this.their_old_y) : null
    ]

  }

  OTR.prototype.rotateTheirKeys = function (their_y) {

    // increment their keyid
    this.their_keyid += 1

    // reveal old mac keys
    var self = this
    this.sessKeys.forEach(function (sk) {
      if (sk[1] && sk[1].sendmacused) self.oldMacKeys.push(sk[1].sendmac)
      if (sk[1] && sk[1].rcvmacused) self.oldMacKeys.push(sk[1].rcvmac)
    })

    // rotate their keys / session
    this.their_old_y = this.their_y
    this.sessKeys[0][1] = this.sessKeys[0][0]
    this.sessKeys[1][1] = this.sessKeys[1][0]

    // new keys / sessions
    this.their_y = their_y
    this.sessKeys[0][0] = new this.DHSession(this.our_dh, this.their_y)
    this.sessKeys[1][0] = new this.DHSession(this.our_old_dh, this.their_y)

  }

  OTR.prototype.prepareMsg = function (msg, esk) {
    if (this.msgstate !== CONST.MSGSTATE_ENCRYPTED || this.their_keyid === 0)
      return this.error('Not ready to encrypt.')

    var sessKeys = this.sessKeys[1][0]

    if (sessKeys.send_counter >= MAX_INT)
      return this.error('Should have rekeyed by now.')

    sessKeys.send_counter += 1

    var ctr = HLP.packCtr(sessKeys.send_counter)

    var send = this.ake.otr_version + '\x03'  // version and type
    var v3 = (this.ake.otr_version === CONST.OTR_VERSION_3)

    if (v3) {
      send += this.our_instance_tag
      send += this.their_instance_tag
    }

    send += '\x00'  // flag
    send += HLP.packINT(this.our_keyid - 1)
    send += HLP.packINT(this.their_keyid)
    send += HLP.packMPI(this.our_dh.publicKey)
    send += ctr.substring(0, 8)

    if (Math.ceil(msg.length / 8) >= MAX_UINT)  // * 16 / 128
      return this.error('Message is too long.')

    var aes = HLP.encryptAes(
        CryptoJS.enc.Latin1.parse(msg)
      , sessKeys.sendenc
      , ctr
    )

    send += HLP.packData(aes)
    send += HLP.make1Mac(send, sessKeys.sendmac)
    send += HLP.packData(this.oldMacKeys.splice(0).join(''))

    sessKeys.sendmacused = true

    send = HLP.wrapMsg(
        send
      , this.fragment_size
      , v3
      , this.our_instance_tag
      , this.their_instance_tag
    )
    if (send[0]) return this.error(send[0])

    // emit extra symmetric key
    if (esk) this.trigger('file', ['send', sessKeys.extra_symkey, esk])

    return send[1]
  }

  OTR.prototype.handleDataMsg = function (msg) {
    var vt = msg.version + msg.type

    if (this.ake.otr_version === CONST.OTR_VERSION_3)
      vt += msg.instance_tags

    var types = ['BYTE', 'INT', 'INT', 'MPI', 'CTR', 'DATA', 'MAC', 'DATA']
    msg = HLP.splitype(types, msg.msg)

    // ignore flag
    var ign = (msg[0] === '\x01')

    if (this.msgstate !== CONST.MSGSTATE_ENCRYPTED || msg.length !== 8) {
      if (!ign) this.error('Received an unreadable encrypted message.', true)
      return
    }

    var our_keyid = this.our_keyid - HLP.readLen(msg[2])
    var their_keyid = this.their_keyid - HLP.readLen(msg[1])

    if (our_keyid < 0 || our_keyid > 1) {
      if (!ign) this.error('Not of our latest keys.', true)
      return
    }

    if (their_keyid < 0 || their_keyid > 1) {
      if (!ign) this.error('Not of your latest keys.', true)
      return
    }

    var their_y = their_keyid ? this.their_old_y : this.their_y

    if (their_keyid === 1 && !their_y) {
      if (!ign) this.error('Do not have that key.')
      return
    }

    var sessKeys = this.sessKeys[our_keyid][their_keyid]

    var ctr = HLP.unpackCtr(msg[4])
    if (ctr <= sessKeys.rcv_counter) {
      if (!ign) this.error('Counter in message is not larger.')
      return
    }
    sessKeys.rcv_counter = ctr

    // verify mac
    vt += msg.slice(0, 6).join('')
    var vmac = HLP.make1Mac(vt, sessKeys.rcvmac)

    if (msg[6] !== vmac) {
      if (!ign) this.error('MACs do not match.')
      return
    }
    sessKeys.rcvmacused = true

    var out = HLP.decryptAes(
        msg[5].substring(4)
      , sessKeys.rcvenc
      , HLP.padCtr(msg[4])
    )
    out = out.toString(CryptoJS.enc.Latin1)

    if (!our_keyid) this.rotateOurKeys()
    if (!their_keyid) this.rotateTheirKeys(HLP.readMPI(msg[3]))

    // parse TLVs
    var ind = out.indexOf('\x00')
    if (~ind) {
      this.handleTLVs(out.substring(ind + 1), sessKeys)
      out = out.substring(0, ind)
    }

    out = CryptoJS.enc.Latin1.parse(out)
    return out.toString(CryptoJS.enc.Utf8)
  }

  OTR.prototype.handleTLVs = function (tlvs, sessKeys) {
    var type, len, msg
    for (; tlvs.length; ) {
      type = HLP.unpackSHORT(tlvs.substr(0, 2))
      len = HLP.unpackSHORT(tlvs.substr(2, 2))

      msg = tlvs.substr(4, len)

      // TODO: handle pathological cases better
      if (msg.length < len) break

      switch (type) {
        case 1:
          // Disconnected
          this.msgstate = CONST.MSGSTATE_FINISHED
          this.trigger('status', [CONST.STATUS_END_OTR])
          break
        case 2: case 3: case 4:
        case 5: case 6: case 7:
          // SMP
          this.sm.handleSM({ msg: msg, type: type })
          break
        case 8:
          // utf8 filenames
          msg = msg.substring(4) // remove 4-byte indication
          msg = CryptoJS.enc.Latin1.parse(msg)
          msg = msg.toString(CryptoJS.enc.Utf8)

          // Extra Symkey
          this.trigger('file', ['receive', sessKeys.extra_symkey, msg])
          break
      }

      tlvs = tlvs.substring(4 + len)
    }
  }

  OTR.prototype.smpSecret = function (secret, question) {
    if (this.msgstate !== CONST.MSGSTATE_ENCRYPTED)
      return this.error('Must be encrypted for SMP.')

    if (typeof secret !== 'string' || secret.length < 1)
      return this.error('Secret is required.')

    this.sm.rcvSecret(secret, question)
  }

  OTR.prototype.sendQueryMsg = function () {
    var versions = {}
      , msg = CONST.OTR_TAG

    if (this.ALLOW_V2) versions['2'] = true
    if (this.ALLOW_V3) versions['3'] = true

    // but we don't allow v1
    // if (versions['1']) msg += '?'

    var vs = Object.keys(versions)
    if (vs.length) {
      msg += 'v'
      vs.forEach(function (v) {
        if (v !== '1') msg += v
      })
      msg += '?'
    }

    this._sendMsg(msg, true)
    this.trigger('status', [CONST.STATUS_SEND_QUERY])
  }

  OTR.prototype.sendMsg = function (msg) {
    if ( this.REQUIRE_ENCRYPTION ||
         this.msgstate !== CONST.MSGSTATE_PLAINTEXT
    ) {
      msg = CryptoJS.enc.Utf8.parse(msg)
      msg = msg.toString(CryptoJS.enc.Latin1)
    }
    this._sendMsg(msg)
  }

  OTR.prototype._sendMsg = function (msg, internal) {
    if (!internal) {  // a user or sm msg

      switch (this.msgstate) {
        case CONST.MSGSTATE_PLAINTEXT:
          if (this.REQUIRE_ENCRYPTION) {
            this.storedMgs.push(msg)
            this.sendQueryMsg()
            return
          }
          if (this.SEND_WHITESPACE_TAG && !this.receivedPlaintext) {
            msg += CONST.WHITESPACE_TAG  // 16 byte tag
            if (this.ALLOW_V3) msg += CONST.WHITESPACE_TAG_V3
            if (this.ALLOW_V2) msg += CONST.WHITESPACE_TAG_V2
          }
          break
        case CONST.MSGSTATE_FINISHED:
          this.storedMgs.push(msg)
          this.error('Message cannot be sent at this time.')
          return
        default:
          msg = this.prepareMsg(msg)
      }

    }
    if (msg) this.io(msg)
  }

  OTR.prototype.receiveMsg = function (msg) {

    // parse type
    msg = Parse.parseMsg(this, msg)

    if (!msg) return

    switch (msg.cls) {
      case 'error':
        this.error(msg.msg)
        return
      case 'ake':
        if ( msg.version === CONST.OTR_VERSION_3 &&
          this.checkInstanceTags(msg.instance_tags)
        ) return  // ignore
        this.ake.handleAKE(msg)
        return
      case 'data':
        if ( msg.version === CONST.OTR_VERSION_3 &&
          this.checkInstanceTags(msg.instance_tags)
        ) return  // ignore
        msg.msg = this.handleDataMsg(msg)
        break
      case 'query':
        if (this.msgstate === CONST.MSGSTATE_ENCRYPTED) this._akeInit()
        this.doAKE(msg)
        break
      default:
        // check for encrypted
        if ( this.REQUIRE_ENCRYPTION ||
             this.msgstate !== CONST.MSGSTATE_PLAINTEXT
        ) this.error('Received an unencrypted message.')

        // received a plaintext message
        // stop sending the whitespace tag
        this.receivedPlaintext = true

        // received a whitespace tag
        if (this.WHITESPACE_START_AKE) this.doAKE(msg)
    }

    if (msg.msg) this.trigger('ui', [msg.msg])
  }

  OTR.prototype.checkInstanceTags = function (it) {
    var their_it = HLP.readLen(it.substr(0, 4))
    var our_it = HLP.readLen(it.substr(4, 4))

    if (our_it && our_it !== HLP.readLen(this.our_instance_tag))
      return true

    if (HLP.readLen(this.their_instance_tag)) {
      if (HLP.readLen(this.their_instance_tag) !== their_it) return true
    } else {
      if (their_it < 100) return true
      this.their_instance_tag = HLP.packINT(their_it)
    }
  }

  OTR.prototype.doAKE = function (msg) {
    if (this.ALLOW_V3 && ~msg.ver.indexOf(CONST.OTR_VERSION_3)) {
      this.ake.initiateAKE(CONST.OTR_VERSION_3)
    } else if (this.ALLOW_V2 && ~msg.ver.indexOf(CONST.OTR_VERSION_2)) {
      this.ake.initiateAKE(CONST.OTR_VERSION_2)
    } else {
      // is this an error?
      this.error('OTR conversation requested, ' +
        'but no compatible protocol version found.')
    }
  }

  OTR.prototype.error = function (err, send) {
    if (send) {
      if (!this.debug) err = "An OTR error has occurred."
      err = '?OTR Error:' + err
      this._sendMsg(err, true)
      return
    }
    this.trigger('error', [err])
  }

  OTR.prototype.sendStored = function () {
    var self = this
    ;(this.storedMgs.splice(0)).forEach(function (msg) {
      self._sendMsg(msg)
    })
  }

  OTR.prototype.sendFile = function (filename) {
    if (this.msgstate !== CONST.MSGSTATE_ENCRYPTED)
      return this.error('Not ready to encrypt.')

    if (this.ake.otr_version !== CONST.OTR_VERSION_3)
      return this.error('Protocol v3 required.')

    if (!filename) return this.error('Please specify a filename.')

    // utf8 filenames
    var l1name = CryptoJS.enc.Utf8.parse(filename)
    l1name = l1name.toString(CryptoJS.enc.Latin1)

    if (l1name.length >= 65532) return this.error('filename is too long.')

    var msg = '\x00'  // null byte
    msg += '\x00\x08'  // type 8 tlv
    msg += HLP.packSHORT(4 + l1name.length)  // length of value
    msg += '\x00\x00\x00\x01'  // four bytes indicating file
    msg += l1name

    msg = this.prepareMsg(msg, filename)
    if (msg) this._sendMsg(msg, true)
  }

  OTR.prototype.endOtr = function () {
    if (this.msgstate === CONST.MSGSTATE_ENCRYPTED) {
      this.sendMsg('\x00\x00\x01\x00\x00')
      this.sm = null
    }
    this.msgstate = CONST.MSGSTATE_PLAINTEXT
    this.receivedPlaintext = false
    this.trigger('status', [CONST.STATUS_END_OTR])
  }

  // attach methods

  OTR.makeInstanceTag = function () {
    var num = BigInt.randBigInt(32)
    if (BigInt.greater(BigInt.str2bigInt('100', 16), num))
      return OTR.makeInstanceTag()
    return HLP.packINT(parseInt(BigInt.bigInt2str(num, 10), 10))
  }

}).call(this)

  return {
      OTR: root.OTR
    , DSA: root.DSA
  }

}));(function(exports){
  //TODO: let otr fingerprints be accessed from the socket
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

  function debug(a,b) {
    // console.log(a,b);
  }

  // chromium/src/net/base/net_error_list.h;
  (function() {
    function NET_ERROR(str, code) {
      util._errorMap[code] = str;
    }

    // Copyright (c) 2012 The Chromium Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.

    // This file intentionally does not have header guards', it's included
    // inside a macro to generate enum values.

    // This file contains the list of network errors.

    //
    // Ranges:
    //     0- 99 System related errors
    //   100-199 Connection related errors
    //   200-299 Certificate errors
    //   300-399 HTTP errors
    //   400-499 Cache errors
    //   500-599 ?
    //   600-699 FTP errors
    //   700-799 Certificate manager errors
    //   800-899 DNS resolver errors

    // An asynchronous IO operation is not yet complete.  This usually does not
    // indicate a fatal error.  Typically this error will be generated as a
    // notification to wait for some external notification that the IO operation
    // finally completed.  
    NET_ERROR('IO_PENDING', -1);

    // A generic failure occurred.
    NET_ERROR('FAILED', -2);

    // An operation was aborted (due to user action).
    NET_ERROR('ABORTED', -3);

    // An argument to the function is incorrect.
    NET_ERROR('INVALID_ARGUMENT', -4);

    // The handle or file descriptor is invalid.
    NET_ERROR('INVALID_HANDLE', -5);

    // The file or directory cannot be found.
    NET_ERROR('FILE_NOT_FOUND', -6);

    // An operation timed out.
    NET_ERROR('TIMED_OUT', -7);

    // The file is too large.
    NET_ERROR('FILE_TOO_BIG', -8);

    // An unexpected error.  This may be caused by a programming mistake or an
    // invalid assumption.
    NET_ERROR('UNEXPECTED', -9);

    // Permission to access a resource, other than the network, was denied.
    NET_ERROR('ACCESS_DENIED', -10);

    // The operation failed because of unimplemented functionality.
    NET_ERROR('NOT_IMPLEMENTED', -11);

    // There were not enough resources to complete the operation.
    NET_ERROR('INSUFFICIENT_RESOURCES', -12);

    // Memory allocation failed.
    NET_ERROR('OUT_OF_MEMORY', -13);

    // The file upload failed because the file's modification time was different
    // from the expectation.
    NET_ERROR('UPLOAD_FILE_CHANGED', -14);

    // The socket is not connected.
    NET_ERROR('SOCKET_NOT_CONNECTED', -15);

    // The file already exists.
    NET_ERROR('FILE_EXISTS', -16);

    // The path or file name is too long.
    NET_ERROR('FILE_PATH_TOO_LONG', -17);

    // Not enough room left on the disk.
    NET_ERROR('FILE_NO_SPACE', -18);

    // The file has a virus.
    NET_ERROR('FILE_VIRUS_INFECTED', -19);

    // The client chose to block the request.
    NET_ERROR('BLOCKED_BY_CLIENT', -20);

    // The network changed.
    NET_ERROR('NETWORK_CHANGED', -21);

    // The request was blocked by the URL blacklist configured by the domain
    // administrator.
    NET_ERROR('BLOCKED_BY_ADMINISTRATOR', -22);

    // The socket is already connected.
    NET_ERROR('SOCKET_IS_CONNECTED', -23);

    // A connection was closed (corresponding to a TCP FIN).
    NET_ERROR('CONNECTION_CLOSED', -100);

    // A connection was reset (corresponding to a TCP RST).
    NET_ERROR('CONNECTION_RESET', -101);

    // A connection attempt was refused.
    NET_ERROR('CONNECTION_REFUSED', -102);

    // A connection timed out as a result of not receiving an ACK for data sent.
    // This can include a FIN packet that did not get ACK'd.
    NET_ERROR('CONNECTION_ABORTED', -103);

    // A connection attempt failed.
    NET_ERROR('CONNECTION_FAILED', -104);

    // The host name could not be resolved.
    NET_ERROR('NAME_NOT_RESOLVED', -105);

    // The Internet connection has been lost.
    NET_ERROR('INTERNET_DISCONNECTED', -106);

    // An SSL protocol error occurred.
    NET_ERROR('SSL_PROTOCOL_ERROR', -107);

    // The IP address or port number is invalid (e.g., cannot connect to the IP
    // address 0 or the port 0).
    NET_ERROR('ADDRESS_INVALID', -108);

    // The IP address is unreachable.  This usually means that there is no route to
    // the specified host or network.
    NET_ERROR('ADDRESS_UNREACHABLE', -109);

    // The server requested a client certificate for SSL client authentication.
    NET_ERROR('SSL_CLIENT_AUTH_CERT_NEEDED', -110);

    // A tunnel connection through the proxy could not be established.
    NET_ERROR('TUNNEL_CONNECTION_FAILED', -111);

    // No SSL protocol versions are enabled.
    NET_ERROR('NO_SSL_VERSIONS_ENABLED', -112);

    // The client and server don't support a common SSL protocol version or
    // cipher suite.
    NET_ERROR('SSL_VERSION_OR_CIPHER_MISMATCH', -113);

    // The server requested a renegotiation (rehandshake).
    NET_ERROR('SSL_RENEGOTIATION_REQUESTED', -114);

    // The proxy requested authentication (for tunnel establishment) with an
    // unsupported method.
    NET_ERROR('PROXY_AUTH_UNSUPPORTED', -115);

    // During SSL renegotiation (rehandshake), the server sent a certificate with
    // an error.
    //
    // Note: this error is not in the -2xx range so that it won't be handled as a
    // certificate error.
    NET_ERROR('CERT_ERROR_IN_SSL_RENEGOTIATION', -116);

    // The SSL handshake failed because of a bad or missing client certificate.
    NET_ERROR('BAD_SSL_CLIENT_AUTH_CERT', -117);

    // A connection attempt timed out.
    NET_ERROR('CONNECTION_TIMED_OUT', -118);

    // There are too many pending DNS resolves, so a request in the queue was
    // aborted.
    NET_ERROR('HOST_RESOLVER_QUEUE_TOO_LARGE', -119);

    // Failed establishing a connection to the SOCKS proxy server for a target host.
    NET_ERROR('SOCKS_CONNECTION_FAILED', -120);

    // The SOCKS proxy server failed establishing connection to the target host
    // because that host is unreachable.
    NET_ERROR('SOCKS_CONNECTION_HOST_UNREACHABLE', -121);

    // The request to negotiate an alternate protocol failed.
    NET_ERROR('NPN_NEGOTIATION_FAILED', -122);

    // The peer sent an SSL no_renegotiation alert message.
    NET_ERROR('SSL_NO_RENEGOTIATION', -123);

    // Winsock sometimes reports more data written than passed.  This is probably
    // due to a broken LSP.
    NET_ERROR('WINSOCK_UNEXPECTED_WRITTEN_BYTES', -124);

    // An SSL peer sent us a fatal decompression_failure alert. This typically
    // occurs when a peer selects DEFLATE compression in the mistaken belief that
    // it supports it.
    NET_ERROR('SSL_DECOMPRESSION_FAILURE_ALERT', -125);

    // An SSL peer sent us a fatal bad_record_mac alert. This has been observed
    // from servers with buggy DEFLATE support.
    NET_ERROR('SSL_BAD_RECORD_MAC_ALERT', -126);

    // The proxy requested authentication (for tunnel establishment).
    NET_ERROR('PROXY_AUTH_REQUESTED', -127);

    // A known TLS strict server didn't offer the renegotiation extension.
    NET_ERROR('SSL_UNSAFE_NEGOTIATION', -128);

    // The SSL server attempted to use a weak ephemeral Diffie-Hellman key.
    NET_ERROR('SSL_WEAK_SERVER_EPHEMERAL_DH_KEY', -129);

    // Could not create a connection to the proxy server. An error occurred
    // either in resolving its name, or in connecting a socket to it.
    // Note that this does NOT include failures during the actual "CONNECT" method
    // of an HTTP proxy.
    NET_ERROR('PROXY_CONNECTION_FAILED', -130);

    // A mandatory proxy configuration could not be used. Currently this means
    // that a mandatory PAC script could not be fetched, parsed or executed.
    NET_ERROR('MANDATORY_PROXY_CONFIGURATION_FAILED', -131);

    // -132 was formerly ERR_ESET_ANTI_VIRUS_SSL_INTERCEPTION

    // We've hit the max socket limit for the socket pool while preconnecting.  We
    // don't bother trying to preconnect more sockets.
    NET_ERROR('PRECONNECT_MAX_SOCKET_LIMIT', -133);

    // The permission to use the SSL client certificate's private key was denied.
    NET_ERROR('SSL_CLIENT_AUTH_PRIVATE_KEY_ACCESS_DENIED', -134);

    // The SSL client certificate has no private key.
    NET_ERROR('SSL_CLIENT_AUTH_CERT_NO_PRIVATE_KEY', -135);

    // The certificate presented by the HTTPS Proxy was invalid.
    NET_ERROR('PROXY_CERTIFICATE_INVALID', -136);

    // An error occurred when trying to do a name resolution (DNS).
    NET_ERROR('NAME_RESOLUTION_FAILED', -137);

    // Permission to access the network was denied. This is used to distinguish
    // errors that were most likely caused by a firewall from other access denied
    // errors. See also ERR_ACCESS_DENIED.
    NET_ERROR('NETWORK_ACCESS_DENIED', -138);

    // The request throttler module cancelled this request to avoid DDOS.
    NET_ERROR('TEMPORARILY_THROTTLED', -139);

    // A request to create an SSL tunnel connection through the HTTPS proxy
    // received a non-200 (OK) and non-407 (Proxy Auth) response.  The response
    // body might include a description of why the request failed.
    NET_ERROR('HTTPS_PROXY_TUNNEL_RESPONSE', -140);

    // We were unable to sign the CertificateVerify data of an SSL client auth
    // handshake with the client certificate's private key.
    //
    // Possible causes for this include the user implicitly or explicitly
    // denying access to the private key, the private key may not be valid for
    // signing, the key may be relying on a cached handle which is no longer
    // valid, or the CSP won't allow arbitrary data to be signed.
    NET_ERROR('SSL_CLIENT_AUTH_SIGNATURE_FAILED', -141);

    // The message was too large for the transport.  (for example a UDP message
    // which exceeds size threshold).
    NET_ERROR('MSG_TOO_BIG', -142);

    // A SPDY session already exists, and should be used instead of this connection.
    NET_ERROR('SPDY_SESSION_ALREADY_EXISTS', -143);

    // Error -144 was removed (LIMIT_VIOLATION).

    // Websocket protocol error. Indicates that we are terminating the connection
    // due to a malformed frame or other protocol violation.
    NET_ERROR('WS_PROTOCOL_ERROR', -145);

    // Connection was aborted for switching to another ptotocol.
    // WebSocket abort SocketStream connection when alternate protocol is found.
    NET_ERROR('PROTOCOL_SWITCHED', -146);

    // Returned when attempting to bind an address that is already in use.
    NET_ERROR('ADDRESS_IN_USE', -147);

    // An operation failed because the SSL handshake has not completed.
    NET_ERROR('SSL_HANDSHAKE_NOT_COMPLETED', -148);

    // SSL peer's public key is invalid.
    NET_ERROR('SSL_BAD_PEER_PUBLIC_KEY', -149);

    // The certificate didn't match the built-in public key pins for the host name.
    // The pins are set in net/http/transport_security_state.cc and require that
    // one of a set of public keys exist on the path from the leaf to the root.
    NET_ERROR('SSL_PINNED_KEY_NOT_IN_CERT_CHAIN', -150);

    // Server request for client certificate did not contain any types we support.
    NET_ERROR('CLIENT_AUTH_CERT_TYPE_UNSUPPORTED', -151);

    // Server requested one type of cert, then requested a different type while the
    // first was still being generated.
    NET_ERROR('ORIGIN_BOUND_CERT_GENERATION_TYPE_MISMATCH', -152);

    // An SSL peer sent us a fatal decrypt_error alert. This typically occurs when
    // a peer could not correctly verify a signature (in CertificateVerify or
    // ServerKeyExchange) or validate a Finished message.
    NET_ERROR('SSL_DECRYPT_ERROR_ALERT', -153);

    // Certificate error codes
    //
    // The values of certificate error codes must be consecutive.

    // The server responded with a certificate whose common name did not match
    // the host name.  This could mean:
    //
    // 1. An attacker has redirected our traffic to his server and is
    //    presenting a certificate for which he knows the private key.
    //
    // 2. The server is misconfigured and responding with the wrong cert.
    //
    // 3. The user is on a wireless network and is being redirected to the
    //    network's login page.
    //
    // 4. The OS has used a DNS search suffix and the server doesn't have
    //    a certificate for the abbreviated name in the address bar.
    //
    NET_ERROR('CERT_COMMON_NAME_INVALID', -200);

    // The server responded with a certificate that, by our clock, appears to
    // either not yet be valid or to have expired.  This could mean:
    //
    // 1. An attacker is presenting an old certificate for which he has
    //    managed to obtain the private key.
    //
    // 2. The server is misconfigured and is not presenting a valid cert.
    //
    // 3. Our clock is wrong.
    //
    NET_ERROR('CERT_DATE_INVALID', -201);

    // The server responded with a certificate that is signed by an authority
    // we don't trust.  The could mean:
    //
    // 1. An attacker has substituted the real certificate for a cert that
    //    contains his public key and is signed by his cousin.
    //
    // 2. The server operator has a legitimate certificate from a CA we don't
    //    know about, but should trust.
    //
    // 3. The server is presenting a self-signed certificate, providing no
    //    defense against active attackers (but foiling passive attackers).
    //
    NET_ERROR('CERT_AUTHORITY_INVALID', -202);

    // The server responded with a certificate that contains errors.
    // This error is not recoverable.
    //
    // MSDN describes this error as follows:
    //   "The SSL certificate contains errors."
    // NOTE: It's unclear how this differs from ERR_CERT_INVALID. For consistency,
    // use that code instead of this one from now on.
    //
    NET_ERROR('CERT_CONTAINS_ERRORS', -203);

    // The certificate has no mechanism for determining if it is revoked.  In
    // effect, this certificate cannot be revoked.
    NET_ERROR('CERT_NO_REVOCATION_MECHANISM', -204);

    // Revocation information for the security certificate for this site is not
    // available.  This could mean:
    //
    // 1. An attacker has compromised the private key in the certificate and is
    //    blocking our attempt to find out that the cert was revoked.
    //
    // 2. The certificate is unrevoked, but the revocation server is busy or
    //    unavailable.
    //
    NET_ERROR('CERT_UNABLE_TO_CHECK_REVOCATION', -205);

    // The server responded with a certificate has been revoked.
    // We have the capability to ignore this error, but it is probably not the
    // thing to do.
    NET_ERROR('CERT_REVOKED', -206);

    // The server responded with a certificate that is invalid.
    // This error is not recoverable.
    //
    // MSDN describes this error as follows:
    //   "The SSL certificate is invalid."
    //
    NET_ERROR('CERT_INVALID', -207);

    // The server responded with a certificate that is signed using a weak
    // signature algorithm.
    NET_ERROR('CERT_WEAK_SIGNATURE_ALGORITHM', -208);

    // -209 is availible: was CERT_NOT_IN_DNS.

    // The host name specified in the certificate is not unique.
    NET_ERROR('CERT_NON_UNIQUE_NAME', -210);

    // The server responded with a certificate that contains a weak key (e.g.
    // a too-small RSA key).
    NET_ERROR('CERT_WEAK_KEY', -211);

    // Add new certificate error codes here.
    //
    // Update the value of CERT_END whenever you add a new certificate error
    // code.

    // The value immediately past the last certificate error code.
    NET_ERROR('CERT_END', -212);

    // The URL is invalid.
    NET_ERROR('INVALID_URL', -300);

    // The scheme of the URL is disallowed.
    NET_ERROR('DISALLOWED_URL_SCHEME', -301);

    // The scheme of the URL is unknown.
    NET_ERROR('UNKNOWN_URL_SCHEME', -302);

    // Attempting to load an URL resulted in too many redirects.
    NET_ERROR('TOO_MANY_REDIRECTS', -310);

    // Attempting to load an URL resulted in an unsafe redirect (e.g., a redirect
    // to file:// is considered unsafe).
    NET_ERROR('UNSAFE_REDIRECT', -311);

    // Attempting to load an URL with an unsafe port number.  These are port
    // numbers that correspond to services, which are not robust to spurious input
    // that may be constructed as a result of an allowed web construct (e.g., HTTP
    // looks a lot like SMTP, so form submission to port 25 is denied).
    NET_ERROR('UNSAFE_PORT', -312);

    // The server's response was invalid.
    NET_ERROR('INVALID_RESPONSE', -320);

    // Error in chunked transfer encoding.
    NET_ERROR('INVALID_CHUNKED_ENCODING', -321);

    // The server did not support the request method.
    NET_ERROR('METHOD_NOT_SUPPORTED', -322);

    // The response was 407 (Proxy Authentication Required), yet we did not send
    // the request to a proxy.
    NET_ERROR('UNEXPECTED_PROXY_AUTH', -323);

    // The server closed the connection without sending any data.
    NET_ERROR('EMPTY_RESPONSE', -324);

    // The headers section of the response is too large.
    NET_ERROR('RESPONSE_HEADERS_TOO_BIG', -325);

    // The PAC requested by HTTP did not have a valid status code (non-200).
    NET_ERROR('PAC_STATUS_NOT_OK', -326);

    // The evaluation of the PAC script failed.
    NET_ERROR('PAC_SCRIPT_FAILED', -327);

    // The response was 416 (Requested range not satisfiable) and the server cannot
    // satisfy the range requested.
    NET_ERROR('REQUEST_RANGE_NOT_SATISFIABLE', -328);

    // The identity used for authentication is invalid.
    NET_ERROR('MALFORMED_IDENTITY', -329);

    // Content decoding of the response body failed.
    NET_ERROR('CONTENT_DECODING_FAILED', -330);

    // An operation could not be completed because all network IO
    // is suspended.
    NET_ERROR('NETWORK_IO_SUSPENDED', -331);

    // FLIP data received without receiving a SYN_REPLY on the stream.
    NET_ERROR('SYN_REPLY_NOT_RECEIVED', -332);

    // Converting the response to target encoding failed.
    NET_ERROR('ENCODING_CONVERSION_FAILED', -333);

    // The server sent an FTP directory listing in a format we do not understand.
    NET_ERROR('UNRECOGNIZED_FTP_DIRECTORY_LISTING_FORMAT', -334);

    // Attempted use of an unknown SPDY stream id.
    NET_ERROR('INVALID_SPDY_STREAM', -335);

    // There are no supported proxies in the provided list.
    NET_ERROR('NO_SUPPORTED_PROXIES', -336);

    // There is a SPDY protocol error.
    NET_ERROR('SPDY_PROTOCOL_ERROR', -337);

    // Credentials could not be established during HTTP Authentication.
    NET_ERROR('INVALID_AUTH_CREDENTIALS', -338);

    // An HTTP Authentication scheme was tried which is not supported on this
    // machine.
    NET_ERROR('UNSUPPORTED_AUTH_SCHEME', -339);

    // Detecting the encoding of the response failed.
    NET_ERROR('ENCODING_DETECTION_FAILED', -340);

    // (GSSAPI) No Kerberos credentials were available during HTTP Authentication.
    NET_ERROR('MISSING_AUTH_CREDENTIALS', -341);

    // An unexpected, but documented, SSPI or GSSAPI status code was returned.
    NET_ERROR('UNEXPECTED_SECURITY_LIBRARY_STATUS', -342);

    // The environment was not set up correctly for authentication (for
    // example, no KDC could be found or the principal is unknown.
    NET_ERROR('MISCONFIGURED_AUTH_ENVIRONMENT', -343);

    // An undocumented SSPI or GSSAPI status code was returned.
    NET_ERROR('UNDOCUMENTED_SECURITY_LIBRARY_STATUS', -344);

    // The HTTP response was too big to drain.
    NET_ERROR('RESPONSE_BODY_TOO_BIG_TO_DRAIN', -345);

    // The HTTP response contained multiple distinct Content-Length headers.
    NET_ERROR('RESPONSE_HEADERS_MULTIPLE_CONTENT_LENGTH', -346);

    // SPDY Headers have been received, but not all of them - status or version
    // headers are missing, so we're expecting additional frames to complete them.
    NET_ERROR('INCOMPLETE_SPDY_HEADERS', -347);

    // No PAC URL configuration could be retrieved from DHCP. This can indicate
    // either a failure to retrieve the DHCP configuration, or that there was no
    // PAC URL configured in DHCP.
    NET_ERROR('PAC_NOT_IN_DHCP', -348);

    // The HTTP response contained multiple Content-Disposition headers.
    NET_ERROR('RESPONSE_HEADERS_MULTIPLE_CONTENT_DISPOSITION', -349);

    // The HTTP response contained multiple Location headers.
    NET_ERROR('RESPONSE_HEADERS_MULTIPLE_LOCATION', -350);

    // SPDY server refused the stream. Client should retry. This should never be a
    // user-visible error.
    NET_ERROR('SPDY_SERVER_REFUSED_STREAM', -351);

    // SPDY server didn't respond to the PING message.
    NET_ERROR('SPDY_PING_FAILED', -352);

    // The request couldn't be completed on an HTTP pipeline. Client should retry.
    NET_ERROR('PIPELINE_EVICTION', -353);

    // The HTTP response body transferred fewer bytes than were advertised by the
    // Content-Length header when the connection is closed.
    NET_ERROR('CONTENT_LENGTH_MISMATCH', -354);

    // The HTTP response body is transferred with Chunked-Encoding, but the
    // terminating zero-length chunk was never sent when the connection is closed.
    NET_ERROR('INCOMPLETE_CHUNKED_ENCODING', -355);

    // There is a QUIC protocol error.
    NET_ERROR('QUIC_PROTOCOL_ERROR', -356);

    // The HTTP headers were truncated by an EOF.
    NET_ERROR('RESPONSE_HEADERS_TRUNCATED', -357);

    // The cache does not have the requested entry.
    NET_ERROR('CACHE_MISS', -400);

    // Unable to read from the disk cache.
    NET_ERROR('CACHE_READ_FAILURE', -401);

    // Unable to write to the disk cache.
    NET_ERROR('CACHE_WRITE_FAILURE', -402);

    // The operation is not supported for this entry.
    NET_ERROR('CACHE_OPERATION_NOT_SUPPORTED', -403);

    // The disk cache is unable to open this entry.
    NET_ERROR('CACHE_OPEN_FAILURE', -404);

    // The disk cache is unable to create this entry.
    NET_ERROR('CACHE_CREATE_FAILURE', -405);

    // Multiple transactions are racing to create disk cache entries. This is an
    // internal error returned from the HttpCache to the HttpCacheTransaction that
    // tells the transaction to restart the entry-creation logic because the state
    // of the cache has changed.
    NET_ERROR('CACHE_RACE', -406);

    // The cache was unable to read a checksum record on an entry. This can be
    // returned from attempts to read from the cache. It is an internal error,
    // returned by the SimpleCache backend, but not by any URLRequest methods
    // or members.
    NET_ERROR('CACHE_CHECKSUM_READ_FAILURE', -407);

    // The cache found an entry with an invalid checksum. This can be returned from
    // attempts to read from the cache. It is an internal error, returned by the
    // SimpleCache backend, but not by any URLRequest methods or members.
    NET_ERROR('CACHE_CHECKSUM_MISMATCH', -408);

    // The server's response was insecure (e.g. there was a cert error).
    NET_ERROR('INSECURE_RESPONSE', -501);

    // The server responded to a <keygen> with a generated client cert that we
    // don't have the matching private key for.
    NET_ERROR('NO_PRIVATE_KEY_FOR_CERT', -502);

    // An error adding to the OS certificate database (e.g. OS X Keychain).
    NET_ERROR('ADD_USER_CERT_FAILED', -503);

    // *** Code -600 is reserved (was FTP_PASV_COMMAND_FAILED). ***

    // A generic error for failed FTP control connection command.
    // If possible, please use or add a more specific error code.
    NET_ERROR('FTP_FAILED', -601);

    // The server cannot fulfill the request at this point. This is a temporary
    // error.
    // FTP response code 421.
    NET_ERROR('FTP_SERVICE_UNAVAILABLE', -602);

    // The server has aborted the transfer.
    // FTP response code 426.
    NET_ERROR('FTP_TRANSFER_ABORTED', -603);

    // The file is busy, or some other temporary error condition on opening
    // the file.
    // FTP response code 450.
    NET_ERROR('FTP_FILE_BUSY', -604);

    // Server rejected our command because of syntax errors.
    // FTP response codes 500, 501.
    NET_ERROR('FTP_SYNTAX_ERROR', -605);

    // Server does not support the command we issued.
    // FTP response codes 502, 504.
    NET_ERROR('FTP_COMMAND_NOT_SUPPORTED', -606);

    // Server rejected our command because we didn't issue the commands in right
    // order.
    // FTP response code 503.
    NET_ERROR('FTP_BAD_COMMAND_SEQUENCE', -607);

    // PKCS #12 import failed due to incorrect password.
    NET_ERROR('PKCS12_IMPORT_BAD_PASSWORD', -701);

    // PKCS #12 import failed due to other error.
    NET_ERROR('PKCS12_IMPORT_FAILED', -702);

    // CA import failed - not a CA cert.
    NET_ERROR('IMPORT_CA_CERT_NOT_CA', -703);

    // Import failed - certificate already exists in database.
    // Note it's a little weird this is an error but reimporting a PKCS12 is ok
    // (no-op).  That's how Mozilla does it, though.
    NET_ERROR('IMPORT_CERT_ALREADY_EXISTS', -704);

    // CA import failed due to some other error.
    NET_ERROR('IMPORT_CA_CERT_FAILED', -705);

    // Server certificate import failed due to some internal error.
    NET_ERROR('IMPORT_SERVER_CERT_FAILED', -706);

    // PKCS #12 import failed due to invalid MAC.
    NET_ERROR('PKCS12_IMPORT_INVALID_MAC', -707);

    // PKCS #12 import failed due to invalid/corrupt file.
    NET_ERROR('PKCS12_IMPORT_INVALID_FILE', -708);

    // PKCS #12 import failed due to unsupported features.
    NET_ERROR('PKCS12_IMPORT_UNSUPPORTED', -709);

    // Key generation failed.
    NET_ERROR('KEY_GENERATION_FAILED', -710);

    // Server-bound certificate generation failed.
    NET_ERROR('ORIGIN_BOUND_CERT_GENERATION_FAILED', -711);

    // Failure to export private key.
    NET_ERROR('PRIVATE_KEY_EXPORT_FAILED', -712);

    // DNS error codes.

    // DNS resolver received a malformed response.
    NET_ERROR('DNS_MALFORMED_RESPONSE', -800);

    // DNS server requires TCP
    NET_ERROR('DNS_SERVER_REQUIRES_TCP', -801);

    // DNS server failed.  This error is returned for all of the following
    // error conditions:
    // 1 - Format error - The name server was unable to interpret the query.
    // 2 - Server failure - The name server was unable to process this query
    //     due to a problem with the name server.
    // 4 - Not Implemented - The name server does not support the requested
    //     kind of query.
    // 5 - Refused - The name server refuses to perform the specified
    //     operation for policy reasons.
    NET_ERROR('DNS_SERVER_FAILED', -802);

    // DNS transaction timed out.
    NET_ERROR('DNS_TIMED_OUT', -803);

    // The entry was not found in cache, for cache-only lookups.
    NET_ERROR('DNS_CACHE_MISS', -804);

    // Suffix search list rules prevent resolution of the given host name.
    NET_ERROR('DNS_SEARCH_EMPTY', -805);

    // Failed to sort addresses according to RFC3484.
    NET_ERROR('DNS_SORT_ERROR', -806);
  })();


  var EventToObject = function() {
    this.prev = null;
    this.next = null;
    this._messageId = 0;
    this._messageIdMax = 1000000000000000;//TODO: figure out when it's safe to loop
    this._messageCbs = [];
  };
  // if sending a response, we pass in the messageId
  // if sending a request, we may specify a callback to wait for a response
  // or we may fire and forget with no callback
  EventToObject.prototype.pipeOut = function(event_name, data, cb, requestId) {

    debug("sending:", data);
    var obj = {
      type: 'simple',
      method: event_name,
      payload: data
    };

    if (typeof cb === 'function') { // request with callback
      var messageId = this._messageId;
      this._messageId = (this._messageId + 1) % this._messageIdMax;
      this._messageCbs[messageId] = cb;
      obj['type'] = 'request';
      obj['messageId'] = messageId;
    } else if (requestId !== undefined) { // response
      obj['type'] = 'response';
      obj['messageId'] = requestId;
    } else { // simple request
    }

    this.next.pipeOut(obj);
  };
  EventToObject.prototype.pipeIn = function(json){
    if(json.type == 'simple'){
      this.prev.pipeIn(json.method, json.payload);
    } else if (json.type == 'request') {
      this.prev.pipeIn(json.method, json.payload, json.messageId/*this is converted into a callback by FirstPipe*/);
    } else if (json.type == 'response') {
      if(this._messageCbs[json.messageId]) {
        this._messageCbs[json.messageId](json.payload);
        delete this._messageCbs[json.messageId];
      } else {
        debug(json, "Got reponse with no request");
      }
    }
  };

  var ObjectToString = function() {
    this.prev = null;
    this.next = null;
  };
  ObjectToString.prototype.pipeOut = function(obj){
    //TODO: handle errors
    var str = JSON.stringify(obj);
    this.next.pipeOut(str);
  };
  ObjectToString.prototype.pipeIn = function(str){
    this.prev.pipeIn(JSON.parse(str));
  };

  //TODO: there are extra copies however I do this... making this class separate just avoids dealing with the buffer API and makes adding a \n easier
  var BufferDefragmenterStage1 = function() {
    this.prev = null;
    this.next = null;
  };
  BufferDefragmenterStage1.prototype.pipeOut = function(str) {
    this.next.pipeOut(str+'\n');
  };
  BufferDefragmenterStage1.prototype.pipeIn = function(str) {
    this.prev.pipeIn(str); // NOP
  };

  var OTRPipe = function(myKey) {
    this.prev = null;
    this.next = null;

    this.myKey = myKey;

    var options = {
      fragment_size: 1400,
      send_interval: 0,
      priv: this.myKey
    };

    this.buddy = new OTR(options);
    this.buddy.REQUIRE_ENCRYPTION = true;

    this.buddy.on('ui', function(msg) {
      this.prev.pipeIn(msg);
    }.bind(this));

    this.buddy.on('io', function(msg) {
      this.next.pipeOut(msg);
    }.bind(this));

    this.buddy.on('error', function(err) {
      console.error(err);
      // this.prev.pipeIn(err);//TODO: error handling
    }.bind(this));
  };

  OTRPipe.prototype.pipeIn = function(msg){
    this.buddy.receiveMsg(msg);
  };
  OTRPipe.prototype.pipeOut = function(msg){
    this.buddy.sendMsg(msg);
  };

  var StringToBuffer = function() {
    this.prev = null;
    this.next = null;
  };
  StringToBuffer.prototype.pipeOut = function(str){
    Socket.prototype._stringToArrayBuffer(str, function(ab){
      this.next.pipeOut(ab);
    }.bind(this));
  };
  StringToBuffer.prototype.pipeIn = function(ab){
    Socket.prototype._arrayBufferToString(ab, function(str){
      this.prev.pipeIn(str);
    }.bind(this));
  };

  var BufferDefragmenter2 = function() {
    this.prev = null;
    this.next = null;
  };
  BufferDefragmenter2.prototype.pipeOut = function(ab) {
    this.next.pipeOut(ab); // NOP: see BufferDefragmenter1
  };
  BufferDefragmenter2.prototype.pipeIn = function(ab) {
    // TODO: move more logic here from lastPipe
    this.prev.pipeIn(ab);
  };

  var FirstPipe = function(socket){
    this.socket = socket;
  };
  var LastPipe = function(socket){
    this.socket = socket;
  };

  FirstPipe.prototype.pipeIn = function(){
    var args = Array.prototype.slice.call(arguments, 0);
    if(args[2] !== undefined){
      var id = args[2];
      args[2] = function(reply) {
        this.send(args[0], reply, undefined, id);
      }.bind(this.socket);
    }
    this.socket.emit.apply(this.socket, args);
  };
  FirstPipe.prototype.pipeOut = function(){
    this.next.pipeOut.apply(this.next, arguments);
  };

  LastPipe.prototype.pipeIn = function(data, hacks){

    var socket = this.socket;
    var buffers = socket._buffers;
    var index = socket._endOfMsg(data);
    if (index !== -1) {
      debug('received message of length '+data.byteLength);
      debug('found newline at ' + index);
      var total_length = index;
      for (var i = 0; i < buffers.length; i++) {
        total_length += buffers[i].byteLength;
      }
      var arr = new ArrayBuffer(total_length);
      var length_covered = 0;
      for (i = 0; i < buffers.length; i++) {
        socket._memcpyWhole(arr, length_covered, buffers[i]);
        length_covered += buffers[i].byteLength;
      }
      socket._memcpy(arr, length_covered, index, data);

      this.prev.pipeIn(arr);

      // if there is more past the end of the message, parse it again
      socket._buffers = [];
      if(index !== data.byteLength - 1){
        this.pipeIn(data.slice(index+1,data.byteLength), true);
      }
    } else {
      buffers.push(data);
    }
    debug('read again');
    if(!hacks){
      chrome.socket.read(socket.socketId, null, socket._receiveCb.bind(socket));
    }
  };

  LastPipe.prototype.writeDone = function(res){
    if(res.bytesWritten < 0){
      console.error('TODO: figure out how to deal with errors sending', res.bytesWritten);
    }
  };

  LastPipe.prototype.pipeOut = function(msg){
    if(this.socket.socketId !== undefined){
      chrome.socket.write(this.socket.socketId, msg, this.writeDone);//Remember it's not bound to this right now
    } else {
      console.error('Please connect before sending');
    }
  };

  // objects in the pipeline are called in order and the "in" and "out" functions are called when a message is coming in or out
  //TODO: improve constructor
  function SocketServer(ip, port, pipeline_fn) {
    this.ip = ip;
    this.port = port;
    this.pipeline_fn = pipeline_fn;
  }

  util.inherits(SocketServer, EventEmitter);

  SocketServer.prototype.listen = function(cb) {
    debug('create server socket');
    chrome.socket.create('tcp', null, function(createInfo) {
      this.socketId = createInfo.socketId;
      debug('created server ' + this.socketId);
      if (this.socketId < 0 && typeof cb === 'function') cb(new Error('socketId < 0'));
      debug('listen server');
      chrome.socket.listen(this.socketId, this.ip, parseInt(this.port), function(resultCode) {
        if (typeof cb === 'function') {
          if (resultCode === 0)
            cb();
          else
            cb(new Error('socket.listen returned ' + util.errorName(resultCode)));
        }
        debug('accept server');
        var accept = function(acceptInfo) {
          debug(acceptInfo, 'accepted server');
          debug(this.socketId, 'server socket');
          if (acceptInfo.resultCode === 0) {
            chrome.socket.getInfo(acceptInfo.socketId, function(res) {
              debug(res, "info");
              debug(res.peerAddress, res.peerPort, "info");
              if (res.peerAddress) {
                this.emit('connection', new Socket(res.peerAddress, res.peerPort, this.pipeline_fn, true, acceptInfo.socketId));
              }
            }.bind(this));
            if (this.socketId) // because the server might have been stopped already
              chrome.socket.accept(this.socketId, accept);
          } else {
            debug(acceptInfo, "failed to accept");
            this._listener_bound = false;
          }
        }.bind(this);
        chrome.socket.accept(this.socketId, accept);
        this._listener_bound = true;
      }.bind(this));
    }.bind(this));
  };

  SocketServer.prototype.stop = function() {
    debug('destroy server ' + this.socketId);
    chrome.socket.destroy(this.socketId);
    // this.removeEvent('connection');
    delete this.socketId;
  };

  //TODO: improve constructor
  var Socket = function(ip, port, pipeline_fn, server, socketId) {
    this.ip = ip;
    this.port = port;

    this.pipeline_fn = pipeline_fn;

    this._buffers = [];
    this._server = server;
    if (server) {
      this.socketId = socketId;
      this.initPipeline();
      debug('read server');
      chrome.socket.read(this.socketId, null, this._receiveCb.bind(this));
    }

    debug('new socket arguments', arguments);
    debug('new socket this', this);
  };

  util.inherits(Socket, EventEmitter);

  Socket.prototype.initPipeline = function(){
    // set up the pipeline
    var pipeline;
    if(typeof this.pipeline_fn === 'function') {
      pipeline = this.pipeline_fn();
    } else {
      // default pipeline
      pipeline = [new EventToObject(), new ObjectToString(), new BufferDefragmenterStage1(), new StringToBuffer(), new BufferDefragmenter2()];
    }
    pipeline.unshift(new FirstPipe(this));
    pipeline.push(new LastPipe(this));
    pipeline[0].next = pipeline[1];
    for (var p = 1; p < pipeline.length - 1; p++) {
      pipeline[p].next = pipeline[p+1];
      pipeline[p].prev = pipeline[p-1];
    }
    pipeline[pipeline.length-1].prev = pipeline[pipeline.length-2];
    this.pipeline = pipeline;
  };

  Socket.prototype.info = function(cb) {
    if (this.socketId) {
      chrome.socket.getInfo(this.socketId, function(res) {
        if (typeof cb === 'function') cb(undefined, res);
      });
    } else {
      if (typeof cb === 'function') cb('No socket'); // TODO: better error messages?
    }
  };

  Socket.prototype._connectStage2 = function(cb) {
    this.info(function(err, res) {
      if (!res.connected) {
        debug('connect client to ' + this.ip + ':' + this.port);
        this.initPipeline();
        chrome.socket.connect(this.socketId, this.ip, parseInt(this.port), function(resultCode) {
          debug(resultCode, 'stage2 - connected');
          debug("client read callback binding");
          chrome.socket.read(this.socketId, null, this._receiveCb.bind(this));
          if (typeof cb === 'function') {
            if (resultCode !== 0) {
              cb(new Error('socket.connect returned ' + util.errorName(resultCode)));
            } else {
              cb();
            }
          }
        }.bind(this));
      } else {
        cb();
      }
    }.bind(this));
  };

  Socket.prototype.connect = function(cb) {
    if (this.socketId >= 0) {
      debug('connect an existing socket');
      this._connectStage2(cb);
    } else {
      debug('create client');
      chrome.socket.create('tcp', null, function(createInfo) {
        this.socketId = createInfo.socketId;
        if (this.socketId < 0 && typeof cb === 'function') cb(new Error('socketId < 0'));
        else this._connectStage2(cb);
      }.bind(this));
    }
  };

  Socket.prototype.destroy = function() {
    if (this.socketId !== undefined) {
      debug('destroy ' + (this._server ? 'server' : 'client'));
      chrome.socket.destroy(this.socketId);
      delete this.socketId;
    }
  };

  Socket.prototype.disconnect = function() {
    if (this.socketId !== undefined) {
      debug("disconnect " + (this._server ? 'server' : 'client'));
      chrome.socket.disconnect(this.socketId);
      this.destroy(); // TODO: Remove this when this is fixed: https://code.google.com/p/chromium/issues/detail?id=251977&thanks=251977&ts=1371681444
    }
  };

  Socket.prototype.send = function(method, obj, callback, messageId) {
    if (this.socketId === undefined) {
      if (typeof callback === 'function') callback(new Error('Not connected'));
      return;
    }
    //TODO: fix error popping up here if you try to send before connecting
    this.pipeline[0].pipeOut.apply(this.pipeline[0], arguments);
  };

  Socket.prototype._receiveCb = function(readInfo) {
    debug(readInfo, "receive " + (this._server ? 'server' : 'client'));
    if (readInfo.resultCode === -1) {
      debug("BINDING TOO MUCH");
      return;
    }
    if (readInfo.resultCode <= 0) {
      debug(this.ip, this.port, "info");
      debug(util.errorName(readInfo.resultCode), "error");
      //TODO: deal with negative result codes more specifically
      this.disconnect();
    } else {
      this.pipeline[this.pipeline.length-1].pipeIn(readInfo.data);
    }
  };

  Socket.prototype._memcpy = function(dst, dstOffset, end, src) {
    var dstU8 = new Uint8Array(dst, dstOffset, end);
    var srcU8 = new Uint8Array(src, 0, end);
    dstU8.set(srcU8);
  };

  Socket.prototype._memcpyWhole = function(dst, dstOffset, src) {
    var dstU8 = new Uint8Array(dst, dstOffset, src.byteLength);
    var srcU8 = new Uint8Array(src, 0, src.byteLength);
    dstU8.set(srcU8);
  };

  Socket.prototype._endOfMsg = function(buff) {
    var buff8 = new Uint8Array(buff);
    for (var i = 0; i < buff.byteLength; i++) {
      if (buff8[i] == 10) {
        return i; // '\n'
      }
    }
    return -1;
  };

  Socket.prototype._stringToArrayBuffer = function(str, callback) {
    var bb = new Blob([str]);
    var f = new FileReader();
    f.onload = function(e) {
      callback(e.target.result);
    }.bind(this);
    f.readAsArrayBuffer(bb);
  };

  Socket.prototype._arrayBufferToString = function(buf, callback) {
    var bb = new Blob([new Uint8Array(buf)]);
    var f = new FileReader();
    f.onload = function(e) {
      callback(e.target.result);
    }.bind(this);
    f.readAsText(bb);
  };

  exports.OTRPipe = OTRPipe;
  exports.EventToObject = EventToObject;
  exports.ObjectToString = ObjectToString;
  exports.BufferDefragmenterStage1 = BufferDefragmenterStage1;
  exports.StringToBuffer = StringToBuffer;
  exports.BufferDefragmenter2 = BufferDefragmenter2;
  exports.Socket = Socket;
  exports.SocketServer = SocketServer;
})(window);
