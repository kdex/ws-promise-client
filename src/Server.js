import WebSocket from "ws";
import EventEmitter from "./EventEmitter.js";
import ServerClient from "./ServerClient.js";
export class Server extends EventEmitter {
	constructor(options) {
		super();
		this.wss = new WebSocket.Server(options);
		for (let event of ["error", "headers", "connection"]) {
			this.wss.on(event, ws => {
				let client = new ServerClient(ws);
				this.emit(event, client);
			});
		}
	}
}
export default Server;