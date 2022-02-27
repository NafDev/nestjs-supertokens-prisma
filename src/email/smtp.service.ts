import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { AppConfig } from '../config/config.service';
import mjml2html = require('mjml');

export enum EmailTemplates {
  VERIFY_USER = 'verify-user.mjml',
}

export interface IEmailVariables {
  verifyLink?: string;
}

@Injectable()
export class SmtpService {
  private readonly logger = new Logger(SmtpService.name);

  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(private readonly appConfig: AppConfig) {
    for (const template in EmailTemplates) {
      const templateFile = EmailTemplates[template];

      const mjmlResult = mjml2html(readFileSync(`emails/templates/${templateFile}`).toString());
      if (mjmlResult.errors.length !== 0) {
        this.logger.error(`Could not parse mjml file ${templateFile} -> ${mjmlResult.errors}`);
        process.exit(1);
      }

      const hbsTemplateFn = compile(mjmlResult.html);
      this.templates.set(templateFile, hbsTemplateFn);
    }

    const smtpConn = appConfig.smtpConnection;

    this.transporter = nodemailer.createTransport({
      host: smtpConn.host,
      port: smtpConn.port,
      secure: true,
      auth: {
        user: smtpConn.user,
        pass: smtpConn.pass,
      },
    });
  }

  sendEmail(recipient: string, subject: string, template: EmailTemplates, variables?: IEmailVariables) {
    return this.transporter.sendMail({
      from: `${this.appConfig.appName ? `"${this.appConfig.appName}"` : ''} <${this.appConfig.sendFromEmail}>`,
      to: recipient,
      subject,
      html: this.templates.get(template)({ ...variables, appName: this.appConfig.appName }),
    });
  }
}
