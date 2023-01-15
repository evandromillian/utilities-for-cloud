import { CompareType, QueryDesc } from "../../src/adapters";
import { DefaultKeyStrategy, 
         PrefixedKeyStrategy, 
         SplittedKeyStrategy } from "../../src/repository";


describe('Key Strategy tests', () => {

    it('Test parse key with default key strategy', () => {
        const id = 'test';

        const strategy = new DefaultKeyStrategy();
        const key = strategy.parseKey(id);

        expect(key).toStrictEqual({ id });
    });

    it('Test join key with default key strategy', () => {
        const id = 'test';

        const strategy = new DefaultKeyStrategy();
        const key = strategy.joinKey({ id });

        expect(key).toBe(id);
    });

    it('Test parse query with default key strategy', () => {
        const query: QueryDesc = {

        };

        const strategy = new DefaultKeyStrategy();
        const parsedQuery = strategy.parseQuery(query);

        expect(parsedQuery).toStrictEqual(query);
    });

    it('Test parse key with splitted key strategy', () => {
        const separator = ':';
        const id = 'test:test';

        const strategy = new SplittedKeyStrategy(separator);
        const key = strategy.parseKey(id);

        expect(key).toStrictEqual({ pk: 'test', sk: 'test' });
    });

    it('Test join key with splitted key strategy', () => {
        const separator = ':';
        const id = 'test';

        const strategy = new SplittedKeyStrategy(separator);
        const key = strategy.joinKey({ pk: id, sk: id });

        expect(key).toBe(id + separator + id);
    });

    it('Test begins with parse query with splitted key strategy', () => {
        const query: QueryDesc = {
            beginsWith: { 
                id: 'user:6'
            }
        };

        const strategy = new SplittedKeyStrategy(':');
        const parsedQuery = strategy.parseQuery(query);

        expect(parsedQuery).toStrictEqual({
            index: undefined,
            compare: { 
                pk: { type: CompareType.Equals, value: 'user' }
            },
            beginsWith: { 
                sk: '6'
            },
            between: {}
        });
    });

    it('Test between parse query with splitted key strategy', () => {
        const query: QueryDesc = {
            between: { 
                id: { left: 'user:2', right: 'user:69' }
            }
        };

        const strategy = new SplittedKeyStrategy(':');
        const parsedQuery = strategy.parseQuery(query);

        expect(parsedQuery).toStrictEqual({
            index: undefined,
            compare: {
                pk: { type: CompareType.Equals, value: 'user' },
            },
            between: {
                sk: { left: '2', right: '69' }
            },
            beginsWith: {}
        });
    });

    it('Test parse key with prefixed key strategy', () => {
        const prefix = 'test';
        const id = '123';

        const strategy = new PrefixedKeyStrategy(prefix);
        const key = strategy.parseKey(id);

        expect(key).toStrictEqual({ pk: prefix, sk: id });
    });

    it('Test join key with prefixed key strategy', () => {
        const prefix = 'test';
        const id = '123';

        const strategy = new PrefixedKeyStrategy(prefix);
        const key = strategy.joinKey({ pk: prefix, sk: id });

        expect(key).toBe(id);
    });

    it('Test begins with parse query with prefixed key strategy', () => {
        const query: QueryDesc = {
            beginsWith: { 
                id: '6'
            }
        };

        const strategy = new PrefixedKeyStrategy('user');
        const parsedQuery = strategy.parseQuery(query);

        expect(parsedQuery).toStrictEqual({
            index: undefined,
            compare: { 
                pk: { type: CompareType.Equals, value: 'user' }
            },
            beginsWith: { 
                sk: '6'
            },
            between: {}
        });
    });

    it('Test between parse query with prefixed key strategy', () => {
        const query: QueryDesc = {
            between: { 
                id: { left: '2', right: '69' }
            }
        };

        const strategy = new PrefixedKeyStrategy('user');
        const parsedQuery = strategy.parseQuery(query);

        expect(parsedQuery).toStrictEqual({
            index: undefined,
            compare: {
                pk: { type: CompareType.Equals, value: 'user' },
            },
            between: {
                sk: { left: '2', right: '69' }
            },
            beginsWith: {}
        });
    });
});