

/**
 * @typedef {(options: { 
 * createStore(storeName: string):void, 
 * deleteStore(storeName: string):void, 
 * addFields(storeName: string , fields: Record<string , any>):void
 * removeFields(storeName: string , fields: string[]): void
 * }) => void} NexMigratorCallback
 */

/**
 * @typedef {Record<number , NexMigratorCallback>} NexMigrator
 */

/**
 * @typedef {{ name: string , version?: number , migrators: NexMigrator }} NexDBConfig
 */

