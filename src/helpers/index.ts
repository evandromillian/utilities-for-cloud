
/**
 * Wait an amount of milliseconds asynchronously
 * 
 * @param timeInMillis 
 * @async
 */
export async function sleep(timeInMillis: number): Promise<void> {
    return new Promise( resolve => setTimeout(resolve, timeInMillis) );
}