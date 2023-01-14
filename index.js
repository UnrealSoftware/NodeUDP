const StreamBuffer = require('./inc/stream_buffer.js');
const dgram = require('dgram');

module.exports = class NodeUdp {
	/**
	 * Creates a new Node UDP socket instance which can be used to send and receive UDP messages.
	 * When startPort is specified (> -1), the socket will be bound to this port.
	 * Otherwise bindSocket needs to be called before the socket is actually active.
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

		this.udp.on('listening', () => {
			this.isBound = true;
			const address = this.udp.address();
			console.log(`UDP socket listening on ${address.address}:${address.port}`);
		});
		
		this.udp.on('error', (err) => {
			console.log(`UDP socket error:\n${err.stack}`);

			this.udp.close();
			this.isBound = false;
			
			if (this.rebindOnError) {
				setTimeout(bindSocket(this.port), this.rebindDelay);
			} else {
				console.log(`UDP socket closed. rebindOnError disabled.`);
			}
		});
		
		this.udp.on('message', (msg, rinfo) => {
			this.inStream.setBuffer(msg);
			const length = this.inStream.length();
		
			this.srcAddress = rinfo.address;
			this.srcPort = rinfo.port;

			onResponse(this.inStream, length, this.srcAddress, this.srcPort);
		});

		if (startPort > -1) {
			this.bindSocket(startPort);
		}
	}

	/**
	 * Binds the UDP socket to a port.
	 * When already bound this will close the socket and re-open it.
	 * @param {number} port - UDP port to bind to (0-65535)
	 */
	bindSocket(port) {
		if (this.isBound)
		{
			this.udp.close();
			this.isBound = false;
		}
		this.port = port;
		console.log(`trying to bind UDP socket ${port}...`);
		this.udp.bind(port);
	}

	/**
	 * Clears the outgoing buffer.
	 * This has to be done before writing anything to it.
	 * When done with writing either call sendResponse or sendResponseTo.
	 */
	startResponse() {
		this.outStream.clearBuffer();
	}
	
	/**
	 * Sends a response to the source of the last incoming message
	 */
	sendResponse() {
		this.sendResponseTo(this.srcAddress, this.srcPort);
	}
	
	/**
	 * Sends a response to the specified destination
	 * @param {string} dstAddress - destination address
	 * @param {number} dstPort - destination port
	 */
	sendResponseTo(dstAddress, dstPort) {
		if (!this.isBound) {
			console.error(`UDP socket can't send response. Not bound!`);
			return;
		}

		this.udp.send(this.outStream.buf, 0, this.outStream.offset, dstPort, dstAddress);
	}
}