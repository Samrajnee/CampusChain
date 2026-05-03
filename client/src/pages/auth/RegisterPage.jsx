import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register as apiRegister } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const ROLES = [
  { value: 'STUDENT',       label: 'Student' },
  { value: 'TEACHER',       label: 'Teacher' },
  { value: 'HOD',           label: 'Head of Department' },
  { value: 'LAB_ASSISTANT', label: 'Lab Assistant' },
  { value: 'LIBRARIAN',     label: 'Librarian' },
];

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = account, 2 = details
  const [form, setForm] = useState({
    email:      '',
    password:   '',
    confirm:    '',
    role:       'STUDENT',
    firstName:  '',
    lastName:   '',
    department: '',
    studentId:  '',
    year:       '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Step 1 validation ──────────────────────────────────────────────────────
  function validateStep1() {
    if (!form.email.trim())               return 'Email is required';
    if (!form.email.includes('@'))        return 'Enter a valid email';
    if (form.password.length < 8)         return 'Password must be at least 8 characters';
    if (form.password !== form.confirm)   return 'Passwords do not match';
    return null;
  }

  function handleNext() {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!form.firstName.trim()) { setError('First name is required'); return; }
    if (!form.lastName.trim())  { setError('Last name is required'); return; }

    setError('');
    setLoading(true);

    try {
      const payload = {
        email:      form.email,
        password:   form.password,
        role:       form.role,
        firstName:  form.firstName,
        lastName:   form.lastName,
        ...(form.role === 'STUDENT' && {
          department: form.department || undefined,
          studentId:  form.studentId  || undefined,
          year:       form.year ? parseInt(form.year) : undefined,
        }),
      };

      const res = await apiRegister(payload);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  // ── Progress bar ───────────────────────────────────────────────────────────
  function ProgressDots() {
    return (
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div
            key={s}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width:      s === step ? '24px' : '8px',
              background: s <= step ? '#C9A96E' : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
        <p
          className="text-xs font-sans ml-1"
          style={{ color: 'rgba(154,163,186,0.7)' }}
        >
          Step {step} of 2
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface)' }}>

      {/* ── Left panel ─────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-14"
        style={{
          background: 'linear-gradient(160deg, #1E2D4A 0%, #0B1120 100%)',
        }}
      >
        {/* Brand */}
        <p
          className="font-display text-2xl text-white"
          style={{ fontWeight: 300, letterSpacing: '-0.02em' }}
        >
          Campus<span style={{ color: '#C9A96E' }}>Chain</span>
        </p>

        {/* Hero copy */}
        <div>
          <p
            className="font-display text-5xl text-white leading-tight mb-6"
            style={{ fontWeight: 200, letterSpacing: '-0.04em' }}
          >
            Your campus
            <br />
            identity starts
            <br />
            <em style={{ color: '#C9A96E', fontStyle: 'italic' }}>here.</em>
          </p>
          <p
            className="text-sm font-sans leading-relaxed"
            style={{ color: 'rgba(154,163,186,0.8)', maxWidth: '340px' }}
          >
            Every vote, certificate, club, and event you participate in
            builds a permanent, verifiable campus record.
          </p>

          {/* Feature list */}
          <div className="mt-8 flex flex-col gap-3">
            {[
              'Verified certificates with QR codes',
              'XP and badge system for engagement',
              'One-click PDF resume generation',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: '#C9A96E' }}
                />
                <p
                  className="text-sm font-sans"
                  style={{ color: 'rgba(154,163,186,0.7)' }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p
          className="text-xs font-sans"
          style={{ color: 'rgba(154,163,186,0.3)' }}
        >
          Techno India Batanagar
        </p>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-sm animate-fade-up">

          {/* Step heading */}
          <div className="mb-8">
            <h1
              className="font-display text-3xl text-t1"
              style={{ fontWeight: 300, letterSpacing: '-0.03em' }}
            >
              {step === 1 ? 'Create account' : 'Your details'}
            </h1>
            <p
              className="text-sm font-sans mt-2"
              style={{ color: 'var(--text-3)' }}
            >
              {step === 1
                ? 'Set up your login credentials'
                : 'Tell us a bit about yourself'}
            </p>
          </div>

          <ProgressDots />

          <Alert type="error" message={error} />

          {/* ── Step 1 — credentials ────────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <Input
                label="Institutional email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="33200123052@tib.edu.in"
                autoComplete="email"
              />

              {/* Role selector */}
              <div>
                <label
                  className="block text-xs font-sans font-medium mb-1.5"
                  style={{
                    color: 'var(--text-3)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, role: r.value }))
                      }
                      className="py-2.5 px-3 rounded-lg text-sm font-sans text-left transition-all duration-150"
                      style={{
                        background:
                          form.role === r.value
                            ? 'rgba(201,169,110,0.1)'
                            : 'var(--white)',
                        border:
                          form.role === r.value
                            ? '1px solid #C9A96E'
                            : '1px solid var(--border)',
                        color:
                          form.role === r.value
                            ? '#C9A96E'
                            : 'var(--text-2)',
                        fontWeight: form.role === r.value ? 500 : 400,
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
              />

              <Input
                label="Confirm password"
                type="password"
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Repeat your password"
                autoComplete="new-password"
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />

              <Button
                variant="primary"
                onClick={handleNext}
                className="w-full justify-center py-3 mt-1"
              >
                Continue
              </Button>
            </div>
          )}

          {/* ── Step 2 — personal details ────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First name"
                  value={form.firstName}
                  onChange={set('firstName')}
                  placeholder="Arjun"
                  autoFocus
                />
                <Input
                  label="Last name"
                  value={form.lastName}
                  onChange={set('lastName')}
                  placeholder="Roy"
                />
              </div>

              {/* Student-only fields */}
              {form.role === 'STUDENT' && (
                <>
                  <Input
                    label="Student ID"
                    value={form.studentId}
                    onChange={set('studentId')}
                    placeholder="33200123052"
                  />

                  <div>
                    <label
                      className="block text-xs font-sans font-medium mb-1.5"
                      style={{
                        color: 'var(--text-3)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Department
                    </label>
                    <select
                      value={form.department}
                      onChange={set('department')}
                      className="w-full px-4 py-2.5 text-sm font-sans rounded-lg transition-all duration-150"
                      style={{
                        background: 'var(--white)',
                        border: '1px solid var(--border)',
                        color: form.department
                          ? 'var(--text-1)'
                          : 'var(--text-4)',
                        outline: 'none',
                        boxShadow: '0 1px 2px rgba(11,17,32,0.04)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#C9A96E';
                        e.currentTarget.style.boxShadow =
                          '0 0 0 3px rgba(201,169,110,0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow =
                          '0 1px 2px rgba(11,17,32,0.04)';
                      }}
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-sans font-medium mb-1.5"
                      style={{
                        color: 'var(--text-3)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Year
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, year: String(y) }))
                          }
                          className="flex-1 py-2.5 rounded-lg text-sm font-sans font-medium transition-all duration-150"
                          style={{
                            background:
                              form.year === String(y)
                                ? 'rgba(201,169,110,0.1)'
                                : 'var(--white)',
                            border:
                              form.year === String(y)
                                ? '1px solid #C9A96E'
                                : '1px solid var(--border)',
                            color:
                              form.year === String(y)
                                ? '#C9A96E'
                                : 'var(--text-3)',
                          }}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-1">
                <Button
                  variant="secondary"
                  onClick={() => { setError(''); setStep(1); }}
                  className="flex-1 justify-center py-3"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  loading={loading}
                  onClick={handleSubmit}
                  className="flex-1 justify-center py-3"
                >
                  Create account
                </Button>
              </div>
            </div>
          )}

          <p
            className="text-center text-sm font-sans mt-6"
            style={{ color: 'var(--text-3)' }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium transition-colors"
              style={{ color: '#C9A96E' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#B8934A')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#C9A96E')}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}