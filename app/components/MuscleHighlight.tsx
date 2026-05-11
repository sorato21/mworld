'use client'

type MuscleGroup =
  | 'chest' | 'shoulders_front' | 'biceps' | 'triceps' | 'abs' | 'quads' | 'calves_front'
  | 'lats' | 'traps' | 'shoulders_back' | 'glutes' | 'hamstrings' | 'calves_back' | 'lower_back'

interface HighlightConfig {
  front: MuscleGroup[]
  back: MuscleGroup[]
}

const ON = '#f97316'
const OFF = '#3f3f46'

const MUSCLE_MAP: Array<{ keywords: string[]; config: HighlightConfig }> = [
  {
    keywords: [
      'ベンチプレス', 'ダンベルフライ', 'プッシュアップ', '腕立て伏せ', 'チェストプレス',
      'ケーブルクロス', 'インクライン', 'ワイドプッシュ', 'ダイヤモンドプッシュ',
      'アーチャープッシュ', '肩甲骨プッシュ', 'プッシュアップ（足上げ）',
    ],
    config: { front: ['chest', 'shoulders_front', 'triceps'], back: [] },
  },
  {
    keywords: [
      'ラットプルダウン', '懸垂', 'チンアップ', 'プルアップ', 'ベントオーバーロウ',
      'テーブルロウ', 'インバーテッドロウ', 'タオルロウ', 'ケーブルロウ', 'TRXロウ',
      'ダンベルロウ', 'ローイング',
    ],
    config: { front: ['biceps'], back: ['lats', 'traps'] },
  },
  {
    keywords: ['デッドリフト', 'ルーマニアン', 'スーパーマン'],
    config: { front: [], back: ['lats', 'lower_back', 'hamstrings', 'glutes'] },
  },
  {
    keywords: [
      'ショルダープレス', 'サイドレイタル', 'サイドレイズ', 'フロントレイズ',
      'フェイスプル', 'アップライトロウ', 'バトルロープ', 'パイクプッシュ',
    ],
    config: { front: ['shoulders_front'], back: ['shoulders_back', 'traps'] },
  },
  {
    keywords: ['カール', 'ハンマー'],
    config: { front: ['biceps'], back: [] },
  },
  {
    keywords: ['トライセプス', 'プレスダウン', 'キックバック', 'EZバー', 'スカルクラッシャー', 'トリセップス'],
    config: { front: ['triceps'], back: [] },
  },
  {
    keywords: ['ディップス', 'チェアディップ'],
    config: { front: ['chest', 'triceps'], back: [] },
  },
  {
    keywords: ['スクワット', 'レッグプレス', 'ランジ', 'ゴブレット', 'ブルガリアン', 'ピストル', 'ボックスジャンプ'],
    config: { front: ['quads'], back: ['glutes', 'hamstrings'] },
  },
  {
    keywords: ['レッグカール', 'シングルレッグデッドリフト'],
    config: { front: [], back: ['hamstrings'] },
  },
  {
    keywords: ['カーフレイズ'],
    config: { front: [], back: ['calves_back'] },
  },
  {
    keywords: ['グルートブリッジ', 'ヒップリフト', 'ルーマニアン'],
    config: { front: [], back: ['glutes', 'hamstrings'] },
  },
  {
    keywords: ['プランク', 'クランチ', '腹筋', 'レッグレイズ', 'ニーレイズ', 'ツイスト', 'Vシット', 'Lシット', 'バイシクル', 'ニートゥ', 'ハンギング'],
    config: { front: ['abs'], back: [] },
  },
  {
    keywords: ['マウンテンクライマー'],
    config: { front: ['abs', 'shoulders_front'], back: [] },
  },
  {
    keywords: ['バーピー', 'ジャンピングジャック', 'ハイニー', 'スプリンター', 'ジャンプランジ', 'ジャンプスクワット'],
    config: {
      front: ['chest', 'shoulders_front', 'biceps', 'triceps', 'abs', 'quads', 'calves_front'],
      back: ['lats', 'traps', 'shoulders_back', 'lower_back', 'glutes', 'hamstrings', 'calves_back'],
    },
  },
  {
    keywords: ['ケトルベルスイング', 'パワークリーン', 'プッシュプレス', 'ダンベルスナッチ'],
    config: {
      front: ['shoulders_front', 'abs', 'quads'],
      back: ['lats', 'lower_back', 'glutes', 'hamstrings'],
    },
  },
]

export function getMusclesForExercise(name: string): HighlightConfig {
  for (const { keywords, config } of MUSCLE_MAP) {
    if (keywords.some((kw) => name.includes(kw))) return config
  }
  return { front: [], back: [] }
}

function col(group: MuscleGroup, hl: MuscleGroup[]): string {
  return hl.includes(group) ? ON : OFF
}

function armColor(groups: ('biceps' | 'triceps')[], hl: MuscleGroup[]): string {
  return groups.some((g) => hl.includes(g)) ? ON : OFF
}

