module.exports = class StreamBuffer {
	constructor() {
		this.offset = 0;
		this.buf;
		this.len = 0;		
	}

	setBuffer(setbuf) {
		this.offset = 0;
		this.buf = setbuf;
		this.len = setbuf.byteLength;
	}
	
	clearBuffer() {
		this.offset = 0;
		this.buf = Buffer.alloc(1024);
		this.len = this.buf.byteLength;
	}
	
	length() {
		return this.len;
	}
	
	canRead() {
		return this.offset < this.len;
	}
	
	avail() {
		return this.len - this.offset;
	}

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
	 * Reads an UInt16LE / unsigned short
	 * @returns {number} the unsinged short
	 */
	readShort() {
		if (this.offset <= this.len - 2) {
			this.offset += 2;
			return this.buf.readUInt16LE(this.offset - 2);
		}
		return 0;
	}
	
	/**
	 * Reads an Int32LE / signed int
	 * @returns {number} the int
	 */
	readInt() {
		if (this.offset <= this.len - 4) {
			this.offset += 4;
			return this.buf.readInt32LE(this.offset - 4);
		}
		return 0;
	}

	/**
	 * Reads a BigInt64LE / signed long
	 * @returns {number} the long
	 */
	readLong() {
		if (this.offset <= this.len - 8) {
			this.offset += 8;
			return this.buf.readBigInt64LE(this.offset - 8);
		}
		return 0;
	}

	/**
	 * Reads a FloatLE / float
	 * @returns {number} the float
	 */
	readFloat() {
		if (this.offset <= this.len - 4) {
			this.offset += 4;
			return this.buf.readFloatLE(this.offset - 4);
		}
		return 0;
	}

	/**
	 * Reads a DoubleLE / double
	 * @returns {number} the double
	 */
	readDouble() {
		if (this.offset <= this.len - 8) {
			this.offset += 8;
			return this.buf.readDoubleLE(this.offset - 8);
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
		const strLen = this.buf.readUInt16LE(this.offset - 2);
		
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
	 * Writes an UInt16LE / unsigned short
	 * @param {number} value - the unsinged short
	 */
	writeShort(value) {
		this.buf.writeUInt16LE(value, this.offset);
		this.offset += 2;
	}
	
	/**
	 * Writes an Int32LE / signed int
	 * @param {number} value - the int
	 */
	writeInt(value) {
		this.buf.writeInt32LE(value, this.offset);
		this.offset += 4;
	}
	
	/**
	 * Writes a BigInt64LE / signed long
	 * @param {number} value - the long
	 */
	writeLong() {
		this.buf.writeBigInt64LE(value, this.offset);
		this.offset += 8;
	}

	/**
	 * Writes a FloatLE / float
	 * @param {number} value - the float
	 */
	writeFloat() {
		this.buf.writeFloatLE(value, this.offset);
		this.offset += 4;
	}

	/**
	 * Writes a DoubleLE / double
	 * @param {number} value - the double
	 */
	writeDouble() {
		this.buf.writeDoubleLE(value, this.offset);
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
			this.buf.writeUInt16LE(0, this.offset);
			this.offset += 2;
			return;
		}
		
		if (value.length > 65535) {
			value = value.substring(0, 65535);
		}
		
		const strLen = value.length;
		
		this.buf.writeUInt16LE(strLen, this.offset);
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