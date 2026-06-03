import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile } from '../../api/identity';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Skeleton';
import { useState, useRef, useEffect } from 'react';
import Avatar from '../../components/ui/Avatar';
import { uploadAvatar } from '../../api/identity';

const PRIVACY_FIELDS = [
  { key: 'showPhone',       label: 'Show phone number' },
  { key: 'showCgpa',        label: 'Show CGPA' },
  { key: 'showAddress',     label: 'Show address' },
  { key: 'showBloodGroup',  label: 'Show blood group' },
  { key: 'showDob',         label: 'Show date of birth' },
  { key: 'isProfilePublic', label: 'Public portfolio' },
];

function Toggle({ enabled, onChange }) {
  return (
    <div
      onClick={onChange}
      className="w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0"
      style={{ background: enabled ? '#C9A96E' : 'var(--border)' }}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
        enabled ? 'translate-x-5' : 'translate-x-0.5'
      }`} />
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const qc = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    onSuccess: (d) => {
      const p = d?.data?.profile;
      if (p) setForm(p);
    },
  });

  const profile = data?.data?.profile;
  const detail  = data?.data?.studentDetail;
  const [avatarLoading, setAvatarLoading] = useState(false);

async function handleAvatarUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  // Client-side size check
  if (file.size > 3 * 1024 * 1024) {
    setError('Image must be under 3 MB');
    return;
  }

  setAvatarLoading(true);
  setError('');
  try {
    const res = await uploadAvatar(file);
    qc.invalidateQueries(['profile']);
    setSuccess('Avatar updated');
    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    setError(err.response?.data?.message || 'Upload failed');
  } finally {
    setAvatarLoading(false);
    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
  }
}
  const updateMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      qc.invalidateQueries(['profile']);
      setSuccess('Profile updated successfully');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (e) => setError(e.response?.data?.message || 'Update failed'),
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const toggle = (field) => setForm((f) => ({ ...f, [field]: !f[field] }));

  if (isLoading) return <Spinner />;

  const name = profile?.firstName
    ? `${profile.firstName} ${profile.lastName}`
    : user?.email;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information and privacy settings"
        action={
          editing ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setEditing(false); setError(''); }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={updateMut.isPending}
                onClick={() => updateMut.mutate(form)}
              >
                Save changes
              </Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => { setForm(profile ?? {}); setEditing(true); }}>
              Edit profile
            </Button>
          )
        }
      />

      <Alert type="success" message={success} />
      <Alert type="error"   message={error} />

      {/* Identity card */}
      <Card className="p-6 mb-5">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-sans font-semibold shrink-0"
            style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-sans font-semibold text-t1">{name}</p>
            <p className="text-sm font-sans" style={{ color: 'var(--text-3)' }}>
              {user?.email}
            </p>
            <p className="text-xs font-sans mt-0.5" style={{ color: '#C9A96E' }}>
              {user?.role}
            </p>
          </div>
          {/* Clickable avatar with upload overlay */}
<div className="relative group cursor-pointer shrink-0">
  <Avatar
    avatarUrl={profile?.avatarUrl}
    name={name}
    size="lg"
  />

  {/* Upload overlay — shows on hover */}
  <label
    htmlFor="avatar-upload"
    className="absolute inset-0 flex items-center justify-center rounded-xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-150"
    style={{
      background: 'rgba(11,17,32,0.55)',
      borderRadius: '12px',
    }}
  >
    {avatarLoading ? (
      <div
        className="w-4 h-4 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}
      />
    ) : (
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )}
  </label>

  <input
    id="avatar-upload"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    className="hidden"
    onChange={handleAvatarUpload}
  />
</div>
        </div>

        {detail && (
          <div className="grid grid-cols-3 gap-4 pt-4"
            style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { label: 'XP Total',   value: detail.xpTotal ?? 0 },
              { label: 'Level',      value: detail.level ?? 1 },
              { label: 'Student ID', value: detail.studentId ?? '—' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xs font-sans uppercase tracking-widest mb-1"
                  style={{ color: 'var(--text-4)' }}>
                  {s.label}
                </p>
                <p className="text-lg font-sans font-semibold text-t1">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit form / display */}
      <Card className="p-6 mb-5">
        <SectionLabel>Personal information</SectionLabel>
        {editing ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First name"   value={form.firstName ?? ''} onChange={set('firstName')} />
              <Input label="Last name"    value={form.lastName ?? ''}  onChange={set('lastName')} />
            </div>
            <Input label="Phone"          value={form.phone ?? ''}     onChange={set('phone')} placeholder="+91 00000 00000" />
            <Input label="Portfolio slug" value={form.portfolioSlug ?? ''} onChange={set('portfolioSlug')} placeholder="your-name" />
            <div>
              <label className="block text-xs font-sans font-medium mb-1.5 uppercase tracking-widest"
                style={{ color: 'var(--text-3)' }}>
                Bio
              </label>
              <textarea
                rows={3}
                value={form.bio ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="A short bio about yourself..."
                className="w-full px-4 py-2.5 text-sm font-sans rounded-lg resize-none transition-all duration-150"
                style={{ background: 'var(--white)', border: '1px solid var(--border)', color: 'var(--text-1)', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.2)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {[
              { label: 'Name',      value: name },
              { label: 'Phone',     value: profile?.phone ?? 'Not set' },
              { label: 'Bio',       value: profile?.bio   ?? 'No bio added' },
              { label: 'Portfolio', value: profile?.portfolioSlug ? `/${profile.portfolioSlug}` : 'Not set' },
            ].map((row) => (
              <div key={row.label} className="flex gap-6">
                <p className="text-xs font-sans uppercase tracking-widest w-24 shrink-0 mt-0.5"
                  style={{ color: 'var(--text-4)' }}>
                  {row.label}
                </p>
                <p className="text-sm font-sans" style={{ color: 'var(--text-2)' }}>
                  {row.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Privacy settings */}
      <Card className="p-6">
        <SectionLabel>Privacy settings</SectionLabel>
        <div className="flex flex-col gap-4">
          {PRIVACY_FIELDS.map((pf) => (
            <div key={pf.key} className="flex items-center justify-between">
              <p className="text-sm font-sans" style={{ color: 'var(--text-2)' }}>
                {pf.label}
              </p>
              <Toggle
                enabled={!!(editing ? form[pf.key] : profile?.[pf.key])}
                onChange={() => editing && toggle(pf.key)}
              />
            </div>
          ))}
        </div>
        {!editing && (
          <p className="text-xs font-sans mt-4" style={{ color: 'var(--text-4)' }}>
            Click Edit profile to change your privacy settings
          </p>
        )}
      </Card>
    </div>
  );
}