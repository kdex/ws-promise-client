import EventEmitter from "./EventEmitter.js";
function closeConnection(target, ...rest) {
	/* Close connections if they weren't properly closed */
	if (target.ws) {
		target.ws.close();
	}
}
export class Client extends EventEmitter {
	constructor(url, protocols) {
		super();
		this.message = 0;
		this.wsOptions = {
			url,
			protocols
		};
	}
	@closeConnection
	async open() {
		return new Promise((resolve, reject) => {
			this.ws = new WebSocket(this.wsOptions.url, this.wsOptions.protocols);
			/* Forward events to listeners if they were declared on the client */
			for (let event of ["close", "error"]) {
				let name = `on${event}`;
				this.ws[name] = (...args) => {
					if (this[name]) {
						this[name](...args);
					}
				};
			}
			this.ws.onopen = e => {
				resolve(e);
			};
			this.ws.onmessage = e => {
				let raw = e.data;
				let json = JSON.parse(raw);
				this.emit(json.message, json.body);
			};
		});
	}
	@closeConnection
	async close() {
	}
	send(payload, timeout = 10000) {
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
			this.ws.send(data);
			this.message++;
		});
	}
}
export default Client;