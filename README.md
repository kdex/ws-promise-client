# ws-promise-client
`ws-promise-client` is a tiny framework that builds a request-response model onto HTML5 WebSockets using ES2015 Promises. You can use this with ES2016's `await`/`async` to simplify your WebSocket API. Browsers, `node.js` and `io.js` environments are supported at the moment.

The API accepts both primitives and Objects; JSON serialization is automatically handled. The server-side WebSocket implementation used by this project is [ws](https://github.com/websockets/ws). The official server to use with this client can be found at [kdex/ws-promise-server](https://github.com/kdex/ws-promise-server).
# Getting started
Your WebSocket code could roughly map to something like this:
```js
import WS from "ws-promise-client";
const ws = new WS("ws://localhost:8080");
(async () => {
    /* The client connects (it will, by default, also automatically reconnect) */
    await ws.open();
    /* Both parties can have an array of return values in `reply` */
    const [result] = await ws.send({
        instruction: "multiply",
        args: [1, 2, 3]
    });
    /* Prints `6` */
    console.log(result);
})();
```
This code creates a client, connects to a server, then sends a message and receives the according reply without the need for setting up any kind of explicit callback or message IDs.
# API reference
#### WS.constructor(url, protocols, options)
Constructs a new `ws-promise-client` connecting to the `url` supporting the subprotocols `protocols`. The `options` argument is an optional object with the following keys:
###### autoReconnect (default: true)
Boolean property that determines whether to automatically reconnect to the server in case of connection losses, and also when the initial connect is unsuccessful.
###### reconnectionFactor (default: 1.2)
Numeric property that determines which factor to multiply the waiting time with after each reconnection try.
###### reconnectionMinimum (default: 2000)
Numeric property that determines the minimum amount of milliseconds to wait before reconnecting. Note that the initial reconnect will be tried immediately after a connection loss, regardless of this amount.
###### rpcOptions
An option object that will be passed to `ws-rpc-client`.
#### WS.prototype.open()
Opens the websocket connection and returns a promise that resolves once the connection is open.
#### WS.prototype.close()
Closes the websocket connection and returns a promise that resolves once the connection is closed.
#### WS.prototype.reconnect(initialWaitingTime)
Reconnects to the websocket connection and returns a promise that resolves once the connection is (re-)opened. Before reconnecting for the first time, there will be a delay of `initialWaitingTime`.
#### WS.prototype.send(payload, options) (inherited)
Sends `payload` to the server and returns a promise that, per default, returns a promise that resolves on the first reply that the server sends. The `options` argument is an optional object with the following keys:
###### timeout
Numeric property that determines the timeout to wait in order to reject the promise.
###### resolveAfterReply (default: true)
Boolean property that determines whether or not to resolve the promise after the first reply.
###### onReply(payload, finished)
Callback function that is called with the server's reply `payload` every time the server sends a reply to this request. If the server has sent its last reply, `finished` will be `true`, otherwise `false`.
#### Events
The following standard WebSocket **client** events can be handled with `on(event, handler):
- error
- close
- open
- message
