export const StatCard = ({ title, value, icon, trend, trendValue, bgColor = 'bg-white/5' }) => {
  return (
    <div className={`${bgColor} backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-white/50 font-medium mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
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
