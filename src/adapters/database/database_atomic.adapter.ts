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
    checkCounter(id: string): Promise<number>;

    /**
     * 
     * @param id counter id
     * @param maxValue maximum counter value 
     */
    incrementCounter(id: string, maxValue: number): Promise<boolean>;

    /**
     * 
     * @param id counter id
     */
    decrementCounter(id: string): Promise<boolean>;
}