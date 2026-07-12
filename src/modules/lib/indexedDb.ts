function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})
}

export class IndexedDbStore<TValue> {
	private dbName: string
	private storeName: string
	private dbPromise: Promise<IDBDatabase> | null = null

	constructor(dbName: string, storeName: string) {
		this.dbName = dbName
		this.storeName = storeName
	}

	private open(): Promise<IDBDatabase> {
		if (!this.dbPromise) {
			this.dbPromise = new Promise((resolve, reject) => {
				const request = indexedDB.open(this.dbName, 1)
				request.onupgradeneeded = () => {
					const database = request.result
					if (!database.objectStoreNames.contains(this.storeName)) {
						database.createObjectStore(this.storeName)
					}
				}
				request.onsuccess = () => resolve(request.result)
				request.onerror = () => reject(request.error)
			})
		}
		return this.dbPromise
	}

	private async withStore<TResult>(
		mode: IDBTransactionMode,
		body: (store: IDBObjectStore) => IDBRequest<TResult>,
	): Promise<TResult> {
		const database = await this.open()
		const transaction = database.transaction(this.storeName, mode)
		const request = body(transaction.objectStore(this.storeName))
		return promisifyRequest(request)
	}

	async getAll(): Promise<TValue[]> {
		return this.withStore("readonly", (store) => store.getAll())
	}

	async put(key: string, value: TValue): Promise<void> {
		await this.withStore("readwrite", (store) => store.put(value, key))
	}

	async delete(key: string): Promise<void> {
		await this.withStore("readwrite", (store) => store.delete(key))
	}
}
