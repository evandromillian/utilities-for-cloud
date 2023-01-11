/**
 * Adapter interface for store and fetch files from storage APIs
 *
 */
export interface StorageAdapter {
  /**
   *
   * @param name file name
   * @param content file content
   */
  storeFile(name: string, content: string): Promise<void>;

  fetchFile(name: string): Promise<string>;
}
