import { readFileSync } from 'node:fs';
import { Injectable, Logger } from '@nestjs/common';
import { compile } from 'handlebars';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import mjml2html from 'mjml';
import appConfig from '../config/app.config';

export enum EmailTemplates {
	VERIFY_USER = 'verify-user.mjml',
	RESET_PASSWORD = 'reset-password.mjml'
}

export interface IEmailVariables {
	link?: string;
}

@Injectable()
export class SmtpService {
	private readonly logger = new Logger(SmtpService.name);

	private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
	private readonly templates: Map<EmailTemplates, HandlebarsTemplateDelegate> = new Map();

	constructor() {
		for (const templateFile of Object.values(EmailTemplates)) {
			const mjmlResult = mjml2html(readFileSync(`emails/templates/${templateFile}`).toString());

			if (mjmlResult.errors.length > 0) {
				throw new Error(
					`Could not parse mjml file "${templateFile}": ${JSON.stringify(mjmlResult.errors, undefined, 2)}`
				);
			}

			const hbsTemplateFn = compile(mjmlResult.html);
			this.templates.set(templateFile, hbsTemplateFn);
		}

		this.transporter = nodemailer.createTransport(
			{
				host: appConfig.SMTP_HOST,
				port: appConfig.SMTP_PORT,
				// Secure: true,
				auth: {
					user: appConfig.SMTP_USER,
					pass: appConfig.SMTP_PASS
				}
			},
			{ debug: appConfig.isDev }
		);
	}

	async sendEmail(recipient: string, subject: string, template: EmailTemplates, variables?: IEmailVariables) {
		const hbsTemplate = this.templates.get(template);

		if (!hbsTemplate) {
			this.logger.error(`Invalid template string: ${template}`);
			return;
		}

		try {
			const result = await this.transporter.sendMail({
				from: `${appConfig.APP_NAME} <${appConfig.SMTP_SENDFROM}>`,
				to: recipient,
				subject,
				html: hbsTemplate({ ...variables, appName: appConfig.APP_NAME })
			});
			this.logger.log(`Email sent - message ID ${result.messageId}`);
		} catch (error: unknown) {
			if (error instanceof Error) {
				this.logger.error('Error sending email', error.stack ?? error);
			}

			throw error;
		}
	}
}
