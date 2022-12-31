/**
 * 
 */
export interface ISemaphoreService {
    
    /**
     * Acquire the semaphore
     * @returns true is semaphore has been successfully acquired
     */
    acquire(): Promise<boolean>;

    /**
     * Release the semaphore
     * @returns true is semaphore has been successfully released
     */
    release(): Promise<boolean>;
}