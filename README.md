# ws-promise-client
`ws-promise-client` is a tiny framework that builds a request-response model onto HTML5 WebSockets using ES2015 Promises. You can use this with ES2017's `await`/`async` to simplify your WebSocket API. Both browsers and `node.js` are supported.

The official server to use with this client can be found at [kdex/ws-promise-server](https://github.com/kdex/ws-promise-server). This client supports any server that adheres to the [RPC protocol](https://github.com/kdex/ws-rpc-client/).
# Getting started
Your WebSocket code could roughly map to something like this:
```js
import Client from "ws-promise-client";
const client = new Client("ws://localhost:8080");
(async () => {
	/* The client connects (it will, by default, also automatically reconnect) */
	await client.open();
	/* Both parties can have an array of return values in `reply` */
	const [result] = await client.send({
		instruction: "multiply",
		args: [1, 2, 3]
	});
	/* Prints `6` */
	console.log(result);
})();
```
This code creates a client, connects to a server, then sends a message and receives the according reply without the need for setting up any kind of explicit callback or message IDs.
# API reference
#### Client.constructor(url, protocols, options)
Constructs a new `ws-promise-client` connecting to the `url` supporting the subprotocols `protocols`. The `options` argument is an optional object with the following keys:
###### autoReconnect (default: true)
Boolean property that determines whether to automatically reconnect to the server in case of connection losses, and also when the initial connect is unsuccessful.
###### reconnectionFactor (default: 1.2)
Numeric property that determines which factor to multiply the waiting time with after each reconnection try.
###### reconnectionMinimum (default: 2000)
Numeric property that determines the minimum amount of milliseconds to wait before reconnecting. Note that the initial reconnect will be tried immediately after a connection loss, regardless of this amount.
###### rpcOptions
An option object that will be passed to the constructor of `ws-rpc-client`.
#### Client.prototype.open()
Opens the websocket connection and returns a promise that resolves once the connection is open.
#### Client.prototype.close()
Closes the websocket connection and returns a promise that resolves once the connection is closed.
#### Client.prototype.reconnect(newWaitingTime)
Reconnects to the server and returns a `Promise` that resolves once the connection is (re-)opened. Before reconnecting for the first time, there will be a delay of `newWaitingTime`. If `newWaitingTime` is not provided, `reconnectionMinimum` is used.
#### Client.prototype.send(payload)
Sends `payload` to the server and returns a `Promise` that that resolves when the server's reply has been received. For more information on which keys are needed in `payload`, see [the protocol](https://github.com/kdex/ws-rpc-client/) (which also defines the `send` method).
#### Events
The following standard WebSocket **client** events are supported:
- close
- error
- message
- open

The client also provides these additional events:
- connectionFailed
- reconnect
- [instruction]

The `[instruction]` event is a custom event that fires once an instruction with the name of `instruction` is received. For example, if the server sends a message with an instruction of `showMenu`, the client will call its `onShowMenu` method (if available) with the arguments that the server has put in the payload's `args` property.

All events can either be handled by providing a handler method named `on[Event]` (see example above) or by registering an event listeners via `on(event, handler)`.
