import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, User, FileText, Target, ChevronRight, Flame, Link as LinkIcon, X, Check, Loader2, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StreakCard from '../components/StreakCard';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const Dashboard = () => {
  const {
    handles,
    githubData,
    leetcodeData,
    updateHandles,
    updateGithubData,
    updateLeetcodeData,
    updateLeetcodeStreak,
    getHiringProbability,
    getStreakCount,
    recordStreakDay,
  } = useUser();

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editHandles, setEditHandles] = useState({ ...handles });

  const hiringProb = getHiringProbability();
  const streakCount = getStreakCount();

  const fetchStats = async () => {
    setLoading(true);
    let anySuccess = false;

    // GitHub sync — independent
    if (editHandles.github) {
      try {
        const ghRes = await axios.get(`https://api.github.com/users/${editHandles.github}`);
        updateGithubData({
          publicRepos: ghRes.data.public_repos,
          followers: ghRes.data.followers,
          avatar: ghRes.data.avatar_url,
          bio: ghRes.data.bio,
          name: ghRes.data.name,
          reliabilityScore: Math.min(100, (ghRes.data.public_repos * 5) + (ghRes.data.followers * 2)),
        });
        anySuccess = true;
      } catch (ghErr) {
        console.warn('GitHub sync failed:', ghErr.message);
      }
    }

    // LeetCode sync — independent
    if (editHandles.leetcode) {
      try {
        const lcRes = await axios.get(`/leetcode-api/${editHandles.leetcode}/solved`);
        if (lcRes.data && lcRes.data.solvedProblem !== undefined) {
          updateLeetcodeData({
            totalSolved: lcRes.data.solvedProblem,
            easySolved: lcRes.data.easySolved || 0,
            mediumSolved: lcRes.data.mediumSolved || 0,
            hardSolved: lcRes.data.hardSolved || 0,
          });
          anySuccess = true;
        }
      } catch (lcErr) {
        console.warn('LeetCode primary API failed, trying fallback...', lcErr.message);
        try {
          const lcRes2 = await axios.get(`/leetcode-api/${editHandles.leetcode}`);
          if (lcRes2.data && (lcRes2.data.totalSolved !== undefined || lcRes2.data.solvedProblem !== undefined)) {
            updateLeetcodeData({
              totalSolved: lcRes2.data.totalSolved || lcRes2.data.solvedProblem || 0,
              easySolved: lcRes2.data.easySolved || 0,
              mediumSolved: lcRes2.data.mediumSolved || 0,
              hardSolved: lcRes2.data.hardSolved || 0,
            });
            anySuccess = true;
          }
        } catch (lcErr2) {
          console.warn('LeetCode fallback also failed:', lcErr2.message);
        }
      }

      // Fetch LeetCode streak from calendar endpoint
      try {
        const calRes = await axios.get(`/leetcode-api/${editHandles.leetcode}/calendar`);
        if (calRes.data) {
          updateLeetcodeStreak({
            streak: calRes.data.streak || 0,
            totalActiveDays: calRes.data.totalActiveDays || 0,
            submissionCalendar: calRes.data.submissionCalendar || '{}',
          });
        }
      } catch (calErr) {
        console.warn('LeetCode calendar fetch failed:', calErr.message);
      }
    }

    updateHandles(editHandles);
    if (anySuccess) {
      recordStreakDay();
    }
    setShowModal(false);
    setLoading(false);
  };

  const githubChartData = githubData ? [
    { name: 'Repos', count: githubData.publicRepos },
    { name: 'Followers', count: githubData.followers },
    { name: 'Score', count: Math.round(githubData.reliabilityScore) },
  ] : [
    { name: 'Mon', count: 4 }, { name: 'Tue', count: 7 }, { name: 'Wed', count: 5 },
    { name: 'Thu', count: 12 }, { name: 'Fri', count: 8 }, { name: 'Sat', count: 15 }, { name: 'Sun', count: 10 },
  ];

  const lcPieData = leetcodeData ? [
    { name: 'Solved', value: leetcodeData.totalSolved, color: '#8b5cf6' },
    { name: 'Remaining', value: Math.max(0, 2500 - leetcodeData.totalSolved), color: '#1e293b' },
  ] : [
    { name: 'Solved', value: 0, color: '#8b5cf6' },
    { name: 'Total', value: 2500, color: '#1e293b' },
  ];

  return (
    <div className="dashboard-container">
      <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800' }}>
            {githubData?.name ? `Hey, ${githubData.name} 👋` : 'Dashboard'}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {githubData ? 'Your career stats at a glance' : 'Connect your profiles to see real-time data'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setEditHandles({ ...handles }); setShowModal(true); }}>
          <LinkIcon size={16} />
          {githubData || leetcodeData ? 'Update Profiles' : 'Connect Profiles'}
        </button>
      </div>

      <div className="dashboard-grid">
        <StreakCard />

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Hiring Probability</h3>
            <Target size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {hiringProb}%
          </div>
          <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${hiringProb}%` }}
              transition={{ duration: 1 }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', borderRadius: '4px' }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.75rem' }}>
            {hiringProb >= 70 ? '🎯 Strong candidate!' : hiringProb >= 40 ? '📈 Building momentum' : '🌱 Connect profiles to boost'}
          </p>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <Code size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '0.9rem' }}>{handles.github ? `@${handles.github}` : 'GitHub Stats'}</h3>
          </div>
          <div style={{ height: '150px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={githubChartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCount)" />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {!githubData && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '0.5rem' }}>
              Connect GitHub to see real data
            </p>
          )}
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <Code size={18} color="var(--secondary)" />
            <h3 style={{ fontSize: '0.9rem' }}>LeetCode Progress</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', position: 'relative' }}>
            <PieChart width={150} height={150}>
              <Pie data={lcPieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                {lcPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                {leetcodeData ? leetcodeData.totalSolved : '—'}
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Solved</div>
            </div>
          </div>
          {leetcodeData && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.7rem', marginTop: '0.5rem' }}>
              <span style={{ color: '#4ade80' }}>E: {leetcodeData.easySolved}</span>
              <span style={{ color: '#fbbf24' }}>M: {leetcodeData.mediumSolved}</span>
              <span style={{ color: '#f87171' }}>H: {leetcodeData.hardSolved}</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Profile Connect Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}>
            <motion.div
              className="glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ width: '420px', maxWidth: '90vw' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3>Connect Profiles</h3>
                <X style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>GitHub Username</label>
                  <input
                    type="text"
                    placeholder="e.g. octocat"
                    style={{
                      width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white',
                    }}
                    value={editHandles.github}
                    onChange={(e) => setEditHandles(prev => ({ ...prev, github: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>LeetCode Username</label>
                  <input
                    type="text"
                    placeholder="e.g. leetcoder123"
                    style={{
                      width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white',
                    }}
                    value={editHandles.leetcode}
                    onChange={(e) => setEditHandles(prev => ({ ...prev, leetcode: e.target.value }))}
                  />
                </div>
                <button className="btn-primary" onClick={fetchStats} disabled={loading} style={{ marginTop: '0.5rem' }}>
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Syncing...</>
                  ) : 'Sync Profiles'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
