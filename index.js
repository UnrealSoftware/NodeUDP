const StreamBuffer = require('./inc/stream_buffer.js');
const dgram = require('dgram');

exports = class nodeudp {
	/**
	 * Creates a new Node UDP instance which can be used to send and receive UDP messages.
	 * @param onResponse - Response handler
	 * @param {number} startPort - Instantly bind to this port (-1 = to not bind)
	 * @param {boolean} rebindOnError - Automatically rebind when a socket error occurs?
	 * @param {number} rebindDelay - Delay before trying to rebind (in milliseconds)
	 */
	constructor(onResponse, startPort = -1, rebindOnError = true, rebindDelay = 3000) {
		this.onResponse = onResponse;
		this.rebindOnError = rebindOnError;
		this.rebindDelay = rebindDelay;

		this.port = 0;
		this.isBound = false;
		this.udp = dgram.createSocket('udp4');

		this.srcAddress = null;
		this.srcPort = null;

		this.inStream = new StreamBuffer();
		this.outStream = new StreamBuffer();

		udp.on('listening', () => {
			const address = udp.address();
			console.log(`UDP socket listening on ${address.address}:${address.port}`);
			isBound = true;
		});
		
		udp.on('error', (err) => {
			console.log(`UDP socket error:\n${err.stack}`);
			udp.close();
			isBound = false;
			if (rebindOnError) {
				setTimeout(bindSocket(port), rebindDelay);
			} else {
				console.log(`UDP socket closed. rebindOnError disabled.`);
			}
		});
		
		udp.on('message', (msg, rinfo) => {
			inStream.setBuffer(msg);
			const length = inStream.length();
		
			srcAddress = rinfo.address;
			srcPort = rinfo.port;

			onResponse(inStream, length, srcAddress, srcPort);
		});

		if (startPort > -1) {
			bindSocket(startPort);
		}
	}

	/**
	 * Binds the UDP socket to a port
	 * @param {number} port - UDP port to bind to (0-65535)
	 */
	bindSocket(port) {
		this.port = port;
		console.log(`trying to bind UDP socket ${port}...`);
		udp.bind(port);
	}

	/**
	 * Clears the outgoing buffer before writing a response
	 */
	startResponse() {
		outStream.clearBuffer();
	}
	
	/**
	 * Sends a response to the source of the last incoming message
	 */
	sendResponse() {
		sendResponseTo(srcAddress, srcPort);
	}
	
	/**
	 * Sends a response to the specified destination
	 * @param {string} dstAddress - destination address
	 * @param {number} dstPort - destination port
	 */
	sendResponseTo(dstAddress, dstPort) {
		if (!isBound) {
			console.error(`UDP socket can't send response. Not bound!`);
			return;
		}

		udp.send(out.buf, 0, out.offset, _dstPort, _dstAddress);
	}
}