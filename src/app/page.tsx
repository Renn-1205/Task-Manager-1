import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 flex items-center justify-center p-4">
      <div className="auth-card w-full max-w-md rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="w-7 h-7"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-green-700">Academic Growth</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Horng Task Manager</h1>
        <p className="text-gray-600 mb-8">Manage your tasks efficiently and boost your productivity</p>
        
        <div className="space-y-4">
          <Link 
            href="/login"
            className="btn-primary block w-full py-3 px-4 text-white font-medium rounded-md text-center"
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className="block w-full py-3 px-4 text-green-600 font-medium rounded-md border-2 border-green-500 hover:bg-green-50 transition-colors text-center"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}