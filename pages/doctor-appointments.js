import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};
const dotClass = {
  pending: 'bg-amber-500',
  confirmed: 'bg-emerald-500',
  completed: 'bg-slate-500',
  cancelled: 'bg-red-500',
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

const ClockIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Icon>
);
const ListIcon = (p) => (
  <Icon {...p}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </Icon>
);
const ChatIcon = (p) => (
  <Icon {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Icon>
);
const ArrowIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </Icon>
);

// Login form shown when /doctor-appointments is opened directly (also works without the homepage Portal Sign In)
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Message left by a blocked patient login (this form is re-created after the sign out)
  useEffect(() => {
    try {
      const msg = sessionStorage.getItem('doctorAuthNotice');
      if (msg) {
        setError(msg);
        sessionStorage.removeItem('doctorAuthNotice');
      }
    } catch {}
  }, []);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50/60 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white border border-gray-200/80 rounded-3xl p-8 flex flex-col shadow-xl shadow-slate-200/70"
      >
        <div className="flex items-center gap-3 mb-5">
          <img src="/images/logo.png" alt="Medicare Hospital" className="w-11 h-11 object-contain" />
          <div className="leading-none">
            <div className="text-xl font-black tracking-tight text-gray-900">MEDICARE</div>
            <div className="text-[10px] font-bold tracking-[0.25em] text-red-600 mt-1">DOCTOR CONSOLE</div>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome, Doctor</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">Sign in to manage your appointments and patients.</p>

        <label className="text-sm font-semibold text-gray-800 mb-1.5">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-4 text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 transition"
        />

        <label className="text-sm font-semibold text-gray-800 mb-1.5">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-4 text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 transition"
        />

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-2.5 mb-3">{error}</div>
        )}

        <button
          disabled={loading}
          className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-xl py-3 shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}

const NAV = [
  { key: 'pending', label: 'Pending Requests', Icon: ClockIcon },
  { key: 'today', label: 'Today', Icon: CalendarIcon },
  { key: 'upcoming', label: 'Upcoming', Icon: ArrowIcon },
  { key: 'all', label: 'All Appointments', Icon: ListIcon },
  { key: 'messages', label: 'Messages', Icon: ChatIcon },
];

const fmtMsgTime = (iso) =>
  new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

