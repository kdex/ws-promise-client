import EventEmitter from "crystal-event-emitter";
const OPTIONS = Symbol("[[Options]]");
const SINGLE_RESPONSE = Symbol("[[Single response]]");
export class Client extends EventEmitter {
	constructor(url, protocols, {
		autoReconnect = true,
		reconnectionFactor = 1.2,
		reconnectionMinimum = 2000,
		defaultTimeout = 5000
	} = {}) {
		super({
			inferListeners: true
		});
		this.message = 0;
		this.wsOptions = {
			url,
			protocols
		};
		this[OPTIONS] = {
			autoReconnect,
			defaultTimeout,
			reconnectionFactor,
			reconnectionMinimum
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
				if (typeof WebSocket === "undefined") {
					/* "require" shouldn't be transpiled here, so enjoy this hack for node support */
					global.WebSocket = eval(`require("websocket").w3cwebsocket`);
				}
				this.ws = new WebSocket(this.wsOptions.url, this.wsOptions.protocols);
				this.ws.onopen = e => {
					this.emit("open", e);
					this.hasBeenOpenBefore = true;
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
					this.emit(json.message, json);
				};
				/* Closed dirtily */
				this.ws.onclose = e => {
					this.resetWebsocket(e);
					if (!this.hasBeenOpenBefore) {
						this.emit("connectionFailed", e);
					}
					if (this[OPTIONS].autoReconnect && !this.reconnecting) {
						this.reconnect();
					}
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
				if (this.ws.readyState !== WebSocket.CLOSED) {
					this.ws.close();
				}
				else {
					this.ws.onclose();
				}
			}
			else {
				reject(new Error("WebSocket hasn't been initialized"));
			}
		});
	}
	async reconnect(newWaitingTime) {
		this.reconnecting = true;
		let waitingTime = newWaitingTime || this[OPTIONS].reconnectionMinimum;
		try {
			await this.open();
			this.reconnecting = false;
			this.emit("reconnect");
		}
		catch (e) {
			setTimeout(() => {
				this.reconnect(waitingTime * this[OPTIONS].reconnectionFactor);
			}, waitingTime);
		}
	}
	send(payload, {
		timeout = this[OPTIONS].defaultTimeout,
		resolveAfterReply = true,
		onReply
	} = {}) {
		return new Promise((resolve, reject) => {
			let data = JSON.stringify({
				message: this.message,
				body: JSON.stringify(payload),
				resolveAfterReply
			});
			let timer = setTimeout(() => {
				reject(new Error("Timeout reached"));
			}, timeout);
			this.addEventListener(this.message, reply => {
				if (onReply instanceof Function) {
					onReply(reply.body, reply.isFinished);
				}
				if (resolveAfterReply || reply.isFinished) {
					clearTimeout(timer);
					resolve(reply.body);
				}
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
	async receive(payload, onIntermediaryResult, {
		timeout = this[OPTIONS].defaultTimeout
	} = {}) {
		return await this.send(payload, {
			timeout,
			resolveAfterReply: false,
			onReply: onIntermediaryResult
		});
	}
}
export default Client;