import axios from 'axios';

import { CaptchaService } from '../../src/services';
import { GoogleCaptchaAdapter } from '../../src/adapters';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;


var captchaService: CaptchaService;

describe('Captcha tests', () => {

    beforeAll(async () => {
        const captchaAdapter = new GoogleCaptchaAdapter('234');
        captchaService = new CaptchaService(captchaAdapter);
    });

    beforeEach(() => {
        jest.clearAllMocks()
    });
    
    afterEach(() => {
        
    });

    it('Validate captcha', async () => {
        mockedAxios.post.mockResolvedValue({
            status: 200,
            data: {
                success: true
            }
        });

        const ret = await captchaService.check('ABC');

        expect(ret).toBe(true);
    });
});