# @unrealsoftware/node_udp
A basic & lightweight Node.JS module supporting binary communication via plain UDP with useful read/write methods.

Available via NPM:
https://www.npmjs.com/package/@unrealsoftware/node_udp


## What this module is good for?
It's a wrapper around the Node.js core module "dgram" and provides some simple read/write methods so you don't have to mess with byte buffers directly. You can use it to quickly get a UDP server up and running with very little code. Also it has no depedencies to any third party modules.

#### Currently comes with read/write methods for the following data types:
- `readByte` / `writeByte` UInt8 / byte / unsigned int (1 byte) with value range 0 to 255
- `readShort` / `writeShort` UInt16LE / ushort / unsigned int (2 bytes) with value range 0 to 65,535
- `readInt` / `writeInt` Int32LE / int / signed int (4 bytes) with value range -2,147,483,648 to 2,147,483,647
- `readLong` / `writeLong` Int64LE / long / signed int (8 bytes) with value range -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807
- `readFloat` / `writeFloat` FloatLE / float / single precision floating-point (4 bytes)
- `readDouble` / `writeDouble` DoubleLE / double / double precision floating-point (8 bytes)
- `readSString` / `writeSString` short ANSI ASCII string with up to 255 chars, length encoded with byte prefix (1 byte + 1 byte per char)
- `readString` / `writeString` ANSI ASCII string with up to 65,535 chars, length encoded with ushort prefix  (2 bytes + 1 byte per char)

:information_source: All numbers are read/written with little endian (LE) byte order!

:heavy_check_mark: The module also provides automatic recovery. It closes and re-binds the socket if any error occurs. This feature can be disabled.


## Limitations
We are talking about plain binary UDP here. Low level networking. No extra protocol on top. This means it comes with the typical UDP features/limitations:
- Unreliable: Messages can get lost. No acknowledgement or re-send mechanism.
- No guaranteed order: Messages can arrive in any order (or not at all).
- Message size limitation: Max. size of a message is limited by the MTU (which is determined by used hard- and software). From my experience keeping the payload size below ~1200 bytes should work fine in most cases.
- Currently the string methods are for sending ANSI ASCII strings only. UTF-8 or other encodings could be added easily though.


## Sample Usage
Here's a server which receives messages, reads the first byte and sends it back:
```javascript
// import the module
const NodeUdp = require('@unrealsoftware/node_udp');

// create a server listening on port 54321
const udp = new NodeUdp(onResponse, 54321);

// handle incoming messages
function onResponse(data, length, addr, port) {
  console.log(`Received msg from ${addr}:${port} with length ${length}`);
  if (length > 0) {
    const byte = data.readByte()
    console.log(`First byte is ${byte}`);
    
    // send response
    udp.startResponse();
    udp.outStream.writeByte(byte);
    udp.sendResponse();
  }
}
```

## MIT License
Do with this whatever you want. No limitations. Please keep the copyright notice though. See LICENSE for details.