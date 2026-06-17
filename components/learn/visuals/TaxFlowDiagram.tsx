interface Props {
  taxType: 'consumption' | 'corporate';
}

export default function TaxFlowDiagram({ taxType }: Props) {
  if (taxType === 'consumption') {
    return (
      <div className="w-full max-w-md mx-auto space-y-3">
        <div className="text-center text-sm font-bold text-[#E6EDF3] mb-3">
          消費税の仕組み（仕入税額控除）
        </div>

        {/* Flow */}
        <div className="space-y-1">
          {/* 売上 */}
          <div className="bg-[#E3B341]/15 border border-[#E3B341]/40 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#8B949E]">顧客から受け取った消費税</div>
                <div className="font-bold text-[#E3B341]">売上消費税</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#8B949E]">売上1,100万円のうち</div>
                <div className="font-bold text-[#E3B341] font-mono">＋ ¥100万</div>
              </div>
            </div>
          </div>

          <div className="text-center text-xl text-[#8B949E] font-bold">－</div>

          {/* 仕入 */}
          <div className="bg-[#58A6FF]/15 border border-[#58A6FF]/40 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#8B949E]">仕入・経費で支払った消費税</div>
                <div className="font-bold text-[#58A6FF]">仕入消費税（控除）</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#8B949E]">仕入660万円のうち</div>
                <div className="font-bold text-[#58A6FF] font-mono">－ ¥60万</div>
              </div>
            </div>
          </div>

          <div className="text-center text-xl text-[#8B949E] font-bold">＝</div>

          {/* 納付 */}
          <div className="bg-[#F85149]/15 border border-[#F85149]/40 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#8B949E]">税務署へ納付する消費税</div>
                <div className="font-bold text-[#F85149]">納付消費税</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#8B949E]">100万 ー 60万</div>
                <div className="font-bold text-[#F85149] font-mono">¥40万</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#21262D] rounded-lg p-2 text-center text-xs text-[#8B949E]">
          💡 インボイス（適格請求書）がないと仕入消費税の控除ができません
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      <div className="text-center text-sm font-bold text-[#E6EDF3] mb-3">
        法人税の計算の流れ
      </div>

      <div className="space-y-1">
        <div className="bg-[#3FB950]/15 border border-[#3FB950]/40 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-[#8B949E]">会計上の利益</div>
              <div className="font-bold text-[#3FB950]">税引前当期純利益</div>
            </div>
            <div className="font-bold text-[#3FB950] font-mono">500万円</div>
          </div>
        </div>

        <div className="text-center text-sm text-[#8B949E]">
          ＋ 損金不算入（交際費超過など）
        </div>

        <div className="bg-[#D29922]/15 border border-[#D29922]/40 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-[#8B949E]">税務調整後</div>
              <div className="font-bold text-[#D29922]">課税所得</div>
            </div>
            <div className="font-bold text-[#D29922] font-mono">600万円</div>
          </div>
        </div>

        <div className="text-center text-sm text-[#8B949E]">× 実効税率（約23〜35%）</div>

        <div className="bg-[#F85149]/15 border border-[#F85149]/40 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-[#8B949E]">法人税 ＋ 住民税 ＋ 事業税</div>
              <div className="font-bold text-[#F85149]">法人税等合計</div>
            </div>
            <div className="font-bold text-[#F85149] font-mono">約150万円</div>
          </div>
        </div>
      </div>

      <div className="bg-[#21262D] rounded-lg p-2 text-xs text-[#8B949E] space-y-1">
        <div>💡 課税所得800万円以下は軽減税率（実効約23%）が適用されます</div>
        <div>💡 損金不算入：交際費超過・役員賞与・罰金など</div>
      </div>
    </div>
  );
}
