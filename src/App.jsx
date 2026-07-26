import { useState } from 'react'

function App() {
  const [amount, setAmount] = useState('')
  const [payee, setPayee] = useState('')
  const [result, setResult] = useState(null)
  const [attackResults, setAttackResults] = useState([])
  const [history, setHistory] = useState([])

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const getDeviceFingerprint = () => {
    const parts = [
      navigator.userAgent,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language
    ]
    return parts.join('|')
  }

  const loadHistory = async () => {
    const response = await fetch('http://localhost:8081/transactions')
    const data = await response.json()
    setHistory(data.reverse())
  }

  const getStats = () => {
    const total = history.length
    const blocked = history.filter((t) => t.decision === 'BLOCKED').length
    const flagged = history.filter((t) => t.decision === 'FLAGGED').length
    const approved = history.filter((t) => t.decision === 'APPROVED').length
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0
    return { total, blocked, flagged, approvalRate }
  }

  const simulateAttack = async () => {
    setAttackResults([])
    for (let i = 1; i <= 7; i++) {
      const response = await fetch('http://localhost:8081/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 500, payee: 'attacker', deviceFingerprint: getDeviceFingerprint() })
      })
      const data = await response.json()
      setAttackResults((prev) => [...prev, { id: i, ...data }])
      await sleep(500)
    }
  }

  const handleSubmit = async () => {
    const response = await fetch('http://localhost:8081/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount, payee: payee, deviceFingerprint: getDeviceFingerprint() })
    })
    const data = await response.json()
    setResult(data)
  }

  return (
    <div>
      <h1>SentinelPay</h1>
      <p>New transaction</p>

      <div>
        <label>Amount</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      <div>
        <label>Payee</label>
        <input type="text" value={payee} onChange={(e) => setPayee(e.target.value)} />
      </div>

      <button onClick={handleSubmit}>Submit transaction</button>
      <button onClick={simulateAttack} style={{ marginLeft: '10px' }}>
        Simulate Fraud Attack
      </button>
      <button onClick={loadHistory} style={{ marginLeft: '10px' }}>
        Load Transaction History
      </button>

      {attackResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Attack simulation:</h4>
          {attackResults.map((r) => (
            <div key={r.id} style={{ padding: '4px 0' }}>
              Transaction {r.id}: <strong>{r.decision}</strong> (score {r.riskScore})
            </div>
          ))}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '16px', maxWidth: '400px' }}>
          <h3>{result.decision}</h3>
          <p>Risk Score: {result.riskScore}/100</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '20px' }}>
              {result.riskScore <= 20 ? '🟢' : result.riskScore <= 40 ? '🟡' : result.riskScore <= 60 ? '🟠' : '🔴'}
            </span>
            <div style={{ background: '#eee', height: '10px', width: '100%', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{
                background: result.riskScore <= 20 ? '#22c55e' : result.riskScore <= 40 ? '#eab308' : result.riskScore <= 60 ? '#f97316' : '#ef4444',
                height: '10px',
                width: result.riskScore + '%',
                transition: 'width 0.4s ease'
              }}></div>
            </div>
          </div>
          <h4>Reasons:</h4>
          <ul>
            {result.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px 20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{getStats().total}</div>
              <div>Total Transactions</div>
            </div>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px 20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{getStats().blocked}</div>
              <div>Blocked</div>
            </div>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px 20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f97316' }}>{getStats().flagged}</div>
              <div>Flagged</div>
            </div>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '12px 20px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{getStats().approvalRate}%</div>
              <div>Approval Rate</div>
            </div>
          </div>

          <h3>Recent Transactions</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '6px' }}>Time</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Payee</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Risk</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Decision</th>
              </tr>
            </thead>
            <tbody>
              {history.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '6px' }}>{new Date(t.createdAt).toLocaleTimeString()}</td>
                  <td style={{ padding: '6px' }}>{t.payee}</td>
                  <td style={{ padding: '6px' }}>₹{t.amount}</td>
                  <td style={{ padding: '6px' }}>{t.riskScore}</td>
                  <td style={{ padding: '6px', fontWeight: 'bold' }}>{t.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default App