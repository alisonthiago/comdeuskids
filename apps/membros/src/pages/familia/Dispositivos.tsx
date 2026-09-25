import React, { useState } from 'react'

interface DeviceItem {
  id: string
  name: string
  model: string
  status: string
}

export function Dispositivos() {
  const [devices, setDevices] = useState<DeviceItem[]>([
    { id: '1', name: 'Tablet Kids', model: 'Galaxy Tab A9', status: 'Ativo' },
    { id: '2', name: 'Smart TV', model: 'LG OLED 55', status: 'Conectado' },
  ])
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleDisconnect = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id))
    setFeedback('Dispositivo desconectado com sucesso.')
    setTimeout(() => setFeedback(null), 3000)
  }

  return (
    <div>
      <h1>Dispositivos Conectados</h1>
      <p>Gerenciamento de sessões e aparelhos vinculados à família.</p>

      {feedback && <div>{feedback}</div>}

      {devices.length === 0 ? (
        <p>Nenhum dispositivo conectado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Modelo</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(d => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.model}</td>
                <td>{d.status}</td>
                <td>
                  <button onClick={() => handleDisconnect(d.id)}>
                    Desconectar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Dispositivos