function FrontSVG({ highlighted }: { highlighted: MuscleGroup[] }) {
  const arm = armColor(['biceps', 'triceps'], highlighted)
  return (
    <svg viewBox="0 0 44 96" width="52" height="112" xmlns="http://www.w3.org/2000/svg">
      {/* head */}
      <ellipse cx="22" cy="7" rx="5" ry="6" fill={OFF} />
      {/* neck */}
      <rect x="20" y="12.5" width="4" height="4" fill={OFF} />

      {/* left shoulder */}
      <path d="M20,16 L6,20 L5,33 L18,33 Z" fill={col('shoulders_front', highlighted)} />
      {/* right shoulder */}
      <path d="M24,16 L38,20 L39,33 L26,33 Z" fill={col('shoulders_front', highlighted)} />
      {/* chest */}
      <path d="M18,16 L26,16 L27,34 L17,34 Z" fill={col('chest', highlighted)} />
      {/* abs */}
      <path d="M17,34 L27,34 L26,53 L18,53 Z" fill={col('abs', highlighted)} />
      {/* hip */}
      <path d="M13,53 L31,53 L30,61 L14,61 Z" fill={OFF} />

      {/* left upper arm (bicep + tricep share same area in front view) */}
      <path d="M5,33 L17,33 L16,48 L5,47 Z" fill={arm} />
      {/* right upper arm */}
      <path d="M27,33 L39,33 L39,47 L28,48 Z" fill={arm} />
      {/* left forearm */}
      <path d="M5,47 L16,48 L15,60 L5,59 Z" fill={OFF} />
      {/* right forearm */}
      <path d="M28,48 L39,47 L39,59 L29,60 Z" fill={OFF} />

      {/* left quad */}
      <path d="M14,61 L23,61 L22,83 L13,82 Z" fill={col('quads', highlighted)} />
      {/* right quad */}
      <path d="M21,61 L30,61 L31,82 L23,83 Z" fill={col('quads', highlighted)} />

      {/* left calf */}
      <path d="M13,82 L22,83 L21,94 L12,93 Z" fill={col('calves_front', highlighted)} />
      {/* right calf */}
      <path d="M23,83 L31,82 L32,93 L24,94 Z" fill={col('calves_front', highlighted)} />

      {/* feet */}
      <ellipse cx="17" cy="95" rx="5" ry="1.5" fill={OFF} />
      <ellipse cx="27" cy="95" rx="5" ry="1.5" fill={OFF} />
    </svg>
  )
}

function BackSVG({ highlighted }: { highlighted: MuscleGroup[] }) {
  return (
    <svg viewBox="0 0 44 96" width="52" height="112" xmlns="http://www.w3.org/2000/svg">
      {/* head */}
      <ellipse cx="22" cy="7" rx="5" ry="6" fill={OFF} />
      {/* neck */}
      <rect x="20" y="12.5" width="4" height="4" fill={OFF} />

      {/* traps (upper center) */}
      <path d="M20,16 L24,16 L27,32 L17,32 Z" fill={col('traps', highlighted)} />
      {/* left shoulder back (rear delt) */}
      <path d="M20,16 L6,20 L6,31 L17,30 Z" fill={col('shoulders_back', highlighted)} />
      {/* right shoulder back */}
      <path d="M24,16 L38,20 L38,31 L27,30 Z" fill={col('shoulders_back', highlighted)} />

      {/* left lats */}
      <path d="M6,31 L17,30 L16,52 L6,47 Z" fill={col('lats', highlighted)} />
      {/* right lats */}
      <path d="M27,30 L38,31 L38,47 L28,52 Z" fill={col('lats', highlighted)} />
      {/* lower back (center) */}
      <path d="M17,32 L27,32 L28,52 L16,52 Z" fill={col('lower_back', highlighted)} />

      {/* left upper arm (neutral on back) */}
      <path d="M5,20 L11,20 L10,48 L5,47 Z" fill={OFF} />
      {/* right upper arm */}
      <path d="M33,20 L39,20 L39,47 L34,48 Z" fill={OFF} />
      {/* left forearm */}
      <path d="M5,47 L10,48 L10,59 L5,58 Z" fill={OFF} />
      {/* right forearm */}
      <path d="M34,48 L39,47 L39,58 L34,59 Z" fill={OFF} />

      {/* hip */}
      <path d="M13,52 L31,52 L31,61 L13,61 Z" fill={OFF} />
      {/* glutes */}
      <path d="M13,61 L31,61 L30,70 L14,70 Z" fill={col('glutes', highlighted)} />

      {/* left hamstring */}
      <path d="M14,70 L23,70 L22,85 L13,84 Z" fill={col('hamstrings', highlighted)} />
      {/* right hamstring */}
      <path d="M21,70 L30,70 L31,84 L23,85 Z" fill={col('hamstrings', highlighted)} />

      {/* left calf back */}
      <path d="M13,84 L22,85 L21,95 L12,94 Z" fill={col('calves_back', highlighted)} />
      {/* right calf back */}
      <path d="M23,85 L31,84 L32,94 L24,95 Z" fill={col('calves_back', highlighted)} />

      {/* feet */}
      <ellipse cx="17" cy="95.5" rx="5" ry="1.5" fill={OFF} />
      <ellipse cx="27" cy="95.5" rx="5" ry="1.5" fill={OFF} />
    </svg>
  )
}

export default function MuscleHighlight({ exerciseName }: { exerciseName: string }) {
  const { front, back } = getMusclesForExercise(exerciseName)
  return (
    <div className="flex gap-2 items-end">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[8px] font-medium tracking-wider" style={{ color: '#52525b' }}>前</span>
        <FrontSVG highlighted={front} />
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[8px] font-medium tracking-wider" style={{ color: '#52525b' }}>後</span>
        <BackSVG highlighted={back} />
      </div>
    </div>
  )
}
