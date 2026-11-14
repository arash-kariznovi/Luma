import { useState } from 'react'
import FormField from './FormField.jsx'
import { signIn } from '../services/auth.js'

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="google-icon">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.798 2.716v2.258h2.91c1.702-1.567 2.684-3.875 2.684-6.614Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.181l-2.91-2.258c-.806.54-1.836.86-3.046.86-2.344 0-4.33-1.583-5.04-3.711H.952v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.952a9 9 0 0 0 0 8.08l3.008-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.323 0 2.51.455 3.446 1.348l2.584-2.584C13.463.892 11.426 0 9 0A9 9 0 0 0 .952 4.96l3.008 2.33C4.67 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  )
}

function EyeIcon({ visible }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      {visible ? (
        <>
          <path
            d="M3 3l14 14M8.6 8.6a2 2 0 0 0 2.8 2.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M6.7 5.1A8.3 8.3 0 0 1 10 4.4c4.2 0 7 3.6 7.8 5.6a9.9 9.9 0 0 1-2.1 3.1M4.2 6.7A10 10 0 0 0 2.2 10c.8 2 3.6 5.6 7.8 5.6 1 0 1.9-.2 2.8-.6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M2.2 10S5 4.4 10 4.4 17.8 10 17.8 10 15 15.6 10 15.6 2.2 10 2.2 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
        </>
      )}
    </svg>
  )
}

function LoginForm({ onRegister, onAuthenticated }) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const password = formData.get('password')
    setNotice('')
    setError('')
    setIsSubmitting(true)

    try {
      await signIn(username, password)
      onAuthenticated(username)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Sign in failed. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function showUnavailableMessage() {
    setNotice('This authentication option is not available yet.')
    setError('')
  }

  const passwordToggle = (
    <button
      className="form-field__toggle"
      type="button"
      onClick={() => setPasswordVisible((visible) => !visible)}
      aria-label={passwordVisible ? 'Hide password' : 'Show password'}
      aria-pressed={passwordVisible}
    >
      <EyeIcon visible={passwordVisible} />
    </button>
  )

  return (
    <div className="login-form-wrap">
      <button
        className="social-button"
        type="button"
        onClick={showUnavailableMessage}
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      <div className="form-divider" aria-hidden="true">
        <span>or continue with your username</span>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <FormField
          id="username"
          label="Username"
          placeholder="Enter your username"
          autoComplete="username"
        />
        <FormField
          id="password"
          label="Password"
          type={passwordVisible ? 'text' : 'password'}
          placeholder="Enter your password"
          autoComplete="current-password"
          trailing={passwordToggle}
        />

        <div className="form-options">
          <label className="remember-option">
            <input type="checkbox" name="remember" />
            <span>Remember me</span>
          </label>
          <button
            className="text-button"
            type="button"
            onClick={showUnavailableMessage}
          >
            Forgot password?
          </button>
        </div>

        <button
          className="submit-button"
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          <span>{isSubmitting ? 'Signing in…' : 'Sign in'}</span>
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

      <p className="signup-prompt">
        New to Luma?{' '}
        <button
          className="text-button signup-link"
          type="button"
          onClick={onRegister}
        >
          Create an account
        </button>
      </p>
    </div>
  )
}

export default LoginForm
