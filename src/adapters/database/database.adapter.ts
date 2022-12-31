/**
 * Base interface to persist data to a database.
 * Currently is implemented per database and model.
 */
export interface DatabaseAdapter {
  /**
   *
   * @param item item to be added
   * @returns true if the item didn't exist in the repository earlier
   */
  create(data: Record<string, string>): Promise<boolean>;

  /**
   *
   * @param id item id
   * @param item item to be updated
   * @returns true if item was successfully updated
   */
  update(id: string, data: Record<string, string>): Promise<boolean>;

  /**
   *
   * @param id item id to be deleted
   * @returns true if the item was deleted
   */
  delete(id: string): Promise<boolean>;

  /**
   *
   * @param id item id to be found in repository
   * @returns item
   */
  findOne(id: string): Promise<Record<string, string>>;

  /**
   *
   * @param item data to search item from repository
   * @returns item
   */
  find(data: Record<string, string>): Promise<Record<string, string>>;
}
