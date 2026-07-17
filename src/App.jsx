import { useState } from 'react'

function App() {
  const [amount, setAmount] = useState('')
  const [payee, setPayee] = useState('')

  return (
    <div>
      <h1>SentinelPay</h1>
      <p>New transaction</p>

      <div>
        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div>
        <label>Payee</label>
        <input
          type="text"
          value={payee}
          onChange={(e) => setPayee(e.target.value)}
        />
      </div>

      <p>You typed: {amount} to {payee}</p>
    </div>
  )
}

export default App