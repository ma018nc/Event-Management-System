import { useNavigate } from "react-router-dom"

export default function Payment() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl mb-6">Complete Payment</h1>

      <button
        className="bg-green-600 text-white px-8 py-3 rounded-xl"
        onClick={() => navigate("/dashboard")}
      >
        Pay Now
      </button>
    </div>
  )
}
