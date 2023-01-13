import { defaultKeyStrategy, prefixedKeyStrategy, splittedKeyStrategy } from "../../src/repository/strategy";


describe('Key Strategy tests', () => {

    it('Test parse key with default key strategy', async () => {
        const id = 'test';

        const strategy = defaultKeyStrategy();
        const key = strategy.parseKey(id);

        expect(key).toStrictEqual({ id });
    });

    it('Test join key with default key strategy', async () => {
        const id = 'test';

        const strategy = defaultKeyStrategy();
        const key = strategy.joinKey({ id });

        expect(key).toBe(id);
    });

    it('Test parse key with splitted key strategy', async () => {
        const separator = ':';
        const id = 'test:test';

        const strategy = splittedKeyStrategy(separator);
        const key = strategy.parseKey(id);

        expect(key).toStrictEqual({ pk: 'test', sk: 'test' });
    });

    it('Test join key with splitted key strategy', async () => {
        const separator = ':';
        const id = 'test';

        const strategy = splittedKeyStrategy(separator);
        const key = strategy.joinKey({ pk: id, sk: id });

        expect(key).toBe(id + separator + id);
    });

    it('Test parse key with prefixed key strategy', async () => {
        const prefix = 'test';
        const id = '123';

        const strategy = prefixedKeyStrategy(prefix);
        const key = strategy.parseKey(id);

        expect(key).toStrictEqual({ pk: prefix, sk: id });
    });

    it('Test join key with prefixed key strategy', async () => {
        const prefix = 'test';
        const id = '123';

        const strategy = prefixedKeyStrategy(prefix);
        const key = strategy.joinKey({ pk: prefix, sk: id });

        expect(key).toBe(id);
    });

});