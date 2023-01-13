export declare type Arg = string | number | boolean | null | undefined;

export enum CompareType {
  Equals,
  NotEquals,
  GreaterThan,
  GreaterOrEqual,
  LesserThan,
  LesserOrEqual,
}

/**
 * Information about fields and conditions required for the query.
 */
export interface QueryDesc {
  readonly index?: string;
  readonly beginsWith?: {
    [field: string]: { readonly value: Arg };
  };
  readonly between?: {
    [field: string]: {
      readonly left: Arg;
      readonly right: Arg;
    };
  };
  readonly compare?: {
    [field: string]: {
      readonly type: CompareType;
      readonly field?: string;
      readonly value?: Arg;
    };
  };
}

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
  create(data: Record<string, any>): Promise<boolean>;

  /**
   *
   * @param id item id
   * @param item item to be updated
   * @returns true if item was successfully updated
   */
  update(key: Record<string, any>, data: Record<string, any>): Promise<boolean>;

  /**
   *
   * @param id item id to be deleted
   * @returns true if the item was deleted
   */
  delete(key: Record<string, any>): Promise<boolean>;

  /**
   *
   * @param id item id to be found in repository
   * @returns item
   */
  findOne(key: Record<string, any>): Promise<Record<string, any>>;

  /**
   *
   * @param item data to search item from repository
   * @returns item
   */
  find(data: Record<string, any>): Promise<Record<string, any>>;

  /**
   *
   * @param query
   * @returns array of items
   */
  query(desc: QueryDesc): Promise<Record<string, any>[]>;
}
