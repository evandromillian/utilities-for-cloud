

export interface KeyStrategy {
    parseKey: (id: string) => Record<string, any>;
    joinKey: (item: Record<string, any>) => string;
}

export function defaultKeyStrategy(): KeyStrategy {
    return {
        parseKey: (id: string): Record<string, string> => {
          return { id };
        },
        joinKey: (item: Record<string, string>) => {
          return item.id;
        },
    };
}

export function splittedKeyStrategy(separator: string): KeyStrategy {
    return {
        parseKey: (id: string): Record<string, string> => {
          const [left, right] = id.split(separator);
          return { pk: left, sk: right };
        },
        joinKey: (item: Record<string, string>) => {
          return item.pk + separator + item.sk;
        },
    };
}

export function prefixedKeyStrategy(prefix: string): KeyStrategy {
    return {
        parseKey: (id: string): Record<string, any> => {
            return { pk: prefix, sk: id }; 
        },
        joinKey: (item: Record<string, any>) => { return item.sk; },
    };     
}