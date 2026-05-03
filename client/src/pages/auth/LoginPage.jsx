import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginApi } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.email || !form.password) return;
    setError('');
    setLoading(true);
    try {
      const res = await apiLogin(form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--surface)' }}
    >
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-14"
        style={{
          background: 'linear-gradient(160deg, #1E2D4A 0%, #0B1120 100%)',
        }}
      >
        <p
          className="font-display text-2xl text-white"
          style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
        >
          Campus<span style={{ color: '#C9A96E' }}>Chain</span>
        </p>

        <div>
          <p
            className="font-display text-5xl text-white leading-tight mb-6"
            style={{ fontWeight: 200, letterSpacing: '-0.04em' }}
          >
            Academic life,<br />
            <em style={{ color: '#C9A96E', fontStyle: 'italic' }}>unified.</em>
          </p>
          <p
            className="text-sm font-sans leading-relaxed"
            style={{ color: 'rgba(154,163,186,0.8)', maxWidth: '340px' }}
          >
            Elections, certificates, clubs, events, and your complete campus
            identity — all in one place.
          </p>
        </div>

        <div
          className="text-xs font-sans"
          style={{ color: 'rgba(154,163,186,0.4)' }}
        >
          Techno India Batanagar
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-10">
            <h1
              className="font-display text-3xl text-t1"
              style={{ fontWeight: 300, letterSpacing: '-0.03em' }}
            >
              Welcome back
            </h1>
            <p
              className="text-sm font-sans mt-2"
              style={{ color: 'var(--text-3)' }}
            >
              Log in to your account to continue
            </p>
          </div>

          <Alert type="error" message={error} />

          <div className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@institution.edu.in"
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="flex justify-end mt-2 mb-6">
            <Link
              to="/forgot-password"
              className="text-xs font-sans transition-colors"
              style={{ color: 'var(--text-4)' }}
              onMouseEnter={(e) => (e.target.style.color = '#C9A96E')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-4)')}
            >
              Forgot password?
            </Link>
          </div>

          <Button
            variant="primary"
            loading={loading}
            onClick={handleSubmit}
            className="w-full justify-center py-3"
          >
            Sign in
          </Button>

          <p
            className="text-center text-sm font-sans mt-6"
            style={{ color: 'var(--text-3)' }}
          >
            No account?{' '}
            <Link
              to="/register"
              className="font-medium transition-colors"
              style={{ color: '#C9A96E' }}
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}