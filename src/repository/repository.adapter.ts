import { DatabaseAdapter } from '../adapters';
import { toRecord } from './parsers';
import { defaultKeyStrategy, KeyStrategy } from './strategy';

/**
 * Base repository class
 */
export abstract class BaseRepository<T> {
  keyStrategy: KeyStrategy;

  constructor(private dbAdapter: DatabaseAdapter, strategy?: KeyStrategy) {
    // Define key strategy
    this.keyStrategy = strategy || defaultKeyStrategy();
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
   * @param id item id to be deleted
   * @returns true if the item was deleted
   */
  async delete(id: string): Promise<boolean> {
    const key = this.keyStrategy.parseKey(id);
    return await this.dbAdapter.delete(key);
  }

  /**
   *
   * @param item data to search item from repository
   * @returns item
   */
  async find(_item: T): Promise<T[]> {
    throw new Error('Method not implemented.');
  }

  /**
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

  async query(): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
}
