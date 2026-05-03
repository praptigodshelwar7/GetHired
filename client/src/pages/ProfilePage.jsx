import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Code, BarChart3, FileText, Target, Download, Trash2, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const ProfilePage = () => {
  const {
    handles,
    githubData,
    leetcodeData,
    leetcodeStreak,
    analysisResult,
    targetRole,
    updateHandles,
    updateGithubData,
    updateLeetcodeData,
    updateLeetcodeStreak,
    updateTargetRole,
    getHiringProbability,
    getStreakCount,
    streakDays,
  } = useUser();

  const [editHandles, setEditHandles] = useState({ ...handles });
  const [editRole, setEditRole] = useState(targetRole);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  React.useEffect(() => {
    setEditHandles(handles);
  }, [handles]);

  React.useEffect(() => {
    setEditRole(targetRole);
  }, [targetRole]);

  const hiringProb = getHiringProbability();
  const streak = leetcodeStreak?.streak ?? getStreakCount();
  const totalActiveDays = leetcodeStreak?.totalActiveDays ?? streakDays.length;

  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    updateHandles(editHandles);
    updateTargetRole(editRole);

    // GitHub sync — independent
    if (editHandles.github) {
      try {
        const response = await fetch(`https://api.github.com/users/${editHandles.github}`);
        if (!response.ok) throw new Error('GitHub API failed');
        const data = await response.json();
        updateGithubData({
          publicRepos: data.public_repos,
          followers: data.followers,
          avatar: data.avatar_url,
          bio: data.bio,
          name: data.name,
          reliabilityScore: Math.min(100, (data.public_repos * 5) + (data.followers * 2)),
        });
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
        }
      } catch (lcErr) {
        console.warn('LeetCode primary failed, trying fallback...', lcErr.message);
        try {
          const lcRes2 = await axios.get(`/leetcode-api/${editHandles.leetcode}`);
          if (lcRes2.data && (lcRes2.data.totalSolved !== undefined || lcRes2.data.solvedProblem !== undefined)) {
            updateLeetcodeData({
              totalSolved: lcRes2.data.totalSolved || lcRes2.data.solvedProblem || 0,
              easySolved: lcRes2.data.easySolved || 0,
              mediumSolved: lcRes2.data.mediumSolved || 0,
              hardSolved: lcRes2.data.hardSolved || 0,
            });
          }
        } catch (lcErr2) {
          console.warn('LeetCode fallback also failed:', lcErr2.message);
        }
      }
    }

    // Fetch LeetCode streak from calendar endpoint
    if (editHandles.leetcode) {
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

    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
    setSyncing(false);
  };

  const handleExport = () => {
    const profile = {
      handles,
      targetRole,
      githubData,
      leetcodeData,
      analysisResult,
      hiringProbability: hiringProb,
      streakCount: streak,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GetHired_Profile_${handles.github || 'user'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('This will clear all your saved data. Are you sure?')) {
      localStorage.removeItem('gethired_user');
      window.location.reload();
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '1.25rem' }}
    >
      <Icon size={20} color={color} style={{ marginBottom: '0.5rem' }} />
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>{sub}</div>}
    </motion.div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Your Profile
        </h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
          Manage your connected accounts and view your overall readiness
        </p>
      </motion.div>

      {/* Avatar + Overall Score */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}
      >
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: githubData?.avatar
            ? `url(${githubData.avatar}) center/cover`
            : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', flexShrink: 0,
        }}>
          {!githubData?.avatar && <UserCircle size={40} />}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>
            {githubData?.name || handles.github || 'Connect your profiles'}
          </h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            {githubData?.bio || `Target: ${targetRole}`}
          </p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            {handles.github && <span>🐙 @{handles.github}</span>}
            {handles.leetcode && <span>💻 @{handles.leetcode}</span>}
            <span>🎯 {targetRole}</span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: hiringProb >= 70 ? '#10b981' : hiringProb >= 40 ? '#fbbf24' : '#f87171' }}>
            {hiringProb}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Hiring Probability</div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={Code} label="Repos" value={githubData?.publicRepos || 0} color="#8b5cf6" />
        <StatCard icon={BarChart3} label="LC Solved" value={leetcodeData?.totalSolved || 0} color="#06b6d4" />
        <StatCard icon={FileText} label="Resume Score" value={analysisResult ? `${analysisResult.score}%` : '—'} color="#10b981" />
        <StatCard 
          icon={Target} 
          label="Streak" 
          value={`${streak} 🔥`} 
          color="#f97316" 
          sub={`${totalActiveDays} total days ${leetcodeStreak ? '(LeetCode)' : '(Local)'}`} 
        />
      </div>

      {/* Edit Profiles */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '2rem' }}
      >
        <h3 style={{ marginBottom: '1.5rem' }}>
          <LinkIcon size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Connected Accounts
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>GitHub Username</label>
            <input
              type="text"
              value={editHandles.github}
              onChange={e => setEditHandles(prev => ({ ...prev, github: e.target.value }))}
              placeholder="e.g. octocat"
              style={{
                width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white', fontSize: '0.85rem',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>LeetCode Username</label>
            <input
              type="text"
              value={editHandles.leetcode}
              onChange={e => setEditHandles(prev => ({ ...prev, leetcode: e.target.value }))}
              placeholder="e.g. leetcoder123"
              style={{
                width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white', fontSize: '0.85rem',
              }}
            />
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>Target Role</label>
          <select
            value={editRole}
            onChange={e => setEditRole(e.target.value)}
            style={{
              width: '100%', padding: '0.7rem', background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white', fontSize: '0.85rem',
            }}
          >
            <option value="SDE">Software Development Engineer (SDE)</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Frontend Dev">Frontend Developer</option>
            <option value="AI/ML Engineer">AI/ML Engineer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
          </select>
        </div>
        <button className="btn-primary" onClick={handleSync} disabled={syncing} style={{ width: '100%' }}>
          {syncing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Loader2 size={16} className="animate-spin" /> Syncing...
            </span>
          ) : syncSuccess ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <Check size={16} /> Synced Successfully!
            </span>
          ) : (
            'Sync Profiles'
          )}
        </button>
      </motion.div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          className="btn-outline"
          onClick={handleExport}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Download size={16} /> Export Profile
        </button>
        <button
          onClick={handleClear}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem', padding: '0.75rem 1.5rem', color: '#f87171',
            cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
          }}
        >
          <Trash2 size={16} /> Clear All Data
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
