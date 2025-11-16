import DoctorPatients from "../../components/doctor/DoctorPatients";
import { FaHospitalUser } from "react-icons/fa";

export default function DoctorPatientsPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="rounded-2xl bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-elevated px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl"><FaHospitalUser className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-bold">Patients List</h1>
            <p className="text-sm text-white/80">Your registered patients</p>
          </div>
        </div>
      </section>
      <DoctorPatients />
    </div>
  );
}
