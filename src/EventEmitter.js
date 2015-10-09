function synonym(name) {
	return (target, method) => {
		let synonymize = array => {
			if (array.some(elm => elm.name === method && elm.type === "add")) {
				target[name] = target[method];
				Object.unobserve(target, synonymize);
			}
		};
		Object.observe(target, synonymize);
	};
}
export class EventEmitter {
	constructor() {
		this.events = new Map();
	}
	@synonym("on")
	addEventListener(event, callback) {
		if (callback instanceof Function) {
			/* Retrieve the listeners for this event type */
			let callbacks = this.events.get(event);
			/* Add a new set if necessary */
			if (!callbacks || !callbacks.size) {
				callbacks = new Set();
				this.events.set(event, callbacks);
			}
			/* Add a callback if necessary */
			if (!callbacks.has(callback)) {
				callbacks.add(callback);
			}
			return this;
		}
		else {
			throw new TypeError();
		}
	}
	@synonym("off")
	removeEventListener(event, callback) {
		if (callback instanceof Function) {
			/* Retrieve the listeners for this event type */
			let callbacks = this.events.get(event);
			/* Add a new set if necessary */
			if (!callbacks) {
				return this;
			}
			/* Remove the callback if necessary */
			if (callbacks.has(callback)) {
				callbacks.delete(callback);
			}
			/* Remove the event if necessary */
			if (!callbacks.size) {
				this.events.delete(event);
			}
			return this;
		}
		else {
			throw new TypeError();
		}
	}
	emit(event, ...args) {
		let callbacks = this.events.get(event);
		if (!callbacks || !callbacks.size) {
			return false;
		}
		for (let callback of callbacks) {
			callback.apply(null, args);
		}
	}
}
export default EventEmitter;