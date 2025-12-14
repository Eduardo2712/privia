import { Injectable } from "@nestjs/common";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import * as nodemailer from "nodemailer";

@Injectable()
export class TransporterService {
    constructor() {}

    public async send(
        mailOptions: nodemailer.SendMailOptions,
        transport: SMTPTransport | SMTPTransport.Options | string,
        defaults?: SMTPTransport.Options | undefined
    ): Promise<void> {
        const transporter = nodemailer.createTransport(transport, defaults);

        await transporter.sendMail(mailOptions);
    }
}

