import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { registerApi } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Business Administration', 'Arts', 'Science']

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: 'STUDENT', studentId: '', department: '', year: '', semester: '',
  })
  const [errors, setErrors] = useState({})

  const mutation = useMutation({
    mutationFn: registerApi,
    onSuccess: (res) => {
          console.log('Register response:', res.data)  // ADD THIS
      const { token, user } = res.data.data
      login(token, user)
      navigate('/dashboard')
    },
  })

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validate = () => {
    const errs = {}
    if (!form.firstName) errs.firstName = 'Required'
    if (!form.lastName) errs.lastName = 'Required'
    if (!form.email) errs.email = 'Required'
    if (!form.password || form.password.length < 8) errs.password = 'Min 8 characters'
    if (form.role === 'STUDENT') {
      if (!form.studentId) errs.studentId = 'Required'
      if (!form.department) errs.department = 'Required'
      if (!form.year) errs.year = 'Required'
      if (!form.semester) errs.semester = 'Required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) mutation.mutate({ ...form, year: Number(form.year), semester: Number(form.semester) })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join your campus community</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <Alert type="error" message={mutation.error?.response?.data?.message} />

            {/* Role selector */}
            <div className="flex gap-2">
              {['STUDENT', 'TEACHER', 'HOD', 'PRINCIPAL'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 py-2 text-xs rounded-lg border font-medium transition
                    ${form.role === r
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                >
                  {r === 'HOD' ? 'HOD' : r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" placeholder="Rahul" value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
              <Input label="Last name" placeholder="Das" value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
            </div>

            <Input label="Email address" type="email" placeholder="you@college.edu" value={form.email} onChange={set('email')} error={errors.email} />
            <Input label="Password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" value={form.password} onChange={set('password')} error={errors.password} />

            {/* Student-specific fields */}
            {form.role === 'STUDENT' && (
              <>
                <Input label="Student ID" placeholder="CS2021001" value={form.studentId} onChange={set('studentId')} error={errors.studentId} />

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <select
                    value={form.department}
                    onChange={set('department')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  {errors.department && <p className="text-xs text-red-500">{errors.department}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Year</label>
                    <select value={form.year} onChange={set('year')} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                      <option value="">Year</option>
                      {[1,2,3,4,5,6].map((y) => <option key={y}>{y}</option>)}
                    </select>
                    {errors.year && <p className="text-xs text-red-500">{errors.year}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Semester</label>
                    <select value={form.semester} onChange={set('semester')} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                      <option value="">Semester</option>
                      {[1,2,3,4,5,6,7,8,9,10].map((s) => <option key={s}>{s}</option>)}
                    </select>
                    {errors.semester && <p className="text-xs text-red-500">{errors.semester}</p>}
                  </div>
                </div>
              </>
            )}

            {/* Faculty-specific fields */}
            {form.role !== 'STUDENT' && (
              <>
                <Input label="Employee ID" placeholder="FAC1001" value={form.employeeId || ''} onChange={set('employeeId')} />
                <Input label="Department" placeholder="Computer Science" value={form.department} onChange={set('department')} />
                <Input label="Designation" placeholder="Associate Professor" value={form.designation || ''} onChange={set('designation')} />
              </>
            )}

            <Button type="submit" loading={mutation.isPending} className="w-full mt-2">
              Create account
            </Button>

          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}