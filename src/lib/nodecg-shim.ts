/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 Alex Van Camp, Matthew McNamara, and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { NodeCGBrowser, NodeCGStaticBrowser, ReplicantBrowser, ReplicantOptions } from '@/types/nodecg';
import { EventEmitter } from 'events';
import clone from 'clone';

const proxyMetadataMap = new WeakMap();
const metadataMap = new WeakMap<
	any,
	{
		replicant: Replicant<any>;
		proxy: any;
		path: string;
	}
>();
const proxySet = new WeakSet();

const declaredReplicants: Record<string, Record<string, Replicant<any>>> = {};

export class Replicant<V> extends EventEmitter implements ReplicantBrowser<V> {
	public value?: V = undefined;
	public revision = 0;
	public status: 'undeclared' | 'declared' | 'declaring' = 'undeclared';
	public opts: ReplicantOptions<V> = {};

	public _ignoreProxy = false;

	constructor(public name: string, public namespace: string, opts?: ReplicantOptions<V>) {
		super();

		if (!name || typeof name !== 'string') {
			throw new Error('Must supply a name when instantiating a Replicant');
		}

		if (!namespace || typeof namespace !== 'string') {
			throw new Error('Must supply a namespace when instantiating a Replicant');
		}

		// If replicant already exists, return that.
		if ({}.hasOwnProperty.call(declaredReplicants, namespace)) {
			if ({}.hasOwnProperty.call(declaredReplicants[namespace], name)) {
				return declaredReplicants[namespace][name];
			}
		} else {
			declaredReplicants[namespace] = {};
		}

		this.opts = opts || {};
		this.status = 'declaring';

		const originalOnce = this.once.bind(this);
		this.once = (event, listener) => {
			if (event === 'change' && this.status === 'declared') {
				return listener(this.value) as unknown as this;
			}
			return originalOnce(event, listener);
		};

		/* When a new "change" listener is added, chances are that the developer wants it to be initialized ASAP.
		 * However, if this Replicant has already been declared previously in this context, their "change"
		 * handler will *not* get run until another change comes in, which may never happen for Replicants
		 * that change very infrequently.
		 * To resolve this, we immediately invoke all new "change" handlers if appropriate.
		 */
		this.on('newListener', (event, listener) => {
			if (event === 'change' && this.status === 'declared') {
				listener(this.value);
			}
		});

		const thisProxy = new Proxy(this, REPLICANT_HANDLER);
		declaredReplicants[namespace][name] = thisProxy;

		setTimeout(() => {
			thisProxy.value = this.opts.defaultValue;
			this.emit('change', this.value, undefined);
		}, 500);

		return thisProxy;
	}

	_assignValue(newValue: V) {
		const oldValue = clone(this.value);

		this.value = proxyRecursive(this, newValue, '/');

		if (this.status !== 'declared') {
			this.status = 'declared';
			this.emit('declared', this.value);
		}

		this.emit('change', this.value, oldValue);
	}

	static get declaredReplicants() {
		return declaredReplicants;
	}
}

