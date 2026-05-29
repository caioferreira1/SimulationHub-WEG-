import { useId } from 'react'

export function AppIcon({ className = 'w-8 h-8' }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  const grad = `fg-${uid}`
  const radGrad = `rg-${uid}`

  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* FEA-style rainbow colormap — azul → verde → amarelo → vermelho */}
        <radialGradient id={radGrad} cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#EF4444" />
          <stop offset="30%"  stopColor="#F59E0B" />
          <stop offset="60%"  stopColor="#009640" />
          <stop offset="100%" stopColor="#3B82F6" />
        </radialGradient>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#3B82F6" />
          <stop offset="33%"  stopColor="#009640" />
          <stop offset="66%"  stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>

      {/* Carcaça externa (estator) */}
      <circle cx="16" cy="16" r="15.5" fill="#0F172A" />

      {/* Campo eletromagnético — região entre estator e rotor */}
      <circle cx="16" cy="16" r="13" fill={`url(#${radGrad})`} />

      {/* Dentes do estator — 4 polos */}
      <rect x="13.5" y="2"  width="5" height="6.5" rx="1.5" fill="#0F172A" />
      <rect x="13.5" y="23.5" width="5" height="6.5" rx="1.5" fill="#0F172A" />
      <rect x="2"  y="13.5" width="6.5" height="5" rx="1.5" fill="#0F172A" />
      <rect x="23.5" y="13.5" width="6.5" height="5" rx="1.5" fill="#0F172A" />

      {/* Rotor */}
      <circle cx="16" cy="16" r="6.5" fill="#0F172A" />

      {/* Núcleo do eixo */}
      <circle cx="16" cy="16" r="3" fill="#334155" />
    </svg>
  )
}
