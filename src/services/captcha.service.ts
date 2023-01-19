import { CaptchaAdapter } from "../adapters";

/**
 *
 */
export class CaptchaService {

  constructor(private adapter: CaptchaAdapter) {}

  /**
   *
   * @param captcha
   * @returns true
   */
  async check(captcha: string): Promise<boolean> {
    return await this.adapter.check(captcha);
  }
}
