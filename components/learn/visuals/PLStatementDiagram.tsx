'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PLItem {
  name: string;
  value: number;
  type: 'revenue' | 'cost' | 'profit';
}

interface Props {
  items: PLItem[];
}

const TYPE_COLORS: Record<string, string> = {
  revenue: '#E3B341',
  cost: '#F85149',
  profit: '#3FB950',
};

function formatYen(value: number) {
  if (value >= 1000000) return `${(value / 10000).toFixed(0)}万`;
  return `${value.toLocaleString()}`;
}

export default function PLStatementDiagram({ items }: Props) {
  return (
    <div className="w-full">
      <div className="text-center text-sm font-bold text-[#E6EDF3] mb-3">
        損益計算書（P/L）イメージ
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#8B949E', fontSize: 10 }}
              axisLine={{ stroke: '#30363D' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYen}
              tick={{ fill: '#8B949E', fontSize: 10 }}
              axisLine={{ stroke: '#30363D' }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => [`¥${Number(value).toLocaleString()}`, '金額']}
              contentStyle={{
                background: '#161B22',
                border: '1px solid #30363D',
                borderRadius: '8px',
                color: '#E6EDF3',
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {items.map((item, i) => (
                <Cell key={i} fill={TYPE_COLORS[item.type]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {[
          { label: '収益', color: '#E3B341' },
          { label: 'コスト', color: '#F85149' },
          { label: '利益', color: '#3FB950' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
            <span className="text-xs text-[#8B949E]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
