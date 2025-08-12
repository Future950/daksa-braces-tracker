const API_URL = "https://daksa-braces-tracker-backend.onrender.com";

import React, { useState, useMemo } from "react";
import './index.css';
const SAMPLE_PATIENTS = [
  {
    id: "p1",
    name: "Jane Doe",
    contact: "055-123-4567",
    startDate: "2025-08-01",
    totalFee: 10000,
    notes: "Standard metal braces",
    payments: [
      { id: "t1", date: "2025-08-05", amount: 2000, method: "Mobile Money", note: "Initial" },
      { id: "t2", date: "2025-09-01", amount: 3000, method: "Cash", note: "Monthly" },
    ],
  }
];

const formatCurrency = (n) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const calcTotalPaid = (payments) => payments.reduce((s, p) => s + p.amount, 0);

function Sidebar({ active, setActive, onAddPatient }) {
  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white min-h-screen p-6">
      <div className="mb-10">
        <h1 className="text-xl font-semibold">Braces Payment</h1>
        <div className="text-sm opacity-80">Tracker</div>
      </div>
      <nav className="space-y-3">
        <button onClick={() => setActive("dashboard")} className={`w-full text-left px-3 py-2 rounded-md hover:bg-slate-700/60`}>
          🏠 Dashboard
        </button>
        <button onClick={() => setActive("patients")} className={`w-full text-left px-3 py-2 rounded-md hover:bg-slate-700/60`}>
          👥 Patients
        </button>
        <button onClick={() => setActive("reports")} className={`w-full text-left px-3 py-2 rounded-md hover:bg-slate-700/60`}>
          📊 Reports
        </button>
      </nav>
      <div className="mt-8">
        <button onClick={onAddPatient} className="flex items-center gap-2 bg-emerald-500 text-slate-900 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-emerald-600">
          ➕ Add Patient
        </button>
      </div>
    </aside>
  );
}

