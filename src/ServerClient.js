import WebSocket from "ws";
import EventEmitter from "./EventEmitter.js";
export class ServerClient extends EventEmitter {
	constructor(ws) {
		super();
		this.ws = ws;
		for (let event of ["close", "error", "message", "open"]) {
			let name = `on${event}`;
			this.ws[name] = e => {
				let body;
				let message;
				try {
					body = JSON.parse(e.data);
					message = body.message;
				}
				catch (e) {
					body = e.data;
					message = null;
				}
				this.emit(event, {
					body,
					message,
					event: e
				});
			};
		}
	}
	send(payload) {
		this.ws.send(JSON.stringify(payload));
	}
	reply(body, receivedBody) {
		let message = receivedBody.message;
		this.send({
			message,
			body
		});
	}
}
export default ServerClient;