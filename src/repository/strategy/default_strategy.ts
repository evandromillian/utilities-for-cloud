import { KeyStrategy } from ".";
import { QueryDesc } from "../../adapters";
import { BeginsWithDesc, BetweenDesc, CompareDesc, CompareType } from "../../adapters/database/database.adapter";

/**
 * 
 */
export class DefaultKeyStrategy implements KeyStrategy {
    constructor() {}

    parseKey(id: string): Record<string, string> {
      return { id };
    }

    joinKey(item: Record<string, string>): string {
      return item.id;
    }
    
    parseQuery(query: QueryDesc): QueryDesc {
      return query;
    }

    /**
     * Parse begins with
     * @param query 
     * @param outCompare 
     * @param outBeginsWith 
     */
    protected parseBeginsWith(query: QueryDesc, outCompare: CompareDesc, outBeginsWith: BeginsWithDesc) {
      const queryBeginsWith = query.beginsWith || {};
      const id_begins = queryBeginsWith['id'];
      if (id_begins !== undefined) {
        const { pk, sk } = this.parseKey(id_begins as string);
    
        // PK should use only Equals comparison
        outCompare['pk'] = {
            type: CompareType.Equals,
            value: pk
        };
    
        outBeginsWith['sk'] = sk;
      }
    }

    /**
     * Parse between
     * @param query 
     * @param outCompare 
     * @param outBetween 
     */
    protected parseBetween(query: QueryDesc, outCompare: CompareDesc, outBetween: BetweenDesc) {
      const queryBetween = query.between || {};
      for (const it of Object.keys(queryBetween)) {
        const { left, right } = queryBetween[it];

        const leftArg = this.parseKey(left as string);
        const rightArg = this.parseKey(right as string);
        
        // TODO asset leftArg.pk === rightArg.pk
        
        // PK should use only Equals comparison
        outCompare['pk'] = {
            type: CompareType.Equals,
            value: leftArg.pk
        };

        outBetween['sk'] = { left: leftArg.sk, right: rightArg.sk };
      }
    }

    protected parseCompare(query: QueryDesc, outCompare: CompareDesc) {
      const queryCompare = query.compare || {};
      for (const it of Object.keys(queryCompare)) {
        const { type, value } = queryCompare[it];

        const { pk, sk } = this.parseKey(value as string);

        // PK should use only Equals comparison
        outCompare['pk'] = {
          type: CompareType.Equals,
          value: pk
        };

        outCompare['sk'] = {
          type: type,
          value: sk
        };
      }
    }
};