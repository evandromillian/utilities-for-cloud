import axios from 'axios';

import { ICaptchaService } from '../../captcha.service';

/**
 * Adapter used to validate reCaptcha authentication.
 *
 * References:
 * * https://developers.google.com/recaptcha
 */
export class GoogleCaptchaService implements ICaptchaService {
  constructor(private captchaSecret: string) {}

  /**
   *
   * @param captcha captcha response from webiste
   * @returns true if captcha is valid, false otherwise
   */
  async check(captcha: string): Promise<boolean> {
    const resp = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${this.captchaSecret}&response=${captcha}`,
      {},
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      },
    );

    return resp.status === 200 && resp.data.success === true;
  }
}
