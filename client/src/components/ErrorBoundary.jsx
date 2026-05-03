import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in dev — wire to Sentry here later if needed
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: 'var(--surface)' }}
      >
        <div className="max-w-md w-full text-center">

          {/* Brand */}
          <p
            className="font-display text-2xl text-t1 mb-10"
            style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
          >
            Campus<span style={{ color: '#C9A96E' }}>Chain</span>
          </p>

          {/* Error card */}
          <div
            className="bg-white rounded-2xl px-8 py-10"
            style={{
              border: '1px solid var(--border)',
              boxShadow: '0 4px 24px rgba(11,17,32,0.08)',
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: '#FEF2F2' }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: '#DC2626' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <h1
              className="font-display text-2xl text-t1 mb-3"
              style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
            >
              Something went wrong
            </h1>

            <p
              className="text-sm font-sans leading-relaxed mb-8"
              style={{ color: 'var(--text-3)' }}
            >
              An unexpected error occurred. Your data is safe. Try refreshing
              the page — if the problem persists, contact your administrator.
            </p>

            {/* Error detail — dev only */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div
                className="text-left rounded-xl px-4 py-3 mb-6 overflow-auto max-h-32"
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                }}
              >
                <p
                  className="text-xs font-mono"
                  style={{ color: '#B91C1C' }}
                >
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl text-sm font-sans font-semibold text-white transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #C9A96E 0%, #B8934A 100%)',
                  boxShadow: '0 2px 8px rgba(184,147,74,0.35)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(184,147,74,0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(184,147,74,0.35)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Refresh page
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/dashboard';
                }}
                className="w-full py-3 rounded-xl text-sm font-sans font-medium transition-all duration-150"
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-dim)';
                  e.currentTarget.style.color = 'var(--text-1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-2)';
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          <p
            className="text-xs font-sans mt-6"
            style={{ color: 'var(--text-4)' }}
          >
            CampusChain · Techno India Batanagar
          </p>
        </div>
      </div>
    );
  }
}