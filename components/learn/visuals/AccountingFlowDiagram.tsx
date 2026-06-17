interface Props {
  steps: string[];
}

export default function AccountingFlowDiagram({ steps }: Props) {
  const colors = ['#3FB950', '#58A6FF', '#E3B341', '#D29922', '#E3B341'];
  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-0 min-w-max mx-auto px-4">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col sm:flex-row items-center">
            <div
              className="flex flex-col items-center justify-center rounded-xl px-4 py-3 text-center min-w-[110px]"
              style={{ background: `${colors[i % colors.length]}22`, border: `1.5px solid ${colors[i % colors.length]}` }}
            >
              <span
                className="text-2xl font-bold mb-1"
                style={{ color: colors[i % colors.length] }}
              >
                {i + 1}
              </span>
              <span className="text-xs font-semibold text-[#E6EDF3] leading-tight whitespace-pre-wrap text-center">
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex sm:hidden flex-col items-center my-1">
                <svg width="14" height="22" viewBox="0 0 14 22">
                  <path d="M7 0 L7 14 M3 10 L7 14 L11 10" stroke="#8B949E" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            )}
            {i < steps.length - 1 && (
              <div className="hidden sm:flex items-center mx-2">
                <svg width="28" height="14" viewBox="0 0 28 14">
                  <path d="M0 7 L20 7 M16 3 L20 7 L16 11" stroke="#8B949E" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