function DoctorMessages({ doctor, rows, messages, reload }) {
  const [selected, setSelected] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const listRef = useRef(null);

  // Only patients with a COMPLETED appointment who booked while logged in
  const patients = useMemo(() => {
    const map = new Map();
    rows
      .filter((r) => r.status === 'completed' && r.patient_id)
      .forEach((r) => {
        const prev = map.get(r.patient_id);
        if (!prev || r.appointment_date > prev.lastVisit) {
          map.set(r.patient_id, {
            id: r.patient_id,
            name: r.patient_name,
            phone: r.patient_phone,
            lastVisit: r.appointment_date,
          });
        }
      });
    return [...map.values()]
      .map((p) => {
        const msgs = messages.filter((m) => m.patient_id === p.id);
        return {
          ...p,
          last: msgs[msgs.length - 1],
          unread: msgs.filter((m) => m.sender === 'patient' && !m.read_at).length,
        };
      })
      .sort((a, b) => (b.last?.created_at || b.lastVisit).localeCompare(a.last?.created_at || a.lastVisit));
  }, [rows, messages]);

  const current = patients.find((p) => p.id === selected);
  const thread = messages.filter((m) => m.patient_id === selected);
  const hasUnread = thread.some((m) => m.sender === 'patient' && !m.read_at);

  // Mark the patient's messages as read when the chat is opened
  useEffect(() => {
    if (!selected || !hasUnread) return;
    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('doctor_id', doctor.id)
      .eq('patient_id', selected)
      .eq('sender', 'patient')
      .is('read_at', null)
      .then(() => reload());
  }, [selected, hasUnread, doctor.id, reload]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [selected, thread.length]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !selected) return;
    setSending(true);
    setErr('');
    const { error } = await supabase
      .from('messages')
      .insert({ patient_id: selected, doctor_id: doctor.id, sender: 'doctor', body });
    setSending(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setText('');
    reload();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden grid md:grid-cols-[18rem_1fr] h-[calc(100vh-11rem)] min-h-[28rem]">
      {/* Patients list */}
      <div className={`border-r border-gray-200 overflow-y-auto ${selected ? 'hidden md:block' : ''}`}>
        <div className="px-4 py-3 border-b border-gray-100 text-xs font-bold tracking-wider text-gray-500 uppercase">
          Patients
        </div>
        {patients.length === 0 && (
          <p className="p-5 text-sm text-gray-500">
            Patients appear here once their appointment is marked Complete. You can then chat with them.
          </p>
        )}
        {patients.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
              selected === p.id ? 'bg-red-50' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-gray-900 truncate">{p.name}</span>
              {p.unread > 0 && (
                <span className="text-xs font-bold bg-red-600 text-white rounded-full px-2 py-0.5">{p.unread}</span>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate mt-0.5">
              {p.last ? p.last.body : `Last visit: ${p.lastVisit}`}
            </div>
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className={`${selected ? 'flex' : 'hidden md:flex'} flex-col min-h-0`}>
        {!current ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Select a patient to start chatting.
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
              <button
                onClick={() => setSelected(null)}
                className="md:hidden text-gray-600 font-bold px-2"
                aria-label="Back"
              >
                ‹
              </button>
              <div className="min-w-0">
                <div className="font-extrabold text-gray-900 truncate">{current.name}</div>
                <div className="text-xs text-gray-500">
                  {current.phone || ''} · Last visit {current.lastVisit}
                </div>
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {thread.length === 0 && (
                <p className="text-center text-sm text-gray-500 mt-8">No messages yet.</p>
              )}
              {thread.map((m) => {
                const mine = m.sender === 'doctor';
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        mine
                          ? 'bg-red-600 text-white rounded-br-md'
                          : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.body}</div>
                      <div className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                        {fmtMsgTime(m.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {err && <div className="bg-red-50 text-red-700 text-sm px-4 py-2">{err}</div>}
            <form onSubmit={send} className="p-3 border-t border-gray-200 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={2000}
                placeholder="Type a reply..."
                className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:bg-white"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="bg-red-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Dashboard({ session }) {
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

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
      .select('id, patient_id, appointment_date, time_slot, patient_name, patient_phone, reason, status')
      .eq('doctor_id', doctor.id)
      .order('appointment_date', { ascending: true })
      .order('time_slot', { ascending: true });
    if (err) setError(err.message);
    else setRows(data);
  }, [doctor]);

  // Update the list automatically when a new booking arrives (realtime)
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

  // Messages (chat) + live updates
  const [messages, setMessages] = useState([]);
  const loadMessages = useCallback(async () => {
    if (!doctor) return;
    const { data, error: err } = await supabase
      .from('messages')
      .select('id, patient_id, sender, body, created_at, read_at')
      .eq('doctor_id', doctor.id)
      .order('created_at', { ascending: true });
    if (!err && data) setMessages(data);
  }, [doctor]);

  useEffect(() => {
    if (!doctor) return;
    loadMessages();
    const channel = supabase
      .channel(`messages-${doctor.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `doctor_id=eq.${doctor.id}` },
        () => loadMessages()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctor, loadMessages]);

  const setStatus = async (id, status) => {
    setError('');
    setBusyId(id);
    const { error: err } = await supabase.from('appointments').update({ status }).eq('id', id);
    setBusyId(null);
    if (err) setError(err.message);
    else load();
  };

  const cancel = (r) => {
    if (window.confirm(`Cancel appointment of ${r.patient_name} on ${r.appointment_date} at ${fmt12(r.time_slot)}?`)) {
      setStatus(r.id, 'cancelled');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col gap-3 items-center justify-center">
        <p className="text-gray-700">This account is not linked to a doctor profile.</p>
        <button onClick={logout} className="border border-gray-300 rounded-lg px-4 py-2 font-semibold">
          Log out
        </button>
      </div>
    );
  }

  const today = todayISO();
  const q = query.trim().toLowerCase();

  const counts = {
    pending: rows.filter((r) => r.status === 'pending').length,
    today: rows.filter((r) => r.appointment_date === today && r.status !== 'cancelled').length,
    upcoming: rows.filter((r) => r.appointment_date >= today && r.status === 'confirmed').length,
    all: rows.length,
    messages: messages.filter((m) => m.sender === 'patient' && !m.read_at).length,
  };

  const shown = rows
    .filter((r) => {
      if (filter === 'pending') return r.status === 'pending';
      if (filter === 'today') return r.appointment_date === today;
      if (filter === 'upcoming') return r.appointment_date >= today && r.status === 'confirmed';
      return true;
    })
    .filter(
      (r) =>
        !q ||
        [r.patient_name, r.patient_phone, r.reason].some((v) => String(v || '').toLowerCase().includes(q))
    );

  const activeNav = NAV.find((n) => n.key === filter);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const nextConfirmed = rows
    .filter((r) => r.status === 'confirmed' && r.appointment_date >= today)
    .sort((a, b) => `${a.appointment_date} ${a.time_slot}`.localeCompare(`${b.appointment_date} ${b.time_slot}`))[0];

  const stats = [
    ['Pending', counts.pending, ClockIcon, 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/30', 'text-gray-900', 'bg-amber-500'],
    ['Today', counts.today, CalendarIcon, 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-500/30', 'text-gray-900', 'bg-red-500'],
    ['Upcoming', counts.upcoming, ArrowIcon, 'bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-emerald-500/30', 'text-gray-900', 'bg-emerald-500'],
    ['Total', counts.all, LayersIcon, 'bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-slate-500/30', 'text-gray-900', 'bg-slate-500'],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/50 lg:flex">
      {/* Sidebar */}
      <aside className="bg-white/90 backdrop-blur border-b lg:border-b-0 lg:border-r border-gray-200/80 lg:w-72 lg:shrink-0 lg:min-h-screen lg:sticky lg:top-0 lg:h-screen flex flex-col shadow-[4px_0_24px_-12px_rgba(15,23,42,0.12)]">
        <Link href="/" className="px-5 pt-5 pb-4 flex items-center gap-2.5">
          <img src="/images/logo.png" alt="Medicare Hospital" className="w-10 h-10 object-contain" />
          <div className="leading-none">
            <div className="text-xl font-black text-gray-900 tracking-tight">MEDICARE</div>
            <div className="text-[10px] font-bold text-gray-500 tracking-[0.3em] mt-1">HOSPITAL</div>
          </div>
        </Link>

        <div className="px-5 py-5 flex items-center gap-3.5 border-y border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30 ring-4 ring-red-50">
            {initials(doctor.name)}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-gray-900 leading-tight truncate">{doctor.name}</h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              <span className="truncate">{doctor.specialization}</span>
            </div>
          </div>
        </div>

        <nav className="p-4 flex lg:flex-col gap-1.5 overflow-x-auto">
          {NAV.map(({ key, label, Icon: NavIcon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === key
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/25'
                  : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <NavIcon className="w-4 h-4" />
              <span className="flex-1 text-left">{label}</span>
              {counts[key] > 0 && (
                <span
                  className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                    filter === key
                      ? 'bg-white/25 text-white'
                      : key === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="hidden lg:block mt-auto p-4 border-t border-gray-100">
          <div className="px-3.5 py-2 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Medicare Hospital
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogoutIcon className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-10 py-6 lg:py-8">
        {filter !== 'messages' && (
          <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200/80 shadow-sm p-5 sm:p-6 mb-6">
            <span className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-red-500 to-red-700" />
            <div className="flex flex-wrap items-center justify-between gap-4 pl-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-500">{greeting}</p>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-0.5 truncate tracking-tight">{doctor.name}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  You have <span className="font-bold text-red-600">{counts.pending}</span> pending{' '}
                  {counts.pending === 1 ? 'request' : 'requests'} and{' '}
                  <span className="font-bold text-red-600">{counts.today}</span>{' '}
                  {counts.today === 1 ? 'appointment' : 'appointments'} today.
                </p>
              </div>
              {nextConfirmed && (
                <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-2.5 text-sm">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="font-bold">Next:</span>
                  <span>
                    {nextConfirmed.patient_name}, {nextConfirmed.appointment_date} at {fmt12(nextConfirmed.time_slot)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{activeNav?.label}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filter === 'pending'
                ? 'New requests. Confirm or cancel each one.'
                : filter === 'messages'
                ? 'Chat with patients whose appointments you have completed.'
                : 'Your appointments. This list updates live.'}
            </p>
          </div>
          <button
            onClick={logout}
            className="lg:hidden flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800"
          >
            <LogoutIcon className="w-4 h-4" />
            Log out
          </button>
        </div>

        {filter === 'messages' ? (
          <DoctorMessages doctor={doctor} rows={rows} messages={messages} reload={loadMessages} />
        ) : (
          <>
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {stats.map(([label, n, IconC, iconBg, numColor, bar]) => (
            <div
              key={label}
              className="group relative overflow-hidden bg-white border border-gray-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className={`absolute left-0 top-0 h-full w-1 ${bar}`} />
              <div>
                <div className="text-xs font-bold tracking-wider text-gray-500 uppercase">{label}</div>
                <div className={`text-4xl font-extrabold mt-1.5 tracking-tight ${numColor}`}>{n}</div>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${iconBg}`}>
                <IconC className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="relative w-full sm:w-96">
            <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient, phone, reason..."
              className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-9 pr-3 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 transition"
            />
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-2.5 mb-4">{error}</div>}

        {/* Table */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-md shadow-slate-200/60 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                {['Date', 'Time', 'Patient', 'Phone', 'Reason', 'Status', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-4 text-xs font-bold tracking-wider text-gray-500 uppercase ${
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
                  <td colSpan="7" className="text-center text-gray-500 py-16">
                    {filter === 'pending' ? 'No pending requests.' : 'No appointments.'}
                  </td>
                </tr>
              )}
              {shown.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-red-50/40 transition-colors">
                  <td className="px-5 py-5 font-bold text-gray-900 whitespace-nowrap">{r.appointment_date}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100 rounded-lg px-2.5 py-1 text-sm font-bold">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {fmt12(r.time_slot)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                        {initials(r.patient_name) || 'P'}
                      </div>
                      <span className="font-bold text-gray-900">{r.patient_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm text-gray-700">{r.patient_phone || '-'}</td>
                  <td className="px-5 py-4 text-gray-700">{r.reason || '-'}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 border px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        badgeClass[r.status] || ''
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass[r.status] || 'bg-gray-400'}`} />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {r.status === 'pending' && (
                        <>
                          <button
                            disabled={busyId === r.id}
                            onClick={() => setStatus(r.id, 'confirmed')}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg px-3.5 py-2 text-sm font-semibold shadow-md shadow-emerald-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60"
                          >
                            <CheckIcon className="w-4 h-4" />
                            Confirm
                          </button>
                          <button
                            disabled={busyId === r.id}
                            onClick={() => cancel(r)}
                            className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                          >
                            <XIcon className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      )}
                      {r.status === 'confirmed' && (
                        <>
                          <button
                            disabled={busyId === r.id}
                            onClick={() => setStatus(r.id, 'completed')}
                            className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-green-100 transition-colors disabled:opacity-60"
                          >
                            <CheckIcon className="w-4 h-4" />
                            Complete
                          </button>
                          <button
                            disabled={busyId === r.id}
                            onClick={() => cancel(r)}
                            className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                          >
                            <XIcon className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function DoctorAppointments() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;

    // Only accounts linked to the doctors table may enter; patients are signed out
    const accept = async (s) => {
      if (!s) {
        if (alive) setSession(null);
        return;
      }
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('profile_id', s.user.id)
        .maybeSingle();
      if (!alive) return;
      if (doctor) {
        setSession(s);
      } else {
        try {
          sessionStorage.setItem(
            'doctorAuthNotice',
            'This is a patient account. Please use the Patient login on the website.'
          );
        } catch {}
        await supabase.auth.signOut();
        setSession(null);
      }
    };

    supabase.auth.getSession().then(async ({ data }) => {
      await accept(data.session);
      if (alive) setChecking(false);
    });
    // Do not call Supabase directly inside this callback, so it is deferred
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setTimeout(() => accept(s), 0);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  }
  return session ? <Dashboard session={session} /> : <Login />;
}