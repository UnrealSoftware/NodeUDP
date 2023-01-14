# @unrealsoftware/node-udp
A basic & lightweight Node.JS module supporting binary communication via plain UDP.

## What this module is good for?
It's a wrapper around the Node.js core module "dgram" and provides some simple read/write methods so you don't have to mess with byte buffers directly. You can use it to quickly get a UDP server up and running with very little code. Also it has no depedencies to any third party modules.

#### Currently comes with read/write methods for the following data types:
- byte: unsigned int with value range 0 to 255
- UInt16LE / ushort: unsigned int with value range 0 to 65,535
- Int32LE / int: signed int with value range -2,147,483,648 to 2,147,483,647
- short ANSI ASCII string: String with up to 255 chars, length encoded with byte prefix
- ANSI ASCII string: String with up to 65,535 chars, length encoded with ushort prefix

The module also provides automatic recovery. It closes and re-binds the socket if any error occurs. This feature can be disabled.

## Limitations
We are talking about plain binary UDP here. Low level networking. No extra protocol on top. This means it comes with the typical UDP features/limitations:
- Unreliable: Messages can get lost. No acknowledgement or re-send mechanism.
- No guaranteed order: Messages can arrive in any order (or not at all).
- Message size limitation: Max. size of a message is limited by the MTU (which is determined by used hard- and software). From my experience keeping the payload size below ~950 bytes should work fine in most cases.
- Currently the string methods are for sending ANSI ASCII strings only. UTF-8 or other encodings could be added easily though.

## Sample Usage
TODO

## MIT License
Do with this whatever you want. No limitations. Please keep the copyright notice though. See LICENSE for details.
