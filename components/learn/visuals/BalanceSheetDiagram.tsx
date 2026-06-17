interface Props {
  simplified?: boolean;
}

export default function BalanceSheetDiagram({ simplified = false }: Props) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center font-bold text-[#E6EDF3] text-base mb-3">
        貸借対照表（B/S）イメージ
      </div>

      {simplified ? (
        // 5大グループ説明（簡略版）
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 text-xs text-[#8B949E] mb-1 font-semibold">
              B/S（財産状況）に載るグループ
            </div>
            <div className="bg-[#58A6FF]/15 border border-[#58A6FF]/40 rounded-lg p-3 text-center">
              <div className="text-[#58A6FF] font-bold text-sm mb-1">資産</div>
              <div className="text-xs text-[#8B949E]">現金・建物・売掛金など</div>
            </div>
            <div className="bg-[#F85149]/15 border border-[#F85149]/40 rounded-lg p-3 text-center">
              <div className="text-[#F85149] font-bold text-sm mb-1">負債</div>
              <div className="text-xs text-[#8B949E]">借入金・買掛金など</div>
            </div>
            <div className="bg-[#E3B341]/15 border border-[#E3B341]/40 rounded-lg p-3 text-center">
              <div className="text-[#E3B341] font-bold text-sm mb-1">純資産</div>
              <div className="text-xs text-[#8B949E]">資本金・利益剰余金</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="col-span-2 text-xs text-[#8B949E] mb-1 font-semibold">
              P/L（損益）に載るグループ
            </div>
            <div className="bg-[#3FB950]/15 border border-[#3FB950]/40 rounded-lg p-3 text-center">
              <div className="text-[#3FB950] font-bold text-sm mb-1">収益</div>
              <div className="text-xs text-[#8B949E]">売上高・受取利息など</div>
            </div>
            <div className="bg-[#D29922]/15 border border-[#D29922]/40 rounded-lg p-3 text-center">
              <div className="text-[#D29922] font-bold text-sm mb-1">費用</div>
              <div className="text-xs text-[#8B949E]">仕入・給料・家賃など</div>
            </div>
          </div>
          <div className="text-center text-sm font-bold text-[#E6EDF3] mt-1 bg-[#21262D] rounded-lg py-2">
            資産 ＝ 負債 ＋ 純資産
          </div>
        </div>
      ) : (
        // 詳細な貸借対照表
        <div>
          <div className="grid grid-cols-2 gap-3">
            {/* 左：資産の部 */}
            <div className="border border-[#58A6FF]/40 rounded-lg overflow-hidden">
              <div className="bg-[#58A6FF]/20 text-[#58A6FF] text-center py-2 text-sm font-bold border-b border-[#58A6FF]/30">
                資産の部
              </div>
              <div className="p-2 space-y-1">
                <div className="bg-[#58A6FF]/10 rounded p-2">
                  <div className="text-xs font-semibold text-[#58A6FF] mb-1">流動資産</div>
                  <div className="text-xs text-[#8B949E] space-y-0.5">
                    <div className="flex justify-between"><span>現金・預金</span><span>300万</span></div>
                    <div className="flex justify-between"><span>売掛金</span><span>200万</span></div>
                    <div className="flex justify-between"><span>商品在庫</span><span>100万</span></div>
                  </div>
                  <div className="text-xs text-[#58A6FF] text-right mt-1 font-semibold">計 600万</div>
                </div>
                <div className="bg-[#3888a8]/10 rounded p-2">
                  <div className="text-xs font-semibold text-[#3888a8] mb-1">固定資産</div>
                  <div className="text-xs text-[#8B949E] space-y-0.5">
                    <div className="flex justify-between"><span>建物</span><span>250万</span></div>
                    <div className="flex justify-between"><span>車両</span><span>100万</span></div>
                    <div className="flex justify-between"><span>機械</span><span>50万</span></div>
                  </div>
                  <div className="text-xs text-[#3888a8] text-right mt-1 font-semibold">計 400万</div>
                </div>
              </div>
              <div className="bg-[#21262D] text-center py-1.5 text-xs font-bold text-[#58A6FF] border-t border-[#30363D]">
                資産合計 1,000万
              </div>
            </div>

            {/* 右：負債・純資産の部 */}
            <div className="flex flex-col gap-2">
              <div className="border border-[#F85149]/40 rounded-lg overflow-hidden flex-1">
                <div className="bg-[#F85149]/20 text-[#F85149] text-center py-2 text-sm font-bold border-b border-[#F85149]/30">
                  負債の部
                </div>
                <div className="p-2 space-y-0.5">
                  <div className="text-xs text-[#8B949E] flex justify-between"><span>買掛金</span><span>150万</span></div>
                  <div className="text-xs text-[#8B949E] flex justify-between"><span>短期借入金</span><span>200万</span></div>
                  <div className="text-xs text-[#8B949E] flex justify-between"><span>長期借入金</span><span>150万</span></div>
                </div>
                <div className="bg-[#21262D] text-center py-1 text-xs font-bold text-[#F85149] border-t border-[#30363D]">
                  負債合計 500万
                </div>
              </div>

              <div className="border border-[#E3B341]/40 rounded-lg overflow-hidden flex-1">
                <div className="bg-[#E3B341]/20 text-[#E3B341] text-center py-2 text-sm font-bold border-b border-[#E3B341]/30">
                  純資産の部
                </div>
                <div className="p-2 space-y-0.5">
                  <div className="text-xs text-[#8B949E] flex justify-between"><span>資本金</span><span>300万</span></div>
                  <div className="text-xs text-[#8B949E] flex justify-between"><span>利益剰余金</span><span>200万</span></div>
                </div>
                <div className="bg-[#21262D] text-center py-1 text-xs font-bold text-[#E3B341] border-t border-[#30363D]">
                  純資産合計 500万
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center bg-[#21262D] rounded-lg py-2 text-sm font-bold text-[#E6EDF3]">
            資産（1,000万）＝ 負債（500万）＋ 純資産（500万）
          </div>
        </div>
      )}
    </div>
  );
}
