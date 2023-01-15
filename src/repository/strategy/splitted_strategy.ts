import { QueryDesc } from "../../adapters";
import { BeginsWithDesc, BetweenDesc, CompareDesc } from "../../adapters/database/database.adapter";
import { DefaultKeyStrategy } from "./default_strategy";

/**
 * This key strategy translates the entity id to a primary and sort key,
 * that are splitted based on a separator string.
 */
export class SplittedKeyStrategy extends DefaultKeyStrategy {
    
    constructor(private separator: string) {
        super();
    }
    
    parseKey(id: string): Record<string, string> {
      const [left, right] = id.split(this.separator);
      return { pk: left, sk: right };
    }

    joinKey(item: Record<string, string>): string {
      return item.pk + this.separator + item.sk;
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