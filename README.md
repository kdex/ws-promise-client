# ws-promise-client
`ws-promise-client` is a tiny framework that builds a request-response model onto HTML5 WebSockets using ES2015 Promises. You can use this with ES2016's `await`/`async` to simplify your WebSocket API. Browsers, `node.js` and `io.js` environments are supported at the moment.

The API accepts both primitives and Objects; JSON serialization is automatically handled. The server-side WebSocket implementation used by this project is [ws](https://github.com/websockets/ws). The official server to use with this client can be found at [kdex/ws-promise-server](https://github.com/kdex/ws-promise-server).
# Getting started
Your WebSocket code could roughly map to something like this:
```js
import WS from "ws-promise-client";
let ws = new WS.Client("ws://localhost:8080");
await ws.open();
let response = ws.send("Hi, I'm a browser!");
console.log(response); // "Hello, I'm a server!"
```
This code creates a client, connects to a server, then sends a message and receives the according reply without the need for setting up any kind of callback.