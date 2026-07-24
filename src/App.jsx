import { useState } from 'react'

function App() {
  const [amount, setAmount] = useState('')
  const [payee, setPayee] = useState('')
  const [result, setResult] = useState(null)
  const [attackResults, setAttackResults] = useState([])

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
          <div style={{ background: '#eee', height: '10px', width: '100%' }}>
            <div style={{
              background: result.riskScore >= 70 ? 'red' : result.riskScore >= 40 ? 'orange' : 'green',
              height: '10px',
              width: result.riskScore + '%'
            }}></div>
          </div>

          <h4>Reasons:</h4>
          <ul>
            {result.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default App