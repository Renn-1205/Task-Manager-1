import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  showLogo?: boolean;
}

export default function AuthLayout({ children, showLogo = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white relative">
      {showLogo && (
        <div className="absolute top-6 left-6">
          <Image
            src="/logo.png"
            alt="Academic Growth"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
        </div>
      )}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="auth-card w-full max-w-xl rounded-2xl p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
