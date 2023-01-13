import { toRecord } from "../../src/repository";
import { parseInteger, parseString } from "../../src/repository/parsers";


describe('Parsers tests', () => {

    it('Test parseString', () => {
        const parsed = parseString('Test');

        expect(parsed.parsed).toBe(true);
        if (parsed.parsed === true) {
            expect(parsed.value).toBe('Test');
        }        
    });

    it('Test parseInteger', () => {
        const parsed = parseInteger('123');

        expect(parsed.parsed).toBe(true);
        if (parsed.parsed === true) {
            expect(parsed.value).toBe(123);
        }        
    });

    it('Test parseInteger not integer', () => {
        const parsed = parseInteger('123.123');

        expect(parsed.parsed).toBe(false);
        if (parsed.parsed === false) {
            expect(parsed.reason).toBe('must be a whole number');
        }        
    });

    it('Test parseInteger not a number', () => {
        const parsed = parseInteger('NaN');

        expect(parsed.parsed).toBe(false);
        if (parsed.parsed === false) {
            expect(parsed.reason).toBe('does not contain a number');
        }        
    });

    it('Test toRecord', () => {
        const user = {
            id: 'user:123',
            name: 'Tester',
            age: 38
        };

        const record = toRecord(user);

        expect(record.id).toBe('user:123');
        expect(record.name).toBe('Tester');
        expect(record.age).toBe('38');
    });
});