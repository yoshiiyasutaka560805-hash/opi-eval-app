export interface InterviewQuestion {
  id: number;
  ability: string;
  question: string;
  whyMatters: string;
  scoringAnchors: {
    level: string;
    description: string;
  }[];
}

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: 1,
    ability: '指示理解力',
    question:
      '利用者の食事介助で、看護師から「ゆっくり・一口ずつ・むせたらすぐ止める」と言われたら、どう動きますか？',
    whyMatters:
      '複数の指示を正確に理解し、それぞれを実行できるかを見ます。誤解や省略は食事中の誤嚥につながる可能性があります。',
    scoringAnchors: [
      {
        level: '優秀 (20点)',
        description:
          '「はい、ゆっくり、一口ずつ、むせたらすぐ止めます」と全て復唱し、理由まで説明できる。例：「むせたら誤嚥の危険があるから」',
      },
      {
        level: '良好 (16点)',
        description: '「ゆっくり・一口ずつ・むせたら止める」と復唱で3つ全て確認できている',
      },
      {
        level: '基本達成 (12点)',
        description: '複数の指示を理解しているが、復唱が1〜2項目のみ、または曖昧な表現',
      },
      {
        level: '要支援 (8点)',
        description: '指示の主要部分のみ理解。細部が欠落している。確認質問がない',
      },
      {
        level: '不十分 (4点)',
        description: '指示の理解が曖昧。復唱・確認がない。または発言に根拠がない',
      },
    ],
  },
  {
    id: 2,
    ability: '情報整理・報告精度',
    question:
      '夜勤中に利用者が転倒しました。朝の申し送りでどのように報告しますか？',
    whyMatters:
      '転倒は重大インシデント。時刻・場所・状況・対応・結果を正確に報告できないと、次の医学的対応が遅延します。',
    scoringAnchors: [
      {
        level: '優秀 (20点)',
        description:
          '5W1H（いつ・どこで・だれが・何をして・どうなった・どう対応した）が全て含まれている。順序が論理的。例：「昨日22時、2階廊下で田中様が転倒。右足着床、意識あり。直ちに報告・医者に確認しました」',
      },
      {
        level: '良好 (16点)',
        description: '5W1Hの主要4〜5項目が含まれている。報告の順序が理解できる',
      },
      {
        level: '基本達成 (12点)',
        description:
          '転倒の事実と基本情報は報告できるが、時刻・対応が不明確。または重要な項目が1つ抜けている',
      },
      {
        level: '要支援 (8点)',
        description: '転倒したことと場所は言及しているが、いつ・どう対応したか不明。報告が散漫',
      },
      {
        level: '不十分 (4点)',
        description: '転倒した事実のみ。状況説明がない。または報告の順序が支離滅裂',
      },
    ],
  },
  {
    id: 3,
    ability: '緊急対応能力',
    question:
      '利用者が急に顔色が悪くなり、声をかけても反応が薄い。あなたはどうしますか？',
    whyMatters:
      '急変時の判断と行動は生死に関わります。慌てずに、まず医療スタッフに報告・相談できるかが重要です。',
    scoringAnchors: [
      {
        level: '優秀 (20点)',
        description:
          '直ちに「看護師さん / 医者を呼びます」と言及。利用者の状態（意識・呼吸）を確認する行動が見られる。詳細報告を準備できている',
      },
      {
        level: '良好 (16点)',
        description:
          '適切に医療スタッフへ報告・相談することが言及されている。応急処置の第一歩が明確',
      },
      {
        level: '基本達成 (12点)',
        description:
          '医者や看護師に報告する必要性を認識しているが、具体的な報告内容（意識・呼吸など）が不明確',
      },
      {
        level: '要支援 (8点)',
        description:
          '何か対応する必要性は感じているが、何をするかが曖昧。医療スタッフへの報告を言及していない',
      },
      {
        level: '不十分 (4点)',
        description: '対応方法が見当違いか、医療スタッフに報告する概念がない',
      },
    ],
  },
  {
    id: 4,
    ability: '確認行動・報連相',
    question:
      'わからないことがあったとき、あなたはどうしますか？具体的に教えてください。',
    whyMatters:
      '不明なまま進めると事故につながります。自分から質問し、確認し、報告できる姿勢が安全文化の基本です。',
    scoringAnchors: [
      {
        level: '優秀 (20点)',
        description:
          '「先輩に声をかけて、具体的に『この場合はどうするんですか？』と聞きます」など、能動的で具体的な確認行動が言及されている',
      },
      {
        level: '良好 (16点)',
        description:
          '「分からないことは確認します」と述べ、確認相手（先輩・看護師など）が明示されている',
      },
      {
        level: '基本達成 (12点)',
        description:
          '確認の必要性は述べているが、具体的な相手や方法が曖昧。復唱型の確認のみの言及',
      },
      {
        level: '要支援 (8点)',
        description:
          '「分かりました」と言うのみ。確認行動の言及が弱い、または相手が不明',
      },
      {
        level: '不十分 (4点)',
        description: '確認・質問の概念がない。またはわかったふりをする傾向が見られる',
      },
    ],
  },
];

export interface ScoringAnchor {
  level: string;
  points: number;
  description: string;
}

export const caringAptiudeScoringAnchors: ScoringAnchor[] = [
  {
    level: '対話・共感能力',
    points: 5,
    description: 'コミュニケーション: 利用者の気持ちを察し、温かみのある会話ができているか',
  },
  {
    level: 'ストレス耐性・継続意欲',
    points: 5,
    description: '定着可能性: 大変な場面でも前向きに取り組む姿勢、継続したいという意思が見えるか',
  },
  {
    level: '安全意識',
    points: 5,
    description: '安全を最優先にする発言・行動: 楽より安全を選ぶ判断が見られるか',
  },
  {
    level: '日本の介護文化への適応',
    points: 5,
    description:
      '現場文化への理解: 利用者への敬意、チームワーク、報告の重要性などが理解できているか',
  },
];
