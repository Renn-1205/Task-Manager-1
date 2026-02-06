import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  iconBgColor: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export default function StatCard({ icon, iconBgColor, title, description, children }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`p-3 ${iconBgColor} rounded-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
