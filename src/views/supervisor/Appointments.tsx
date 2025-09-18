import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Appointment {
  meeting_id: number;
  child_id: number;
  recipient: string;
  meeting_date: string;
  meeting_time: string;
  reason: string;
  response: string | null;
}

const API_URL = "http://localhost:5001/api/appointments";

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({
    child_id: "",
    meeting_date: "",
    meeting_time: "",
    reason: "",
  });

  const loadAppointments = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      toast.error("Failed to fetch appointments");
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create appointment");
      toast.success("Appointment added!");
      setForm({ child_id: "", meeting_date: "", meeting_time: "", reason: "" });
      loadAppointments();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Supervisor Appointments</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input
          name="child_id"
          value={form.child_id}
          onChange={handleChange}
          placeholder="Child ID"
          className="block w-full border p-2 rounded"
          required
        />
        <input
          type="date"
          name="meeting_date"
          value={form.meeting_date}
          onChange={handleChange}
          className="block w-full border p-2 rounded"
          required
        />
        <input
          type="time"
          name="meeting_time"
          value={form.meeting_time}
          onChange={handleChange}
          className="block w-full border p-2 rounded"
          required
        />
        <input
          name="reason"
          value={form.reason}
          onChange={handleChange}
          placeholder="Reason"
          className="block w-full border p-2 rounded"
          required
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Add Appointment
        </button>
      </form>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Child ID</th>
            <th className="p-2">Date</th>
            <th className="p-2">Time</th>
            <th className="p-2">Reason</th>
            <th className="p-2">Response</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.meeting_id} className="border-t">
              <td className="p-2">{a.child_id}</td>
              <td className="p-2">{a.meeting_date}</td>
              <td className="p-2">{a.meeting_time}</td>
              <td className="p-2">{a.reason}</td>
              <td className="p-2">{a.response || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
