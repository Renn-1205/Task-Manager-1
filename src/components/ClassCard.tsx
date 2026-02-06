import { ReactNode } from 'react';

interface ClassCardProps {
  title: string;
  icon: ReactNode;
  onJoin?: () => void;
}

export default function ClassCard({ title, icon, onJoin }: ClassCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
      <div className="flex justify-center mb-4 h-20 items-center">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-4 min-h-[48px] flex items-center justify-center">
        {title}
      </h3>
      <button 
        onClick={onJoin}
        className="btn-primary w-full py-2.5 px-4 text-white font-medium rounded-lg text-sm"
      >
        Join class
      </button>
    </div>
  );
}
