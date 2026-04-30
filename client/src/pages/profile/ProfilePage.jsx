import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { updateProfileApi, getXPTimelineApi, getMyBadgesApi } from '../../api/identity'
import { listCertificatesApi } from '../../api/identity'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

const XP_EVENT_LABELS = {
  VOTE_CAST: 'Voted in election',
  PROPOSAL_SUBMITTED: 'Submitted a proposal',
  PROPOSAL_UPVOTED: 'Voted on a proposal',
  EVENT_ATTENDED: 'Attended an event',
  CLUB_JOINED: 'Joined a club',
  BADGE_EARNED: 'Earned a badge',
  CERTIFICATE_ISSUED: 'Received a certificate',
  GRIEVANCE_RESOLVED: 'Grievance resolved',
  POLL_PARTICIPATED: 'Participated in a poll',
  CUSTOM: 'Activity',
}

const CERT_TYPE_COLORS = {
  PARTICIPATION: 'bg-sky-50 text-sky-700 border-sky-100',
  ACHIEVEMENT: 'bg-amber-50 text-amber-700 border-amber-100',
  LEADERSHIP: 'bg-violet-50 text-violet-700 border-violet-100',
  ACADEMIC: 'bg-green-50 text-green-700 border-green-100',
  CUSTOM: 'bg-gray-50 text-gray-600 border-gray-100',
}

