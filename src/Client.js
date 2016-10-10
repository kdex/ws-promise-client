import EventEmitter from "crystal-event-emitter";
import RPCClient, { ANY } from "ws-rpc-client";
const extensions = Symbol();
export class Client extends EventEmitter {
	ws = null;
	reconnecting = false;
	wasOpenBefore = false;
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
	async open() {
		return new Promise(async (resolve, reject) => {
			/* Wait for already connected client to close first */
			if (this.ws) {
				await this.close();
			}
			if (!global.WebSocket) {
				global.WebSocket = eval(`require("ws")`);
			}
			this.ws = new WebSocket(this[extensions].url, this[extensions].protocols);
			this.rpcClient = new RPCClient(this.ws, this[extensions].rpcOptions);
			this.ws.onopen = e => {
				this.emit("open", e);
				this.wasOpenBefore = true;
				resolve(e);
			};
			this.ws.onerror = e => {
				this.emit("error", e);
				reject(e);
			};
			/* Closed dirtily */
			this.ws.onclose = e => {
				this.resetWebsocket(e);
				if (!this.wasOpenBefore) {
					this.emit("connectionFailed", e);
				}
				if (this[extensions].autoReconnect && !this.reconnecting) {
					this.reconnect();
				}
			};
			this.rpcClient.on(ANY, e => {
				const { data } = e;
				if (data) {
					if (e.raw) {
						/* Proxy generalized `message` event */
						this.emit("message", data);
					}
					else {
						/* Proxy specialized instruction event */
						const { instruction } = data.payload;
						this.emit(instruction, data);
					}
				}
				else {
					/*
					* Don't do anything. No data ⇒ It's not a message event.
					* This case should be handled by the event listeners on
					* `this.ws` already.
					*/
				}
			});
		});
	}
	async close() {
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
	async reconnect(newDelay) {
		this.reconnecting = true;
		const delay = newDelay || this[extensions].reconnectionMinimum;
		try {
			await this.open();
			this.reconnecting = false;
			this.emit("reconnect");
		}
		catch (e) {
			setTimeout(() => {
				this.reconnect(delay * this[extensions].reconnectionFactor);
			}, delay);
		}
	}
	async send(payload) {
		return await this.rpcClient.send(payload);
	}
}
export default Client;