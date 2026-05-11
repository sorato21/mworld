const MUSCLE_MAP: Array<{ keywords: string[]; muscles: string[] }> = [
  {
    keywords: [
      'ベンチプレス', 'ダンベルフライ', 'プッシュアップ', '腕立て伏せ', 'チェストプレス',
      'ケーブルクロス', 'インクライン', 'ワイドプッシュ', 'ダイヤモンドプッシュ',
      'アーチャープッシュ', '肩甲骨プッシュ',
    ],
    muscles: ['大胸筋', '三角筋前部', '上腕三頭筋'],
  },
  {
    keywords: [
      'ラットプルダウン', '懸垂', 'チンアップ', 'プルアップ', 'ベントオーバーロウ',
      'テーブルロウ', 'インバーテッドロウ', 'タオルロウ', 'ケーブルロウ', 'TRXロウ',
      'ダンベルロウ', 'ローイング',
    ],
    muscles: ['広背筋', '僧帽筋', '上腕二頭筋'],
  },
  {
    keywords: ['デッドリフト', 'ルーマニアン', 'スーパーマン'],
    muscles: ['広背筋', '脊柱起立筋', 'ハムストリング', '臀筋'],
  },
  {
    keywords: [
      'ショルダープレス', 'サイドレイタル', 'サイドレイズ', 'フロントレイズ',
      'フェイスプル', 'アップライトロウ', 'バトルロープ', 'パイクプッシュ',
    ],
    muscles: ['三角筋', '僧帽筋'],
  },
  {
    keywords: ['カール', 'ハンマー'],
    muscles: ['上腕二頭筋', '前腕'],
  },
  {
    keywords: [
      'トライセプス', 'プレスダウン', 'キックバック', 'EZバー', 'スカルクラッシャー',
      'トリセップス', 'ディップス', 'チェアディップ',
    ],
    muscles: ['上腕三頭筋'],
  },
  {
    keywords: ['スクワット', 'レッグプレス', 'ランジ', 'ゴブレット', 'ブルガリアン', 'ピストル', 'ボックスジャンプ'],
    muscles: ['大腿四頭筋', '臀筋', 'ハムストリング'],
  },
  {
    keywords: ['レッグカール', 'シングルレッグデッドリフト'],
    muscles: ['ハムストリング'],
  },
  {
    keywords: ['カーフレイズ'],
    muscles: ['下腿三頭筋'],
  },
  {
    keywords: ['グルートブリッジ', 'ヒップリフト'],
    muscles: ['臀筋', 'ハムストリング'],
  },
  {
    keywords: [
      'プランク', 'クランチ', '腹筋', 'レッグレイズ', 'ニーレイズ',
      'ツイスト', 'Vシット', 'Lシット', 'バイシクル', 'ニートゥ', 'ハンギング',
    ],
    muscles: ['腹直筋', '体幹'],
  },
  {
    keywords: ['マウンテンクライマー'],
    muscles: ['体幹', '三角筋'],
  },
  {
    keywords: ['バーピー', 'ジャンピングジャック', 'ハイニー', 'スプリンター', 'ジャンプランジ', 'ジャンプスクワット'],
    muscles: ['全身'],
  },
  {
    keywords: ['ケトルベルスイング', 'パワークリーン', 'プッシュプレス', 'ダンベルスナッチ'],
    muscles: ['全身', '体幹'],
  },
]

function getMusclesForExercise(name: string): string[] {
  for (const { keywords, muscles } of MUSCLE_MAP) {
    if (keywords.some((kw) => name.includes(kw))) return muscles
  }
  return []
}

export default function MuscleHighlight({ exerciseName }: { exerciseName: string }) {
  const muscles = getMusclesForExercise(exerciseName)
  if (muscles.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {muscles.map((muscle) => (
        <span
          key={muscle}
          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}
        >
          {muscle}
        </span>
      ))}
    </div>
  )
}
