interface Props {
  operating: number;
  investing: number;
  financing: number;
}

function formatAmount(n: number) {
  const sign = n >= 0 ? '+' : '';
  return `${sign}${(n / 10000).toFixed(0)}万円`;
}

export default function CashFlowDiagram({ operating, investing, financing }: Props) {
  const sections = [
    {
      label: '① 営業活動によるCF',
      sublabel: '本業で生み出したキャッシュ',
      value: operating,
      color: '#3FB950',
      icon: '🏪',
      examples: ['売上代金の回収', '仕入代金の支払', '人件費の支払'],
    },
    {
      label: '② 投資活動によるCF',
      sublabel: '設備投資・資産の取得・売却',
      value: investing,
      color: '#F85149',
      icon: '🏭',
      examples: ['機械・設備の購入', '不動産の売却', '有価証券の取得'],
    },
    {
      label: '③ 財務活動によるCF',
      sublabel: '借入・返済・増資など',
      value: financing,
      color: '#58A6FF',
      icon: '🏦',
      examples: ['銀行借入', '借入金の返済', '増資（株式発行）'],
    },
  ];

  const total = operating + investing + financing;

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="text-center text-sm font-bold text-[#E6EDF3] mb-3">
        キャッシュフロー計算書 構造
      </div>
      {sections.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: `${s.color}40` }}
        >
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ background: `${s.color}18` }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{s.icon}</span>
              <div>
                <div className="text-xs font-bold" style={{ color: s.color }}>
                  {s.label}
                </div>
                <div className="text-xs text-[#8B949E]">{s.sublabel}</div>
              </div>
            </div>
            <div
              className="text-sm font-bold font-mono rounded px-2 py-0.5"
              style={{ color: s.color, background: `${s.color}20` }}
            >
              {formatAmount(s.value)}
            </div>
          </div>
          <div className="px-3 py-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            {s.examples.map((ex) => (
              <span key={ex} className="text-xs text-[#8B949E]">
                • {ex}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* Total */}
      <div className="border-t-2 border-[#30363D] pt-2 flex items-center justify-between px-3 bg-[#21262D] rounded-lg py-2">
        <span className="text-sm font-bold text-[#E6EDF3]">現金増減合計</span>
        <span
          className={`text-sm font-bold font-mono ${total >= 0 ? 'text-[#3FB950]' : 'text-[#F85149]'}`}
        >
          {formatAmount(total)}
        </span>
      </div>
    </div>
  );
}
