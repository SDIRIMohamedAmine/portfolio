import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2, Users, Monitor, Smartphone, Globe,
  TrendingUp, RefreshCw, Calendar, ArrowUp, ArrowDown, Minus,
} from 'lucide-react';
import { supabase } from '../../supabase/client';

const ACCENT = 'var(--color-accent)';

// ── Helpers ───────────────────────────────────────────────────────────────────
function startOf(unit) {
  const d = new Date();
  if (unit === 'day')   { d.setHours(0, 0, 0, 0); }
  if (unit === 'week')  { d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); }
  if (unit === 'month') { d.setDate(d.getDate() - 29); d.setHours(0, 0, 0, 0); }
  return d.toISOString();
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, trend, loading }) {
  const trendIcon =
    trend > 0 ? <ArrowUp size={13} className="text-green-400" /> :
    trend < 0 ? <ArrowDown size={13} className="text-red-400" /> :
                <Minus size={13} className="text-text-muted" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-card flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)' }}>
          <Icon size={15} style={{ color: ACCENT }} />
        </div>
      </div>

      {loading ? (
        <div className="h-8 w-24 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-border-bright)' }} />
      ) : (
        <p className="font-display font-extrabold text-3xl text-text-primary">{value ?? '—'}</p>
      )}

      {sub && !loading && (
        <div className="flex items-center gap-1.5">
          {trendIcon}
          <p className="font-mono text-[11px] text-text-muted">{sub}</p>
        </div>
      )}
    </motion.div>
  );
}

