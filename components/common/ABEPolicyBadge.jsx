import React from "react";
import { FiShield, FiUser, FiLock } from "react-icons/fi";
import { FaUserMd } from "react-icons/fa";

const capitalize = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const ABEPolicyBadge = ({
  patientId,
  doctorId,
  specialty,
  allowAdmin = true,
  emergencyAccess = false,
  className = "",
}) => {
  const doctorLabel = specialty
    ? `${capitalize(specialty)} specialists`
    : doctorId
    ? `Doctor #${doctorId}`
    : "Authorized doctors";

  const items = [
    {
      label: "Patient Key",
      value: patientId ? `Patient #${patientId}` : "Record owner",
      description: "Always granted access",
      gradient: "from-emerald-500 to-green-500",
      icon: <FiUser className="h-4 w-4" />,
    },
    {
      label: "Clinical Key",
      value: doctorLabel,
      description: "Requires verified credentials",
      gradient: "from-sky-500 to-indigo-500",
      icon: <FaUserMd className="h-4 w-4" />,
    },
  ];

  if (allowAdmin) {
    items.push({
      label: "Admin Escrow",
      value: "Emergency override",
      description: "Used for audits & disasters",
      gradient: "from-purple-500 to-pink-500",
      icon: <FiShield className="h-4 w-4" />,
    });
  }

  if (emergencyAccess) {
    items.push({
      label: "Emergency Mode",
      value: "Paramedic access",
      description: "Restricted to flagged events",
      gradient: "from-amber-500 to-orange-500",
      icon: <FiLock className="h-4 w-4" />,
    });
  }

  return (
    <div
      className={`mt-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Attribute-Based Encryption Policy
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-white/80 p-3 shadow-inner border border-slate-100"
          >
            <div
              className={`mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${item.gradient} px-3 py-1 text-xs font-semibold text-white`}
            >
              {item.icon}
              {item.label}
            </div>
            <p className="text-sm font-bold text-slate-900">{item.value}</p>
            <p className="text-xs text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ABEPolicyBadge;


