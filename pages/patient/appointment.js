import PatientBookAppointment from "../../components/patient/PatientBookAppointment";
import { FaStethoscope } from "react-icons/fa";

export default function PatientAppointmentPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="rounded-2xl bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-elevated px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl"><FaStethoscope className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-bold">Book Appointment</h1>
            <p className="text-sm text-white/80">Schedule a consultation</p>
          </div>
        </div>
      </section>
      <PatientBookAppointment />
    </div>
  );
}
