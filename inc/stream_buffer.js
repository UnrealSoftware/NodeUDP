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
	
	readByte() {
		if (this.offset <= this.len - 1) {
			this.offset += 1;
			return this.buf.readUInt8(this.offset - 1);
		}
		return 0;
	}
	
	readShort() {
		if (this.offset <= this.len - 2) {
			this.offset += 2;
			return this.buf.readUInt16LE(this.offset - 2);
		}
		return 0;
	}
	
	readInt() {
		if (this.offset <= this.len - 4) {
			this.offset += 4;
			return this.buf.readInt32LE(this.offset - 4);
		}
		return 0;
	}
	
	// Read a short string (8 bit length)
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
	
	// Read a string (16 bit length)
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
	
	writeByte(value) {
		this.buf.writeUInt8(value, this.offset);
		this.offset += 1;
	}
	
	writeShort(value) {
		this.buf.writeUInt16LE(value, this.offset);
		this.offset += 2;
	}
	
	writeInt(value) {
		this.buf.writeInt32LE(value, this.offset);
		this.offset += 4;
	}
	
	// Write short string (8 bit length)
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
	
	// Write a string (16 bit length)
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