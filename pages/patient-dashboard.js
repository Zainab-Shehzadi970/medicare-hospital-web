import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useSession } from '../lib/useSession';
import { getHomeRoute } from '../lib/auth';
import PatientAuthForm from '../components/patient-auth-form';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmt12 = (t) => {
  const [h, m] = String(t).slice(0, 5).split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const fmtDate = (iso) => {
  const [y, m, d] = String(iso).split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAY_NAMES[dt.getDay()]}, ${d} ${MONTH_NAMES[m - 1]} ${y}`;
};
const fmtMsgTime = (iso) =>
  new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const initials = (name) =>
  String(name || '')
    .replace(/^dr\.?\s*/i, '')
    .trim()
    .charAt(0)
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
const statusNote = {
  pending: "Waiting for the doctor's confirmation.",
  confirmed: 'Confirmed. Please arrive 10 minutes early.',
  completed: 'Consultation completed.',
  cancelled: 'This appointment was cancelled.',
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
const LayersIcon = (p) => (
  <Icon {...p}>
    <path d="M12 2 2 7l10 5 10-5-10-5z" />
    <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
  </Icon>
);
const ChatIcon = (p) => (
  <Icon {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Icon>
);
const LogoutIcon = (p) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Icon>
);
const HomeIcon = (p) => (
  <Icon {...p}>
    <path d="m3 11 9-8 9 8M5 10v10h14V10" />
  </Icon>
);

const NAV = [
  { key: 'upcoming', label: 'Upcoming', Icon: ClockIcon },
  { key: 'completed', label: 'Completed', Icon: CheckIcon },
  { key: 'cancelled', label: 'Cancelled', Icon: XIcon },
  { key: 'messages', label: 'Messages', Icon: ChatIcon },
];

/* ---------------- Chat ---------------- */

const SendIcon = (p) => (
  <Icon {...p}>
    <path d="m22 2-7 20-4-9-9-4 20-7z" />
    <path d="M22 2 11 13" />
  </Icon>
);

const timeOnly = (iso) => {
  const d = new Date(iso);
  const h = d.getHours();
  return `${h % 12 === 0 ? 12 : h % 12}:${String(d.getMinutes()).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const dayKey = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};
const dayLabel = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const yest = new Date();
  yest.setDate(now.getDate() - 1);
  if (dayKey(iso) === dayKey(now.toISOString())) return 'Today';
  if (dayKey(iso) === dayKey(yest.toISOString())) return 'Yesterday';
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};
// Short stamp for the doctors list: time if today, otherwise the date
const listStamp = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return dayKey(iso) === dayKey(new Date().toISOString()) ? timeOnly(iso) : `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
};

function PatientMessages({ userId, doctors, messages, reload, selected, setSelected }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const listRef = useRef(null);

  const threads = useMemo(
    () =>
      doctors
        .map((d) => {
          const msgs = messages.filter((m) => m.doctor_id === d.id);
          return {
            ...d,
            last: msgs[msgs.length - 1],
            unread: msgs.filter((m) => m.sender === 'doctor' && !m.read_at).length,
          };
        })
        .sort((a, b) => (b.last?.created_at || '').localeCompare(a.last?.created_at || '')),
    [doctors, messages]
  );

  const current = threads.find((t) => t.id === selected);
  const thread = messages.filter((m) => m.doctor_id === selected);
  const hasUnread = thread.some((m) => m.sender === 'doctor' && !m.read_at);

  // Mark the doctor's messages as read while the chat is open
  useEffect(() => {
    if (!selected || !hasUnread) return;
    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('patient_id', userId)
      .eq('doctor_id', selected)
      .eq('sender', 'doctor')
      .is('read_at', null)
      .then(() => reload());
  }, [selected, hasUnread, userId, reload]);

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
      .insert({ patient_id: userId, doctor_id: selected, sender: 'patient', body });
    setSending(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setText('');
    reload();
  };

  const totalUnread = threads.reduce((n, t) => n + t.unread, 0);

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl shadow-md shadow-slate-200/60 overflow-hidden grid md:grid-cols-[22rem_1fr] h-[calc(100vh-11rem)] min-h-[30rem]">
      {/* Doctors list */}
      <div className={`border-r border-gray-100 bg-white flex-col min-h-0 ${selected ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Your doctors</h3>
          {totalUnread > 0 && (
            <span className="text-xs font-bold bg-red-50 text-red-700 border border-red-100 rounded-full px-2.5 py-1">
              {totalUnread} unread
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {threads.length === 0 && (
            <div className="px-3 py-10 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                <ChatIcon className="w-5 h-5" />
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Chat unlocks once a doctor marks your appointment as completed.
              </p>
            </div>
          )}
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`w-full text-left flex items-center gap-3 px-3 py-3 mb-1 rounded-xl transition-colors ${
                selected === t.id ? 'bg-red-50 ring-1 ring-red-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {initials(t.name) || 'D'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate text-sm ${t.unread > 0 ? 'font-extrabold' : 'font-bold'} text-gray-900`}>
                    {t.name}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0">{listStamp(t.last?.created_at)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className={`truncate text-xs ${t.unread > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
                    {t.last
                      ? `${t.last.sender === 'patient' ? 'You: ' : ''}${t.last.body}`
                      : t.specialization || 'Tap to start chatting'}
                  </span>
                  {t.unread > 0 && (
                    <span className="text-[11px] font-bold bg-red-600 text-white rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shrink-0">
                      {t.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className={`${selected ? 'flex' : 'hidden md:flex'} flex-col min-h-0 bg-slate-50/70`}>
        {!current ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-3xl bg-white border border-gray-200 shadow-sm text-red-500 flex items-center justify-center">
              <ChatIcon className="w-7 h-7" />
            </div>
            <h4 className="mt-4 text-lg font-extrabold text-gray-900">Your conversations</h4>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              Select a doctor from the list to read and send messages.
            </p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm">
              <button
                onClick={() => setSelected(null)}
                className="md:hidden text-2xl leading-none text-red-600 font-bold px-1"
                aria-label="Back"
              >
                ‹
              </button>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {initials(current.name) || 'D'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-gray-900 truncate">{current.name}</div>
                <div className="text-xs text-gray-500 truncate">{current.specialization}</div>
              </div>
            </div>

            <p className="text-[11px] text-amber-800 bg-amber-50 border-b border-amber-100 px-4 py-2 text-center">
              Not for emergencies. In an emergency call the hospital or go to the nearest emergency room.
            </p>

            <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {thread.length === 0 && (
                <p className="text-center text-sm text-gray-500 mt-10">
                  No messages yet. Ask your doctor about your medicine or follow-up.
                </p>
              )}
              {thread.map((m, i) => {
                const mine = m.sender === 'patient';
                const newDay = i === 0 || dayKey(thread[i - 1].created_at) !== dayKey(m.created_at);
                return (
                  <div key={m.id}>
                    {newDay && (
                      <div className="flex justify-center my-3">
                        <span className="bg-white border border-gray-200 text-gray-500 text-[11px] font-semibold rounded-full px-3 py-1 shadow-sm">
                          {dayLabel(m.created_at)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          mine
                            ? 'bg-gradient-to-br from-red-500 to-red-700 text-white rounded-br-md shadow-md shadow-red-500/20'
                            : 'bg-white border border-gray-200/80 text-gray-900 rounded-bl-md shadow-sm'
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</div>
                        <div className={`text-[10px] mt-1 text-right ${mine ? 'text-white/75' : 'text-gray-400'}`}>
                          {timeOnly(m.created_at)}
                          {mine && m.read_at ? ' · Seen' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {err && <div className="bg-red-50 text-red-700 text-sm px-5 py-2">{err}</div>}
            <form onSubmit={send} className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2.5">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={2000}
                placeholder="Type a message..."
                className="flex-1 border border-gray-200 bg-gray-50 rounded-full px-5 py-3 text-sm text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 transition"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                aria-label="Send"
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-full pl-5 pr-4 py-3 text-sm font-bold shadow-md shadow-red-500/25 hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Send
                <SendIcon className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */

function Dashboard({ session }) {
  const router = useRouter();
  const user = session.user;
  const fullName = user.user_metadata?.full_name || user.email;

  const [rows, setRows] = useState([]);
  const [doctorMap, setDoctorMap] = useState({});
  const [messages, setMessages] = useState([]);
  const [view, setView] = useState('upcoming');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const [apRes, docRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('id, doctor_id, appointment_date, time_slot, reason, status')
        .eq('patient_id', user.id),
      supabase.from('doctors').select('id, name, specialization'),
    ]);
    const err = apRes.error || docRes.error;
    if (err) {
      setError(err.message);
    } else {
      setError('');
      setRows(apRes.data);
      setDoctorMap(Object.fromEntries(docRes.data.map((d) => [d.id, d])));
    }
    setLoading(false);
  }, [user.id]);

  const loadMessages = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('messages')
      .select('id, doctor_id, sender, body, created_at, read_at')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: true });
    if (!err && data) setMessages(data);
  }, [user.id]);

  // Live updates: the doctor confirms, cancels, completes or replies
  useEffect(() => {
    load();
    loadMessages();
    const channel = supabase
      .channel(`patient-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `patient_id=eq.${user.id}` },
        () => load()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `patient_id=eq.${user.id}` },
        () => loadMessages()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, loadMessages, user.id]);

  const key = (r) => `${r.appointment_date} ${String(r.time_slot).slice(0, 5)}`;
  const groups = useMemo(() => {
    const asc = (a, b) => key(a).localeCompare(key(b));
    const desc = (a, b) => key(b).localeCompare(key(a));
    return {
      upcoming: rows.filter((r) => r.status === 'pending' || r.status === 'confirmed').sort(asc),
      completed: rows.filter((r) => r.status === 'completed').sort(desc),
      cancelled: rows.filter((r) => r.status === 'cancelled').sort(desc),
    };
  }, [rows]);

  // Doctors the patient has completed an appointment with (chat is only allowed for these)
  const chatDoctors = useMemo(() => {
    const ids = [...new Set(rows.filter((r) => r.status === 'completed').map((r) => r.doctor_id))];
    return ids.map((id) => doctorMap[id]).filter(Boolean);
  }, [rows, doctorMap]);

  const unread = messages.filter((m) => m.sender === 'doctor' && !m.read_at).length;
  const counts = {
    upcoming: groups.upcoming.length,
    completed: groups.completed.length,
    cancelled: groups.cancelled.length,
    messages: unread,
  };

  const cancelRequest = async (r) => {
    if (!window.confirm(`Cancel your request for ${fmtDate(r.appointment_date)} at ${fmt12(r.time_slot)}?`)) return;
    setBusyId(r.id);
    setError('');
    const { data, error: err } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', r.id)
      .eq('status', 'pending')
      .select();
    setBusyId(null);
    if (err) setError(err.message);
    else if (!data || data.length === 0) setError('Could not cancel. The doctor may have just confirmed it.');
    load();
  };

  const messageDoctor = (doctorId) => {
    setSelectedDoctor(doctorId);
    setView('messages');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const stats = [
    ['Pending', rows.filter((r) => r.status === 'pending').length, ClockIcon, 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/30', 'text-gray-900', 'bg-amber-500'],
    ['Confirmed', rows.filter((r) => r.status === 'confirmed').length, CheckIcon, 'bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-emerald-500/30', 'text-gray-900', 'bg-emerald-500'],
    ['Completed', counts.completed, CalendarIcon, 'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-red-500/30', 'text-gray-900', 'bg-red-500'],
    ['Total', rows.length, LayersIcon, 'bg-gradient-to-br from-slate-500 to-slate-700 text-white shadow-slate-500/30', 'text-gray-900', 'bg-slate-500'],
  ];

  const nextAppt = groups.upcoming[0];
  const activeNav = NAV.find((n) => n.key === view);
  const list = view === 'messages' ? [] : groups[view];

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
            {initials(fullName)}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-gray-900 leading-tight truncate">{fullName}</h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              <span className="truncate">Patient</span>
            </div>
          </div>
        </div>

        <div className="p-4 pb-0">
          <Link
            href="/#doctors"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-xl px-3.5 py-3 text-sm font-bold shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <CalendarIcon className="w-4 h-4" />
            Book Appointment
          </Link>
        </div>

        <nav className="p-4 flex lg:flex-col gap-1.5 overflow-x-auto">
          {NAV.map(({ key: k, label, Icon: NavIcon }) => (
            <button
              key={k}
              onClick={() => setView(k)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                view === k
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/25'
                  : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <NavIcon className="w-4 h-4" />
              <span className="flex-1 text-left">{label}</span>
              {counts[k] > 0 && (
                <span
                  className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                    view === k
                      ? 'bg-white/25 text-white'
                      : k === 'messages'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {counts[k]}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="hidden lg:block mt-auto p-4 border-t border-gray-100">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            Back to website
          </Link>
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
        {view !== 'messages' && (
          <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200/80 shadow-sm p-5 sm:p-6 mb-6">
            <span className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-red-500 to-red-700" />
            <div className="flex flex-wrap items-center justify-between gap-4 pl-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-500">Welcome back</p>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-0.5 truncate tracking-tight">{fullName}</h2>
                {!nextAppt && (
                  <p className="mt-1 text-sm text-gray-600">No upcoming visits. Book an appointment whenever you need one.</p>
                )}
              </div>
              {nextAppt && (
                <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 bg-red-50 text-red-700 border border-red-100 rounded-xl px-4 py-2.5 text-sm">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="font-bold">Next visit:</span>
                  <span>
                    {fmtDate(nextAppt.appointment_date)} at {fmt12(nextAppt.time_slot)}
                    {doctorMap[nextAppt.doctor_id]?.name ? ` with ${doctorMap[nextAppt.doctor_id].name}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {view === 'messages' ? 'Messages' : `${activeNav?.label} Appointments`}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {view === 'messages'
                ? 'Chat with doctors you have completed an appointment with.'
                : 'Updates automatically when your doctor confirms or cancels.'}
            </p>
          </div>
          <div className="lg:hidden flex gap-2">
            <Link href="/" className="border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800">
              Home
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800"
            >
              <LogoutIcon className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-2.5 mb-4">{error}</div>}

        {view === 'messages' ? (
          <PatientMessages
            userId={user.id}
            doctors={chatDoctors}
            messages={messages}
            reload={loadMessages}
            selected={selectedDoctor}
            setSelected={setSelectedDoctor}
          />
        ) : (
          <>
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

            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-md shadow-slate-200/60 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    {['Date', 'Time', 'Doctor', 'Reason', 'Status', 'Actions'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-4 text-xs font-bold tracking-wider text-gray-500 uppercase ${
                          i === 5 ? 'text-right' : ''
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-500 py-12">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!loading && list.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-500 py-16">
                        {view === 'upcoming'
                          ? 'No upcoming appointments. Use Book Appointment to schedule one.'
                          : view === 'completed'
                          ? 'No completed appointments yet.'
                          : 'No cancelled appointments.'}
                      </td>
                    </tr>
                  )}
                  {list.map((r) => {
                    const doc = doctorMap[r.doctor_id];
                    return (
                      <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-red-50/40 transition-colors">
                        <td className="px-5 py-5 font-bold text-gray-900 whitespace-nowrap">{fmtDate(r.appointment_date)}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100 rounded-lg px-2.5 py-1 text-sm font-bold">
                            <ClockIcon className="w-3.5 h-3.5" />
                            {fmt12(r.time_slot)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white text-sm font-bold flex items-center justify-center shrink-0">
                              {initials(doc?.name) || 'D'}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{doc?.name || 'Doctor'}</div>
                              <div className="text-xs text-gray-500">{doc?.specialization}</div>
                            </div>
                          </div>
                        </td>
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
                          <div className="text-[11px] text-gray-500 mt-1.5 max-w-[14rem]">{statusNote[r.status]}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {r.status === 'pending' && (
                              <button
                                disabled={busyId === r.id}
                                onClick={() => cancelRequest(r)}
                                className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60 whitespace-nowrap"
                              >
                                <XIcon className="w-4 h-4" />
                                Cancel request
                              </button>
                            )}
                            {r.status === 'completed' && (
                              <button
                                onClick={() => messageDoctor(r.doctor_id)}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg px-3.5 py-2 text-sm font-semibold shadow-md shadow-red-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all whitespace-nowrap"
                              >
                                <ChatIcon className="w-4 h-4" />
                                Message Doctor
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ---------------- Page (auth guard) ---------------- */

export default function PatientDashboardPage() {
  const router = useRouter();
  const session = useSession();
  const [ready, setReady] = useState(false);

  // Doctors who open this page are signed out and asked to use their own login
  useEffect(() => {
    if (!session) {
      setReady(false);
      return;
    }
    let alive = true;
    getHomeRoute(session.user.id).then((route) => {
      if (!alive) return;
      if (route === '/doctor-appointments') {
        // Doctor accounts do not belong in the patient portal
        try {
          sessionStorage.setItem(
            'patientAuthNotice',
            'This is a doctor account. Please use the Staff / Doctor login on the website.'
          );
        } catch {}
        supabase.auth.signOut();
      } else setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [session, router]);

  if (session === undefined || (session && !ready)) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl sm:p-10">
          <PatientAuthForm
            heading="Patient sign in"
            subheading="Use the same account as the Medicare mobile app."
            onSignedIn={() => {}}
          />
          <p className="mt-6 text-center text-sm">
            <Link href="/" className="font-bold text-slate-400 hover:text-white">
              Back to website
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return <Dashboard session={session} />;
}