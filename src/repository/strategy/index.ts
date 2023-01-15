import { QueryDesc } from "../../adapters";

/**
 * Base interface for parsing keys between entity, repository and database adapters.
 */
export interface KeyStrategy {
    parseKey: (id: string) => Record<string, any>;
    joinKey: (item: Record<string, any>) => string;
    parseQuery: (query: QueryDesc) => QueryDesc;
}