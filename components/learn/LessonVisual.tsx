import { LessonVisual as LessonVisualData } from '@/lib/learnData';
import AccountingFlowDiagram from './visuals/AccountingFlowDiagram';
import TAccountDiagram from './visuals/TAccountDiagram';
import BalanceSheetDiagram from './visuals/BalanceSheetDiagram';
import PLStatementDiagram from './visuals/PLStatementDiagram';
import CashFlowDiagram from './visuals/CashFlowDiagram';
import JournalEntryVisual from './visuals/JournalEntryVisual';
import DepreciationChart from './visuals/DepreciationChart';
import TaxFlowDiagram from './visuals/TaxFlowDiagram';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, React.ComponentType<any>> = {
  AccountingFlowDiagram,
  TAccountDiagram,
  BalanceSheetDiagram,
  PLStatementDiagram,
  CashFlowDiagram,
  JournalEntryVisual,
  DepreciationChart,
  TaxFlowDiagram,
};

interface Props {
  visual: LessonVisualData;
}

export default function LessonVisual({ visual }: Props) {
  const Component = REGISTRY[visual.componentKey];
  if (!Component) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center text-gray-400 shadow-sm">
        図解を準備中です...
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm overflow-hidden">
      <Component {...(visual.data ?? {})} />
    </div>
  );
}
