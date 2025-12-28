import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import "react-calendar/dist/Calendar.css"

const API_BASE = "/api"

export default function BookingCalendar({ hallId }: { hallId: number }) {

  const [date, setDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState("10:00")
  const [endTime, setEndTime] = useState("13:00")
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Load all bookings of this hall
  useEffect(() => {
    if (!hallId) return

    axios
      .get(`${API_BASE}/bookings/hall/${hallId}`)
      .then((res) => setBookings(res.data))
      .catch((err) => console.log(err))
  }, [hallId])


  //  Convert time → Date
  const generateDateTime = (date: Date, time: string) => {
    const [h, m] = time.split(":").map(Number)
    const d = new Date(date)
    d.setHours(h)
    d.setMinutes(m)
    d.setSeconds(0)
    return d
  }


  // Check if slot is already booked
  const isSlotBooked = (start: Date, end: Date) => {
    return bookings.some((b) => {
      const existingStart = new Date(b.start_time)
      const existingEnd = new Date(b.end_time)

      return (
        (start >= existingStart && start < existingEnd) ||
        (end > existingStart && end <= existingEnd) ||
        (start <= existingStart && end >= existingEnd)
      )
    })
  }


  //  Mark booked dates in calendar
  const isDateBooked = (checkDate: Date) => {
    return bookings.some((b) => {
      const d = new Date(b.start_time)
      return d.toDateString() === checkDate.toDateString()
    })
  }


  //  Confirm booking
  const bookNow = async () => {
    const start = generateDateTime(date, startTime)
    const end = generateDateTime(date, endTime)

    if (end <= start) {
      return toast.error("End time must be after start time!")
    }

    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60))

    if (isSlotBooked(start, end)) {
      return toast.error("❌ This time slot is already booked")
    }

    try {
      setLoading(true)

      const res = await axios.post(`${API_BASE}/bookings/create`, {
        hall_id: hallId,
        date: start.toISOString(),
        duration: duration,
        guests: 50,
        note: "Booked from calendar",
        total_price: duration * 1000
      }, { withCredentials: true })

      toast.success("✅ Booking successful")

      // Re-fetch updated data
      const refreshed = await axios.get(`${API_BASE}/bookings/hall/${hallId}`)
      setBookings(refreshed.data)

    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Booking failed")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="mt-12 bg-white shadow-xl rounded-2xl p-6">

      <h2 className="text-xl font-bold mb-4 text-orange-600">
        📆 Real-Time Availability
      </h2>

      {/* CALENDAR */}
      <Calendar
        value={date}
        onChange={(d: any) => setDate(d)}
        tileClassName={({ date }) =>
          isDateBooked(date)
            ? "bg-red-500 text-white rounded-lg"
            : null
        }
      />

      <p className="mt-2 text-sm text-gray-500">
        🔴 = Day has at least one booking
      </p>

      {/* TIME */}
      <div className="grid md:grid-cols-2 gap-5 mt-6">
        <div>
          <label className="block font-semibold mb-1">Start Time</label>
          <input
            type="time"
            className="w-full border p-2 rounded-lg"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">End Time</label>
          <input
            type="time"
            className="w-full border p-2 rounded-lg"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      {/* BUTTON */}
      <Button
        disabled={loading}
        className="w-full mt-6 text-lg py-5 rounded-xl bg-orange-600 hover:bg-orange-700"
        onClick={bookNow}
      >
        {loading ? "Booking..." : "Confirm Booking"}
      </Button>

    </div>
  )
}
