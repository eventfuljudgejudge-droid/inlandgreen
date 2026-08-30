import Link from "next/link";
import SignupForm from "./signup-form";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Inland Green Bank";

export default function SignupPage() {
  return (
    <div className="auth-page auth-page-glass">
      <div className="auth-hero">
        <Link href="/" className="auth-hero-brand">
          <span className="brand-icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/landmark.svg" alt="" width={20} height={20} />
          </span>
          <span className="brand-text">{APP_NAME}</span>
        </Link>

        <div className="auth-hero-content">
          <h2>Start banking<br />in minutes.</h2>
          <p>
            Create your free account and get access to instant transfers,
            real-time insights, and bank-grade security.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/icons/wallet.svg" alt="" /></div>
              <div>
                <h3>No fees</h3>
                <p>No monthly fees, no hidden charges, ever.</p>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/icons/zap.svg" alt="" /></div>
              <div>
                <h3>Instant account setup</h3>
                <p>Open checking or savings accounts in seconds.</p>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/icons/shield-check.svg" alt="" /></div>
              <div>
                <h3>Fully insured</h3>
                <p>Member FDIC. Your deposits are protected.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Create your account</h1>
            <p>Get started with {APP_NAME} in seconds.</p>
          </div>
          <SignupForm />
          <div className="auth-footer">
            Already have an account? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
