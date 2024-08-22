'use client';

import {
	Box,
	Button,
	ButtonGroup,
	Card,
	Container,
	FormControl,
	InputLabel,
	MenuItem,
	Paper,
	Select,
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

export type intervalType = 'daily' | 'weekly' | 'monthly';

export default function Home() {
	const [interval, setInterval] = useState<intervalType | null>(null);
	const [day, setDay] = useState<number | null>(null);
	const [time, setTime] = useState<Dayjs | null>(null);
	const [query, setQuery] = useState<string>('');
	const [emailList, setEmailList] = useState<string>('');
	const [emails, setEmails] = useState<string[]>([]);
	const [isValid, setIsValid] = useState<boolean>(true);
	const [range, setRange] = useState<number | null>(null);
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	function handleSetInterval(value: intervalType) {
		setInterval(value);
		switch (value) {
			case 'daily':
				setRange(24);
				break;

			default:
				break;
		}
	}
	function handleSetDay(value: number) {
		setDay(value);
	}
	function handleSetTime(value: Dayjs | null) {
		setTime(value);
	}
	function handleSetQuery(value: string) {
		setQuery(value);
	}
	function handleSetEmailList(value: string) {
		const inputEmails = value.split(/,*\s+/); // Assuming one email per line
		const allValid = inputEmails.every((email) =>
			emailRegex.test(email.trim())
		);
		setEmailList(value);
		setIsValid(allValid);
		setEmails(inputEmails);
	}

	function handleClear() {
		setInterval(null);
		setDay(null);
		setTime(null);
		setQuery('');
		setEmailList('');
		setEmails([]);
		setIsValid(true);
	}

	async function handleSend() {
		const req = { interval, emails, time, query, day };

		await fetch('/api/send', {
			method: 'POST',
			body: JSON.stringify(req),
		});
	}

	return (
		<Box component='main'>
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
						<Box p={3}>
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
											onChange={(event) =>
												handleSetInterval(
													event.target
														.value as intervalType
												)
											}
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
											onChange={(event) =>
												handleSetDay(
													+event.target.value!
												)
											}
										>
											{[
												...Array(
													interval === 'weekly'
														? 7
														: 28
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
													{value + 1}
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
											onChange={(newValue) =>
												handleSetTime(newValue)
											}
										/>
									</LocalizationProvider>
								</Grid2>
								<Grid2 xs={3}>
									<TextField
										label='Search Query'
										value={query}
										fullWidth
										onChange={(event) => {
											handleSetQuery(event.target.value);
										}}
									/>
								</Grid2>
								<Grid2 xs>
									<TextField
										label='Email List'
										value={emailList}
										fullWidth
										multiline
										rows={2}
										onChange={(event) => {
											handleSetEmailList(
												event.target.value
											);
										}}
										error={!isValid}
										helperText={
											!isValid
												? 'One or more emails are invalid.'
												: ''
										}
									/>
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
							<Button variant='contained' onClick={handleSend}>
								Create
							</Button>
						</ButtonGroup>
					</Box>
				</Paper>
			</Container>
		</Box>
	);
}
