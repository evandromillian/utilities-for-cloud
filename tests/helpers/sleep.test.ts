import { sleep } from '../../src/helpers';

describe('Sleep tests', () => {

    it('Sleep waiting successfully', async () => {
        const start = Date.now();
        await sleep(1000);

        expect(Date.now() - start).toBeGreaterThanOrEqual(1000);
    })

});