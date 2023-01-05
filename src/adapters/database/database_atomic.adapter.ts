/**
 * Interface to provide primitives needed to implement 
 * distributed semaphores
 */
export interface DatabaseAtomicAdapter {

    /**
     * 
     * @param id counter id
     * @returns current counter value
     */
    checkCounter(key: Record<string, any>): Promise<number>;

    /**
     * 
     * @param id counter id
     * @param maxValue maximum counter value 
     */
    incrementCounter(key: Record<string, any>, maxValue: number): Promise<boolean>;

    /**
     * 
     * @param id counter id
     */
    decrementCounter(key: Record<string, any>): Promise<boolean>;
}