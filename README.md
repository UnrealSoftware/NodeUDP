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
- Currently only a few popular data types are supported and they are all little endian. Support for big endian and more types could be added easily.
- Currently the string methods are for sending ANSI ASCII strings only. UTF-8 or other encodings could be added easily though.

## Sample
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

## Constructor
The `NodeUdp` constructor has 4 parameters:
```javascript
const udp = new NodeUdp(onResponse, startPort = -1, rebindOnError = true, rebindDelay = 3000)
```
- `onResponse`: The response callback. Mandatory. See "Reading Messages" for details.
- `startPort` (optional): The port the UDP socket will be bound to on construction. If you don't provide a port you have to bind the socket manually using `udp.bindSocket(port)`.
- `rebindOnError` (optional): Try to bind the socket again after an error? This defaults to true. Set to false if you don't want the socket to be bound automatically.
- `rebindDelay` (optional): Delay (in milliseconds) after which the program will attempt to bind the socket again after an error occurred. Defaults to 3000 ms (3 milliseconds). Not relevant if `rebindOnError` is false.

## Receiving Messages
Messages are read in the response callback you specify as the first parameter in the constructor of `NodeUdp`. It has these parameters:
- `data` (StreamBuffer): The data you received. You can use the read-methods mentioned above to read this data. Before reading you can use `data.avail()` to check if enough bytes are left for reading. Alternatively you can use `data.canRead()` which returns true if at least one readable byte is left.
- `length` (number): The length (in bytes) of data. You can also use `data.length()` to retrieve this value.
- `addr` (string): The address of the sender of the message. `udp.srcAddrees` will have the same value.
- `port` (number): The port of the sender of the message. `udp.srcPort` will have the same value.

:information_source: Data in a message always has to be read in the same order it was written.

## Sending Messages
Sending a message happens in 3 steps:
- `udp.startResponse()` resets the contents of `udp.outStream`. By default new responses will have a maximum size of 1024 bytes. For bigger responses you can provide a size e.g. `udp.startResponse(2048)`. You can skip this call if you want to send the same data to multiple addresses.
- Writing data. This happens via `udp.outStream.writeX` with writeX being one of the write methods mentioned above. e.g. `udp.outStream.writeString('Hello, world!')`. You can write as much data as you want this way. The maximum size is however limited by the buffer size and the MTU.
- `udp.sendResponse()` sends the data to the address and port of the last sender. Alternatively you can use `udp.sendResponseTo(addr, port)` to send the message to a custom address and port.

:warning: Sending messages will fail with an error message if the socket is not bound. You can check this with `udp.isBound`.

## MIT License
Do with this whatever you want. No limitations. Please keep the copyright notice though. See LICENSE for details.

Made with :green_heart: in :anchor: Hamburg, Germany
