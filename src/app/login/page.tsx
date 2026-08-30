import Link from "next/link";
import LoginForm from "./login-form";
import LoginUtilities from "./login-utilities";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Inland Green Bank";

type IconProps = { className?: string };
function Icon({ className, children }: React.PropsWithChildren<IconProps>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function LandmarkIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <line x1="3" x2="21" y1="22" y2="22" />
      <line x1="6" x2="6" y1="18" y2="11" />
      <line x1="10" x2="10" y1="18" y2="11" />
      <line x1="14" x2="14" y1="18" y2="11" />
      <line x1="18" x2="18" y1="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </Icon>
  );
}

function ShieldCheckIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

function ZapIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </Icon>
  );
}

function ChartIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </Icon>
  );
}

function LockIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  );
}

function ArrowRightIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Icon>
  );
}

function ChevronRightIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  );
}

const FEATURES = [
  {
    icon: ZapIcon,
    accent: "blue",
    title: "Instant transfers",
    description: "Send money to anyone, anywhere, in real time.",
  },
  {
    icon: ShieldCheckIcon,
    accent: "cyan",
    title: "Bank-grade security",
    description: "End-to-end encryption and multi-factor protection.",
  },
  {
    icon: ChartIcon,
    accent: "green",
    title: "Real-time insights",
    description: "Track spending, balances, and statements at a glance.",
  },
];

export default function LoginPage() {
  return (
    <div className="login-page">
      <section className="login-hero" aria-label="Inland Green Bank">
        <header className="login-hero-top">
          <Link href="/" className="login-brand">
            <span className="login-brand-icon">
              <LandmarkIcon className="login-brand-logo" />
            </span>
            <span className="login-brand-text">
              <span className="login-brand-name">{APP_NAME}</span>
              <span className="login-brand-tagline">Banking for a better tomorrow</span>
            </span>
          </Link>
        </header>

        <div className="login-hero-mid">
          <span className="login-badge">
            <ShieldCheckIcon className="login-badge-icon" />
            Trusted by thousands
          </span>
          <h1 className="login-headline">
            Your finances,<br />
            simplified<span className="login-headline-accent">.</span>
          </h1>
          <p className="login-hero-sub">
            Secure, fast, and built for the way you manage money today. Sign in to access
            your accounts and start banking.
          </p>

          <div className="login-features">
            {FEATURES.map(f => {
              const IconCmp = f.icon;
              return (
                <div className={`login-feature login-feature-${f.accent}`} key={f.title}>
                  <span className="login-feature-icon">
                    <IconCmp className="login-feature-logo" />
                  </span>
                  <span className="login-feature-body">
                    <span className="login-feature-title">{f.title}</span>
                    <span className="login-feature-desc">{f.description}</span>
                  </span>
                  <ChevronRightIcon className="login-feature-chevron" />
                </div>
              );
            })}
          </div>
        </div>

        <footer className="login-hero-footer">
          <div className="login-trust">
            <span className="login-trust-item">
              <ShieldCheckIcon className="login-trust-icon" />
              Bank-level security
            </span>
            <span className="login-trust-sep" aria-hidden="true" />
            <span className="login-trust-item">
              <LockIcon className="login-trust-icon" />
              256-bit encryption
            </span>
            <span className="login-trust-sep" aria-hidden="true" />
            <span className="login-trust-item">
              <ShieldCheckIcon className="login-trust-icon" />
              PCI DSS compliant
            </span>
          </div>
          <div className="login-copyright">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </div>
        </footer>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <LoginUtilities />

          <div className="login-card-inner">
            <div className="login-brand-circle">
              <span className="login-brand-circle-dots" aria-hidden="true" />
              <span className="login-brand-circle-inner">
                <LandmarkIcon className="login-brand-circle-logo" />
              </span>
            </div>

            <header className="login-card-header">
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue.</p>
            </header>

            <LoginForm />

            <div className="login-divider">
              <span className="login-divider-line" aria-hidden="true" />
              <span className="login-divider-text">Or continue with</span>
              <span className="login-divider-line" aria-hidden="true" />
            </div>

            <div className="login-social">
              <button type="button" className="login-social-btn" disabled aria-label="Sign in with Google (unavailable)">
                <GoogleIcon />
                Google
              </button>
              <button type="button" className="login-social-btn" disabled aria-label="Sign in with Apple (unavailable)">
                <AppleIcon />
                Apple
              </button>
            </div>

            <p className="login-signup">
              Don&apos;t have an account? <Link href="/signup">Create one</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.22 7.22 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.7 12.9c-.02-2.14 1.75-3.17 1.83-3.22-1-.1-1.75-2.53-2.52-2.53-.77-.04-1.5.45-1.9.45-.4 0-1.03-.44-1.68-.43-.87 0-1.66.5-2.11 1.28-.9 1.56-.23 3.87.65 5.14.42.63.93 1.33 1.6 1.3.64-.02.88-.41 1.66-.41.78 0 1 .41 1.68.4.7-.01 1.13-.64 1.55-1.27.49-.72.69-1.42.7-1.46-.01-.01-.63-.24-1.67-.81-.27-.12-.32-.31-.33-.44zM14.6 7.02c.34-.42.57-.99.51-1.57-.49.02-1.09.33-1.45.75-.32.37-.6.97-.52 1.54.55.04 1.11-.28 1.46-.72z"
      />
    </svg>
  );
}
