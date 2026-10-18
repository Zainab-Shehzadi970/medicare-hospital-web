import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const fmt12 = (t) => {
  const [h, m] = String(t).slice(0, 5).split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const initials = (name) =>
  String(name || '')
    .replace(/^dr\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 1)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const badgeClass = {
  confirmed: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const Icon = ({ children, className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);
const CalendarIcon = (p) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Icon>
);
const LayersIcon = (p) => (
  <Icon {...p}>
    <path d="M12 2 2 7l10 5 10-5-10-5z" />
    <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
  </Icon>
);
const SearchIcon = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Icon>
);
const LogoutIcon = (p) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Icon>
);
const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);
const XIcon = (p) => (
  <Icon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (err) setError('Incorrect email or password.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-7 flex flex-col shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-red-600 text-white font-extrabold text-xl flex items-center justify-center">
            M
          </div>
          <div>
            <div className="font-extrabold tracking-wider text-gray-900">MEDICARE</div>
            <div className="text-[10px] font-semibold tracking-[0.2em] text-red-600">DOCTOR CONSOLE</div>
          </div>
        </div>

        <label className="text-sm font-semibold text-gray-800 mb-1.5">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 mb-4 text-gray-900 focus:outline-none focus:border-red-600"
        />

        <label className="text-sm font-semibold text-gray-800 mb-1.5">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 mb-4 text-gray-900 focus:outline-none focus:border-red-600"
        />

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-2.5 mb-3">{error}</div>
        )}

        <button
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg py-2.5 disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ session }) {
  const [doctor, setDoctor] = useState(null);
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('today');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('doctors')
      .select('id, name, specialization')
      .eq('profile_id', session.user.id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        setDoctor(data);
        setLoading(false);
      });
  }, [session.user.id]);

  const load = useCallback(async () => {
    if (!doctor) return;
    const { data, error: err } = await supabase
      .from('appointments')
      .select('id, appointment_date, time_slot, patient_name, patient_phone, reason, status')
      .eq('doctor_id', doctor.id)
      .order('appointment_date', { ascending: true })
      .order('time_slot', { ascending: true });
    if (err) setError(err.message);
    else setRows(data);
  }, [doctor]);

  useEffect(() => {
    if (!doctor) return;
    load();
    const channel = supabase
      .channel(`appointments-${doctor.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${doctor.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctor, load]);

  const setStatus = async (id, status) => {
    const { error: err } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (err) setError(err.message);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col gap-3 items-center justify-center">
        <p className="text-gray-700">This account is not linked to a doctor profile.</p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="border border-gray-300 rounded-lg px-4 py-2 font-semibold"
        >
          Log out
        </button>
      </div>
    );
  }

  const today = todayISO();
  const q = query.trim().toLowerCase();
  const shown = rows
    .filter((r) => {
      if (filter === 'today') return r.appointment_date === today;
      if (filter === 'upcoming') return r.appointment_date >= today && r.status === 'confirmed';
      return true;
    })
    .filter((r) =>
      !q ||
      [r.patient_name, r.patient_phone, r.reason].some((v) => String(v || '').toLowerCase().includes(q))
    );
  const todayCount = rows.filter((r) => r.appointment_date === today && r.status !== 'cancelled').length;
  const upcomingCount = rows.filter((r) => r.appointment_date >= today && r.status === 'confirmed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-20 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 font-extrabold text-lg flex items-center justify-center">
              {initials(doctor.name)}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 leading-tight">{doctor.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {doctor.specialization} • Medicare Hospital
              </div>
            </div>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-2 font-semibold text-gray-800 hover:bg-gray-50"
          >
            <LogoutIcon className="w-4 h-4" />
            Log out
          </button>
        </div>
      </div>

      <div className="w-full px-20 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          {[
            [todayCount, 'Today', CalendarIcon, 'bg-red-50 text-red-600', 'text-red-600'],
            [upcomingCount, 'Upcoming', CalendarIcon, 'bg-gray-100 text-gray-600', 'text-gray-900'],
            [rows.length, 'Total', LayersIcon, 'bg-gray-100 text-gray-600', 'text-gray-900'],
          ].map(([n, label, IconC, iconBg, numColor]) => (
            <div
              key={label}
              className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between shadow-sm"
            >
              <div>
                <div className="text-xs font-bold tracking-wider text-gray-500 uppercase">{label}</div>
                <div className={`text-4xl font-extrabold mt-1 ${numColor}`}>{n}</div>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
                <IconC className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[
              ['today', 'Today'],
              ['upcoming', 'Upcoming'],
              ['all', 'All'],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold ${
                  filter === k ? 'bg-red-600 text-white shadow' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient, phone, reason..."
              className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:bg-white"
            />
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-2.5 mb-4">{error}</div>}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['Date', 'Time', 'Patient', 'Phone', 'Reason', 'Status', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-xs font-bold tracking-wider text-gray-500 uppercase ${
                      i === 6 ? 'text-right' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-gray-500 py-12">
                    No appointments.
                  </td>
                </tr>
              )}
              {shown.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                  <td className="px-6 py-5 font-bold text-gray-900">{r.appointment_date}</td>
                  <td className="px-6 py-5">
                    <span className="bg-gray-100 border border-gray-200 rounded-md px-2.5 py-1 text-sm font-semibold text-gray-800">
                      {fmt12(r.time_slot)}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-900">{r.patient_name}</td>
                  <td className="px-6 py-5 font-mono text-sm text-gray-700">{r.patient_phone || '-'}</td>
                  <td className="px-6 py-5 text-gray-700">{r.reason || '-'}</td>
                  <td className="px-6 py-5">
                    <span
                      className={`border px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        badgeClass[r.status] || ''
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {r.status === 'confirmed' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setStatus(r.id, 'completed')}
                          className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg px-3.5 py-1.5 text-sm font-semibold hover:bg-green-100"
                        >
                          <CheckIcon className="w-4 h-4" />
                          Complete
                        </button>
                        <button
                          onClick={() => setStatus(r.id, 'cancelled')}
                          className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg px-3.5 py-1.5 text-sm font-semibold hover:bg-red-100"
                        >
                          <XIcon className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function DoctorAppointments() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  }
  return session ? <Dashboard session={session} /> : <Login />;
}