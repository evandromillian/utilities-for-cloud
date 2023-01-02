import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

import { GoogleCaptchaService } from "../../src/services";

var captchaService: GoogleCaptchaService;

describe('Captcha tests', () => {

    beforeAll(async () => {
        captchaService = new GoogleCaptchaService('234');
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