function proxyRecursive<V>(replicant: Replicant<V>, value: V, path: string) {
	if (typeof value === 'object' && value !== null) {
		let p;

		assertSingleOwner(replicant, value);

		if (proxySet.has(value)) {
			p = value;
			const metadata = proxyMetadataMap.get(value);
			metadata.path = path;
		} else if (metadataMap.has(value)) {
			const metadata = metadataMap.get(value)!;
			p = metadata.proxy;
			metadata.path = path;
		} else {
			const handler = Array.isArray(value) ? CHILD_ARRAY_HANDLER : CHILD_OBJECT_HANDLER;
			p = new Proxy(value, handler as any);
			proxySet.add(p);
			const metadata = {
				replicant,
				path,
				proxy: p,
			};
			metadataMap.set(value, metadata);
			proxyMetadataMap.set(p, metadata);
		}

		for (const key in value) {
			if (!{}.hasOwnProperty.call(value, key)) {
				continue;
			}

			const escapedKey = key.replace(/\//g, '~1');
			if (path) {
				const joinedPath = joinPathParts(path, escapedKey);
				(value as any)[key] = proxyRecursive(replicant, (value as any)[key], joinedPath);
			} else {
				(value as any)[key] = proxyRecursive(replicant, (value as any)[key], escapedKey);
			}
		}

		return p;
	}

	return value;
}

function joinPathParts(part1: string, part2: string) {
	return part1.endsWith('/') ? `${part1}${part2}` : `${part1}/${part2}`;
}

function assertSingleOwner<V>(replicant: Replicant<V>, value: V) {
	let metadata;
	if (proxySet.has(value as object)) {
		metadata = proxyMetadataMap.get(value as object);
	} else if (metadataMap.has(value as object)) {
		metadata = metadataMap.get(value as object);
	} else {
		return;
	}

	if (metadata.replicant !== replicant) {
		throw new Error(
			`This object belongs to another Replicant, ${metadata.replicant.namespace}::${metadata.replicant.name}.` +
				`\nA given object cannot belong to multiple Replicants. Object value:\n${JSON.stringify(
					value,
					null,
					2,
				)}`,
		);
	}
}

const deleteTrap = function <V>(target: Replicant<V>, prop: keyof Replicant<V>) {
	const metadata = metadataMap.get(target)!;
	const { replicant } = metadata;

	if (replicant._ignoreProxy) {
		return delete target[prop];
	}

	// If the target doesn't have this prop, return true.
	if (!{}.hasOwnProperty.call(target, prop)) {
		return true;
	}

	return delete target[prop];
};

const ARRAY_MUTATOR_METHODS: (keyof typeof Array.prototype)[] = [
	'copyWithin',
	'fill',
	'pop',
	'push',
	'reverse',
	'shift',
	'sort',
	'splice',
	'unshift',
];

const REPLICANT_HANDLER = {
	get(target: Replicant<any>, prop: keyof Replicant<any>) {
		return target[prop];
	},

	set(target: Replicant<any>, prop: keyof Replicant<any>, newValue: any) {
		if (prop !== 'value') {
			(target[prop] as any) = newValue;
			return true;
		}

		if (newValue === target[prop]) {
			return true;
		}

		target._assignValue(newValue);
		return true;
	},
};

const CHILD_ARRAY_HANDLER = {
	get<V>(target: Array<V>, prop: keyof Array<V>) {
		const metadata = metadataMap.get(target)!;
		const { replicant } = metadata;

		if (replicant._ignoreProxy) {
			return target[prop];
		}

		if (
			{}.hasOwnProperty.call(Array.prototype, prop) &&
			typeof Array.prototype[prop as keyof typeof Array.prototype] === 'function' &&
			target[prop] === Array.prototype[prop as keyof typeof Array.prototype] &&
			ARRAY_MUTATOR_METHODS.indexOf(prop) >= 0
		) {
			/* eslint-disable prefer-spread */
			return (...args: any[]) => {
				replicant._ignoreProxy = true;
				const retValue = (target[prop]! as any).apply(target, args);
				replicant._ignoreProxy = false;

				// We have to re-proxy the target because the items could have been inserted.
				proxyRecursive(replicant, target, metadata.path);

				// TODO: This could leak a non-proxied object and cause bugs!
				return retValue;
			};
			/* eslint-enable prefer-spread */
		}

		return target[prop];
	},

	set<V>(target: Array<V>, prop: keyof Array<V>, newValue: Array<V>[keyof Array<V>]) {
		if (target[prop] === newValue) {
			return true;
		}

		const metadata = metadataMap.get(target)!;
		const { replicant } = metadata;

		if (replicant._ignoreProxy) {
			(target[prop] as any) = newValue;
			return true;
		}

		const oldValue = clone(replicant.value);

		target[prop] = proxyRecursive(metadata.replicant, newValue, joinPathParts(metadata.path, prop as string));

		replicant.emit('change', replicant.value, oldValue);

		return true;
	},

	deleteProperty: deleteTrap,
};

const CHILD_OBJECT_HANDLER = {
	get<T extends object>(target: T, prop: keyof T) {
		const value = target[prop];

		const tag = Object.prototype.toString.call(value);
		const shouldBindProperty =
			prop !== 'constructor' &&
			(tag === '[object Function]' || tag === '[object AsyncFunction]' || tag === '[object GeneratorFunction]');

		if (shouldBindProperty) {
			return (value as any).bind(target);
		}

		return value;
	},

	set<T extends object>(target: T, prop: keyof T, newValue: T[keyof T]) {
		if (target[prop] === newValue) {
			return true;
		}

		const metadata = metadataMap.get(target)!;
		const { replicant } = metadata;

		if (replicant._ignoreProxy) {
			target[prop] = newValue;
			return true;
		}

		const oldValue = clone(replicant.value);

		target[prop] = proxyRecursive(metadata.replicant, newValue, joinPathParts(metadata.path, prop as string));

		replicant.emit('change', replicant.value, oldValue);

		return true;
	},

	deleteProperty: deleteTrap,
};

window.nodecg =
	window.nodecg ||
	(() => {
		const ret: NodeCGBrowser = {} as unknown as NodeCGBrowser;

		const listenerMap = new Map<string, Map<string, ((message: any) => void)[]>>();

		ret.sendMessageToBundle = ((messageName, bundleName, data, cb) => {
			if (!listenerMap.has(bundleName)) return;
			const bundle = listenerMap.get(bundleName)!;

			if (!bundle.has(messageName)) return;
			const listeners = bundle.get(messageName)!;

			listeners.forEach((listener) => listener(data));

			return new Promise(() => {});
		}) as typeof ret.sendMessageToBundle;

		ret.sendMessage = ((messageName, data, cb) => {
			return ret.sendMessageToBundle(messageName, 'nodecg-pratchett', data, cb);
		}) as typeof ret.sendMessage;

		ret.listenFor = ((messageName, bundleName, handlerFunc) => {
			const func = typeof bundleName === 'function' ? bundleName : handlerFunc;
			const name = typeof bundleName === 'function' ? 'nodecg-pratchett' : bundleName;

			if (!listenerMap.has(name)) listenerMap.set(name, new Map());

			const bundle = listenerMap.get(name)!;

			if (!bundle.has(messageName)) bundle.set(messageName, []);

			const array = bundle.get(messageName)!;
			array.push(func);
		}) as typeof ret.listenFor;

		ret.unlisten = ((messageName, bundleName, handlerFunc) => {
			const func = typeof bundleName === 'function' ? bundleName : handlerFunc;
			const name = typeof bundleName === 'function' ? 'nodecg-pratchett' : bundleName;

			if (!listenerMap.has(name)) return;

			const bundle = listenerMap.get(name)!;

			if (!bundle.has(messageName)) return;

			const array = bundle.get(messageName)!;
			const idx = array.findIndex((cb) => cb === func);

			if (idx === -1) return;

			array.splice(idx, 1);
		}) as typeof ret.unlisten;

		ret.Replicant = ((name, namespace, opts) => {
			const options = typeof namespace !== 'string' ? namespace : opts;
			const space = typeof namespace !== 'string' ? 'nodecg-pratchett' : namespace;

			return new Replicant(name, space, options) as ReplicantBrowser<any>;
		}) as typeof ret.Replicant;

		ret.readReplicant = (<V>(name: string, namespace: string, cb: (value: V) => void) => {
			const callback = typeof namespace !== 'string' ? namespace : cb;
			const space = typeof namespace !== 'string' ? 'nodecg-pratchett' : namespace;

			const replicant = new Replicant<V>(name, space);

			if (replicant.status === 'declared') {
				setTimeout(() => {
					callback(replicant.value!);
				}, 0);

				return;
			}

			replicant.once('change', (val) => {
				callback(val);
			});
		}) as typeof ret.readReplicant;

		return ret;
	})();

window.NodeCG =
	window.NodeCG ||
	(() => {
		const ret = {} as NodeCGStaticBrowser;

		ret.declaredReplicants = declaredReplicants;
		ret.waitForReplicants = function (...replicants: Replicant<any>[]) {
			return new Promise((resolve) => {
				const numReplicants = replicants.length;
				let declaredReplicants = 0;
				replicants.forEach((replicant) => {
					replicant.once('change', () => {
						declaredReplicants += 1;
						if (declaredReplicants >= numReplicants) {
							resolve();
						}
					});
				});
			});
		};

		return ret;
	})();
