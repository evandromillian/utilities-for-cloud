
/**
 * Base adapter for captch verification
 */
export interface CaptchaAdapter {

    check(captcha: string): Promise<boolean>;
}