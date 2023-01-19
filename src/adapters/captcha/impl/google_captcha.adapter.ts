import axios from 'axios';

import { CaptchaAdapter } from "../captcha.adapter";

/**
 * Google adapter for reCAPTCHA authentication
 * 
 * References:
 * - https://developers.google.com/recaptcha
 */
export class GoogleCaptchaAdapter implements CaptchaAdapter {
    
    private static readonly URL_START = 'https://www.google.com/recaptcha/api/siteverify?secret=';
    private static readonly RESPONSE_ARG = '&response=';
    private static readonly HEADERS = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      };

    constructor(private captchaSecret: string) {}
    
    async check(captcha: string): Promise<boolean> {
        const url = GoogleCaptchaAdapter.URL_START + 
                    this.captchaSecret + 
                    GoogleCaptchaAdapter.RESPONSE_ARG + 
                    captcha;
        const resp = await axios.post(url, {}, GoogleCaptchaAdapter.HEADERS);
      
        return resp.status === 200 && resp.data.success === true;
    }

}