const BADGE_COLORS = {
  GOVERNANCE: 'bg-blue-50 text-blue-700',
  SOCIAL: 'bg-pink-50 text-pink-700',
  ACADEMIC: 'bg-green-50 text-green-700',
  LEADERSHIP: 'bg-violet-50 text-violet-700',
  EVENTS: 'bg-amber-50 text-amber-700',
  FUN: 'bg-rose-50 text-rose-600',
}

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState('overview')
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    bio: user?.profile?.bio || '',
    portfolioSlug: user?.profile?.portfolioSlug || '',
    showCgpa: user?.profile?.showCgpa ?? false,
    showBloodGroup: user?.profile?.showBloodGroup ?? false,
    showPhone: user?.profile?.showPhone ?? false,
    showAddress: user?.profile?.showAddress ?? false,
    isProfilePublic: user?.profile?.isProfilePublic ?? true,
    cgpa: user?.studentDetail?.cgpa || '',
    bloodGroup: user?.studentDetail?.bloodGroup || '',
    section: user?.studentDetail?.section || '',
    hostelName: user?.studentDetail?.hostelName || '',
  })

  const set = (f) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [f]: val })
  }

  const { data: certificates } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => listCertificatesApi().then((r) => r.data.data.certificates),
  })

  const { data: badges } = useQuery({
    queryKey: ['my-badges'],
    queryFn: () => getMyBadgesApi().then((r) => r.data.data.badges),
  })

  const { data: timeline } = useQuery({
    queryKey: ['xp-timeline'],
    queryFn: () => getXPTimelineApi().then((r) => r.data.data.timeline),
  })

  const updateMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => {
      qc.invalidateQueries(['me'])
      setEditMode(false)
    },
  })

  const sd = user?.studentDetail
  const levelProgress = sd ? Math.min(((sd.xpTotal % 500) / 500) * 100, 100) : 0
  const portfolioUrl = user?.profile?.portfolioSlug
    ? `${window.location.origin}/portfolio/${user.profile.portfolioSlug}`
    : null

  const tabs = ['overview', 'certificates', 'badges', 'timeline']

  return (
    <div className="max-w-4xl flex flex-col gap-6">

      {/* Profile header */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-indigo-600">
                {user?.profile?.firstName?.charAt(0)}{user?.profile?.lastName?.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {sd?.department} · Year {sd?.year} · Semester {sd?.semester}
              </p>
              {user?.profile?.bio && (
                <p className="text-sm text-gray-500 mt-1">{user.profile.bio}</p>
              )}
            </div>
          </div>
          <Button variant="secondary" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Cancel' : 'Edit profile'}
          </Button>
        </div>

        {/* XP bar */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500">Level {sd?.level ?? 1}</span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-500">{sd?.xpTotal ?? 0} XP total</span>
            </div>
            <span className="text-xs text-gray-400">{500 - ((sd?.xpTotal ?? 0) % 500)} XP to next level</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
          {[
            { label: 'Certificates', value: certificates?.length ?? 0 },
            { label: 'Badges', value: badges?.length ?? 0 },
            { label: 'Student ID', value: sd?.studentId ?? 'N/A' },
            { label: 'Section', value: sd?.section ?? 'N/A' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xs text-gray-400 mb-0.5">{s.label}</p>
              <p className="text-sm font-semibold text-gray-800">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Portfolio link */}
        {portfolioUrl && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
            <p className="text-xs text-gray-400">Public portfolio:</p>
            <a href={portfolioUrl} target="_blank" rel="noreferrer"
              className="text-xs text-indigo-500 hover:underline truncate"
            >
              {portfolioUrl}
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(portfolioUrl)}
              className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Edit form */}
      {editMode && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Edit profile</h3>
          <form
            onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form) }}
            className="flex flex-col gap-4"
          >
            <Alert type="error" message={updateMutation.error?.response?.data?.message} />
            <Alert type="success" message={updateMutation.isSuccess ? 'Profile updated successfully' : ''} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={form.firstName} onChange={set('firstName')} />
              <Input label="Last name" value={form.lastName} onChange={set('lastName')} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                rows={2}
                placeholder="A short bio about yourself"
                value={form.bio}
                onChange={set('bio')}
              />
            </div>

            <Input
              label="Portfolio URL slug"
              placeholder="e.g. rahul-das (used in your public link)"
              value={form.portfolioSlug}
              onChange={set('portfolioSlug')}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input label="CGPA" type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.5" value={form.cgpa} onChange={set('cgpa')} />
              <Input label="Blood group" placeholder="e.g. O+" value={form.bloodGroup} onChange={set('bloodGroup')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Section" placeholder="e.g. A" value={form.section} onChange={set('section')} />
              <Input label="Hostel name" placeholder="e.g. Block C" value={form.hostelName} onChange={set('hostelName')} />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Privacy settings</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { key: 'isProfilePublic', label: 'Public profile', desc: 'Allow others to view your portfolio page' },
                  { key: 'showCgpa', label: 'Show CGPA', desc: 'Display your CGPA on your public profile' },
                  { key: 'showBloodGroup', label: 'Show blood group', desc: 'Display your blood group publicly' },
                  { key: 'showPhone', label: 'Show phone number', desc: 'Display your phone number publicly' },
                  { key: 'showAddress', label: 'Show address', desc: 'Display your address publicly' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form[item.key]}
                      onChange={set(item.key)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditMode(false)} className="flex-1">Cancel</Button>
              <Button type="submit" loading={updateMutation.isPending} className="flex-1">Save changes</Button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition capitalize
              ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Academic info</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Student ID', value: sd?.studentId },
                { label: 'Department', value: sd?.department },
                { label: 'Year', value: sd?.year },
                { label: 'Semester', value: sd?.semester },
                { label: 'Section', value: sd?.section || 'N/A' },
                ...(user?.profile?.showCgpa ? [{ label: 'CGPA', value: sd?.cgpa || 'N/A' }] : []),
                ...(user?.profile?.showBloodGroup ? [{ label: 'Blood group', value: sd?.bloodGroup || 'N/A' }] : []),
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span className="text-xs font-medium text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Recent badges</h3>
            {!badges?.length ? (
              <p className="text-xs text-gray-400">No badges earned yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {badges.slice(0, 6).map((ub) => (
                  <span key={ub.id} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${BADGE_COLORS[ub.badge.category] || 'bg-gray-50 text-gray-600'} border-transparent`}>
                    {ub.badge.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certificates tab */}
      {tab === 'certificates' && (
        <div className="flex flex-col gap-3">
          {!certificates?.length ? (
            <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
              <p className="text-sm text-gray-400">No certificates yet.</p>
            </div>
          ) : certificates.map((cert) => (
            <div key={cert.id} className={`bg-white border rounded-xl p-5 ${CERT_TYPE_COLORS[cert.type]}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CERT_TYPE_COLORS[cert.type]}`}>
                      {cert.type.charAt(0) + cert.type.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mt-1">{cert.title}</h3>
                  {cert.description && <p className="text-xs text-gray-500 mt-0.5">{cert.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Issued by {cert.issuedBy}</span>
                    <span>·</span>
                    <span>{new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  {cert.qrCodeUrl && (
                    <img src={cert.qrCodeUrl} alt="QR" className="w-16 h-16 rounded-lg border border-gray-100" />
                  )}
                  <p className="text-xs text-gray-400 font-mono">{cert.uniqueCode.slice(0, 8)}...</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badges tab */}
      {tab === 'badges' && (
        <div>
          {!badges?.length ? (
            <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
              <p className="text-sm text-gray-400">No badges earned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {badges.map((ub) => (
                <div key={ub.id} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mb-2 ${BADGE_COLORS[ub.badge.category] || 'bg-gray-50 text-gray-600'}`}>
                    {ub.badge.category.charAt(0) + ub.badge.category.slice(1).toLowerCase()}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{ub.badge.name}</h4>
                  {ub.badge.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{ub.badge.description}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-2">
                    {new Date(ub.earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline tab */}
      {tab === 'timeline' && (
        <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
          {!timeline?.length ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-400">No activity yet.</p>
            </div>
          ) : timeline.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm text-gray-700">{entry.description || XP_EVENT_LABELS[entry.eventType]}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span className={`text-sm font-semibold flex-shrink-0 ml-4 ${entry.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {entry.amount > 0 ? '+' : ''}{entry.amount} XP
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}