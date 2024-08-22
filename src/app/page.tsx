'use client';

import {
	Alert,
	Box,
	Button,
	ButtonGroup,
	Card,
	Chip,
	Container,
	FormControl,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	SelectChangeEvent,
	TextField,
	Typography,
} from '@mui/material';
import {
	DatePicker,
	LocalizationProvider,
	TimeField,
} from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import CheckIcon from '@mui/icons-material/Check';

export type intervalType = 'daily' | 'weekly' | 'monthly';

const daysOfWeek = [
	'Sunday',
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
];

export default function Home() {
	const [interval, setInterval] = useState<intervalType | null>(null);
	const [day, setDay] = useState<number | null>(null);
	const [time, setTime] = useState<Dayjs | null>(null);
	const [query, setQuery] = useState<string>('');
	const [emailList, setEmailList] = useState<string>('');
	const [emails, setEmails] = useState<string[]>([]);
	const [error, setError] = useState<string>('');
	const [success, setSuccess] = useState<boolean>(false);
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	function handleSetInterval(
		event: SelectChangeEvent<'daily' | 'weekly' | 'monthly' | null>
	) {
		setInterval(event.target.value as intervalType);
	}
	function handleSetDay(event: SelectChangeEvent<number | null>) {
		setDay(+event.target.value!);
	}
	function handleSetTime(value: Dayjs | null) {
		setTime(value);
	}
	function handleSetQuery(
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) {
		setQuery(event.target.value);
	}

	function handleSetEmailList(
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) {
		setEmailList(event.target.value);
	}
	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (
			(event.key === 'Enter' || event.key === ',') &&
			emailList.trim() !== ''
		) {
			event.preventDefault();
			addEmails(emailList);
		}
	}
	function validateEmail(email: string) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	function handleDelete(emailToDelete: string) {
		setEmails(emails.filter((email) => email !== emailToDelete));
	}
	function addEmails(input: string) {
		const emailList = input
			.split(/[\s,;]+/)
			.map((email) => email.trim())
			.filter((email) => email !== '');

		const invalidEmails = emailList.filter(
			(email) => !validateEmail(email)
		);
		if (invalidEmails.length > 0) {
			setError(`Invalid email(s): ${invalidEmails.join(', ')}`);
			return;
		}

		const newEmails = emailList.filter((email) => !emails.includes(email));
		if (newEmails.length > 0) {
			setEmails([...emails, ...newEmails]);
			setEmailList('');
			setError('');
		} else {
			setError('All entered emails are already added.');
		}
	}

	function handleClear() {
		setInterval(null);
		setDay(null);
		setTime(null);
		setQuery('');
		setEmailList('');
		setEmails([]);
		setError('');
	}

	async function handleSend() {
		const req = { interval, emails, time, query, day };

		const response = await fetch('/api/send', {
			method: 'POST',
			body: JSON.stringify(req),
		});

		if (response.status < 300) {
			setSuccess(true);
			setTimeout(() => {
				setSuccess(false);
			}, 3000);
		}
	}

	return (
		<Box component='main' py={4}>
			<Container>
				<Paper>
					<Box p={4}>
						<Typography variant='h4' component='h1'>
							Manage Big Notifications
						</Typography>
						<Typography variant='body1' component='h2'>
							Configure your email notification settings for
							relevant business bids.
						</Typography>
						<Box py={3}>
							<Grid2 container spacing={2}>
								<Grid2 xs={3}>
									<FormControl fullWidth>
										<InputLabel id='interval-select-label'>
											Notification Interval
										</InputLabel>
										<Select
											labelId='interval-select-label'
											id='interval-select'
											value={interval}
											label='Notification Interval'
											fullWidth
											onChange={handleSetInterval}
										>
											<MenuItem value='daily'>
												Daily
											</MenuItem>
											<MenuItem value='weekly'>
												Weekly
											</MenuItem>
											<MenuItem value='monthly'>
												Monthly
											</MenuItem>
										</Select>
									</FormControl>
								</Grid2>
								<Grid2 xs={3}>
									<FormControl
										fullWidth
										disabled={interval === 'daily'}
									>
										<InputLabel id='interval-select-label'>
											Notification Day
										</InputLabel>
										<Select
											labelId='interval-select-label'
											id='interval-select'
											value={day}
											label='Notification Interval'
											fullWidth
											onChange={handleSetDay}
										>
											{[
												...Array(
													interval === 'weekly'
														? 7
														: 31
												).keys(),
											].map((value) => (
												<MenuItem
													key={value}
													value={
														value +
														(interval === 'weekly'
															? 0
															: 1)
													}
												>
													{interval === 'weekly'
														? daysOfWeek[value]
														: value + 1}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid2>
								<Grid2 xs={3}>
									<LocalizationProvider
										dateAdapter={AdapterDayjs}
										adapterLocale='en'
									>
										<TimeField
											label='Notification Time'
											format='HH:mm'
											fullWidth
											value={time}
											onChange={handleSetTime}
										/>
									</LocalizationProvider>
								</Grid2>
								<Grid2 xs={3}>
									<TextField
										label='Search Query'
										value={query}
										fullWidth
										onChange={handleSetQuery}
									/>
								</Grid2>
								<Grid2 xs>
									<TextField
										variant='outlined'
										label='Add Emails'
										fullWidth
										value={emailList}
										onChange={handleSetEmailList}
										onKeyDown={handleKeyDown}
										error={!!error}
										helperText={
											error ||
											'Separate emails with commas, spaces, or semicolons'
										}
									/>
									<Box
										sx={{
											display: 'flex',
											flexWrap: 'wrap',
											gap: 1,
											marginTop: 2,
										}}
									>
										{emails.map((email, index) => (
											<Chip
												key={index}
												label={email}
												onDelete={() =>
													handleDelete(email)
												}
											/>
										))}
									</Box>
								</Grid2>
							</Grid2>
						</Box>
						<ButtonGroup
							variant='outlined'
							aria-label='Basic button group'
						>
							<Button color='error' onClick={handleClear}>
								Clear
							</Button>
							<Button
								variant='contained'
								onClick={handleSend}
								disabled={emails.length === 0}
							>
								Create
							</Button>
						</ButtonGroup>
					</Box>
				</Paper>
			</Container>
			{success && (
				<Alert
					sx={{ marginTop: '25px' }}
					icon={<CheckIcon fontSize='inherit' />}
					severity='success'
				>
					Here is a gentle confirmation that your action was
					successful.
				</Alert>
			)}
		</Box>
	);
}
