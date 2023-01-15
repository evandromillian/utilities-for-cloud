import { QueryDesc } from "../../adapters";
import { BeginsWithDesc, BetweenDesc, CompareDesc } from "../../adapters/database/database.adapter";
import { DefaultKeyStrategy } from "./default_strategy";

/**
 * This key strategy translates the entity id to a primary and sort key,
 * being the first a prefix passed from the constructor.
 */
export class PrefixedKeyStrategy extends DefaultKeyStrategy {
    
    constructor(private prefix: string) {
        super();
    }
    
    parseKey(id: string): Record<string, any> {
        return { pk: this.prefix, sk: id }; 
    }

    joinKey(item: Record<string, any>): string { 
        return item.sk; 
    }

    parseQuery(query: QueryDesc): QueryDesc {
        const compare: CompareDesc = {};
        const beginsWith: BeginsWithDesc = {};
        const between: BetweenDesc = {};
  
        this.parseCompare(query, compare);
        this.parseBeginsWith(query, compare, beginsWith);
        this.parseBetween(query, compare, between);
  
        return {
          index: query.index,
          compare,
          beginsWith,
          between
        };
      }
}