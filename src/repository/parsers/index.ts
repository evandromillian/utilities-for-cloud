export type CellParse<T> =
| { parsed: true; value: T; }
| { parsed: false; reason: string; };

export function parseInteger(s: string): CellParse<number> {
    const n = Number(s);
    if (Number.isNaN(n)) { 
        return { parsed: false, reason: "does not contain a number" }; 
    }
    
    if (!Number.isInteger(n)) { 
        return { parsed: false, reason: "must be a whole number" }; 
    }

    return { parsed: true, value: n };
};

export function parseString(s: string): CellParse<string> {
    return { parsed: true, value: s };
}
 
/**
 * 
 * @param object 
 * @returns 
 */
export function toRecord(object: any): Record<string, any> {
    const record: Record<string, any> = {};
    Object.entries(object).reduce((obj, val) => {
                                        const [key, value] = val;
                                        obj[key] = (typeof(value) === 'number') ? value.toString() : value as string;
                                        return obj;
                                    }, record);

    return record;
}