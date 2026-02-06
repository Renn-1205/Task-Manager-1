interface ProgressCardProps {
  title: string;
  subtitle: string;
  completed: number;
  pending: number;
}

export default function ProgressCard({ title, subtitle, completed, pending }: ProgressCardProps) {
  const total = completed + pending;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-[280px] shadow-sm">
      <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
      
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex-1 bg-green-50 rounded-lg py-2 px-3 text-center border border-green-200">
          <p className="text-xs text-green-600 mb-1">Completed</p>
          <p className="text-xl font-bold text-green-600">{completed}</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 text-center border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Pending</p>
          <p className="text-xl font-bold text-gray-600">{String(pending).padStart(2, '0')}</p>
        </div>
      </div>
    </div>
  );
}
