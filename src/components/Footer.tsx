import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-4">
          <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
          <Link href="/help" className="text-gray-600 hover:text-gray-900 transition-colors">help Center</Link>
          <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</Link>
          <Link href="/teams" className="text-gray-600 hover:text-gray-900 transition-colors">Teams</Link>
        </div>
        <p className="text-center text-sm text-gray-500">
          © 2026 Academic Growth Platform . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
