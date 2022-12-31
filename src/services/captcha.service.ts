/**
 *
 */
export interface ICaptchaService {
  /**
   *
   * @param captcha
   * @returns true
   */
  check(captcha: string): Promise<boolean>;
}
