// 会計学習アプリ - コンテンツデータ定義

export type DifficultyLevel = 1 | 2 | 3;

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface LessonVisual {
  type: 'svgDiagram' | 'rechartsBar' | 'rechartsLine';
  componentKey: string;
  data?: Record<string, unknown>;
}

export interface KeyConcept {
  term: string;
  definition: string;
  example?: string;
}

// セクション：段落テキスト + オプションで図解・用語・ミニクイズを挟む
export interface LessonSection {
  text: string;
  visual?: LessonVisual;    // この段落の後に図解を表示
  concept?: KeyConcept;     // この段落の後に用語カードを表示
  miniQuiz?: QuizQuestion;  // この段落の後にミニクイズを表示
}

export interface Lesson {
  id: string;
  moduleId: string;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  sections: LessonSection[];  // 段落ごとに図解・クイズを挟む
  keyConcepts: KeyConcept[];  // まとめ用語一覧（末尾に表示）
  quiz: QuizQuestion[];       // 末尾の理解度チェック
}

export interface Module {
  id: string;
  order: number;
  level: DifficultyLevel;
  levelLabel: '超基礎' | '財務諸表' | '決算・税務';
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  lessons: Lesson[];
}

// ─── localStorage スキーマ ────────────────────────────────────────────────────

export const LEARN_STORAGE_KEY = 'kaikei_learn_progress';

export interface LessonProgress {
  lessonId: string;
  completedAt: string;
  quizScore: number;
  quizTotal: number;
}

export interface LearnProgress {
  completedLessons: Record<string, LessonProgress>;
  lastVisitedLessonId: string | null;
}

const defaultProgress: LearnProgress = {
  completedLessons: {},
  lastVisitedLessonId: null,
};