// ── Bar chart (pure CSS — no library needed) ──────────────────────────────────
function BarChart({ data, loading }) {
  if (loading) {
    return (
      <div className="flex items-end gap-1 h-28">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="flex-1 rounded-t animate-pulse"
            style={{ height: `${20 + Math.random() * 60}%`, backgroundColor: 'var(--color-border-bright)' }} />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-28 font-body text-sm text-text-muted">
        No data yet
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-28">
      {data.map((d, i) => {
        const pct = Math.max(4, (d.count / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div
              className="absolute bottom-full mb-2 px-2 py-1 rounded-lg font-mono text-[10px] text-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10"
              style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-bright)' }}
            >
              {d.label}: <span style={{ color: ACCENT }}>{d.count}</span>
            </div>

            <motion.div
              className="w-full rounded-t cursor-pointer transition-all duration-200"
              style={{
                height: `${pct}%`,
                background: d.count > 0
                  ? `linear-gradient(to top, var(--color-accent), var(--color-accent-bright))`
                  : 'var(--color-border)',
                opacity: d.count > 0 ? 0.85 : 0.3,
              }}
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ opacity: 1, scaleX: 1.05 }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Donut / pie breakdown ─────────────────────────────────────────────────────
function BreakdownBar({ label, count, total, icon: Icon }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={13} className="text-text-muted shrink-0" />}
          <span className="font-body text-sm text-text-secondary">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-text-primary">{count}</span>
          <span className="font-mono text-[11px] text-text-muted w-9 text-right">{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border-bright)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, var(--color-accent), var(--color-accent-bright))` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

// ── Recent visits table ───────────────────────────────────────────────────────
function RecentTable({ visits, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="h-9 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
        ))}
      </div>
    );
  }
  if (!visits.length) {
    return <p className="font-body text-sm text-text-muted text-center py-6">No visits recorded yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {['Time', 'Device', 'Browser', 'Referrer'].map((h) => (
              <th key={h} className="pb-2 pr-4 font-mono text-[10px] text-text-muted uppercase tracking-widest">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visits.map((v, i) => (
            <motion.tr
              key={v.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)' }}
              className="hover:bg-white/2 transition-colors"
            >
              <td className="py-2.5 pr-4 font-mono text-xs text-text-muted whitespace-nowrap">
                {new Date(v.created_at).toLocaleString('en-GB', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </td>
              <td className="py-2.5 pr-4">
                <span className="flex items-center gap-1.5">
                  {v.device === 'Mobile' ? <Smartphone size={12} className="text-text-muted" /> : <Monitor size={12} className="text-text-muted" />}
                  <span className="font-body text-xs text-text-secondary">{v.device || '—'}</span>
                </span>
              </td>
              <td className="py-2.5 pr-4 font-body text-xs text-text-secondary">{v.browser || '—'}</td>
              <td className="py-2.5 font-mono text-xs text-text-muted max-w-[140px] truncate">
                {v.referrer || 'direct'}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPanel() {
  const [range, setRange]       = useState('week'); // day | week | month
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const RANGES = [
    { id: 'day',   label: 'Today' },
    { id: 'week',  label: '7 days' },
    { id: 'month', label: '30 days' },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const since = startOf(range);

      // All visits in selected range
      const { data: visits, error } = await supabase
        .from('page_visits')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Total and today's count
      const todayStart = startOf('day');
      const todayVisits = visits.filter((v) => v.created_at >= todayStart);

      // Yesterday for comparison
      const ydStart = new Date(todayStart);
      ydStart.setDate(ydStart.getDate() - 1);
      const { count: yesterdayCount } = await supabase
        .from('page_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', ydStart.toISOString())
        .lt('created_at', todayStart);

      // Chart data — group by day
      const dayMap = {};
      const daysToShow = range === 'day' ? 1 : range === 'week' ? 7 : 30;
      for (let i = daysToShow - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = { label: fmtDate(d.toISOString()), count: 0 };
      }
      visits.forEach((v) => {
        const key = v.created_at.slice(0, 10);
        if (dayMap[key]) dayMap[key].count++;
      });
      const chartData = Object.values(dayMap);

      // Device breakdown
      const deviceMap = {};
      visits.forEach((v) => { const d = v.device || 'Unknown'; deviceMap[d] = (deviceMap[d] || 0) + 1; });
      const devices = Object.entries(deviceMap).sort((a, b) => b[1] - a[1]);

      // Browser breakdown
      const browserMap = {};
      visits.forEach((v) => { const b = v.browser || 'Other'; browserMap[b] = (browserMap[b] || 0) + 1; });
      const browsers = Object.entries(browserMap).sort((a, b) => b[1] - a[1]);

      // Referrer breakdown
      const refMap = {};
      visits.forEach((v) => { const r = v.referrer || 'direct'; refMap[r] = (refMap[r] || 0) + 1; });
      const referrers = Object.entries(refMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

      setData({
        total: visits.length,
        todayCount: todayVisits.length,
        yesterdayCount: yesterdayCount || 0,
        chartData,
        devices,
        browsers,
        referrers,
        recent: visits.slice(0, 15),
      });
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Analytics fetch error:', err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchData, 120_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const todayTrend = data ? data.todayCount - data.yesterdayCount : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' }}>
            <BarChart2 size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Analytics</h2>
            <p className="font-body text-xs text-text-muted">
              Visitor stats · last refreshed {lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Range selector */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            {RANGES.map((r) => (
              <button key={r.id} onClick={() => setRange(r.id)}
                className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all"
                style={range === r.id
                  ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-bg-primary)', fontWeight: 600 }
                  : { color: 'var(--color-text-muted)' }}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button onClick={fetchData} disabled={loading}
            className="admin-btn-secondary p-2.5 disabled:opacity-50"
            title="Refresh">
            <motion.div animate={loading ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw size={15} />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'color-mix(in srgb, var(--color-accent) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)' }}>
        <span className="text-sm" style={{ color: ACCENT }}>🔒</span>
        <p className="font-body text-xs text-text-secondary">
          Privacy-friendly tracking — no cookies, no IP addresses, no personal data collected. Device type, browser name, and referrer domain only.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total visits"
          value={data?.total?.toLocaleString()}
          sub={`In the last ${range === 'day' ? '24h' : range === 'week' ? '7 days' : '30 days'}`}
          icon={Users}
          loading={loading}
        />
        <StatCard
          label="Today"
          value={data?.todayCount?.toLocaleString()}
          sub={`${Math.abs(todayTrend)} ${todayTrend >= 0 ? 'more' : 'less'} than yesterday`}
          trend={todayTrend}
          icon={Calendar}
          loading={loading}
        />
        <StatCard
          label="Yesterday"
          value={data?.yesterdayCount?.toLocaleString()}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          label="Daily avg"
          value={
            data
              ? Math.round(
                  data.total /
                  (range === 'day' ? 1 : range === 'week' ? 7 : 30)
                ).toLocaleString()
              : null
          }
          sub="visits per day"
          icon={BarChart2}
          loading={loading}
        />
      </div>

      {/* ── Chart ── */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-5">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest">Visits over time</p>
          <p className="font-mono text-xs text-text-muted">
            {range === 'day' ? 'Today' : range === 'week' ? 'Last 7 days' : 'Last 30 days'}
          </p>
        </div>
        <BarChart data={data?.chartData || []} loading={loading} />
        {/* X-axis labels — only show first, middle, last */}
        {data?.chartData?.length > 0 && (
          <div className="flex justify-between mt-2">
            {[data.chartData[0], data.chartData[Math.floor(data.chartData.length / 2)], data.chartData[data.chartData.length - 1]].map((d, i) => (
              <span key={i} className="font-mono text-[10px] text-text-muted">{d?.label}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Breakdowns ── */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Devices */}
        <div className="admin-card flex flex-col gap-4">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest flex items-center gap-2">
            <Monitor size={13} /> Devices
          </p>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map((i) => <div key={i} className="h-7 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />)}
            </div>
          ) : data?.devices?.length ? (
            <div className="flex flex-col gap-3">
              {data.devices.map(([device, count]) => {
                const Icon = device === 'Mobile' ? Smartphone : Monitor;
                return (
                  <BreakdownBar key={device} label={device} count={count}
                    total={data.total} icon={Icon} />
                );
              })}
            </div>
          ) : (
            <p className="font-body text-xs text-text-muted">No data</p>
          )}
        </div>

        {/* Browsers */}
        <div className="admin-card flex flex-col gap-4">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest flex items-center gap-2">
            <Globe size={13} /> Browsers
          </p>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map((i) => <div key={i} className="h-7 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />)}
            </div>
          ) : data?.browsers?.length ? (
            <div className="flex flex-col gap-3">
              {data.browsers.map(([browser, count]) => (
                <BreakdownBar key={browser} label={browser} count={count} total={data.total} />
              ))}
            </div>
          ) : (
            <p className="font-body text-xs text-text-muted">No data</p>
          )}
        </div>

        {/* Referrers */}
        <div className="admin-card flex flex-col gap-4">
          <p className="font-mono text-xs text-text-muted uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={13} /> Sources
          </p>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map((i) => <div key={i} className="h-7 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />)}
            </div>
          ) : data?.referrers?.length ? (
            <div className="flex flex-col gap-3">
              {data.referrers.map(([ref, count]) => (
                <BreakdownBar key={ref} label={ref === 'direct' ? '🔗 Direct' : ref} count={count} total={data.total} />
              ))}
            </div>
          ) : (
            <p className="font-body text-xs text-text-muted">No data</p>
          )}
        </div>
      </div>

      {/* ── Recent visits ── */}
      <div className="admin-card">
        <p className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">
          Recent Visits
        </p>
        <RecentTable visits={data?.recent || []} loading={loading} />
      </div>
    </div>
  );
}
