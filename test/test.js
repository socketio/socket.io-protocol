
var parser = require('..');
var expect = require('expect.js');
var encode = parser.encode;
var decode = parser.decode;

// tests encoding and decoding a single packet

function test(obj){
  encode(obj, function(encodedPackets) {
    expect(decode(encodedPackets[0])).to.eql(obj);
  });
}

function test_bin(obj) {
  var originalData = obj.data;
  encode(obj, function(encodedPackets) {
    var reconPack = decode(encodedPackets[0]);

    var reconstructor = new parser.BinaryReconstructor(reconPack);
    var packet;
    for (var i = 1; i < encodedPackets.length; i++) {
      packet = reconstructor.takeBinaryData(encodedPackets[i]);
    }

    obj.data = originalData;
    obj.attachments = undefined;
    expect(obj).to.eql(packet);
  });
}

function testPacketMetadata(p1, p2) {
  expect(p1.type).to.eql(p2.type);
  expect(p1.id).to.eql(p2.id);
  expect(p1.nsp).to.eql(p2.nsp);
}

describe('parser', function(){

  it('exposes types', function(){
    expect(parser.CONNECT).to.be.a('number');
    expect(parser.DISCONNECT).to.be.a('number');
    expect(parser.EVENT).to.be.a('number');
    expect(parser.ACK).to.be.a('number');
    expect(parser.ERROR).to.be.a('number');
  });

  it('encodes connection', function(){
    test({
      type: parser.CONNECT,
      nsp: '/woot'
    });
  });

  it('encodes disconnection', function(){
    test({
      type: parser.DISCONNECT,
      nsp: '/woot'
    });
  });

  it('encodes an event', function(){
    test({
      type: parser.EVENT,
      data: ['a', 1, {}],
      nsp: '/'
    });
    test({
      type: parser.EVENT,
      data: ['a', 1, {}],
      id: 1,
      nsp: '/test'
    });
  });

  it('encodes an ack', function(){
    test({
      type: parser.ACK,
      data: ['a', 1, {}],
      id: 123,
      nsp: '/'
    });
  });

  it('encodes a Buffer', function() {
    test_bin({
      type: parser.BINARY_EVENT,
      data: new Buffer('abc', 'utf8'),
      id: 23,
      nsp: '/cool'
    });
  });

  it('encodes an ArrayBuffer', function() {
    var packet = {
      type: parser.BINARY_EVENT,
      data: new ArrayBuffer(2),
      id: 0,
      nsp: '/'
    };
    test_bin(packet);
  });

  it('encodes ArrayBuffers deep in JSON', function() {
    var packet = {
      type: parser.BINARY_EVENT,
      data: {a: 'hi', b: {why: new ArrayBuffer(3)}, c: {a: 'bye', b: { a: new ArrayBuffer(6)}}},
      id: 999,
      nsp: '/deep'
    };
    test_bin(packet);
  });

});
