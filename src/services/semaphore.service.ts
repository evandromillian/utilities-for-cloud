import { DatabaseAtomicAdapter } from "../adapters";

/**
 *
 */
export class SemaphoreService {

  constructor(private adapter: DatabaseAtomicAdapter, private keyName: string, private maxSemaphores = 1) {
    
  }

  /**
   * Acquire the semaphore
   * @returns true is semaphore has been successfully acquired
   */
  async acquire(): Promise<boolean> {
    return await this.adapter.incrementCounter(this.keyName, this.maxSemaphores);
  }

  /**
   * 
   * @param timeout 
   */
  async acquireWithTimeout(_timeout: number): Promise<boolean> {
    throw new Error("Not implemented");
  }

  /**
   * Release the semaphore
   * @returns true is semaphore has been successfully released
   */
  async release(): Promise<boolean> {
    return await this.adapter.decrementCounter(this.keyName);
  }
}
