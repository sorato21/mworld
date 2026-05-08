import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
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
            fontSize: '340px',
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
    { width: 512, height: 512 }
  )
}
