declare global {
	var nodecg: NodeCGBrowser;
	var NodeCG: NodeCGStaticBrowser;
}

export interface NodeCGBrowser {
	sendMessage(messageName: string, cb?: (error: any, ...args: any[]) => void): Promise<any>;
	sendMessage(messageName: string, data: any, cb?: (error: any, ...args: any[]) => void): Promise<any>;

	sendMessageToBundle(
		messageName: string,
		bundleName: string,
		cb?: (error: any, ...args: any[]) => void,
	): Promise<any>;
	sendMessageToBundle(
		messageName: string,
		bundleName: string,
		data: any,
		cb?: (error: any, ...args: any[]) => void,
	): Promise<any>;

	listenFor(messageName: string, handlerFunc: (message: any) => void): void;
	listenFor(messageName: string, bundleName: string, handlerFunc: (message: any) => void): void;

	unlisten(messageName: string, handlerFunc: (message: any) => void): void;
	unlisten(messageName: string, bundleName: string, handlerFunc: (message: any) => void): void;

	Replicant<V>(name: string, opts?: ReplicantOptions<V>): ReplicantBrowser<V>;
	Replicant<V>(name: string, namespace: string, opts?: ReplicantOptions<V>): ReplicantBrowser<V>;

	readReplicant<V>(name: string, cb: (value: V) => void): void;
	readReplicant<V>(name: string, namespace: string, cb: (value: V) => void): void;
}

export class ReplicantBrowser<V> extends EventEmitter {
	constructor(name: string, namespace?: string, opts?: ReplicantOptions<V>);

	name: string;
	opts: ReplicantOptions<V>;

	value?: V;
	namespace: string;

	once<R>(event: 'change', listener: (value: V) => R): R;
	once<R>(event: string, listener: (...args: any[]) => R): R;

	status: 'undeclared' | 'declared' | 'declaring';

	on(event: 'declared' | 'fullUpdate', listener: (data: V) => void): this;
	on(event: 'change', listener: (newValue: V, oldValue: V, dataOperations: any[]) => void): this;
	on(
		event: 'operationsRejected' | 'assignmentRejected' | 'declarationRejected',
		listener: (rejectReason: any) => void,
	): this;

	[prop: string]: any;
}

interface ReplicantOptions<V> {
	defaultValue?: V;
	persistent?: boolean;
	persistenceInterval?: number;
	schemaPath?: string;
	persistenceInterval?: number;
}

export interface NodeCGStaticBrowser extends NodeCGStaticCommon<'browser'> {
	waitForReplicants(...replicants: ReplicantBrowser<any>[]): Promise<void>;
	declaredReplicants: DeclaredReplicants;
}

export interface DeclaredReplicants {
	[bundleName: string]: { [replicantName: string]: Replicant<any> };
}
