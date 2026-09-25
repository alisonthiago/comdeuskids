import React from 'react'
import { ShieldCheck } from 'lucide-react'

interface SecureQRCodeProps {
  token: string
  securityCode: string
  size?: number
}

// Gerador visual de matriz determinística (estilo QR Code) para credencial opaca
export function SecureQRCode({ token, securityCode, size = 180 }: SecureQRCodeProps) {
  // Gera padrão matricial 21x21 baseado no hash determinístico do token opaco
  const matrixSize = 21
  const matrix: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false))

  // Padrões de posição nos cantos (Eye patterns do QR Code padrão)
  const drawCornerPattern = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true
        }
      }
    }
  }

  drawCornerPattern(0, 0)
  drawCornerPattern(14, 0)
  drawCornerPattern(0, 14)

  // Preenche dados do token usando hash determinístico
  let hashVal = 0
  for (let i = 0; i < token.length; i++) {
    hashVal = (hashVal << 5) - hashVal + token.charCodeAt(i)
    hashVal |= 0
  }

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Ignora os cantos de posicionamento
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c >= 13) ||
        (r >= 13 && c < 8)
      ) {
        continue
      }
      const bit = ((hashVal ^ (r * 31 + c * 17)) & 1) === 1
      matrix[r][c] = bit
    }
  }

  const cellSize = size / matrixSize

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        border: '2px solid #e2e8f0',
        width: `${size + 32}px`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <ShieldCheck size={16} color="#059669" />
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em' }}>
          CREDENCIAL SEGURA
        </span>
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {matrix.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>

      <div style={{ marginTop: '12px', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>
          CÓDIGO DE PULSEIRA
        </span>
        <span
          style={{
            fontSize: '22px',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '0.1em',
            fontFamily: 'monospace'
          }}
        >
          {securityCode}
        </span>
      </div>

      <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
        Apresente este código na retirada
      </span>
    </div>
  )
}
