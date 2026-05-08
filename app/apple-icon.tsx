import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#f97316',
            fontSize: '120px',
            fontWeight: 900,
            fontFamily: 'sans-serif',
            lineHeight: '1',
            letterSpacing: '-0.02em',
          }}
        >
          M
        </span>
      </div>
    ),
    { width: 180, height: 180 }
  )
}
