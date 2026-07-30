export const StatCard = ({ title, value, icon, trend, trendValue, bgColor = 'bg-orange-50' }) => {
  return (
    <div className={`${bgColor} rounded-2xl p-6 hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="text-4xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
