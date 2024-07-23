

export default class Nex {

/**
 * @type {string}
 */
name

/**
 * @type {number}
 */
version

/**
 * @type {IDBDatabase | undefined}
 */
#db

/**
 * @type {NexMigrator}
 */
#migrators

/**
 * @type {{ removedFields: {storeName: string , fields: string[]}[], addedFields: { storeName: string , fields: Record<string , any>[]}[]}}
 */
#updates

/**
 * 
 * @param {NexDBConfig} config 
 */
constructor({ name, version, migrators = {} }) {

    this.name = name

    this.version = version

    this.#db = undefined

    this.#migrators = migrators

    this.#updates = { removedFields: [] , addedFields: [] }

    this.#initialize(name, version)
}

/**
 * 
 * @param {string} name 
 * @param {number} version 
 */
#initialize(name, version) {

    const request = indexedDB.open(name, version)

    request.addEventListener('upgradeneeded', ev => {

        const upgradeRangeKeys = Object.keys(this.#migrators).filter(version => parseInt(version) > ev.oldVersion && parseInt(version) <= ev.newVersion).map(version => parseInt(version)).sort()

        this.#db = ev.target.result

        const existingStores = this.#db.objectStoreNames

        /**
         * 
         * @param {string} storeName 
         */
        const createStore = (storeName) => {

            if (existingStores.contains(storeName)) return

            this.#db.createObjectStore(storeName, { keyPath: "_id" })
        }

        /**
         * 
         * @param {string} storeName 
         */
        const deleteStore = (storeName) => {
            this.#db.deleteObjectStore(storeName)
        }

        /**
         * 
         * @param {string} storeName 
         * @param {string[]} callback 
         */
        const removeFields = (storeName, fields) => {

            if(!this.#db.objectStoreNames.contains(storeName)) return
            
            let foundUpdate = this.#updates.removedFields.find(upgrade => upgrade.storeName === storeName)
            
            if (foundUpdate) foundUpdate.fields = [...foundUpdate.fields, ...fields]; else this.#updates.removedFields.push({ storeName, fields: [...fields] })
            }
            
            /**
             * 
             * @param {string} storeName 
             * @param {Record<string , any>} callback 
            */
           const addFields = (storeName, fields) => {

            if(!this.#db.objectStoreNames.contains(storeName)) return
            
            let foundUpdate = this.#updates.addedFields.find(upgrade => upgrade.storeName === storeName)

            if (foundUpdate) foundUpdate.fields = [...foundUpdate.fields, fields]; else this.#updates.addedFields.push({ storeName, fields: [fields] })
        }

        upgradeRangeKeys.forEach(key => {
            const mig = this.#migrators[key]

            mig({ createStore, deleteStore, removeFields , addFields })
        })
    })

    request.addEventListener('success', ev => {

        this.#db = ev.target.result

        this.#updates.addedFields.forEach(({ storeName, fields }) => {

            if(!this.#db.objectStoreNames.contains(storeName)) return

            const store = this.#db.transaction([storeName], 'readwrite').objectStore(storeName)

            store.getAll().onsuccess = ({ target: { result } }) => {

                const newData = result.map(item => {

                    let newItem = fields.reduce((prevItem, fields) => {

                        return {...prevItem , ...fields}
                    }, item)

                    return {...newItem , _id: item._id}
                })

                newData.forEach(item => store.put(item))
            }
        })

        this.#updates.removedFields.forEach(({ storeName, fields }) => {

            if(!this.#db.objectStoreNames.contains(storeName)) return

            const store = this.#db.transaction([storeName], 'readwrite').objectStore(storeName)

            store.getAll().onsuccess = ({ target: { result } }) => {

                const newData = result.map(item => {

                    let newItem = Object.entries(item).filter(([key]) => !fields.includes(key)).reduce((prev , [key , value]) => ({...prev , [key] : value}), {})

                    return {...newItem , _id: item._id}
                })

                newData.forEach(item => store.put(item))
            }
        })
    })

    request.addEventListener('error', _ => {
        console.log("Couldn't open database");
    })
}

#generateKey() {

    return Math.floor(Math.random() * 10000000)
}

/**
 * @template T
 * @description Accesses an existing store in the database see.
 * @example ```
 * const notes = db.store<Note>('notes')
 * ```
 * @param {string} storeName 
 */
