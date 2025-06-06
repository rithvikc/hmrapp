import Header from '@/components/Header'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-serif">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a verification link to your email address. Please click the link to verify your account and complete the registration process.
            </p>
            <div className="mt-6">
              <a 
                href="/login" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Back to Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 