import "babel-register";
import test from "ava";
import * as exports from "../src/index";
import Server from "ws-promise-server";
const { Client } = exports;
const port = 1234;
let index = 0;
test.beforeEach(async t => {
	t.context.environment = (index => ({
		server: new Server({
			port: port + index
		}),
		makeClient() {
			return new Client(`ws://localhost:${port + index}`);
		}
	}))(index);
	++index;
	await t.context.environment.server.open();
});
test.afterEach.always(async t => {
	await t.context.environment.server.close();
});
function limit(promise) {
	const fail = new Promise((resolve, reject) => {
		setTimeout(() => {
			reject();
		}, 3000);
	})
	return Promise.race([promise, fail]);
}
function decideTest(client, t, method, ...events) {
	for (const event of events) {
		client.on(event, () => t[method]());
	}
}
function passOn(client, t, ...events) {
	decideTest(client, t, "pass", ...events);
}
function failOn(client, t, ...events) {
	decideTest(client, t, "fail", ...events);
}
test("There is both a default as well as a named export", t => {
	t.plan(1);
	if (Object.keys(exports).length !== 2) {
		t.fail();
	}
	else if (!exports.default || !exports.Client) {
		t.fail();
	}
	else if (exports.default !== exports.Client) {
		t.fail();
	}
	else {
		t.pass();
	}
});
test("Opening a connection without a server running will be rejected", async t => {
	const passList = ["connectionFailed", "close", "error"];
	const failList = ["open", "message", "reconnect"];
	const { environment: { server, makeClient }} = t.context;
	t.plan(passList.length + 1);
	try {
		await limit(new Promise(async (resolve, reject) => {
			await server.close();
			const client = makeClient();
			passOn(client, t, ...passList);
			failOn(client, t, ...failList);
			try {
				await client.open();
				t.fail();
			}
			catch (e) {
				reject(e);
			}
		}));
	}
	catch (e) {
		t.pass();
	}
});
test("Opening a connection with a server running will be resolved", async t => {
	const passList = ["open"];
	const failList = ["message", "reconnect", "connectionFailed", "close", "error"];
	const { environment: { server, makeClient }} = t.context;
	t.plan(passList.length + 1);
	try {
		await limit(new Promise(async (resolve, reject) => {
			const client = makeClient();
			passOn(client, t, ...passList);
			failOn(client, t, ...failList);
			try {
				await client.open();
				resolve();
			}
			catch (e) {
				reject(e);
			}
		}));
		t.pass();
	}
	catch (e) {
		t.fail();
	}
});
test("`onOpen` fires exactly once", async t => {
	const failList = ["message", "connectionFailed", "error"];
	const { environment: { server, makeClient }} = t.context;
	t.plan(2);
	try {
		await limit(new Promise(async (resolve, reject) => {
			const client = makeClient();
			client.onOpen = e => {
				t.pass();
			};
			failOn(client, t, ...failList);
			try {
				await client.open();
				await client.close();
				await client.open();
				resolve();
			}
			catch (e) {
				reject(e);
			}
		}));
	}
	catch (e) {
		t.fail();
	}
});
test("`on` can handle multiple handlers", async t => {
	const failList = ["message", "reconnect", "connectionFailed", "close", "error"];
	const { environment: { server, makeClient }} = t.context;
	t.plan(2);
	try {
		await limit(new Promise(async (resolve, reject) => {
			const client = makeClient();
			client.on("open", e => {
				t.pass();
			});
			client.on("open", e => {
				t.pass();
			});
			failOn(client, t, ...failList);
			try {
				await client.open();
				resolve();
			}
			catch (e) {
				reject(e);
			}
		}));
	}
	catch (e) {
		t.fail();
	}
});
test("Receiving a message fires exactly one `message` event", async t => {
	const failList = ["reconnect", "connectionFailed", "close", "error"];
	const { environment: { server, makeClient }} = t.context;
	t.plan(1);
	try {
		await limit(new Promise(async (resolve, reject) => {
			server.on("connection", rpc => {
				rpc.send({
					instruction: "greet"
				});
			});
			const client = makeClient();
			client.on("message", msg => {
				t.pass();
				resolve();
			});
			failOn(client, t, ...failList);
			try {
				await client.open();
			}
			catch (e) {
				reject(e);
			}
		}));
	}
	catch (e) {
		t.fail();
	}
});
test("Receiving a message fires exactly one specialized event", async t => {
	const failList = ["reconnect", "connectionFailed", "close", "error"];
	const { environment: { server, makeClient }} = t.context;
	t.plan(1);
	try {
		await limit(new Promise(async (resolve, reject) => {
			server.on("connection", rpc => {
				rpc.send({
					instruction: "greet"
				});
			});
			const client = makeClient();
			client.on("greet", () => {
				t.pass();
				resolve();
			});
			failOn(client, t, ...failList);
			try {
				await client.open();
			}
			catch (e) {
				reject(e);
			}
		}));
	}
	catch (e) {
		t.fail();
	}
});