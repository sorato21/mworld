'use client'

import { type BossDefinition, type BossId } from '../lib/boss'

function GoblinSVG() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <ellipse cx="20" cy="56" rx="17" ry="21" fill="#f97316" />
      <ellipse cx="20" cy="56" rx="11" ry="14" fill="#ea580c" />
      <ellipse cx="100" cy="56" rx="17" ry="21" fill="#f97316" />
      <ellipse cx="100" cy="56" rx="11" ry="14" fill="#ea580c" />
      <ellipse cx="60" cy="52" rx="30" ry="32" fill="#f97316" />
      <ellipse cx="60" cy="92" rx="24" ry="18" fill="#f97316" />
      <polygon points="38,44 52,38 52,50" fill="#1c1917" />
      <polygon points="82,44 68,38 68,50" fill="#1c1917" />
      <circle cx="46" cy="45" r="3.5" fill="#fbbf24" />
      <circle cx="74" cy="45" r="3.5" fill="#fbbf24" />
      <ellipse cx="60" cy="60" rx="6" ry="5" fill="#ea580c" />
      <circle cx="57" cy="60" r="1.8" fill="#1c1917" />
      <circle cx="63" cy="60" r="1.8" fill="#1c1917" />
      <path d="M 44 70 Q 60 83 76 70" fill="none" stroke="#1c1917" strokeWidth="2.5" />
      <rect x="53" y="69" width="5" height="8" rx="1.5" fill="white" />
      <rect x="62" y="69" width="5" height="8" rx="1.5" fill="white" />
    </svg>
  )
}

function OrcSVG() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="97" y="28" width="9" height="62" rx="3" fill="#78350f" />
      <path d="M 97 28 L 118 16 L 118 52 Z" fill="#d97706" />
      <rect x="16" y="70" width="76" height="40" rx="12" fill="#f97316" />
      <ellipse cx="16" cy="74" rx="14" ry="11" fill="#f97316" />
      <ellipse cx="94" cy="74" rx="14" ry="11" fill="#f97316" />
      <rect x="22" y="20" width="68" height="58" rx="14" fill="#f97316" />
      <rect x="24" y="32" width="64" height="14" rx="7" fill="#c2410c" />
      <ellipse cx="44" cy="50" rx="8" ry="7" fill="#1c1917" />
      <ellipse cx="76" cy="50" rx="8" ry="7" fill="#1c1917" />
      <circle cx="44" cy="50" r="3" fill="#f97316" />
      <circle cx="76" cy="50" r="3" fill="#f97316" />
      <rect x="53" y="56" width="14" height="9" rx="4" fill="#c2410c" />
      <rect x="30" y="63" width="60" height="14" rx="7" fill="#c2410c" />
      <polygon points="44,75 39,96 52,96" fill="white" />
      <polygon points="76,75 71,96 84,96" fill="white" />
    </svg>
  )
}

function TrollSVG() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <rect x="87" y="10" width="11" height="58" rx="5" fill="#78350f" />
      <ellipse cx="92" cy="10" rx="19" ry="12" fill="#92400e" />
      <rect x="82" y="50" width="22" height="18" rx="9" fill="#f97316" />
      <ellipse cx="55" cy="90" rx="44" ry="30" fill="#f97316" />
      <circle cx="37" cy="82" r="5" fill="#c2410c" />
      <circle cx="63" cy="98" r="4" fill="#c2410c" />
      <circle cx="73" cy="80" r="4" fill="#c2410c" />
      <circle cx="44" cy="99" r="3.5" fill="#c2410c" />
      <ellipse cx="55" cy="52" rx="38" ry="36" fill="#f97316" />
      <ellipse cx="55" cy="36" rx="32" ry="10" fill="#c2410c" />
      <circle cx="41" cy="52" r="9" fill="#1c1917" />
      <circle cx="69" cy="52" r="9" fill="#1c1917" />
      <circle cx="41" cy="52" r="3.5" fill="#f97316" opacity="0.8" />
      <circle cx="69" cy="52" r="3.5" fill="#f97316" opacity="0.8" />
      <rect x="47" y="61" width="16" height="11" rx="5" fill="#c2410c" />
      <circle cx="51" cy="66" r="2.5" fill="#1c1917" />
      <circle cx="63" cy="66" r="2.5" fill="#1c1917" />
      <path d="M 27 77 Q 55 92 83 77" fill="#c2410c" />
      <path d="M 29 77 Q 55 84 81 77" fill="#1c1917" />
    </svg>
  )
}

