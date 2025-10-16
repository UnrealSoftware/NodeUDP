/**
 * Utility class which is basically a wrapper around Buffer.
 * Internally keeps track of an offset and provides "stream-style" methods for reading/writing data.
 */
module.exports = class StreamBuffer {
	/**
	 * Creates a new stream buffer without allocating buffer memory.
	 */
	constructor(littleEndian = true) {
		this.littleEndian = littleEndian;
		this.offset = 0;
		this.buf = null;
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
		if (!this.buf || this.buf.byteLength < size) {
			this.buf = Buffer.allocUnsafe(size);
		}
		this.buf.fill(0, 0, size);
		this.len = size;
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
			this.buf = this.buf.slice(0, this.offset);
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
			return this.buf.readUInt8(this.offset++);
		}
		return 0;
	}

	/**
	 * Reads a UInt16 / unsigned short (2 bytes)
	 * @returns {number} the unsigned short
	 */
	readShort() {
		if (this.offset <= this.len - 2) {
			const value = this.littleEndian ? this.buf.readUInt16LE(this.offset) : this.buf.readUInt16BE(this.offset);
			this.offset += 2;
			return value;
		}
		return 0;
	}

	/**
	 * Reads an Int32 / signed int (4 bytes)
	 * @returns {number} the int
	 */
	readInt() {
		if (this.offset <= this.len - 4) {
			const value = this.littleEndian ? this.buf.readInt32LE(this.offset) : this.buf.readInt32BE(this.offset);
			this.offset += 4;
			return value;
		}
		return 0;
	}

	/**
	 * Reads a BigInt64 / signed long (8 bytes)
	 * @returns {bigint} the long
	 */
	readLong() {
		if (this.offset <= this.len - 8) {
			const value = this.littleEndian ? this.buf.readBigInt64LE(this.offset) : this.buf.readBigInt64BE(this.offset);
			this.offset += 8;
			return value;
		}
		return 0n;
	}

	/**
	 * Reads a Float / float (4 bytes)
	 * @returns {number} the float
	 */
	readFloat() {
		if (this.offset <= this.len - 4) {
			const value = this.littleEndian ? this.buf.readFloatLE(this.offset) : this.buf.readFloatBE(this.offset);
			this.offset += 4;
			return value;
		}
		return 0;
	}

	/**
	 * Reads a Double / double (8 bytes)
	 * @returns {number} the double
	 */
	readDouble() {
		if (this.offset <= this.len - 8) {
			const value = this.littleEndian ? this.buf.readDoubleLE(this.offset) : this.buf.readDoubleBE(this.offset);
			this.offset += 8;
			return value;
		}
		return 0;
	}

	/**
	 * Reads a printable ASCII string with a length of up to 255 chars.
	 * Internally the string data is prefixed with a single byte for the length.
	 * Non-printable ASCII chars are replaced with 'x'.
	 * @returns {string} the string
	 */
	readSString() {
		if (this.offset >= this.len) {
			return '';
		}

		const strLen = this.buf.readUInt8(this.offset++);

		if (this.offset + strLen > this.len) {
			return '';
		}

		let result = '';
		for (let i = 0; i < strLen; i++) {
			const charCode = this.buf.readUInt8(this.offset++);
			result += (charCode >= 32 && charCode <= 126) ? String.fromCharCode(charCode) : 'x';
		}

		return result;
	}

	/**
	 * Reads a printable ASCII string with a length of up to 65,535 chars.
	 * Internally the string data is prefixed with a UInt16 (2 bytes) for the length.
	 * Non-printable ASCII chars are replaced with 'x'.
	 * @returns {string} the string
	 */
	readString() {
		if (this.offset + 1 >= this.len) {
			return '';
		}

		const strLen = this.littleEndian ? this.buf.readUInt16LE(this.offset) : this.buf.readUInt16BE(this.offset);
		this.offset += 2;

		if (this.offset + strLen > this.len) {
			return '';
		}

		let result = '';
		for (let i = 0; i < strLen; i++) {
			const charCode = this.buf.readUInt8(this.offset++);
			result += (charCode >= 32 && charCode <= 126) ? String.fromCharCode(charCode) : 'x';
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
		this.buf.writeUInt8(value, this.offset++);
	}

	/**
	 * Writes a UInt16 / unsigned short (2 bytes)
	 * @param {number} value - the unsigned short
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
	 * @param {bigint} value - the long
	 */
	writeLong(value) {
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
	writeFloat(value) {
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
	writeDouble(value) {
		if (this.littleEndian) {
			this.buf.writeDoubleLE(value, this.offset);
		} else {
			this.buf.writeDoubleBE(value, this.offset);
		}
		this.offset += 8;
	}

	/**
	 * Writes a printable ASCII string with a length of up to 255 chars.
	 * Internally the string data is prefixed with a single byte for the length.
	 * Non-printable ASCII chars (outside 32-126) are replaced with 'x'.
	 * @param {string} value - the string
	 */
	writeSString(value) {
		if (!value || value.length === 0) {
			this.buf.writeUInt8(0, this.offset++);
			return;
		}

		if (value.length > 255) {
			value = value.substring(0, 255);
		}

		const strLen = value.length;
		this.buf.writeUInt8(strLen, this.offset++);

		for (let i = 0; i < strLen; i++) {
			let charCode = value.charCodeAt(i);
			if (charCode < 32 || charCode > 126) {
				charCode = 120; // 'x'
			}
			this.buf.writeUInt8(charCode, this.offset++);
		}
	}

	/**
	 * Writes a printable ASCII string with a length of up to 65,535 chars.
	 * Internally the string data is prefixed with a UInt16 (2 bytes) for the length.
	 * Non-printable ASCII chars (outside 32-126) are replaced with 'x'.
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
			let charCode = value.charCodeAt(i);
			if (charCode < 32 || charCode > 126) {
				charCode = 120; // 'x'
			}
			this.buf.writeUInt8(charCode, this.offset++);
		}
	}

	//#endregion Write
};
