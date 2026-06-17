interface Entry {
  scenario: string;
  debit: string;
  credit: string;
  amount: string;
}

interface Props {
  entries: Entry[];
}

export default function JournalEntryVisual({ entries }: Props) {
  return (
    <div className="w-full space-y-3">
      <div className="text-center text-sm font-bold text-[#E6EDF3] mb-1">仕訳の例</div>
      {entries.map((e, i) => (
        <div key={i} className="bg-[#0D1117] rounded-lg border border-[#30363D] overflow-hidden">
          <div className="bg-[#21262D] px-3 py-1.5 text-xs font-semibold text-[#8B949E]">
            例{i + 1}：{e.scenario}（¥{e.amount}）
          </div>
          <div className="grid grid-cols-2 divide-x divide-[#30363D]">
            <div className="p-3 flex flex-col items-center justify-center">
              <div className="text-xs text-[#3FB950] font-semibold mb-1">借方（左）</div>
              <div className="font-bold text-[#E6EDF3] text-sm">{e.debit}</div>
              <div className="text-xs text-[#3FB950] font-mono mt-1">¥{e.amount}</div>
            </div>
            <div className="p-3 flex flex-col items-center justify-center">
              <div className="text-xs text-[#F85149] font-semibold mb-1">貸方（右）</div>
              <div className="font-bold text-[#E6EDF3] text-sm">{e.credit}</div>
              <div className="text-xs text-[#F85149] font-mono mt-1">¥{e.amount}</div>
            </div>
          </div>
        </div>
      ))}
      <p className="text-center text-xs text-[#8B949E] mt-1">
        借方合計 ＝ 貸方合計（貸借平均の原則）
      </p>
    </div>
  );
}
