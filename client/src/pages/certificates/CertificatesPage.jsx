import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listCertificatesApi, issueCertificateApi } from '../../api/identity'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

const ADMIN_ROLES = ['TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN']

const CERT_TYPE_COLORS = {
  PARTICIPATION: 'bg-sky-50 text-sky-700',
  ACHIEVEMENT: 'bg-amber-50 text-amber-700',
  LEADERSHIP: 'bg-violet-50 text-violet-700',
  ACADEMIC: 'bg-green-50 text-green-700',
  CUSTOM: 'bg-gray-50 text-gray-600',
}

export default function CertificatesPage() {
  const { user } = useAuth()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const qc = useQueryClient()
  const [showIssue, setShowIssue] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => listCertificatesApi().then((r) => r.data.data.certificates),
  })

  const certificates = data ?? []

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Certificates</h2>
          <p className="text-sm text-gray-400 mt-0.5">Your verified credentials and awards</p>
        </div>
        {isAdmin && <Button onClick={() => setShowIssue(true)}>Issue certificate</Button>}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <p className="text-sm text-gray-400">No certificates yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${CERT_TYPE_COLORS[cert.type]}`}>
                      {cert.type.charAt(0) + cert.type.slice(1).toLowerCase()}
                    </span>
                    {cert.isRevoked && (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-500">
                        Revoked
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{cert.title}</h3>
                  {cert.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{cert.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Issued by {cert.issuedBy}</span>
                    <span>·</span>
                    <span>{new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <p className="text-xs font-mono text-gray-300 mt-1">ID: {cert.uniqueCode}</p>
                </div>
                {cert.qrCodeUrl && (
                  <img src={cert.qrCodeUrl} alt="QR code" className="w-20 h-20 rounded-xl border border-gray-100 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showIssue && (
        <IssueCertificateModal
          onClose={() => setShowIssue(false)}
          onSuccess={() => { setShowIssue(false); qc.invalidateQueries(['my-certificates']) }}
        />
      )}
    </div>
  )
}

function IssueCertificateModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    userId: '', title: '', description: '',
    type: 'PARTICIPATION', issuedBy: '',
  })
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const mutation = useMutation({ mutationFn: issueCertificateApi, onSuccess })

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Issue certificate</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="p-6 flex flex-col gap-4">
          <Alert type="error" message={mutation.error?.response?.data?.message} />
          <Input label="Student user ID" placeholder="Paste the student's UUID" value={form.userId} onChange={set('userId')} required />
          <Input label="Certificate title" placeholder="e.g. Best Outgoing Student 2025" value={form.title} onChange={set('title')} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              rows={2}
              value={form.description}
              onChange={set('description')}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
              value={form.type}
              onChange={set('type')}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              {['PARTICIPATION', 'ACHIEVEMENT', 'LEADERSHIP', 'ACADEMIC', 'CUSTOM'].map((t) => (
                <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <Input label="Issued by" placeholder="e.g. Department of Computer Science" value={form.issuedBy} onChange={set('issuedBy')} required />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={mutation.isPending} className="flex-1">Issue</Button>
          </div>
        </form>
      </div>
    </div>
  )
}