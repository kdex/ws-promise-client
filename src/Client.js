import EventEmitter from "crystal-event-emitter";
export class Client extends EventEmitter {
	constructor(url, protocols) {
		super({
			inferListeners: true
		});
		this.message = 0;
		this.wsOptions = {
			url,
			protocols
		};
	}
	resetWebsocket(e) {
		this.emit("close", e);
		this.ws = null;
	}
	open() {
		return new Promise((resolve, reject) => {
			let closed = false;
			if (this.ws) {
				closed = this.close();
			}
			/* Wait for already connected client to close first */
			Promise.resolve(closed).then(() => {
				this.ws = new WebSocket(this.wsOptions.url, this.wsOptions.protocols);
				this.ws.onopen = e => {
					this.emit("open", e);
					resolve(e);
				};
				this.ws.onerror = e => {
					this.emit("error", e);
					reject(e);
				};
				this.ws.onmessage = e => {
					this.emit("message", e);
					let raw = e.data;
					let json = JSON.parse(raw);
					this.emit(json.message, json.body);
				};
				/* Closed dirtily */
				this.ws.onclose = e => {
					this.resetWebsocket(e);
				};
			});
		});
	}
	close() {
		return new Promise((resolve, reject) => {
			if (this.ws) {
				/* Closed cleanly */
				this.ws.onclose = e => {
					this.resetWebsocket(e);
					resolve(e);
				};
				this.ws.close();
			}
			else {
				reject(new Error("WebSocket hasn't been initialized"));
			}
		});
	}
	send(payload, timeout = 5000) {
		return new Promise((resolve, reject) => {
			let data = JSON.stringify({
				message: this.message,
				body: JSON.stringify(payload)
			});
			let timer = setTimeout(() => {
				reject(null);
			}, timeout);
			this.addEventListener(this.message, body => {
				clearTimeout(timer);
				resolve(body);
			});
			if (this.ws.readyState === WebSocket.OPEN) {
				this.ws.send(data);
			}
			else {
				clearTimeout(timer);
				reject(new Error(`WebSocket isn't in "OPEN" state`));
			}
			this.message++;
		});
	}
}
export default Client;