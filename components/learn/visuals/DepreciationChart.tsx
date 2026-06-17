'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  initialValue: number;
  years: number;
  straightLineRate: number;
  decliningRate: number;
}

function formatYen(value: number) {
  return `${(value / 10000).toFixed(0)}万`;
}

export default function DepreciationChart({
  initialValue,
  years,
  straightLineRate,
  decliningRate,
}: Props) {
  const data = Array.from({ length: years + 1 }, (_, i) => {
    const sl = Math.max(0, initialValue - initialValue * straightLineRate * i);
    let db = initialValue;
    for (let j = 0; j < i; j++) {
      db = Math.max(0, db - db * decliningRate);
    }
    return {
      name: i === 0 ? '取得時' : `${i}年後`,
      定額法: Math.round(sl),
      定率法: Math.round(db),
    };
  });

  return (
    <div className="w-full">
      <div className="text-center text-sm font-bold text-[#E6EDF3] mb-2">
        減価償却：帳簿価額の推移（取得価額 ¥{initialValue.toLocaleString()}）
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#8B949E', fontSize: 11 }}
              axisLine={{ stroke: '#30363D' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYen}
              tick={{ fill: '#8B949E', fontSize: 11 }}
              axisLine={{ stroke: '#30363D' }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value, name) => [
                `¥${Number(value).toLocaleString()}`,
                name,
              ]}
              contentStyle={{
                background: '#161B22',
                border: '1px solid #30363D',
                borderRadius: '8px',
                color: '#E6EDF3',
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, color: '#8B949E' }}
            />
            <Line
              type="linear"
              dataKey="定額法"
              stroke="#58A6FF"
              strokeWidth={2}
              dot={{ fill: '#58A6FF', r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="定率法"
              stroke="#E3B341"
              strokeWidth={2}
              dot={{ fill: '#E3B341', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-xs text-[#8B949E] mt-1">
        定額法：毎年一定額を償却 ／ 定率法：最初が多く年々減少
      </p>
    </div>
  );
}
