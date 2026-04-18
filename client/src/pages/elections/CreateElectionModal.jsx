import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createElectionApi } from '../../api/elections'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'

export default function CreateElectionModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startsAt: '',
    endsAt: '',
    isAnonymous: false,
    eligibleYear: '',
    eligibleDept: '',
  })

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [field]: val })
  }

  const mutation = useMutation({
    mutationFn: createElectionApi,
    onSuccess,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      ...form,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      eligibleYear: form.eligibleYear ? Number(form.eligibleYear) : null,
      eligibleDept: form.eligibleDept || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Create election</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Close</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <Alert type="error" message={mutation.error?.response?.data?.message} />

          <Input
            label="Title"
            placeholder="e.g. Class Representative Election 2025"
            value={form.title}
            onChange={set('title')}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              rows={3}
              placeholder="Brief description of the election"
              value={form.description}
              onChange={set('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Starts at"
              type="datetime-local"
              value={form.startsAt}
              onChange={set('startsAt')}
              required
            />
            <Input
              label="Ends at"
              type="datetime-local"
              value={form.endsAt}
              onChange={set('endsAt')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Eligible year (optional)</label>
              <select
                value={form.eligibleYear}
                onChange={set('eligibleYear')}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">All years</option>
                {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <Input
              label="Eligible dept (optional)"
              placeholder="e.g. Computer Science"
              value={form.eligibleDept}
              onChange={set('eligibleDept')}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={set('isAnonymous')}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">Anonymous voting</p>
              <p className="text-xs text-gray-400">Voter identity is hidden using secure tokens</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending} className="flex-1">
              Create election
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}