"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
	const router = useRouter()
	const [step, setStep] = useState<'form' | 'otp'>('form')
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [otp, setOtp] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
		const [resendLoading, setResendLoading] = useState(false)

	const onSubmitForm = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setSuccess('')
		if (!name.trim()) return setError('Please enter your name.')
		if (password !== confirmPassword) return setError('Passwords do not match.')
		setLoading(true)
		try {
			const res = await fetch('/api/auth/sign-up', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, phone, password }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Signup failed')
			setSuccess('OTP sent to your email. Please verify.')
			setStep('otp')
		} catch (err: any) {
			setError(err.message || 'Signup failed')
		} finally {
			setLoading(false)
		}
	}

	const onVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setSuccess('')
		if (!otp.trim()) return setError('Enter the OTP sent to your email.')
		setLoading(true)
		try {
			const res = await fetch('/api/auth/verify-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, code: otp }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'OTP verification failed')
			setSuccess('Email verified! Redirecting to login...')
			setTimeout(() => router.push('/login'), 1000)
		} catch (err: any) {
			setError(err.message || 'OTP verification failed')
		} finally {
			setLoading(false)
		}

	}

	const onResendOtp = async () => {
		if (!email) return setError('Enter your email first')
		setError('')
		setSuccess('')
		setResendLoading(true)
		try {
			const res = await fetch('/api/auth/resend-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			})
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Failed to resend OTP')
			setSuccess('OTP resent. Check your email!')
		} catch (err: any) {
			setError(err.message || 'Failed to resend OTP')
		} finally {
			setResendLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center px-4 py-10">
			<div className="w-full max-w-xl relative">
				{/* Decorative gradient glow */}
				<div aria-hidden className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-200/50 via-fuchsia-200/40 to-violet-200/40 blur-2xl" />

				<div className="relative bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl rounded-2xl p-6 sm:p-8">
					<div className="mb-6">
						<h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">Create your account</h1>
						<p className="mt-1.5 text-sm text-slate-600">Join us to enjoy faster checkout, order tracking, and personalized recommendations.</p>
					</div>

					{/* Step indicator */}
					<ol className="mb-8 flex items-center gap-3 text-sm">
						<li className="flex items-center gap-2">
							<span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${step === 'form' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>1</span>
							<span className={`hidden sm:inline ${step === 'form' ? 'text-slate-900' : 'text-slate-500'}`}>Account details</span>
						</li>
						<span className="h-px flex-1 bg-slate-200" />
						<li className="flex items-center gap-2">
							<span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${step === 'otp' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>2</span>
							<span className={`hidden sm:inline ${step === 'otp' ? 'text-slate-900' : 'text-slate-500'}`}>Verify email</span>
						</li>
					</ol>

					{step === 'form' ? (
						<form onSubmit={onSubmitForm} className="space-y-5">
							<div>
								<label className="block text-sm font-medium text-slate-700">Full name</label>
								<div className="relative mt-1">
									<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
										{/* user icon */}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-4.418 0-8 2.239-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.761-3.582-5-8-5Z"/></svg>
									</span>
									<input
										className="block w-full rounded-lg border-slate-300 bg-white/90 pl-10 pr-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
										placeholder="Jane Doe"
										value={name}
										onChange={(e) => setName(e.target.value)}
										required
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700">Email</label>
								<div className="relative mt-1">
									<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
										{/* mail icon */}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm-1.4 3.2-6.3 4.2a1 1 0 0 1-1.1 0L4.9 7.2a1 1 0 0 1 1.1-1.6l5.9 3.9 5.9-3.9a1 1 0 1 1 1.1 1.6Z"/></svg>
									</span>
									<input
										type="email"
										className="block w-full rounded-lg border-slate-300 bg-white/90 pl-10 pr-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
										placeholder="you@example.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
								<div className="relative mt-1">
									<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
										{/* phone icon */}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l1.98-1.98a1 1 0 0 1 1.01-.24c1.1.37 2.29.57 3.5.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C11.85 21 3 12.15 3 1a1 1 0 0 1 1-1h2.27a1 1 0 0 1 1 1c0 1.21.2 2.4.57 3.5a1 1 0 0 1-.24 1.01l-1.98 1.98Z"/></svg>
									</span>
									<input
										type="tel"
										className="block w-full rounded-lg border-slate-300 bg-white/90 pl-10 pr-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
										placeholder="(+1) 555-000-0000"
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700">Password</label>
								<div className="relative mt-1">
									<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
										{/* lock icon */}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-6 7.73V17a1 1 0 1 1 2 0v-.27a2 2 0 1 1-2 0ZM9 9V7a3 3 0 1 1 6 0v2H9Z"/></svg>
									</span>
									<input
										type="password"
										className="block w-full rounded-lg border-slate-300 bg-white/90 pl-10 pr-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
										placeholder="At least 8 characters"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-700">Confirm password</label>
								<div className="relative mt-1">
									<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
										{/* lock check icon */}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-3.29 6.71a1 1 0 0 1-1.42 0l-1-1a1 1 0 1 1 1.42-1.42l.29.3 1.29-1.3a1 1 0 0 1 1.42 1.42l-2 2ZM9 9V7a3 3 0 1 1 6 0v2H9Z"/></svg>
									</span>
									<input
										type="password"
										className="block w-full rounded-lg border-slate-300 bg-white/90 pl-10 pr-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
										placeholder="Re-enter your password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
									/>
								</div>
							</div>

							{error && (
								<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.6c.75 1.337-.213 3.001-1.742 3.001H3.48c-1.53 0-2.492-1.664-1.742-3.001l6.518-11.6zM11 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-2a1 1 0 0 1-1-1V7a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1z" clipRule="evenodd"/></svg>
									<span>{error}</span>
								</div>
							)}
							{success && (
								<div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm3.707-9.707a1 1 0 0 0-1.414-1.414L9 10.172 7.707 8.879a1 1 0 1 0-1.414 1.414L9 13l4.707-4.707z" clipRule="evenodd"/></svg>
									<span>{success}</span>
								</div>
							)}

							<button
								type="submit"
								disabled={loading}
								className={`relative w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-70 ${loading ? 'bg-indigo-400' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-600/90 hover:to-violet-600/90'}`}
							>
								{loading ? (
									<span className="inline-flex items-center gap-2">
										<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
										Submitting...
									</span>
								) : (
									'Create account'
								)}
							</button>
							<p className="text-xs text-slate-500">By creating an account, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.</p>
							<p className="text-sm text-slate-600">Already have an account? <a className="text-indigo-600 hover:underline" href="/login">Log in</a></p>
						</form>
					) : (
						<form onSubmit={onVerifyOtp} className="space-y-5">
							<div>
								<label className="block text-sm font-medium text-slate-700">Enter the OTP sent to <span className="font-medium text-slate-900">{email || 'your email'}</span></label>
								<div className="relative mt-1">
									<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
										{/* shield check icon */}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2 3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4Zm3.71 8.29-4 4a1 1 0 0 1-1.42 0l-2-2a1 1 0 1 1 1.42-1.42L11 12.59l3.29-3.3a1 1 0 0 1 1.42 1.42Z"/></svg>
									</span>
									<input
										inputMode="numeric"
										className="block w-full rounded-lg border-slate-300 bg-white/90 pl-10 pr-3 py-2.5 tracking-widest text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
										placeholder="123456"
										value={otp}
										onChange={(e) => setOtp(e.target.value)}
									/>
								</div>
							</div>
							{error && (
								<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.6c.75 1.337-.213 3.001-1.742 3.001H3.48c-1.53 0-2.492-1.664-1.742-3.001l6.518-11.6zM11 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-2a1 1 0 0 1-1-1V7a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1z" clipRule="evenodd"/></svg>
									<span>{error}</span>
								</div>
							)}
							{success && (
								<div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm3.707-9.707a1 1 0 0 0-1.414-1.414L9 10.172 7.707 8.879a1 1 0 1 0-1.414 1.414L9 13l4.707-4.707z" clipRule="evenodd"/></svg>
									<span>{success}</span>
								</div>
							)}
							<button
								type="submit"
								disabled={loading}
								className={`relative w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-70 ${loading ? 'bg-indigo-400' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-600/90 hover:to-violet-600/90'}`}
							>
								{loading ? (
									<span className="inline-flex items-center gap-2">
										<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
										Verifying...
									</span>
								) : (
									'Verify email'
								)}
							</button>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<button
									type="button"
									disabled={resendLoading}
									onClick={onResendOtp}
									className={`inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-white/70 px-4 py-2.5 text-indigo-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60`}
								>
									{resendLoading ? (
										<span className="inline-flex items-center gap-2">
											<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
											Sending...
										</span>
									) : (
										'Resend OTP'
									)}
								</button>
								<button
									type="button"
									className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white/70 px-4 py-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
									onClick={() => setStep('form')}
								>
									Back
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	)
}

