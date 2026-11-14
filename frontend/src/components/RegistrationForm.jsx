import { useState } from 'react'
import FormField from './FormField.jsx'
import { register } from '../services/auth.js'

function RegistrationForm() {
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = formData.get('registration-email')
    const username = formData.get('registration-username')
    const password = formData.get('registration-password')
    const passwordConfirmation = formData.get(
      'registration-password-confirmation',
    )
    setNotice('')
    setError('')

    if (password.length < 5) {
      setError('Password must be at least 5 characters long.')
      return
    }

    if (password !== passwordConfirmation) {
      setError('Passwords do not match. Please check both entries.')
      return
    }

    setIsSubmitting(true)

    try {
      await register(email, username, password)
      setNotice('Your account was created. You can now sign in.')
      form.reset()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Registration failed. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <FormField
        id="registration-email"
        label="Email address"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
      />
      <FormField
        id="registration-username"
        label="Username"
        placeholder="Choose a username"
        autoComplete="username"
      />
      <FormField
        id="registration-password"
        label="Password"
        type="password"
        placeholder="Create a password"
        autoComplete="new-password"
      />
      <FormField
        id="registration-password-confirmation"
        label="Confirm password"
        type="password"
        placeholder="Enter your password again"
        autoComplete="new-password"
      />
      <button
        className="submit-button"
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        <span>{isSubmitting ? 'Creating account…' : 'Create account'}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
          <path
            d="M4.2 10h11.6m-4.8-4.8 4.8 4.8-4.8 4.8"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <p className="form-notice" role="status" aria-live="polite">
        {notice}
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

export default RegistrationForm