function DashboardPanel({ patients, onViewPatient, onAddPayment }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(term) || p.contact.includes(term) || p.id.includes(term));
  }, [q, patients]);

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients..." className="w-full border rounded-lg px-4 py-2" />
            <span className="absolute right-3 top-2.5 opacity-60">🔎</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left text-slate-600 border-b">
              <th className="py-3">Name</th>
              <th className="py-3">Total Fee</th>
              <th className="py-3">Amount Paid</th>
              <th className="py-3">Balance Left</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const paid = calcTotalPaid(p.payments);
              const balance = p.totalFee - paid;
              return (
                <tr key={p.id} className="border-b hover:bg-slate-50">
                  <td className="py-4">{p.name}<div className="text-xs text-slate-400">{p.contact}</div></td>
                  <td className="py-4">{formatCurrency(p.totalFee)}</td>
                  <td className="py-4">{formatCurrency(paid)}</td>
                  <td className={`py-4 font-semibold ${balance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(balance)}</td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button onClick={() => onAddPayment(p.id)} className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600">Add Payment</button>
                      <button onClick={() => onViewPatient(p.id)} className="px-3 py-1 border rounded">View</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddPatientForm({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", contact: "", totalFee: "", startDate: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {
      id: `p${Date.now()}`,
      name: form.name,
      contact: form.contact,
      startDate: form.startDate || new Date().toISOString().slice(0, 10),
      totalFee: Number(form.totalFee) || 0,
      notes: "",
      payments: [],
    };
    onCreate(next);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg w-[520px]">
        <h3 className="text-lg font-semibold mb-4">Add New Patient</h3>
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Contact (phone/email)" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="border p-2 rounded" />
          <input required placeholder="Total fee (numeric)" value={form.totalFee} onChange={(e) => setForm({ ...form, totalFee: e.target.value })} className="border p-2 rounded" />
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border p-2 rounded" />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded">Create</button>
        </div>
      </form>
    </div>
  );
}

function AddPaymentModal({ patient, onClose, onSave }) {
  const [form, setForm] = useState({ amount: "", date: new Date().toISOString().slice(0, 10), method: "Cash", note: "" });

  const handleSave = (e) => {
    e.preventDefault();
    const payment = { id: `t${Date.now()}`, amount: Number(form.amount), date: form.date, method: form.method, note: form.note };
    onSave(patient.id, payment);
    onClose();
  };

  if (!patient) return null;

  const paid = calcTotalPaid(patient.payments);
  const balance = patient.totalFee - paid;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg w-[520px]">
        <h3 className="text-lg font-semibold mb-2">Add Payment — {patient.name}</h3>
        <p className="text-sm text-slate-500 mb-4">Total fee: {formatCurrency(patient.totalFee)} — Balance: {formatCurrency(balance)}</p>

        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="border p-2 rounded" />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border p-2 rounded" />
          <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="border p-2 rounded">
            <option>Cash</option>
            <option>Mobile Money</option>
            <option>Card</option>
          </select>
          <input placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="border p-2 rounded" />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded">Save Payment</button>
        </div>
      </form>
    </div>
  );
}

function PatientDetail({ patient, onBack }) {
  if (!patient) return <div className="p-6">Select a patient</div>;

  const paid = calcTotalPaid(patient.payments);
  const balance = patient.totalFee - paid;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{patient.name}</h2>
          <div className="text-sm text-slate-500">{patient.contact} • Started: {patient.startDate}</div>
          <div className="mt-2 text-sm text-slate-500">{patient.notes}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Total Fee</div>
          <div className="text-xl font-semibold">{formatCurrency(patient.totalFee)}</div>
          <div className="mt-2">
            <div className="text-sm text-slate-400">Paid</div>
            <div className="text-lg">{formatCurrency(paid)}</div>
            <div className={`mt-1 font-semibold ${balance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Balance: {formatCurrency(balance)}</div>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      <h3 className="text-lg font-semibold mb-2">Payment History</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-slate-600 border-b">
              <th className="py-2">Date</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Method</th>
              <th className="py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {patient.payments.map((t) => (
              <tr key={t.id} className="border-b hover:bg-slate-50">
                <td className="py-3">{t.date}</td>
                <td className="py-3">{formatCurrency(t.amount)}</td>
                <td className="py-3">{t.method}</td>
                <td className="py-3">{t.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <button onClick={onBack} className="px-4 py-2 border rounded">Back</button>
      </div>
    </div>
  );
}

export default function App() {
  const [patients, setPatients] = useState(SAMPLE_PATIENTS);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showAddPaymentFor, setShowAddPaymentFor] = useState(null);

  const viewPatient = (id) => {
    setSelectedPatientId(id);
    setActiveView("patients");
  };

  const addPayment = (patientId, payment) => {
    setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, payments: [...p.payments, payment] } : p)));
  };

  const createPatient = (patient) => setPatients((prev) => [patient, ...prev]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800">
      <Sidebar active={activeView} setActive={setActiveView} onAddPatient={() => setShowAddPatient(true)} />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{activeView === "dashboard" ? "Dashboard" : activeView === "patients" ? "Patient Profile" : "Reports"}</h1>
            <div className="text-sm text-slate-500">Manage payments, view balances and export reports.</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAddPatient(true)} className="bg-emerald-500 text-white px-4 py-2 rounded">Add Patient</button>
          </div>
        </div>

        {activeView === "dashboard" && (
          <DashboardPanel patients={patients} onViewPatient={viewPatient} onAddPayment={(id) => setShowAddPaymentFor(id)} />
        )}

        {activeView === "patients" && (
          <div>
            <PatientDetail patient={selectedPatient} onBack={() => setActiveView("dashboard")} />
          </div>
        )}

        {activeView === "reports" && <div className="p-6 bg-white rounded-lg shadow"><h2>Reports (TODO)</h2></div>}
      </main>

      {showAddPatient && <AddPatientForm onClose={() => setShowAddPatient(false)} onCreate={createPatient} />}
      {showAddPaymentFor && (
        <AddPaymentModal
          patient={patients.find((p) => p.id === showAddPaymentFor)}
          onClose={() => setShowAddPaymentFor(null)}
          onSave={addPayment}
        />
      )}
    </div>
);
