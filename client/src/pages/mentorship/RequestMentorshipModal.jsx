import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createMentorship } from '../../api/mentorship';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

export default function RequestMentorshipModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ topic: '', description: '' });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => createMentorship(form),
    onSuccess: onCreated,
    onError: (err) =>
      setError(err.response?.data?.message || 'Failed to submit request'),
  });

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const valid = form.topic.trim().length >= 5 && form.description.trim().length >= 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Request Mentorship
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              A faculty member or senior will accept your request
            </p>
          </div>
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
            label="Topic"
            value={form.topic}
            onChange={set('topic')}
            placeholder="e.g. Data Structures, Resume Review, Career Guidance"
          />
          {form.topic.length > 0 && form.topic.length < 5 && (
            <p className="text-xs text-red-400 -mt-2">
              Topic must be at least 5 characters
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Description
            </label>
            <textarea
              rows={5}
              value={form.description}
              onChange={set('description')}
              placeholder="Describe what you need help with, your current level, and what outcome you are hoping for..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.description.length} / 1000 characters (min 20)
            </p>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
          <p className="text-xs text-indigo-700 font-medium">How it works</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {[
              'Your request is visible to all faculty members',
              'A mentor will accept and reach out to you',
              'On completion you earn 30 XP, your mentor earns 20 XP',
            ].map((line) => (
              <li key={line} className="text-xs text-indigo-600 flex items-start gap-1.5">
                <span className="mt-0.5 w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={mutation.isPending}
            disabled={!valid}
            onClick={() => mutation.mutate()}
          >
            Submit Request
          </Button>
        </div>
      </div>
    </div>
  );
}