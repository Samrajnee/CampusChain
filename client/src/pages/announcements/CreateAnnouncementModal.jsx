import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createAnnouncement } from '../../api/announcements';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

const ROLES = [
  { value: '', label: 'All roles' },
  { value: 'STUDENT', label: 'Students only' },
  { value: 'TEACHER', label: 'Teachers only' },
  { value: 'HOD', label: 'HODs only' },
  { value: 'PRINCIPAL', label: 'Principal' },
];

const DEPARTMENTS = [
  '', 'Computer Science', 'Electronics', 'Mechanical',
  'Civil', 'Information Technology', 'Electrical',
];

const YEARS = ['', 1, 2, 3, 4, 5, 6];

export default function CreateAnnouncementModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    body: '',
    targetRole: '',
    targetDept: '',
    targetYear: '',
    isPinned: false,
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      createAnnouncement({
        title: form.title,
        body: form.body,
        targetRole: form.targetRole || null,
        targetDept: form.targetDept || null,
        targetYear: form.targetYear ? parseInt(form.targetYear) : null,
        isPinned: form.isPinned,
      }),
    onSuccess: onCreated,
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to post announcement');
    },
  });

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            Post Announcement
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
        </div>

        <Alert type="error" message={error} />

        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            value={form.title}
            onChange={set('title')}
            placeholder="Announcement title"
          />

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Message
            </label>
            <textarea
              rows={5}
              value={form.body}
              onChange={set('body')}
              placeholder="Write your announcement..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          {/* Targeting */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Target role
              </label>
              <select
                value={form.targetRole}
                onChange={set('targetRole')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Department
              </label>
              <select
                value={form.targetDept}
                onChange={set('targetDept')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d || 'All departments'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Year
              </label>
              <select
                value={form.targetYear}
                onChange={set('targetYear')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y || 'All years'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pin toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() =>
                setForm((f) => ({ ...f, isPinned: !f.isPinned }))
              }
              className={`w-10 h-5 rounded-full transition-colors ${
                form.isPinned ? 'bg-indigo-500' : 'bg-gray-200'
              } relative`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.isPinned ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm text-gray-600">Pin to top</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
            disabled={!form.title.trim() || !form.body.trim()}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}