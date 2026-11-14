import { useState } from 'react'
import BrandMark from './BrandMark.jsx'
import LoginForm from './LoginForm.jsx'
import RegistrationForm from './RegistrationForm.jsx'

function LoginPage({ onAuthenticated }) {
  const [showRegistration, setShowRegistration] = useState(false)

  return (
    <main className="login-page">
      <section className="welcome-panel" aria-label="About Luma">
        <div className="welcome-panel__glow" aria-hidden="true" />
        <BrandMark light />

        <div className="welcome-copy">
          <p className="eyebrow">
            <span className="eyebrow__dot" />
            Your space to do great work
          </p>
          <h1>
            Good things
            <br />
            happen when
            <br />
            <span>we work together.</span>
          </h1>
          <p className="welcome-copy__description">
            One calm place for your team to plan, create, and move forward.
          </p>
        </div>

        <div className="welcome-footer">
          <div className="avatar-stack" aria-hidden="true">
            <span className="avatar avatar--one">J</span>
            <span className="avatar avatar--two">M</span>
            <span className="avatar avatar--three">A</span>
            <span className="avatar avatar--four">S</span>
          </div>
          <p>
            <strong>Teams are finding their flow.</strong>
            <span>Join a community of thoughtful doers.</span>
          </p>
        </div>
      </section>

      <section
        className="form-panel"
        aria-labelledby={showRegistration ? 'registration-title' : 'login-title'}
      >
        <div className="form-panel__top">
          <span>{showRegistration ? 'Create your Luma account' : 'Already a member?'}</span>
          <span className="secure-label">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
              <path
                d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2m-8 0h9v7h-9V7Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Secure sign in
          </span>
        </div>

        <div className="form-panel__content">
          <div className="mobile-brand">
            <BrandMark />
          </div>
          {showRegistration ? (
            <>
              <p className="form-eyebrow">GET STARTED</p>
              <h2 id="registration-title">Create your account</h2>
              <p className="form-intro">
                Choose a username and password to join Luma.
              </p>
              <RegistrationForm />
              <p className="signup-prompt">
                Already have an account?{' '}
                <button
                  className="text-button signup-link"
                  type="button"
                  onClick={() => setShowRegistration(false)}
                >
                  Sign in
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="form-eyebrow">WELCOME BACK</p>
              <h2 id="login-title">Sign in to Luma</h2>
              <p className="form-intro">Pick up right where you left off.</p>
              <LoginForm
                onRegister={() => setShowRegistration(true)}
                onAuthenticated={onAuthenticated}
              />
            </>
          )}
        </div>

        <footer className="form-footer">
          <span>© {new Date().getFullYear()} Luma Workspace</span>
          <nav aria-label="Legal">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#help">Help</a>
          </nav>
        </footer>
      </section>
    </main>
  )
}

export default LoginPage
