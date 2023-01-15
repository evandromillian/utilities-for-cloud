import { DatabaseAdapter, QueryDesc } from '../adapters';
import { toRecord } from './parsers';
import { DefaultKeyStrategy, KeyStrategy } from '.';

/**
 * This is the Base repository class, 
 * that is responsible to parse data to and from the database adapter.
 */
export abstract class BaseRepository<T> {
  keyStrategy: KeyStrategy;

  constructor(private dbAdapter: DatabaseAdapter, strategy?: KeyStrategy) {
    // Define key strategy
    this.keyStrategy = strategy || new DefaultKeyStrategy();
  }

  /**
   * Parse adapter result to the concrete entity
   * @param item
   * @returns parsed entity
   */
  abstract toEntity(item: Record<string, string>): T;

  /**
   *
   *
   * @param item item to be added
   * @returns true if the item didn't exist in the repository earlier
   */
  async create(item: T): Promise<boolean> {
    let record = toRecord(item);
    const key = this.keyStrategy.parseKey(record.id);
    record = {
      ...key,
      record,
    };
    delete record.id;

    return await this.dbAdapter.create(record);
  }

  /**
   * 
   * 
   * @param id item id
   * @param item item to be updated
   * @returns true if item was successfully updated
   */
  async update(id: string, item: T): Promise<boolean> {
    const key = this.keyStrategy.parseKey(id);
    const record = toRecord(item);
    return await this.dbAdapter.update(key, record);
  }

  /**
   * 
   * 
   * @param id item id to be deleted
   * @returns true if the item was deleted
   */
  async delete(id: string): Promise<boolean> {
    const key = this.keyStrategy.parseKey(id);
    return await this.dbAdapter.delete(key);
  }

  /**
   * 
   * 
   * @param item data to search item from repository
   * @returns item
   */
  async find(_item: T): Promise<T[]> {
    throw new Error('Method not implemented.');
  }

  /**
   * 
   * 
   * @param id item id to be found in repository
   * @returns item
   */
  async findOne(id: string): Promise<T> {
    const key = this.keyStrategy.parseKey(id);
    const ret = await this.dbAdapter.findOne(key);
    ret.id = this.keyStrategy.joinKey(ret);
    return this.toEntity(ret);
  }

  /**
   * 
   * 
   * @param query query description
   * @returns array of items
   */
  async query(query: QueryDesc): Promise<T[]> {
    const pquery = this.keyStrategy.parseQuery(query);
    const ret = await this.dbAdapter.query(pquery);
    return ret.map(e => {
      e.id = this.keyStrategy.joinKey(e);
      return this.toEntity(e);
    });
  }
}
