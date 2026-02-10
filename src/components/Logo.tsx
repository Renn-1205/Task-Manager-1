import Image from 'next/image';

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image src="/logo.png" alt="Academic Growth" width={52} height={52} className="object-contain" />
      <span className="text-sm font-semibold text-green-700">Academic Growth</span>
    </div>
  );
}