store(name) {

    /**
 * @function
 * 
 * @param {T} record
 * 
 * @returns {Promise<number>}
 * 
 * @description Adds a single record to the table and returns the key of the record. If a record with the same key already exists, an error occurs. 
 */
    const addOne = async (record) => {

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection = indexedDB.open(this.name, this.version)

        return new Promise((res, rej) => {

            connection.addEventListener('success', e => {

                /**
                 * @type {IDBOpenDBRequest}
                 */
                const db = e.target?.result

                /**
                 * @type {IDBTransaction}
                 */
                const transaction = db.transaction([name], "readwrite")

                transaction.addEventListener('error', rej)

                /**
                 * @type {IDBObjectStore}
                 */
                const store = transaction.objectStore(name)

                const operation = store.add({...record , _id: this.#generateKey()})

                operation.addEventListener('success', e => {
                    res(e.target.result)
                })

                operation.addEventListener('error', rej)
            })

            connection.addEventListener('error', rej)
        })
    }

    /**
     * @function
     * 
     * @param {T[]} records
     * 
     * @returns {Promise<number[]>}
     * 
     * @description Adds multiple records and returns an Array containing the key of each record.
     */
    const addMany = async (records) => {

        return await Promise.all(records.map(record => addOne(record)))
    }

    /**
     * @function
     * 
     * @param {number} key
     * 
     * @param {(data: T) => T} callback
     * 
     * @returns {Promise<number>}
     * 
     * @description Updates a record in the table.
     */
    const updateOne = async (key, callback) => {

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection = indexedDB.open(this.name, this.version)

        return new Promise(async (res, rej) => {


            connection.addEventListener('success', e => {

                /**
                 * @type {IDBOpenDBRequest}
                 */
                const db = e.target?.result

                /**
                 * @type {IDBTransaction}
                 */
                const transaction = db.transaction([name], "readwrite")

                transaction.addEventListener('error', rej)

                /**
                 * @type {IDBObjectStore}
                */
                const store = transaction.objectStore(name)

                const operation = store.get(key)


                operation.addEventListener('success', e => {
                    let data = e.target.result

                    const updateOperation = store.put(callback(data))

                    updateOperation.addEventListener('success', e => {
                        res(e.target.result)
                    })

                    updateOperation.addEventListener('error', rej)
                })

                operation.addEventListener('error', rej)
            })

            connection.addEventListener('error', rej)
        })
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @param {(data: T) => T} callback
     * 
     * @returns {Promise<void>}
     * 
     * @description updates a single record in the table based on a query.
     */
    const updateOneWhere = async (query, callback) =>  {

        const found = await getOneWhere(query)

        if (found) await updateOne(found.id, callback)
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @param {(data: T) => T} callback
     * 
     * @returns {Promise<void>}
     * 
     * @description updates multiple records in the table based on a query.
     */
    const updateAllWhere = async (query, callback) => {

        const matches = await getAllWhere(query)

        await Promise.all(matches.map(_ => updateOneWhere(query, callback)))
    }

    /**
     * 
     * 
     * @function
     * 
     * @param {number} key
     * 
     * @returns {Promise<T|undefined>}
     * 
     * @description Retrieves a record from the table.
     */
    const getOne = async (key) => {

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection = indexedDB.open(this.name, this.version)

        return new Promise((res, rej) => {

            connection.addEventListener('success', e => {

                /**
                 * @type {IDBOpenDBRequest}
                 */
                const db = e.target?.result

                /**
                 * @type {IDBTransaction}
                 */
                const transaction = db.transaction([name])

                transaction.addEventListener('error', e => {
                    rej(e)
                })

                /**
                 * @type {IDBObjectStore}
                 */
                const store = transaction.objectStore(name)

                const operation = store.get(key)

                operation.addEventListener('success', e => {
                    res(e.target.result)
                })

                operation.addEventListener('error', e => {
                    rej(e)
                })
            })

            connection.addEventListener('error', e => {
                rej(e)
            })
        })
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @returns {Promise<T|undefined>}
     * 
     * @description Retrieves a record from the table based on a given query.
     */
    const getOneWhere = async (query) => {

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection = indexedDB.open(this.name, this.version)

        return new Promise((res, rej) => {

            connection.addEventListener('success', e => {

                /**
                 * @type {IDBOpenDBRequest}
                 */
                const db = e.target?.result

                /**
                 * @type {IDBTransaction}
                 */
                const transaction = db.transaction([name])

                transaction.addEventListener('error', e => {
                    rej(e)
                })

                /**
                 * @type {IDBObjectStore}
                 */
                const store = transaction.objectStore(name)

                const operation = store.getAll()

                operation.addEventListener('success', e => {
                    let data = e.target.result

                    const match = data.find(record => Object.entries(query).every(([key, value]) => record[key] === value))

                    res(match)
                })

                operation.addEventListener('error', e => {
                    rej(e)
                })
            })

            connection.addEventListener('error', e => {
                rej(e)
            })
        })
    }

    /**
     * @function
     * 
     * 
     * @returns {Promise<T[]>}
     * 
     * @description Retrieves multiple records from the table.
     */
    const getAll = async () => {

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection = indexedDB.open(this.name, this.version)

        return new Promise((res, rej) => {

            connection.addEventListener('success', e => {

                /**
                 * @type {IDBOpenDBRequest}
                 */
                const db = e.target?.result

                /**
                 * @type {IDBTransaction}
                 */
                const transaction = db.transaction([name])

                transaction.addEventListener('error', e => {
                    rej(e)
                })

                /**
                 * @type {IDBObjectStore}
                 */
                const store = transaction.objectStore(name)

                const operation = store.getAll()

                operation.addEventListener('success', e => {
                    res(e.target.result)
                })

                operation.addEventListener('error', e => {
                    rej(e)
                })
            })

            connection.addEventListener('error', e => {
                rej(e)
            })
        })
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @returns {Promise<T[]>}
     * 
     * @description Retrieves multiple records from the table based on a given query.
     */
    const getAllWhere = async (query) => {

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection = indexedDB.open(this.name, this.version)

        return new Promise((res, rej) => {

            connection.addEventListener('success', e => {

                /**
                 * @type {IDBOpenDBRequest}
                 */
                const db = e.target?.result

                /**
                 * @type {IDBTransaction}
                 */
                const transaction = db.transaction([name])

                transaction.addEventListener('error', e => {
                    rej(e)
                })

                /**
                 * @type {IDBObjectStore}
                 */
                const store = transaction.objectStore(name)

                const operation = store.getAll()

                operation.addEventListener('success', e => {
                    let data = e.target.result

                    const matches = data.filter(record => Object.entries(query).every(([key, value]) => record[key] === value))

                    res(matches)
                })

                operation.addEventListener('error', e => {
                    rej(e)
                })
            })

            connection.addEventListener('error', e => {
                rej(e)
            })
        })
    }

    /**
     * @function
     * 
     * @param {number | string} key
     * 
     * @returns {Promise<void>}
     * 
     * @description removes a single record from the table.
     */
    const deleteOne = async (key) => {

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection = indexedDB.open(this.name, this.version)

        return new Promise((res, rej) => {

            connection.addEventListener('success', e => {

                /**
                 * @type {IDBOpenDBRequest}
                 */
                const db = e.target?.result

                /**
                 * @type {IDBTransaction}
                 */
                const transaction = db.transaction([name], "readwrite")

                transaction.addEventListener('error', e => {
                    rej(e)
                })

                /**
                 * @type {IDBObjectStore}
                 */
                const store = transaction.objectStore(name)

                const operation = store.delete(key)

                operation.addEventListener('success', e => {
                    res()
                })

                operation.addEventListener('error', e => {
                    rej(e)
                })
            })

            connection.addEventListener('error', e => {
                rej(e)
            })
        })
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @returns {Promise<void>}
     * 
     * @description removes a single record from the table based on a query.
     */
     const deleteOneWhere = async (query) => {

        const found = await getOneWhere(query)

        if (found) await deleteOne(found.id)
    }

    /**
     * @function
     * 
     * @param {(number | string)[]} keys
     * 
     * @returns {Promise<void>}
     * 
     * @description removes multiple records from the table.
     */
    const deleteMany = async (keys) => {

        await Promise.all(keys.map(key => deleteOne(key)))
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @returns {Promise<void>}
     * 
     * @description removes multiple records from the table based on a query.
     */
    const deleteAllWhere = async (query) => {

        const matches = await getAllWhere(query)

        await deleteMany(matches.map(m => m.id))
    }

    /**
     * @function
     * 
     * @param {T} query
     * 
     * @returns {Promise<boolean>}
     * 
     * @description Checks wether a record exists by a given query. 
     */
    const hasRecord = async (query) => {

        /**
         * @type {IDBOpenDBRequest}
         */
        const connection = indexedDB.open(this.name, this.version)

        return new Promise((res, rej) => {

            connection.addEventListener('success', e => {

                /**
                 * @type {IDBOpenDBRequest}
                 */
                const db = e.target?.result

                /**
                 * @type {IDBTransaction}
                 */
                const transaction = db.transaction([name], "readwrite")

                transaction.addEventListener('error', rej)

                /**
                 * @type {IDBObjectStore}
                 */
                const store = transaction.objectStore(name)

                const operation = store.getAll()

                operation.addEventListener('success', e => {
                    let data = e.target.result

                    const found = data.find(record => Object.entries(query).every(([key, value]) => record[key] === value))

                    res(found ? true : false)
                })

                operation.addEventListener('error', rej)
            })

            connection.addEventListener('error', rej)
        })
    }

    return { addOne, addMany, updateOne, updateOneWhere, updateAllWhere, getOne, getOneWhere, getAll, getAllWhere, deleteOne, deleteOneWhere, deleteMany, deleteAllWhere, hasRecord }
}
}
