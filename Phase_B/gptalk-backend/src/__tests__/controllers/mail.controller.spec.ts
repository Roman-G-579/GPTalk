import nodemailer from 'nodemailer';
import { sendMail } from '../../controllers/mail.controller';
import { Config } from '../../config/config';

jest.mock('nodemailer');

describe('sendMail', () => {
	let mockSendMail: jest.Mock;
	let mockCreateTransport: jest.Mock;

	beforeEach(() => {
		mockSendMail = jest.fn().mockResolvedValue('Email sent');
		mockCreateTransport = nodemailer.createTransport as jest.Mock;
		mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should send an email with the correct options', async () => {
		const mailOptions = {
			from: 'test@example.com',
			to: 'recipient@example.com',
			subject: 'Test Subject',
			text: 'Test Email Body',
		};

		const result = await sendMail(mailOptions);

		expect(mockCreateTransport).toHaveBeenCalledWith({
			service: 'gmail',
			auth: {
				user: Config.ADMIN_EMAIL,
				pass: Config.ADMIN_PASSWORD,
			},
			tls: {
				rejectUnauthorized: false,
			},
		});

		expect(mockSendMail).toHaveBeenCalledWith(mailOptions);
		expect(result).toBe('Email sent');
	});
});
