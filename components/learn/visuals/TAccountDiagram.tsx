interface Entry {
  label: string;
  amount: number;
}

interface Props {
  accountName: string;
  debitEntries: Entry[];
  creditEntries: Entry[];
}

function formatAmount(n: number) {
  return n.toLocaleString('ja-JP');
}

export default function TAccountDiagram({ accountName, debitEntries, creditEntries }: Props) {
  const debitTotal = debitEntries.reduce((s, e) => s + e.amount, 0);
  const creditTotal = creditEntries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="w-full max-w-lg mx-auto select-none">
      {/* Account name header */}
      <div className="text-center font-bold text-[#E3B341] text-lg mb-2 tracking-wide">
        【 {accountName} 】
      </div>

      <div className="relative border-2 border-[#30363D] rounded-lg overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-2 divide-x divide-[#30363D] border-b-2 border-[#30363D]">
          <div className="py-2 text-center text-sm font-bold text-[#3FB950] bg-[#3FB950]/10">
            借方（左）
          </div>
          <div className="py-2 text-center text-sm font-bold text-[#F85149] bg-[#F85149]/10">
            貸方（右）
          </div>
        </div>

        {/* Entries */}
        <div className="grid grid-cols-2 divide-x divide-[#30363D] min-h-[120px]">
          {/* Debit entries */}
          <div className="p-3 space-y-1">
            {debitEntries.map((e, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-[#8B949E] text-xs">{e.label}</span>
                <span className="text-[#3FB950] font-mono font-medium">
                  ¥{formatAmount(e.amount)}
                </span>
              </div>
            ))}
          </div>

          {/* Credit entries */}
          <div className="p-3 space-y-1">
            {creditEntries.map((e, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-[#8B949E] text-xs">{e.label}</span>
                <span className="text-[#F85149] font-mono font-medium">
                  ¥{formatAmount(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 divide-x divide-[#30363D] border-t-2 border-[#30363D] bg-[#161B22]">
          <div className="py-2 px-3 flex justify-between items-center">
            <span className="text-xs text-[#8B949E]">合計</span>
            <span className="font-bold text-[#3FB950] font-mono text-sm">
              ¥{formatAmount(debitTotal)}
            </span>
          </div>
          <div className="py-2 px-3 flex justify-between items-center">
            <span className="text-xs text-[#8B949E]">合計</span>
            <span className="font-bold text-[#F85149] font-mono text-sm">
              ¥{formatAmount(creditTotal)}
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-[#8B949E] mt-2">
        借方合計 ¥{formatAmount(debitTotal)}　　貸方合計 ¥{formatAmount(creditTotal)}
      </p>
    </div>
  );
}