function DragonSVG() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <polygon points="55,42 3,7 15,62" fill="#c2410c" />
      <polygon points="55,42 9,13 19,54" fill="#f97316" opacity="0.5" />
      <polygon points="65,42 117,7 105,62" fill="#c2410c" />
      <polygon points="65,42 111,13 101,54" fill="#f97316" opacity="0.5" />
      <ellipse cx="60" cy="84" rx="28" ry="26" fill="#f97316" />
      <path d="M 80 97 Q 106 110 115 120" stroke="#f97316" strokeWidth="9" strokeLinecap="round" fill="none" />
      <ellipse cx="60" cy="47" rx="26" ry="22" fill="#f97316" />
      <polygon points="49,29 43,7 57,27" fill="#c2410c" />
      <polygon points="71,29 77,7 63,27" fill="#c2410c" />
      <ellipse cx="49" cy="43" rx="7" ry="6" fill="#1c1917" />
      <ellipse cx="71" cy="43" rx="7" ry="6" fill="#1c1917" />
      <ellipse cx="49" cy="43" rx="3" ry="4" fill="#fbbf24" />
      <ellipse cx="71" cy="43" rx="3" ry="4" fill="#fbbf24" />
      <rect x="44" y="56" width="32" height="12" rx="6" fill="#c2410c" />
      <path d="M 50 68 Q 36 82 46 97 Q 51 83 58 94 Q 62 82 68 94 Q 75 82 74 97 Q 84 82 70 68 Z" fill="#fbbf24" />
      <path d="M 52 68 Q 40 80 48 92 Q 53 81 60 90 Q 65 80 66 92 Q 72 80 68 68 Z" fill="#fb923c" />
      <polygon points="36,88 27,103 40,101" fill="#c2410c" />
      <polygon points="84,88 93,103 80,101" fill="#c2410c" />
    </svg>
  )
}

function BossIllustration({ id }: { id: BossId }) {
  switch (id) {
    case 'goblin': return <GoblinSVG />
    case 'orc': return <OrcSVG />
    case 'troll': return <TrollSVG />
    case 'dragon': return <DragonSVG />
  }
}

function hpBarColor(remainingPct: number): string {
  if (remainingPct > 0.5) return 'bg-green-500'
  if (remainingPct > 0.25) return 'bg-yellow-400'
  return 'bg-red-500'
}

interface BossCardProps {
  boss: BossDefinition
  damageAccumulated: number
}

export default function BossCard({ boss, damageAccumulated }: BossCardProps) {
  const clampedDmg = Math.min(damageAccumulated, boss.maxHP)
  const remainingPct = Math.max(0, 1 - clampedDmg / boss.maxHP)
  const damagePct = Math.min(100, (clampedDmg / boss.maxHP) * 100)

  return (
    <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">BOSS</span>
      </div>

      <div className="relative">
        <BossIllustration id={boss.id} />
      </div>

      <p className="text-white font-black text-xl tracking-wider">{boss.name}</p>

      <div className="w-full flex flex-col gap-1.5">
        <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${hpBarColor(remainingPct)}`}
            style={{ width: `${100 - damagePct}%` }}
          />
        </div>
        <p className="text-zinc-500 text-xs text-center tabular-nums">
          累計ダメージ：{clampedDmg.toLocaleString()}kg / {boss.maxHP.toLocaleString()}kg
        </p>
      </div>
    </div>
  )
}
