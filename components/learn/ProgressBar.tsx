interface Props {
  completed: number;
  total: number;
  color?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  completed,
  total,
  color = '#E3B341',
  showLabel = true,
}: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="w-full">
      <div className="w-full bg-[#21262D] rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[#8B949E]">
            {completed}/{total} レッスン完了
          </span>
          <span className="text-xs font-semibold" style={{ color }}>
            {pct}%
          </span>
        </div>
      )}
    </div>
  );
}
