import { useState } from 'react'

function App() {
  const [amount, setAmount] = useState('')
  const [payee, setPayee] = useState('')
  const [result, setResult] = useState('')

  const handleSubmit = async () => {
    const response = await fetch('http://localhost:8081/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amount, payee: payee })
    })
    const data = await response.text()
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

      <p>{result}</p>
    </div>
  )
}

export default App