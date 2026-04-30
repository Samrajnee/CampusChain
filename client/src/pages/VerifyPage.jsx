import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { verifyCertificateApi } from '../api/identity'

export default function VerifyPage() {
  const { code } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['verify', code],
    queryFn: () => verifyCertificateApi(code).then((r) => r.data.data),
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white border border-red-100 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-red-400 text-lg font-bold">!</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Certificate not found</h2>
        <p className="text-sm text-gray-400">This certificate could not be verified. It may be invalid or revoked.</p>
      </div>
    </div>
  )

  const { certificate, isValid } = data
  const cert = certificate

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 max-w-md w-full">

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${isValid ? 'bg-green-50' : 'bg-red-50'}`}>
          <span className={`font-bold text-lg ${isValid ? 'text-green-500' : 'text-red-400'}`}>
            {isValid ? 'V' : 'X'}
          </span>
        </div>

        <h2 className={`text-lg font-bold text-center mb-1 ${isValid ? 'text-green-700' : 'text-red-600'}`}>
          {isValid ? 'Certificate verified' : 'Verification failed'}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          {isValid ? 'This is a genuine certificate issued by CampusChain.' : 'This certificate could not be verified.'}
        </p>

        <div className="border border-gray-100 rounded-xl p-5 flex flex-col gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Certificate title</p>
            <p className="text-sm font-semibold text-gray-900">{cert.title}</p>
          </div>
          {cert.description && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Description</p>
              <p className="text-sm text-gray-600">{cert.description}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Issued to</p>
              <p className="text-sm font-medium text-gray-800">
                {cert.user?.profile?.firstName} {cert.user?.profile?.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Issued by</p>
              <p className="text-sm font-medium text-gray-800">{cert.issuedBy}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Issue date</p>
              <p className="text-sm font-medium text-gray-800">
                {new Date(cert.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Type</p>
              <p className="text-sm font-medium text-gray-800 capitalize">
                {cert.type.charAt(0) + cert.type.slice(1).toLowerCase()}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Certificate ID</p>
            <p className="text-xs font-mono text-gray-500">{cert.uniqueCode}</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 text-center mt-4">Verified by CampusChain</p>
      </div>
    </div>
  )
}