export function loadProgress(): LearnProgress {
  if (typeof window === 'undefined') return defaultProgress;
  try {
    const raw = localStorage.getItem(LEARN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultProgress;
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: LearnProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(progress));
}

export function markLessonComplete(lessonId: string, score: number, total: number): void {
  const progress = loadProgress();
  progress.completedLessons[lessonId] = {
    lessonId,
    completedAt: new Date().toISOString(),
    quizScore: score,
    quizTotal: total,
  };
  saveProgress(progress);
}

export function isLessonComplete(lessonId: string): boolean {
  const progress = loadProgress();
  return !!progress.completedLessons[lessonId];
}

export function getModuleProgress(moduleId: string): { completed: number; total: number } {
  const module = MODULES.find((m) => m.id === moduleId);
  if (!module) return { completed: 0, total: 0 };
  const progress = loadProgress();
  const completed = module.lessons.filter(
    (l) => !!progress.completedLessons[l.id]
  ).length;
  return { completed, total: module.lessons.length };
}

export function getTotalProgress(): { completed: number; total: number } {
  const progress = loadProgress();
  const total = MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  const completed = Object.keys(progress.completedLessons).length;
  return { completed, total };
}

// ─── 学習コンテンツ ──────────────────────────────────────────────────────────

export const MODULES: Module[] = [
  // ────────────────────────────────────────────────────────────────────────────
  // Module 1: 会計の基本（超基礎）
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'module-1',
    order: 1,
    level: 1,
    levelLabel: '超基礎',
    title: '会計の基本',
    subtitle: '会計とは何か・複式簿記・勘定科目・仕訳',
    icon: '📖',
    accentColor: 'text-green-600',
    lessons: [
      // ── レッスン 1-1 ─────────────────────────────────────────────────────────
      {
        id: 'l1-1',
        moduleId: 'module-1',
        order: 1,
        title: '会計とは何か',
        description: 'ビジネスの「記録・伝達・意思決定」を支える言語を学ぶ',
        estimatedMinutes: 5,
        sections: [
          {
            text: '会計（かいけい）とは、企業や個人事業主が行う経済活動を「お金の言葉」で記録し、整理して伝える仕組みです。初めて決算を迎える経営者にとって難しく感じられますが、基本は「いつ、何が、いくら動いたか」を記録することです。',
            concept: {
              term: '会計（かいけい）',
              definition: '企業の経済活動を記録・分類・集計し、財務情報として報告するシステム',
              example: '売上100,000円を記録 → 損益計算書に反映 → 利益を把握',
            },
          },
          {
            text: '会計の流れは5つのステップで成り立っています。①取引が発生したら、②仕訳という方法で帳簿に記録します。③それをまとめた試算表を作り、④最終的に損益計算書や貸借対照表などの財務諸表を作成します。⑤この情報をもとに経営判断や税務申告を行います。',
            visual: {
              type: 'svgDiagram',
              componentKey: 'AccountingFlowDiagram',
              data: {
                steps: ['取引発生', '仕訳・記帳', '試算表作成', '財務諸表作成', '意思決定・報告'],
              },
            },
          },
          {
            text: '会計には大きく分けて「財務会計」（外部への報告）と「管理会計」（内部の経営判断）があります。中小企業が決算で主に扱うのは財務会計です。',
            concept: {
              term: '簿記（ぼき）',
              definition: '会計帳簿に取引を記録する技術・方法論。「帳簿記入」の略',
              example: '商品を売った → 仕訳帳に借方・貸方を記録',
            },
          },
          {
            text: '決算では、この1年間の記録を整理して財務諸表を完成させます。まず基礎をしっかり理解することが大切です。次のレッスンでは、会計の記録方式「複式簿記」を学びます。',
            miniQuiz: {
              id: 'q-l1-1-1',
              question: '会計の主な目的として最も適切なものはどれですか？',
              options: [
                '売上を増やすための戦略を立てること',
                '企業の経済活動を記録・報告し、意思決定に役立てること',
                '税金をなるべく少なくすること',
                '銀行からお金を借りやすくすること',
              ],
              correctIndex: 1,
              explanation: '会計の本質は「記録・分類・集計・報告」です。その情報を使って経営判断や税務申告、資金調達が行われます。',
            },
          },
        ],
        keyConcepts: [
          {
            term: '会計（かいけい）',
            definition: '企業の経済活動を記録・分類・集計し、財務情報として報告するシステム',
            example: '売上100,000円を記録 → 損益計算書に反映 → 利益を把握',
          },
          {
            term: '簿記（ぼき）',
            definition: '会計帳簿に取引を記録する技術・方法論。「帳簿記入」の略',
          },
          {
            term: '財務会計',
            definition: '株主・銀行・税務署など外部の関係者への報告を目的とした会計',
          },
        ],
        quiz: [
          {
            id: 'q-l1-1-2',
            question: '簿記（ぼき）とは何ですか？',
            options: [
              '帳簿に取引を記録する技術',
              '税務署への申告書類',
              '銀行の通帳のこと',
              '会社の規則を書いた文書',
            ],
            correctIndex: 0,
            explanation: '簿記は「帳簿記入」の略で、取引を体系的に記録・整理する技術です。',
          },
          {
            id: 'q-l1-1-3',
            question: '決算（けっさん）とは何ですか？',
            options: [
              '毎月の売上を集計すること',
              '一定期間の会計を締め切り、財務諸表を作成する作業',
              '銀行に残高証明書を依頼すること',
              '税理士に申告を依頼すること',
            ],
            correctIndex: 1,
            explanation: '決算は事業年度末に行う、会計の締め切り作業です。財務諸表（B/S・P/L）を完成させ、税務申告の基礎となります。',
          },
        ],
      },

      // ── レッスン 1-2 ─────────────────────────────────────────────────────────
      {
        id: 'l1-2',
        moduleId: 'module-1',
        order: 2,
        title: '複式簿記の仕組み',
        description: '1つの取引を「借方」と「貸方」の2面から記録する方法を理解する',
        estimatedMinutes: 8,
        sections: [
          {
            text: '複式簿記では、1つの取引を必ず2つの側面から記録します。左側を「借方（かりかた）」、右側を「貸方（かしかた）」と呼びます。この2面を記録することで、「お金がどこから来て、どこへ行ったか」が常に釣り合います。',
            concept: {
              term: '複式簿記（ふくしきぼき）',
              definition: '1つの取引を「借方（左）」と「貸方（右）」の2面で記録する方法',
              example: '現金100,000円の売上 → 借方：現金100,000 / 貸方：売上100,000',
            },
          },
          {
            text: 'たとえば「商品を100,000円で売って現金を受け取った」という取引は、①現金（資産）が100,000円増えた、②売上（収益）が100,000円発生した、という2つの側面があります。下のT字勘定（ティー勘定）がその記録方法を示しています。',
            visual: {
              type: 'svgDiagram',
              componentKey: 'TAccountDiagram',
              data: {
                accountName: '現金',
                debitEntries: [
                  { label: '売上（入金）', amount: 100000 },
                  { label: '借入金（受取）', amount: 500000 },
                ],
                creditEntries: [
                  { label: '仕入（支払）', amount: 60000 },
                  { label: '経費（支払）', amount: 30000 },
                ],
              },
            },
          },
          {
            text: '覚え方のコツ：資産が増えたら借方（左）、収益が発生したら貸方（右）。この2つのルールだけで、日常のほとんどの取引を仕訳できます。',
            concept: {
              term: '借方（かりかた）',
              definition: 'T字勘定の左側。資産の増加・費用の発生などを記録する',
              example: '現金が増えた → 借方に「現金」',
            },
            miniQuiz: {
              id: 'q-l1-2-inline',
              question: '複式簿記において「借方」はT字勘定のどちら側ですか？',
              options: ['右側', '左側', '上側', '下側'],
              correctIndex: 1,
              explanation: '借方は左側、貸方は右側です。「借方（かりかた）の「り」は左払いの形、貸方（かしかた）の「し」は右払いの形」と覚えると便利です。',
            },
          },
          {
            text: '最初は「借方＝左」「貸方＝右」と機械的に覚えることから始めましょう。何度も仕訳を書くうちに自然と身につきます。貸借平均の原則（借方合計＝貸方合計）が崩れていたら、仕訳に誤りがあります。',
            concept: {
              term: '貸方（かしかた）',
              definition: 'T字勘定の右側。資産の減少・収益の発生・負債の増加などを記録する',
              example: '売上が発生した → 貸方に「売上」',
            },
          },
        ],
        keyConcepts: [
          {
            term: '複式簿記（ふくしきぼき）',
            definition: '1つの取引を「借方（左）」と「貸方（右）」の2面で記録する方法',
            example: '現金100,000円の売上 → 借方：現金100,000 / 貸方：売上100,000',
          },
          {
            term: '借方（かりかた）',
            definition: 'T字勘定の左側。資産の増加・費用の発生などを記録する',
          },
          {
            term: '貸方（かしかた）',
            definition: 'T字勘定の右側。資産の減少・収益の発生・負債の増加などを記録する',
          },
        ],
        quiz: [
          {
            id: 'q-l1-2-1',
            question: '現金100,000円の売上があった場合の仕訳として正しいものはどれですか？',
            options: [
              '借方：売上100,000 / 貸方：現金100,000',
              '借方：現金100,000 / 貸方：売上100,000',
              '借方：費用100,000 / 貸方：現金100,000',
              '借方：現金100,000 / 貸方：負債100,000',
            ],
            correctIndex: 1,
            explanation: '現金（資産）が増えるので借方に「現金」、売上（収益）が発生するので貸方に「売上」を記録します。',
          },
          {
            id: 'q-l1-2-2',
            question: '「貸借平均の原則」とは何ですか？',
            options: [
              '売上と費用が等しくなること',
              '借方合計と貸方合計が必ず一致すること',
              '資産と負債が半分ずつになること',
              '収益と純資産が釣り合うこと',
            ],
            correctIndex: 1,
            explanation: '複式簿記では、どの取引でも借方合計と貸方合計が必ず一致します。これを「貸借平均の原則」といい、仕訳が正しいかの確認に使います。',
          },
        ],
      },

      // ── レッスン 1-3 ─────────────────────────────────────────────────────────
      {
        id: 'l1-3',
        moduleId: 'module-1',
        order: 3,
        title: '主要な勘定科目',
        description: '「資産・負債・純資産・収益・費用」という5つの大分類を理解する',
        estimatedMinutes: 7,
        sections: [
          {
            text: '会計のすべての取引は、5つの勘定科目グループのどれかに分類されます。まずこの5グループを覚えることが会計理解の第一歩です。',
            visual: {
              type: 'svgDiagram',
              componentKey: 'BalanceSheetDiagram',
              data: { simplified: true },
            },
          },
          {
            text: '「資産・負債・純資産」は貸借対照表（B/S）に載るグループです。決算日時点の財産状況を表します。「資産 ＝ 負債 ＋ 純資産」という等式が常に成立します。',
            concept: {
              term: '資産（しさん）',
              definition: '会社が持っている財産。現金・売掛金・建物・機械など',
              example: '現金、普通預金、売掛金、商品在庫、土地・建物',
            },
          },
          {
            text: '「収益・費用」は損益計算書（P/L）に載るグループです。1年間の儲けの内訳を表します。「収益 ー 費用 ＝ 利益」です。',
            concept: {
              term: '負債（ふさい）',
              definition: '会社が将来返済・支払いをする義務。借入金・買掛金など',
              example: '銀行借入金、買掛金、未払費用',
            },
            miniQuiz: {
              id: 'q-l1-3-inline',
              question: '「資産 ＝ 負債 ＋ 純資産」において、資産500万円、負債300万円のとき純資産はいくらですか？',
              options: ['800万円', '300万円', '200万円', '500万円'],
              correctIndex: 2,
              explanation: '純資産 ＝ 資産 ー 負債 ＝ 500万 ー 300万 ＝ 200万円です。これは会社の「自己資本」とも呼ばれます。',
            },
          },
          {
            text: '仕訳を書くときは、まず「この取引は5つのグループのどれが動くか？」を考えることが出発点です。たとえば「家賃を支払った」なら、費用（地代家賃）が発生し、資産（現金）が減ります。',
            concept: {
              term: '純資産（じゅんしさん）',
              definition: '資産から負債を差し引いた正味の財産。資本金＋利益の蓄積',
              example: '資本金、利益剰余金',
            },
          },
        ],
        keyConcepts: [
          { term: '資産（しさん）', definition: '会社が持っている財産。現金・売掛金・建物・機械など', example: '現金、普通預金、売掛金、商品在庫、土地・建物' },
          { term: '負債（ふさい）', definition: '会社が将来返済・支払いをする義務。借入金・買掛金など' },
          { term: '純資産（じゅんしさん）', definition: '資産から負債を差し引いた正味の財産。資本金＋利益の蓄積' },
          { term: '収益（しゅうえき）', definition: 'ビジネス活動で得た売上や利益の源泉', example: '売上高、受取利息、雑収入' },
          { term: '費用（ひよう）', definition: '収益を得るためにかかったコスト', example: '仕入高、給与、家賃、水道光熱費' },
        ],
        quiz: [
          {
            id: 'q-l1-3-1',
            question: '「売掛金（うりかけきん）」はどのグループに分類されますか？',
            options: ['負債', '収益', '資産', '費用'],
            correctIndex: 2,
            explanation: '売掛金はまだ受け取っていない代金の権利（債権）なので、資産に分類されます。将来現金として受け取れる財産です。',
          },
          {
            id: 'q-l1-3-2',
            question: '「収益 ー 費用 ＝ ？」の「？」に入るものはどれですか？',
            options: ['資産', '負債', '利益', '純資産'],
            correctIndex: 2,
            explanation: '損益計算書（P/L）の基本公式は「収益 ー 費用 ＝ 利益」です。',
          },
        ],
      },

      // ── レッスン 1-4 ─────────────────────────────────────────────────────────
      {
        id: 'l1-4',
        moduleId: 'module-1',
        order: 4,
        title: '仕訳の基本',
        description: '実際の取引を借方・貸方に振り分ける「仕訳」を練習する',
        estimatedMinutes: 10,
        sections: [
          {
            text: '仕訳（しわけ）は会計の最も基本的な作業です。取引が発生するたびに、「何が増えたか（借方）」「何が減ったか、または何の源泉か（貸方）」を記録します。',
          },
          {
            text: '仕訳のルール：①資産が増えたら借方、減ったら貸方。②負債・純資産が増えたら貸方、減ったら借方。③費用は借方、収益は貸方。下の例で確認しましょう。',
            visual: {
              type: 'svgDiagram',
              componentKey: 'JournalEntryVisual',
              data: {
                entries: [
                  { scenario: '売上入金', debit: '現金', credit: '売上高', amount: '100,000' },
                  { scenario: '家賃支払', debit: '地代家賃', credit: '現金', amount: '80,000' },
                  { scenario: '備品購入', debit: '備品', credit: '現金', amount: '50,000' },
                ],
              },
            },
          },
          {
            text: '例1：現金100,000円の売上 → 借方：現金100,000 ／ 貸方：売上高100,000\n例2：家賃80,000円を現金で支払った → 借方：地代家賃80,000 ／ 貸方：現金80,000',
            concept: {
              term: '仕訳（しわけ）',
              definition: '取引を借方・貸方の2面に振り分けて記録すること',
              example: '借方：現金 100,000 / 貸方：売上高 100,000',
            },
            miniQuiz: {
              id: 'q-l1-4-inline',
              question: '費用が発生したとき、仕訳の借方・貸方はどうなりますか？',
              options: [
                '費用は貸方、現金は借方',
                '費用は借方、現金は貸方',
                '費用は借方、売上は借方',
                '費用は貸方、負債は貸方',
              ],
              correctIndex: 1,
              explanation: '費用の発生は借方に記録します。現金で支払った場合、現金（資産）が減るので貸方に現金を記録します。',
            },
          },
          {
            text: 'これを毎日積み重ねることが会計の基本です。会計ソフト（弥生・freee等）を使う場合も、この仕訳の考え方が土台になります。「なぜこの仕訳になるのか」を理解しておくと、ソフトの使い方も直感的にわかります。',
          },
        ],
        keyConcepts: [
          { term: '仕訳（しわけ）', definition: '取引を借方・貸方の2面に振り分けて記録すること', example: '借方：現金 100,000 / 貸方：売上高 100,000' },
          { term: '仕訳帳（しわけちょう）', definition: '全ての仕訳を日付順に記録した帳簿' },
          { term: '元帳転記（もとちょうてんき）', definition: '仕訳帳の記録を勘定科目ごとの元帳（T勘定）に転記すること' },
        ],
        quiz: [
          {
            id: 'q-l1-4-1',
            question: '銀行から200万円を借り入れた場合の仕訳として正しいものはどれですか？',
            options: [
              '借方：借入金2,000,000 / 貸方：現金2,000,000',
              '借方：現金2,000,000 / 貸方：借入金2,000,000',
              '借方：資本金2,000,000 / 貸方：現金2,000,000',
              '借方：費用2,000,000 / 貸方：借入金2,000,000',
            ],
            correctIndex: 1,
            explanation: '現金（資産）が増えるので借方、借入金（負債）が増えるので貸方になります。',
          },
          {
            id: 'q-l1-4-2',
            question: '従業員の給与を現金で支払った際の正しい仕訳はどれですか？',
            options: [
              '借方：現金 / 貸方：給料手当',
              '借方：給料手当 / 貸方：現金',
              '借方：売上 / 貸方：給料手当',
              '借方：給料手当 / 貸方：売掛金',
            ],
            correctIndex: 1,
            explanation: '給料手当（費用）が発生するので借方、現金（資産）が減少するので貸方に現金を記録します。',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // Module 2: 財務諸表
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'module-2',
    order: 2,
    level: 2,
    levelLabel: '財務諸表',
    title: '財務諸表を読む',
    subtitle: '損益計算書・貸借対照表・キャッシュフロー計算書',
    icon: '📊',
    accentColor: 'text-blue-600',
    lessons: [
      // ── レッスン 2-1 ─────────────────────────────────────────────────────────
      {
        id: 'l2-1',
        moduleId: 'module-2',
        order: 1,
        title: '損益計算書（P/L）の読み方',
        description: '1年間の儲けを示す「損益計算書」の構造と見方を理解する',
        estimatedMinutes: 8,
        sections: [
          {
            text: '損益計算書（そんえきけいさんしょ）は英語でProfit & Loss Statement（P/L）と呼ばれ、「1年間でいくら稼いで、いくら使ったか」を示す表です。',
            concept: {
              term: '損益計算書（P/L）',
              definition: '一定期間（通常1年間）の収益と費用、利益を示す財務諸表',
              example: '売上高1,000万円 - 費用850万円 = 当期純利益150万円',
            },
          },
          {
            text: '構造は「売上高 → 売上総利益 → 営業利益 → 経常利益 → 当期純利益」という段階的な計算になっています。下のグラフで各段階を確認しましょう。',
            visual: {
              type: 'rechartsBar',
              componentKey: 'PLStatementDiagram',
              data: {
                items: [
                  { name: '売上高', value: 10000000, type: 'revenue' },
                  { name: '売上原価', value: 6000000, type: 'cost' },
                  { name: '売上総利益', value: 4000000, type: 'profit' },
                  { name: '販管費', value: 2000000, type: 'cost' },
                  { name: '営業利益', value: 2000000, type: 'profit' },
                  { name: '当期純利益', value: 1500000, type: 'profit' },
                ],
              },
            },
          },
          {
            text: '「売上高 ー 売上原価 ＝ 売上総利益（粗利）」：商品・サービスを提供するための直接コストを引いた利益です。粗利率（粗利÷売上高）は業種によって大きく異なります。',
            concept: {
              term: '売上総利益（粗利）',
              definition: '売上高から売上原価を差し引いた利益。「粗利（あらり）」とも呼ぶ',
              example: '売上1,000万 - 仕入600万 = 粗利400万（粗利率40%）',
            },
            miniQuiz: {
              id: 'q-l2-1-inline',
              question: '売上高が800万円、売上原価が480万円の場合、売上総利益はいくらですか？',
              options: ['480万円', '320万円', '800万円', '160万円'],
              correctIndex: 1,
              explanation: '売上総利益 ＝ 売上高 ー 売上原価 ＝ 800万 ー 480万 ＝ 320万円です。粗利率は320÷800＝40%になります。',
            },
          },
          {
            text: '「粗利 ー 販管費 ＝ 営業利益」：人件費・家賃・広告費など会社の運営コストを引いた本業の利益です。決算では、この1年間の損益を正確に計算することが最重要課題の一つです。',
            concept: {
              term: '営業利益',
              definition: '売上総利益から販売費及び一般管理費（販管費）を差し引いた利益',
              example: '粗利400万 - 人件費・家賃等200万 = 営業利益200万',
            },
          },
        ],
        keyConcepts: [
          { term: '損益計算書（P/L）', definition: '一定期間（通常1年間）の収益と費用、利益を示す財務諸表', example: '売上高1,000万円 - 費用850万円 = 当期純利益150万円' },
          { term: '売上総利益（粗利）', definition: '売上高から売上原価を差し引いた利益。「粗利（あらり）」とも呼ぶ' },
          { term: '営業利益', definition: '売上総利益から販売費及び一般管理費（販管費）を差し引いた利益' },
          { term: '当期純利益', definition: '税引後の最終的な利益。貸借対照表の純資産に加算される' },
        ],
        quiz: [
          {
            id: 'q-l2-1-1',
            question: '損益計算書（P/L）が示すものとして正しいものはどれですか？',
            options: [
              '決算日時点の財産状況',
              '一定期間の収益・費用・利益',
              '現金の増減の内訳',
              '株主への配当金の記録',
            ],
            correctIndex: 1,
            explanation: 'P/Lは一定期間（通常1年間）の収益・費用・利益を示します。決算日時点の財産状況はB/S（貸借対照表）が示します。',
          },
          {
            id: 'q-l2-1-2',
            question: '「当期純利益」はどのような利益ですか？',
            options: [
              '売上から仕入を引いた利益',
              '本業で稼いだ利益',
              '税金を支払った後の最終的な利益',
              '販管費を引く前の利益',
            ],
            correctIndex: 2,
            explanation: '当期純利益は法人税等を支払った後の最終利益です。これがB/Sの利益剰余金に積み上がっていきます。',
          },
        ],
      },

      // ── レッスン 2-2 ─────────────────────────────────────────────────────────
      {
        id: 'l2-2',
        moduleId: 'module-2',
        order: 2,
        title: '貸借対照表（B/S）の構造',
        description: '決算日時点の財産状況を示す「貸借対照表」の左右の関係を理解する',
        estimatedMinutes: 8,
        sections: [
          {
            text: '貸借対照表（B/S: Balance Sheet）は、決算日時点での会社の財産状況を示します。左側（資産の部）と右側（負債・純資産の部）が常に一致します。',
            concept: {
              term: '貸借対照表（B/S）',
              definition: '決算日時点の資産・負債・純資産のバランスを示す財務諸表',
              example: '資産合計1,000万 ＝ 負債500万 ＋ 純資産500万',
            },
          },
          {
            text: '左側：資産の部は「会社が持っているもの」です。上から流動資産（現金化しやすいもの）、固定資産（長期保有するもの）の順に並びます。右側：負債の部は「他者からの借り（返済義務）」、純資産の部は「株主からの出資と過去の利益の蓄積」です。',
            visual: {
              type: 'svgDiagram',
              componentKey: 'BalanceSheetDiagram',
              data: { simplified: false },
            },
          },
          {
            text: '重要な等式：資産 ＝ 負債 ＋ 純資産。これが崩れていたら仕訳に誤りがあります。',
            concept: {
              term: '流動資産',
              definition: '1年以内に現金化できる資産（現金・売掛金・在庫など）',
            },
            miniQuiz: {
              id: 'q-l2-2-inline',
              question: '貸借対照表（B/S）において、左側に表示されるものはどれですか？',
              options: ['負債', '純資産', '資産', '収益'],
              correctIndex: 2,
              explanation: 'B/Sの左側は「資産の部」です。右側は「負債の部」と「純資産の部」に分かれています。',
            },
          },
          {
            text: '純資産が大きいほど財務的に安定した会社です。自己資本比率（純資産÷総資産）が高いと銀行からの信頼も得やすくなります。中小企業では自己資本比率20〜30%以上が健全の目安とされます。',
            concept: {
              term: '固定資産',
              definition: '1年超保有する資産（土地・建物・機械・車両など）',
            },
          },
        ],
        keyConcepts: [
          { term: '貸借対照表（B/S）', definition: '決算日時点の資産・負債・純資産のバランスを示す財務諸表', example: '資産合計1,000万 ＝ 負債500万 ＋ 純資産500万' },
          { term: '流動資産', definition: '1年以内に現金化できる資産（現金・売掛金・在庫など）' },
          { term: '固定資産', definition: '1年超保有する資産（土地・建物・機械・車両など）' },
          { term: '流動負債', definition: '1年以内に返済する義務のある負債（買掛金・短期借入金など）' },
        ],
        quiz: [
          {
            id: 'q-l2-2-1',
            question: '「売掛金（うりかけきん）」は流動資産と固定資産のどちらに分類されますか？',
            options: ['固定資産', '流動資産', '流動負債', '純資産'],
            correctIndex: 1,
            explanation: '売掛金は通常1年以内に回収される（現金化される）ので、流動資産に分類されます。',
          },
          {
            id: 'q-l2-2-2',
            question: '自己資本比率とは何ですか？',
            options: [
              '売上高に対する利益の割合',
              '純資産を総資産で割った割合',
              '負債を純資産で割った割合',
              '流動資産を流動負債で割った割合',
            ],
            correctIndex: 1,
            explanation: '自己資本比率 ＝ 純資産 ÷ 総資産（×100%）。この比率が高いほど財務的に安定しています。',
          },
        ],
      },

      // ── レッスン 2-3 ─────────────────────────────────────────────────────────
      {
        id: 'l2-3',
        moduleId: 'module-2',
        order: 3,
        title: 'キャッシュフロー計算書',
        description: '現金の「増減の内訳」を3つの活動区分で把握する',
        estimatedMinutes: 8,
        sections: [
          {
            text: 'キャッシュフロー計算書（CF計算書）は、会社のお金の流れを3つの区分で見える化した表です。「P/Lでは黒字なのに資金繰りが苦しい」という状況を把握するのに役立ちます。',
            concept: {
              term: 'キャッシュフロー計算書（CF）',
              definition: '一定期間の現金の増減を、3つの活動区分で示す財務諸表',
            },
          },
          {
            text: '3つの活動区分：①営業活動CF（本業の現金の動き）、②投資活動CF（設備投資など）、③財務活動CF（借入・返済など）。下の図で確認しましょう。',
            visual: {
              type: 'svgDiagram',
              componentKey: 'CashFlowDiagram',
              data: { operating: 3000000, investing: -2000000, financing: 1000000 },
            },
          },
          {
            text: '「黒字倒産」という言葉があります。利益は出ているのに現金が不足して倒産するケースです。P/L上の利益と実際の現金は異なります。売掛金の回収遅延や在庫の積み上がりが原因になります。',
            concept: {
              term: '営業活動によるCF',
              definition: '本業（商品・サービスの販売）による現金の増減。プラスが健全',
              example: '売上の回収＋3,000万円、仕入の支払い－2,000万円',
            },
            miniQuiz: {
              id: 'q-l2-3-inline',
              question: '「黒字倒産」が起きる主な原因はどれですか？',
              options: [
                '売上が多すぎること',
                '利益はあるが現金が不足すること',
                '税金を支払いすぎること',
                '従業員が多すぎること',
              ],
              correctIndex: 1,
              explanation: '利益（P/L上の数字）と現金（実際に手元にあるお金）は異なります。売掛金が回収できなかったり、在庫投資が多すぎると現金不足になります。',
            },
          },
          {
            text: '営業活動CFがプラスかつ大きいほど健全な会社です。投資活動CFは成長のための投資でマイナスになりやすく、財務活動CFは借入でプラス・返済でマイナスになります。3つを合わせた変動が現金残高の変化になります。',
          },
        ],
        keyConcepts: [
          { term: 'キャッシュフロー計算書（CF）', definition: '一定期間の現金の増減を、3つの活動区分で示す財務諸表' },
          { term: '営業活動によるCF', definition: '本業（商品・サービスの販売）による現金の増減。プラスが健全' },
          { term: '投資活動によるCF', definition: '設備投資や有価証券の取得・売却による現金の増減' },
          { term: '財務活動によるCF', definition: '借入・返済・増資などによる現金の増減' },
        ],
        quiz: [
          {
            id: 'q-l2-3-1',
            question: 'キャッシュフロー計算書の「営業活動によるCF」がプラスであることは何を意味しますか？',
            options: [
              '会社が設備投資をしている',
              '本業で現金を稼いでいる',
              '銀行から借入をしている',
              '株主へ配当を支払っている',
            ],
            correctIndex: 1,
            explanation: '営業活動によるCFがプラスとは、本業（商品・サービスの販売）によって現金が入ってきていることを意味します。これが最も重要な指標です。',
          },
          {
            id: 'q-l2-3-2',
            question: '銀行借入でお金を受け取った場合、CF計算書のどの区分に影響しますか？',
            options: ['営業活動によるCF', '投資活動によるCF', '財務活動によるCF', '営業外活動によるCF'],
            correctIndex: 2,
            explanation: '銀行借入・返済・増資・配当などは「財務活動によるCF」に分類されます。',
          },
        ],
      },

      // ── レッスン 2-4 ─────────────────────────────────────────────────────────
      {
        id: 'l2-4',
        moduleId: 'module-2',
        order: 4,
        title: '主要な勘定科目の詳細',
        description: '中小企業でよく使う具体的な勘定科目を仕訳例で学ぶ',
        estimatedMinutes: 10,
        sections: [
          {
            text: '中小企業の日常業務でよく登場する勘定科目を整理します。これらを正しく使い分けることが正確な決算の鍵です。',
          },
          {
            text: '【資産系】現金・普通預金・売掛金・商品（在庫）・前払費用・建物・車両・機械\n【負債系】買掛金・未払費用・短期借入金・長期借入金・預り金（源泉所得税）',
            visual: {
              type: 'svgDiagram',
              componentKey: 'TAccountDiagram',
              data: {
                accountName: '売掛金',
                debitEntries: [
                  { label: '掛売上発生', amount: 300000 },
                  { label: '掛売上発生', amount: 200000 },
                ],
                creditEntries: [
                  { label: '現金回収', amount: 300000 },
                  { label: '残高', amount: 200000 },
                ],
              },
            },
          },
          {
            text: '「売掛金」と「買掛金」は特に重要です。売掛金は掛け売り（後払い）で発生する資産、買掛金は掛け仕入れで発生する負債です。月次で残高を確認し、回収漏れや支払い漏れがないか管理しましょう。',
            concept: {
              term: '売掛金（うりかけきん）',
              definition: '商品・サービスを販売したが、まだ代金を受け取っていない債権（資産）',
              example: '月末締め翌月払いの取引 → 販売時に売掛金計上 → 入金時に現金へ振替',
            },
            miniQuiz: {
              id: 'q-l2-4-inline',
              question: '「買掛金（かいかけきん）」はどのグループに分類されますか？',
              options: ['資産', '費用', '負債', '純資産'],
              correctIndex: 2,
              explanation: '買掛金は「まだ支払っていない代金」なので、将来支払う義務のある負債に分類されます。',
            },
          },
          {
            text: '【収益系】売上高・受取利息・雑収入\n【費用系】仕入高・給料手当・地代家賃・水道光熱費・通信費・広告宣伝費・減価償却費・支払利息',
            concept: {
              term: '買掛金（かいかけきん）',
              definition: '商品・サービスを購入したが、まだ代金を支払っていない債務（負債）',
            },
          },
        ],
        keyConcepts: [
          { term: '売掛金（うりかけきん）', definition: '商品・サービスを販売したが、まだ代金を受け取っていない債権（資産）' },
          { term: '買掛金（かいかけきん）', definition: '商品・サービスを購入したが、まだ代金を支払っていない債務（負債）' },
          { term: '未払費用（みばらいひよう）', definition: '費用は発生しているが、まだ支払っていない負債（給与・利息など）' },
          { term: '前払費用（まえばらいひよう）', definition: 'まだサービスを受けていないのに支払った費用（保険料の前払いなど）（資産）' },
        ],
        quiz: [
          {
            id: 'q-l2-4-1',
            question: '従業員の給与を現金で支払った際の正しい仕訳はどれですか？',
            options: [
              '借方：現金 / 貸方：給料手当',
              '借方：給料手当 / 貸方：現金',
              '借方：売上 / 貸方：給料手当',
              '借方：給料手当 / 貸方：売掛金',
            ],
            correctIndex: 1,
            explanation: '給料手当（費用）が発生するので借方、現金（資産）が減少するので貸方に現金を記録します。',
          },
          {
            id: 'q-l2-4-2',
            question: '「未払費用（みばらいひよう）」はどのグループですか？',
            options: ['資産', '負債', '費用', '収益'],
            correctIndex: 1,
            explanation: '未払費用は「費用は発生したが、まだ支払っていない金額」です。将来支払う義務があるので負債に分類されます。',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────────
  // Module 3: 決算・税務
  // ────────────────────────────────────────────────────────────────────────────
  {
    id: 'module-3',
    order: 3,
    level: 3,
    levelLabel: '決算・税務',
    title: '決算と税務の基礎',
    subtitle: '決算の流れ・減価償却・消費税・法人税',
    icon: '🏛️',
    accentColor: 'text-amber-600',
    lessons: [
      // ── レッスン 3-1 ─────────────────────────────────────────────────────────
      {
        id: 'l3-1',
        moduleId: 'module-3',
        order: 1,
        title: '決算の全体フロー',
        description: '決算期末に行う作業の流れとスケジュールを把握する',
        estimatedMinutes: 8,
        sections: [
          {
            text: '決算（けっさん）とは、1年間の会計を締め切り、財務諸表を完成させる作業です。法人は通常、事業年度終了から2ヶ月以内に法人税等の申告・納付が必要です。',
            concept: {
              term: '決算（けっさん）',
              definition: '一定期間（事業年度）の会計を締め切り、財務諸表を作成する作業',
            },
          },
          {
            text: '決算の主な流れは5ステップです。帳簿の整理から財務諸表の完成、税務申告まで順番に進みます。',
            visual: {
              type: 'svgDiagram',
              componentKey: 'AccountingFlowDiagram',
              data: {
                steps: ['残高試算表の作成', '決算整理仕訳', '精算表の作成', '財務諸表の作成', '税務申告（法人税・消費税）'],
              },
            },
          },
          {
            text: '「決算整理仕訳」が特に重要です。通常の仕訳では計上されない項目（減価償却費・棚卸・未払費用の計上等）をまとめて調整します。棚卸（たなおろし）とは、期末に在庫の実際の数量と金額を確認する作業です。',
            concept: {
              term: '決算整理仕訳',
              definition: '決算日に行う調整仕訳。減価償却・棚卸・未払費用の計上など',
              example: '減価償却費の計上、在庫の棚卸調整、未払法人税の計上',
            },
            miniQuiz: {
              id: 'q-l3-1-inline',
              question: '日本の法人が決算後に行う税務申告の期限は通常いつですか？',
              options: [
                '事業年度終了から1ヶ月以内',
                '事業年度終了から2ヶ月以内',
                '事業年度終了から6ヶ月以内',
                '翌事業年度の末日まで',
              ],
              correctIndex: 1,
              explanation: '法人税の申告・納付期限は事業年度終了の翌日から2ヶ月以内です（延長申請した場合は3ヶ月）。',
            },
          },
          {
            text: '初めての決算は税理士に依頼することを強く推奨します。ただし基礎を理解しておくことで、税理士との打ち合わせがスムーズになり、節税アドバイスも活かしやすくなります。',
          },
        ],
        keyConcepts: [
          { term: '決算（けっさん）', definition: '一定期間（事業年度）の会計を締め切り、財務諸表を作成する作業' },
          { term: '決算整理仕訳', definition: '決算日に行う調整仕訳。減価償却・棚卸・未払費用の計上など' },
          { term: '棚卸（たなおろし）', definition: '期末に在庫（商品・材料）の実際の数量と金額を確認する作業' },
          { term: '試算表（しさんひょう）', definition: '全勘定科目の残高をまとめた表。B/SとP/Lの素材となる' },
        ],
        quiz: [
          {
            id: 'q-l3-1-1',
            question: '「棚卸（たなおろし）」の目的として正しいものはどれですか？',
            options: [
              '従業員の勤怠を確認すること',
              '期末時点の在庫数量と金額を確認すること',
              '売掛金の回収を催促すること',
              '固定資産の時価を評価すること',
            ],
            correctIndex: 1,
            explanation: '棚卸は期末に在庫（商品・材料・製品）の実際の数量を数えて、帳簿残高と照合する作業です。売上原価の計算に直結します。',
          },
          {
            id: 'q-l3-1-2',
            question: '決算整理仕訳の例として正しいものはどれですか？',
            options: [
              '商品を販売したときの仕訳',
              '給与を支払ったときの仕訳',
              '減価償却費を計上する仕訳',
              '銀行から借り入れたときの仕訳',
            ],
            correctIndex: 2,
            explanation: '決算整理仕訳は期末に行う特別な仕訳です。減価償却費・棚卸の調整・未払費用の計上などが含まれます。',
          },
        ],
      },

      // ── レッスン 3-2 ─────────────────────────────────────────────────────────
      {
        id: 'l3-2',
        moduleId: 'module-3',
        order: 2,
        title: '減価償却の計算',
        description: '固定資産の価値が時間とともに減少する「減価償却」の仕組みを学ぶ',
        estimatedMinutes: 10,
        sections: [
          {
            text: '100万円の機械を購入した場合、その年に100万円全額を費用にするのではなく、使用できる期間（耐用年数）にわたって少しずつ費用化します。これが減価償却です。',
            concept: {
              term: '減価償却（げんかしょうきゃく）',
              definition: '固定資産（建物・機械・車両など）の取得コストを、耐用年数にわたって費用配分すること',
              example: '100万円の機械（耐用年数5年）→ 毎年20万円を「減価償却費」として費用計上',
            },
          },
          {
            text: '定額法と定率法という2つの計算方法があります。定額法は毎年同額、定率法は最初の年が最も多く年々減少します。下のグラフで違いを確認しましょう。',
            visual: {
              type: 'rechartsLine',
              componentKey: 'DepreciationChart',
              data: { initialValue: 1000000, years: 5, straightLineRate: 0.2, decliningRate: 0.4 },
            },
          },
          {
            text: '仕訳：借方：減価償却費200,000 ／ 貸方：減価償却累計額200,000\n定額法は毎年同額を償却。個人事業主は定額法のみ、法人は選択可（届出が必要）です。',
            concept: {
              term: '定額法（ていがくほう）',
              definition: '毎期均等額を償却する方法。計算が簡単で予測しやすい',
              example: '取得価額100万÷耐用年数5年＝毎年20万円',
            },
            miniQuiz: {
              id: 'q-l3-2-inline',
              question: '取得価額120万円、耐用年数6年の備品を定額法で償却した場合、毎年の減価償却費はいくらですか？',
              options: ['6万円', '12万円', '20万円', '24万円'],
              correctIndex: 2,
              explanation: '定額法の年間償却費 ＝ 取得価額 ÷ 耐用年数 ＝ 120万円 ÷ 6年 ＝ 20万円です。',
            },
          },
          {
            text: '減価償却費は実際に現金が出ていかないのに費用として計上できるため、税金を減らす効果があります。決算整理仕訳で必ず計上しましょう。計上漏れは税務上リスクになります。',
            concept: {
              term: '耐用年数（たいようねんすう）',
              definition: '税法上の使用可能期間。資産の種類ごとに法定されている',
              example: '普通乗用車：6年、コンピュータ：4年、木造建物：22年',
            },
          },
        ],
        keyConcepts: [
          { term: '減価償却（げんかしょうきゃく）', definition: '固定資産の取得コストを、耐用年数にわたって費用配分すること' },
          { term: '定額法（ていがくほう）', definition: '毎期均等額を償却する方法', example: '取得価額100万÷耐用年数5年＝毎年20万円' },
          { term: '定率法（ていりつほう）', definition: '期首帳簿価額に一定率を掛けて償却する方法。最初の年が最も大きい' },
          { term: '耐用年数（たいようねんすう）', definition: '税法上の使用可能期間。資産の種類ごとに法定されている' },
        ],
        quiz: [
          {
            id: 'q-l3-2-1',
            question: '減価償却費を計上することで得られる税務上のメリットはどれですか？',
            options: [
              '消費税が還付される',
              '課税所得が減少し、法人税が減る',
              '売掛金の回収が早くなる',
              '借入金の金利が下がる',
            ],
            correctIndex: 1,
            explanation: '減価償却費は費用として計上されるため、課税所得（税金の対象となる利益）が減り、法人税や所得税が減少します。',
          },
          {
            id: 'q-l3-2-2',
            question: '減価償却の仕訳（定額法）として正しいものはどれですか？',
            options: [
              '借方：機械 / 貸方：現金',
              '借方：減価償却費 / 貸方：減価償却累計額',
              '借方：現金 / 貸方：減価償却費',
              '借方：費用 / 貸方：機械',
            ],
            correctIndex: 1,
            explanation: '減価償却費（費用）を借方に計上し、対応する勘定として「減価償却累計額」を貸方に記録します。機械本体の勘定は変えません。',
          },
        ],
      },

      // ── レッスン 3-3 ─────────────────────────────────────────────────────────
      {
        id: 'l3-3',
        moduleId: 'module-3',
        order: 3,
        title: '消費税の仕組み',
        description: '消費税の課税・非課税・インボイス制度の基礎を理解する',
        estimatedMinutes: 10,
        sections: [
          {
            text: '消費税は「受け取った消費税 ー 支払った消費税 ＝ 納付する消費税」という仕組みです。これを「仕入税額控除」といいます。',
            concept: {
              term: '仕入税額控除',
              definition: '売上にかかった消費税から、仕入にかかった消費税を差し引いて納付する仕組み',
              example: '受け取り消費税100万 - 支払い消費税60万 = 納付消費税40万',
            },
          },
          {
            text: '例：売上1,100万円（消費税100万円含む）、仕入660万円（消費税60万円含む）の場合、納付消費税 ＝ 100万 ー 60万 ＝ 40万円。下の図で流れを確認しましょう。',
            visual: {
              type: 'svgDiagram',
              componentKey: 'TaxFlowDiagram',
              data: { taxType: 'consumption' },
            },
          },
          {
            text: '2023年10月からインボイス制度が始まりました。適格請求書（インボイス）がないと仕入税額控除ができません。取引先からインボイスをもらうことが重要です。',
            concept: {
              term: 'インボイス制度',
              definition: '適格請求書発行事業者登録番号を記載した請求書を発行・保存する制度（2023年10月〜）',
            },
            miniQuiz: {
              id: 'q-l3-3-inline',
              question: '売上の消費税が80万円、仕入の消費税が50万円の場合、納付する消費税はいくらですか？',
              options: ['130万円', '50万円', '30万円', '80万円'],
              correctIndex: 2,
              explanation: '納付消費税 ＝ 受け取り消費税 ー 支払い消費税 ＝ 80万 ー 50万 ＝ 30万円。これを仕入税額控除といいます。',
            },
          },
          {
            text: '設立2年以内の法人は原則として免税事業者（消費税の納付不要）ですが、資本金1,000万円以上の場合は初年度から課税事業者になります。消費税の申告・納付は通常、事業年度終了から2ヶ月以内です。',
            concept: {
              term: '課税事業者',
              definition: '消費税を納める義務がある事業者。基準期間の課税売上高が1,000万円超など',
            },
          },
        ],
        keyConcepts: [
          { term: '課税事業者', definition: '消費税を納める義務がある事業者。基準期間の課税売上高が1,000万円超など' },
          { term: 'インボイス制度', definition: '適格請求書発行事業者登録番号を記載した請求書を発行・保存する制度（2023年10月〜）' },
          { term: '仕入税額控除', definition: '売上にかかった消費税から、仕入にかかった消費税を差し引いて納付する仕組み' },
          { term: '簡易課税制度', definition: '課税売上高5,000万円以下の事業者が選択できる簡便な消費税計算方法' },
        ],
        quiz: [
          {
            id: 'q-l3-3-1',
            question: 'インボイス制度に関して正しい説明はどれですか？',
            options: [
              '2020年1月から始まった制度',
              '適格請求書がないと仕入税額控除ができない',
              '売上高にかかわらず全事業者に適用される',
              '消費税率を自分で設定できる制度',
            ],
            correctIndex: 1,
            explanation: 'インボイス制度では、登録番号付きの適格請求書（インボイス）がないと仕入税額控除を受けられません。2023年10月に開始されました。',
          },
          {
            id: 'q-l3-3-2',
            question: '設立2年以内の法人が免税事業者になれない条件はどれですか？',
            options: [
              '従業員が10人以上いる場合',
              '資本金が1,000万円以上の場合',
              '売上が500万円以上の場合',
              '法人税を支払っている場合',
            ],
            correctIndex: 1,
            explanation: '資本金1,000万円以上で設立した法人は、設立初年度から課税事業者となり消費税を納める義務があります。',
          },
        ],
      },

      // ── レッスン 3-4 ─────────────────────────────────────────────────────────
      {
        id: 'l3-4',
        moduleId: 'module-3',
        order: 4,
        title: '法人税の基礎',
        description: '法人税の計算の流れと主な節税策の考え方を学ぶ',
        estimatedMinutes: 8,
        sections: [
          {
            text: '法人税は「課税所得 × 税率」で計算されます。課税所得は会計上の利益とは異なり、税務調整が加わります。法人実効税率は約30〜35%（法人税＋住民税＋事業税の合計）です。',
            concept: {
              term: '法人税',
              definition: '会社の所得（利益）に対してかかる国税。税率は資本金1億円以下の中小企業は約23.2%（軽減税率適用時は15%）',
            },
          },
          {
            text: '課税所得は会計上の利益に税務調整（損金不算入・損金算入）を加えて計算します。下の図で流れを確認しましょう。',
            visual: {
              type: 'svgDiagram',
              componentKey: 'TaxFlowDiagram',
              data: { taxType: 'corporate' },
            },
          },
          {
            text: '節税の基本は「課税所得を合法的に減らすこと」です。主な方法：①経費をもれなく計上する、②減価償却を適切に行う、③役員報酬を適切に設定する、④小規模企業共済に加入する。',
            concept: {
              term: '損金算入（そんきんさんにゅう）',
              definition: '税務上、費用として認められること。損金算入できる費用は課税所得を減らす',
            },
            miniQuiz: {
              id: 'q-l3-4-inline',
              question: '「損金不算入（そんきんふさんにゅう）」の例として正しいものはどれですか？',
              options: [
                '従業員への給与',
                '事務所の家賃',
                '法人税等の税金（本税）',
                '業務用車両の燃料費',
              ],
              correctIndex: 2,
              explanation: '法人税等の本税は損金不算入です（会計上費用計上するが、課税所得計算では差し戻す）。罰金・科料なども損金不算入です。',
            },
          },
          {
            text: '会計上の費用でも税務上認められない「損金不算入」のものがあります。交際費の超過分（資本金1億円以下は年800万円まで全額損金可）、役員への不当に高い報酬、罰金・科料などです。税務処理は複雑なので税理士への相談が不可欠ですが、基本知識があると打ち合わせの効率が上がります。',
            concept: {
              term: '課税所得',
              definition: '法人税の計算の元となる所得。会計上の利益に税務上の調整を加えたもの',
              example: '会計利益500万 ＋ 損金不算入100万 ＝ 課税所得600万',
            },
          },
        ],
        keyConcepts: [
          { term: '法人税', definition: '会社の所得（利益）に対してかかる国税' },
          { term: '課税所得', definition: '法人税の計算の元となる所得。会計上の利益に税務上の調整を加えたもの' },
          { term: '損金算入（そんきんさんにゅう）', definition: '税務上、費用として認められること。損金算入できる費用は課税所得を減らす' },
          { term: '損金不算入', definition: '会計上は費用でも税務上は認められないもの（交際費の超過分・罰金等）' },
        ],
        quiz: [
          {
            id: 'q-l3-4-1',
            question: '課税所得を合法的に減らす（節税する）方法として適切なものはどれですか？',
            options: [
              '売上を意図的に少なく申告する',
              '経費をもれなく正しく計上する',
              '従業員への給与を帳簿外で支払う',
              '架空の領収書で経費を水増しする',
            ],
            correctIndex: 1,
            explanation: '正当な節税は「実際にかかった費用を正しく・もれなく計上すること」です。架空計上・隠蔽は脱税であり、重加算税や刑事罰の対象になります。',
          },
          {
            id: 'q-l3-4-2',
            question: '中小企業（資本金1億円以下）の法人税率として正しいものはどれですか？',
            options: [
              '課税所得800万円以下は約15%（軽減税率）',
              '一律50%',
              '売上高の10%',
              '従業員数×10万円',
            ],
            correctIndex: 0,
            explanation: '中小企業の法人税率は、課税所得800万円以下の部分に15%（軽減税率）が適用されます（実効税率は住民税・事業税を含め約23%程度）。',
          },
        ],
      },
    ],
  },
];

// ─── ユーティリティ関数 ──────────────────────────────────────────────────────

export function getAllLessons(): Lesson[] {
  return MODULES.flatMap((m) => m.lessons);
}

export function findModule(moduleId: string): Module | undefined {
  return MODULES.find((m) => m.id === moduleId);
}

export function findLesson(moduleId: string, lessonId: string): Lesson | undefined {
  const module = findModule(moduleId);
  return module?.lessons.find((l) => l.id === lessonId);
}

export function getAdjacentLessons(
  moduleId: string,
  lessonId: string
): { prev: Lesson | null; next: Lesson | null } {
  const module = findModule(moduleId);
  if (!module) return { prev: null, next: null };
  const idx = module.lessons.findIndex((l) => l.id === lessonId);
  return {
    prev: idx > 0 ? module.lessons[idx - 1] : null,
    next: idx < module.lessons.length - 1 ? module.lessons[idx + 1] : null,
  };
}
