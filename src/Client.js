import EventEmitter from "crystal-event-emitter";
import {
	default as RPCClient,
	ANY,
	MESSAGE_ACKNOWLEDGEMENT,
	MESSAGE_REPLY
} from "ws-rpc-client";
const extensions = Symbol();
export class Client extends EventEmitter {
	constructor(url, protocols, {
		autoReconnect = true,
		reconnectionFactor = 1.2,
		reconnectionMinimum = 2000,
		rpcOptions
	} = {}) {
		super({
			inferListeners: true
		});
		this[extensions] = {
			autoReconnect,
			reconnectionFactor,
			reconnectionMinimum,
			rpcOptions,
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
				if (typeof WebSocket === "undefined") {
					/* "require" shouldn't be transpiled here, so enjoy this hack for node support */
					global.WebSocket = eval(`require("ws").WebSocket`);
				}
				this.ws = new WebSocket(this[extensions].url, this[extensions].protocols);
				this.rpcClient = new RPCClient(this.ws, this[extensions].rpcOptions);
				this.ws.onopen = e => {
					this.emit("open", e);
					this.hasBeenOpenBefore = true;
					resolve(e);
				};
				this.ws.onerror = e => {
					this.emit("error", e);
					reject(e);
				};
				this.rpcClient.on(ANY, e => {
					if (!e.data) {
						/* Proxy message event */
						this.emit("message", e);
					}
					else {
						/* Proxy specialized message event */
						const instruction = e.data.payload.instruction;
						if (instruction !== MESSAGE_REPLY && instruction !== MESSAGE_ACKNOWLEDGEMENT) {
							this.emit(instruction, e.data);
						}
					}
				});
				/* Closed dirtily */
				this.ws.onclose = e => {
					this.resetWebsocket(e);
					if (!this.hasBeenOpenBefore) {
						this.emit("connectionFailed", e);
					}
					if (this[extensions].autoReconnect && !this.reconnecting) {
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
		let waitingTime = newWaitingTime || this[extensions].reconnectionMinimum;
		try {
			await this.open();
			this.reconnecting = false;
			this.emit("reconnect");
		}
		catch (e) {
			setTimeout(() => {
				this.reconnect(waitingTime * this[extensions].reconnectionFactor);
			}, waitingTime);
		}
	}
	async send(payload) {
		return await this.rpcClient.send(payload);
	}
}
export default Client;