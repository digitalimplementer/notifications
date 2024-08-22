import { intervalType } from '@/app/page';
import dayjs, { Dayjs } from 'dayjs';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';
import { NextResponse } from 'next/server';

import cron from 'node-cron';

const mailerSend = new MailerSend({
	apiKey: process.env.MAILSENDER_API_KEY!,
});

export async function POST(req: Request) {
	// Process a POST request
	const { interval, time, emails, query, day } = (await req.json()) as {
		interval: intervalType;
		time: Dayjs;
		emails: string[];
		day: number;
		query: string;
	};

	// Calculate next send date and time based on frequency and time
	let cronSchedulePart;
	switch (interval) {
		case 'daily':
			cronSchedulePart = '* * *';
			break;
		case 'weekly':
			if (day >= 29) {
				cronSchedulePart = `* * 28-${day}`;
			} else {
				cronSchedulePart = `* * ${day}`;
			}
			break;
		case 'monthly':
			cronSchedulePart = `${day} * *`;
			break;
		default:
			cronSchedulePart = '* * *';
			break;
	}

	const sentFrom = new Sender(
		'MS_Iyxqdh@trial-3vz9dle650pgkj50.mlsender.net',
		'nepajix4'
	);
	const recipients = emails.map((email) => new Recipient(email));

	const emailParams = new EmailParams()
		.setFrom(sentFrom)
		.setTo(recipients)
		.setSubject('Requested Notifications')
		.setHtml(
			`<div>
            <h2>Hello!</h2>
            <p>
                This is DigitalImplement. You&apos;ve requested notifications about ${query}.
            </p>
            <p>Have a great day,</p>
            <p>DigitalImplement</p>
        </div>`
		);

	async function sendNotification() {
		if (day >= 29) {
			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			// Check if tomorrow's month is different from today's month or is 'The' day
			if (
				today.getMonth() !== tomorrow.getMonth() ||
				today.getDate() === day
			) {
				await mailerSend.email.send(emailParams);
			}
		} else {
			await mailerSend.email.send(emailParams);
		}
	}
	try {
		cron.schedule(
			`${dayjs(time).get('minute')} ${dayjs(time).get('hour')} ` +
				cronSchedulePart,
			sendNotification
		);

		return NextResponse.json(
			{ message: 'Email scheduled successfully.' },
			{ status: 200 }
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: 'Failed to schedule email.' },
			{ status: 500 }
		);
	}
}
