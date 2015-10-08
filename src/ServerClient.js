import WebSocket from "ws";
import EventEmitter from "./EventEmitter.js";
export class ServerClient extends EventEmitter {
	constructor(ws) {
		super();
		this.ws = ws;
		let that = this;
		for (let event of ["close", "error", "message", "open"]) {
			let name = `on${event}`;
			this.ws[name] = e => {
				let payload;
				let message;
				let body;
				try {
					payload = JSON.parse(e.data);
					body = JSON.parse(payload.body);
					message = payload.message;
				}
				catch (e) {
					payload = e.data;
					message = null;
					body = null;
				}
				this.emit(event, {
					payload,
					body,
					message,
					event: e,
					reply(body) {
						that.send({
							message,
							body
						});
					}
				});
			};
		}
	}
	send(body) {
		this.ws.send(JSON.stringify(body));
	}
}
export default ServerClient;