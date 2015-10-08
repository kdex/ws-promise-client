# websocket-promise
`websocket-promise` is a tiny framework that builds a request-response model onto HTML5 WebSockets using ES2015 Promises. You can use this with ES2016's `await`/`async` to simplify your WebSocket API. Browsers, `node.js` and `io.js` are supported at the moment.

The API accepts both primitives and Objects (JSON serialization is automatically handled). The server-side WebSocket implementation used by this project is [ws](https://github.com/websockets/ws).
# Getting started
### Server code
```js
import WebSocketServer from "./Server.js";
let server = new WebSocketServer({
	port: 8080
});
server.addEventListener("connection", ws => {
	ws.addEventListener("message", msg => {
		msg.reply("Hello, I'm a server!");
	});
});
```
### Client code
Using `websocket-promise`, your client's WebSocket code could roughly map into this:
```js
import WebSocket from "./Client.js";
let ws = new WebSocket("ws://localhost:8080");
await ws.open();
let response = ws.send("Hi, I'm a browser!");
console.log(response); // "Hello, I'm a server!"
```
# Supporting browsers
Note that without custom adjustments, you'll have to use an ES2015 module loader such as [SystemJS](https://github.com/systemjs/systemjs) to run this in your browser.