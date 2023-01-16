/**
 * Utility class which is basically a wrapper around Buffer.
 * Internally keeps track of an offset and provides "stream-style" methods for reading/writing data.
 */
module.exports = class StreamBuffer {
	/**
	 * Creates a new stream buffer without allocating buffer memory.
	 */
	constructor(littleEndian = true) {
		this.littleEndian = this.littleEndian
		this.offset = 0;
		this.buf;
		this.len = 0;		
	}

	/**
	 * Sets a new buffer and resets the offset.
	 * @param {Buffer} setbuf - the buffer to set
	 */
	setBuffer(setbuf) {
		this.offset = 0;
		this.buf = setbuf;
		this.len = setbuf.byteLength;
	}
	
	/**
	 * Sets an empty buffer and resets the offset.
	 * @param {number} size - size (in bytes) of the buffer
	 */
	clearBuffer(size = 1024) {
		this.offset = 0;
		this.buf = Buffer.alloc(size);
		this.len = this.buf.byteLength;
	}
	
	/**
	 * Gets the length of the buffer in bytes.
	 * @returns {number} the length in bytes
	 */
	length() {
		return this.len;
	}
	
	/**
	 * Checks if there is still readable data in this buffer.
	 * @returns {boolean} true if can read at least 1 byte, false otherwise
	 */
	canRead() {
		return this.offset < this.len;
	}
	
	/**
	 * Gets the number of readable bytes in this buffer.
	 * @returns {number} the amount of readable bytes
	 */
	avail() {
		return this.len - this.offset;
	}

	/**
	 * Reduces the internal size of this buffer to its current read/write offset.
	 */
	trim() {
		if (this.buf.byteLength !== this.offset) {
			console.log(`resizing buffer from len ${this.buf.byteLength} to ${this.offset}`)
			const tmpBuf = Buffer.alloc(this.offset);
			for (let i = 0; i < this.offset; i++) {
				tmpBuf[i] = this.buf[i];
			}
			this.buf = tmpBuf;
			this.len = this.offset;
		}
	}
	
	//#region Read
	
	/**
	 * Reads a single byte (unsigned)
	 * @returns {number} the byte
	 */
	readByte() {
		if (this.offset <= this.len - 1) {
			this.offset += 1;
			return this.buf.readUInt8(this.offset - 1);
		}
		return 0;
	}
	
	/**
	 * Reads an UInt16 / unsigned short (2 bytes)
	 * @returns {number} the unsinged short
	 */
	readShort() {
		if (this.offset <= this.len - 2) {
			this.offset += 2;
			return this.littleEndian ? this.buf.readUInt16LE(this.offset - 2) : this.buf.readUInt16BE(this.offset - 2);
		}
		return 0;
	}
	
	/**
	 * Reads an Int32 / signed int (4 bytes)
	 * @returns {number} the int
	 */
	readInt() {
		if (this.offset <= this.len - 4) {
			this.offset += 4;
			return this.littleEndian ? this.buf.readInt32LE(this.offset - 4) : this.buf.readInt32BE(this.offset - 4);
		}
		return 0;
	}

	/**
	 * Reads a BigInt64 / signed long (8 bytes)
	 * @returns {number} the long
	 */
	readLong() {
		if (this.offset <= this.len - 8) {
			this.offset += 8;
			return this.littleEndian ? this.buf.readBigInt64LE(this.offset - 8) : this.buf.readBigInt64BE(this.offset - 8);
		}
		return 0;
	}

	/**
	 * Reads a FloatLE / float (4 bytes)
	 * @returns {number} the float
	 */
	readFloat() {
		if (this.offset <= this.len - 4) {
			this.offset += 4;
			return this.littleEndian ? this.buf.readFloatLE(this.offset - 4) : this.buf.readFloatBE(this.offset - 4);
		}
		return 0;
	}

	/**
	 * Reads a DoubleLE / double (8 bytes)
	 * @returns {number} the double
	 */
	readDouble() {
		if (this.offset <= this.len - 8) {
			this.offset += 8;
			return this.littleEndian ? this.buf.readDoubleLE(this.offset - 8) : this.buf.readDoubleBE(this.offset - 8);
		}
		return 0;
	}
	
	/**
	 * Reads an ANSI ASCII string with a length of up to 255 chars.
	 * Internally the string data is prefixed with a single byte for the length.
	 * @returns {string} the string
	 */
	readSString() {
		if (this.offset >= this.len) {
			return '';
		}
		
		let result = '';
		this.offset += 1;
		const strLen = this.buf.readUInt8(this.offset - 1);
		
		if (this.offset + strLen > this.len) {
			return '';
		}
		
		for (let i = 0; i < strLen; i++) {
			this.offset += 1;
			var charCode = this.buf.readUInt8(this.offset - 1);
			result += String.fromCharCode(charCode);
		}
		
		return result;
	}
	
	/**
	 * Reads an ANSI ASCII string with a length of up to 65,535 chars.
	 * Internally the string data is prefixed with a ushort (2 bytes) for the length.
	 * @returns {string} the string
	 */
	readString() {
		if (this.offset + 1 >= this.len) {
			return '';
		}
		
		let result = '';
		this.offset += 2;
		const strLen = this.littleEndian ? this.buf.readUInt16LE(this.offset - 2) : this.buf.readUInt16BE(this.offset - 2);
		
		if (this.offset + strLen > this.len) {
			return '';
		}
		
		for (let i = 0; i < strLen; i++) {
			this.offset += 1;
			var charCode = this.buf.readUInt8(this.offset - 1);
			result += String.fromCharCode(charCode);
		}
		
		return result;
	}

	//#endregion Read
	
	//#region Write
	
	/**
	 * Writes a single byte (unsigned)
	 * @param {number} value - the byte
	 */
	writeByte(value) {
		this.buf.writeUInt8(value, this.offset);
		this.offset += 1;
	}
	
	/**
	 * Writes an UInt16 / unsigned short (2 bytes)
	 * @param {number} value - the unsinged short
	 */
	writeShort(value) {
		if (this.littleEndian) {
			this.buf.writeUInt16LE(value, this.offset);
		} else {
			this.buf.writeUInt16BE(value, this.offset);
		}
		this.offset += 2;
	}
	
	/**
	 * Writes an Int32 / signed int (4 bytes)
	 * @param {number} value - the int
	 */
	writeInt(value) {
		if (this.littleEndian) {
			this.buf.writeInt32LE(value, this.offset);
		} else {
			this.buf.writeInt32BE(value, this.offset);
		}
		this.offset += 4;
	}
	
	/**
	 * Writes a BigInt64 / signed long (8 bytes)
	 * @param {number} value - the long
	 */
	writeLong() {
		if (this.littleEndian) {
			this.buf.writeBigInt64LE(value, this.offset);
		} else {
			this.buf.writeBigInt64BE(value, this.offset);
		}
		this.offset += 8;
	}

	/**
	 * Writes a Float / float (4 bytes)
	 * @param {number} value - the float
	 */
	writeFloat() {
		if (this.littleEndian) {
			this.buf.writeFloatLE(value, this.offset);
		} else {
			this.buf.writeFloatBE(value, this.offset);
		}
		this.offset += 4;
	}

	/**
	 * Writes a Double / double (8 bytes)
	 * @param {number} value - the double
	 */
	writeDouble() {
		if (this.littleEndian) {
			this.buf.writeDoubleLE(value, this.offset);
		} else {
			this.buf.writeDoubleBE(value, this.offset);
		}
		this.offset += 8;
	}

	/**
	 * Writes an ANSI ASCII string with a length of up to 255 chars.
	 * Internally the string data is prefixed with a single byte for the length.
	 * Strings with a length > 255 will be cut off.
	 * Non-ANSI-ASCII chars will be replaced with 'x'.
	 * @param {string} value - the string
	 */
	writeSString(value) {
		if (!value || value.length === 0) {
			this.buf.writeUInt8(0, this.offset);
			this.offset += 1;
			return;
		}
		
		if (value.length > 255) {
			value = value.substring(0, 255);
		}
		
		const strLen = value.length;
		
		this.buf.writeUInt8(strLen, this.offset);
		this.offset += 1;
		
		for (let i = 0; i < strLen; i++) {
			var charCode = value.charCodeAt(i);
			if (charCode < 0 || charCode > 255)
			{
				// use 'x' for non-ASCII chars
				charCode = 120;
			}
			this.buf.writeUInt8(charCode, this.offset);
			this.offset += 1;
		}
	}
	
	/**
	 * Writes an ANSI ASCII string with a length of up to 65,535 chars.
	 * Internally the string data is prefixed with a ushort (2 bytes) for the length.
	 * Strings with a length > 65,535 will be cut off.
	 * Non-ANSI-ASCII chars will be replaced with 'x'.
	 * @param {string} value - the string
	 */
	writeString(value) {
		if (!value || value.length === 0) {
			if (this.littleEndian) {
				this.buf.writeUInt16LE(0, this.offset);
			} else {
				this.buf.writeUInt16BE(0, this.offset);
			}
			this.offset += 2;
			return;
		}
		
		if (value.length > 65535) {
			value = value.substring(0, 65535);
		}
		
		const strLen = value.length;
		
		if (this.littleEndian) {
			this.buf.writeUInt16LE(strLen, this.offset);
		} else {
			this.buf.writeUInt16BE(strLen, this.offset);
		}
		this.offset += 2;
		
		for (let i = 0; i < strLen; i++) {
			var charCode = value.charCodeAt(i);
			if (charCode < 0 || charCode > 255)
			{
				// use 'x' for non-ASCII chars
				charCode = 120;
			}
			this.buf.writeUInt8(charCode, this.offset);
			this.offset += 1;
		}
	}

	//#endregion Write
};