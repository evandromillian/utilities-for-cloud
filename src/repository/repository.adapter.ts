import { DatabaseAdapter } from "../adapters";
import { toRecord } from "./parsers";

/**
 * Base repository class
 */
export abstract class BaseRepository<T> {

    constructor(private dbAdapter: DatabaseAdapter) { }

    /**
     * Parse adapter result to the concrete entity
     * @param item 
     * @returns parsed entity
     */
    abstract toEntity(item: Record<string, string>): T;

    /**
     * 
     * @param item item to be added
     * @returns true if the item didn't exist in the repository earlier
     */
    async create(item: T): Promise<boolean> {
        const record = toRecord(item);
        return await this.dbAdapter.create(record);
    }

    /**
     * 
     * @param id item id
     * @param item item to be updated
     * @returns true if item was successfully updated
     */
    async update(id: string, item: T): Promise<boolean> {
        const record = toRecord(item);
        return await this.dbAdapter.update(id, record);
    }

    /**
     * 
     * @param id item id to be deleted
     * @returns true if the item was deleted
     */
    async delete(id: string): Promise<boolean> {
        return await this.dbAdapter.delete(id);
    }

    /**
     * 
     * @param item data to search item from repository
     * @returns item
     */
    async find(_item: T): Promise<T[]> {
        throw new Error("Method not implemented.");
    }

    /**
     * 
     * @param id item id to be found in repository
     * @returns item
     */
    async findOne(id: string): Promise<T> {
        const ret = await this.dbAdapter.findOne(id);        
        return this.toEntity(ret);
    }
}