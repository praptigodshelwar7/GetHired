import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Target, Trophy, ChevronDown, Flame, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useUser } from '../context/UserContext';
import { useEffect } from 'react';

const COMPANY_DATA = {
  'Google': { 
    required: 450, 
    color: '#4285F4', 
    focus: ['DP', 'Graphs', 'Binary Search', 'System Design'],
    suggestions: [
      { q: 'Longest Palindromic Substring', topic: 'DP' },
      { q: 'Course Schedule II', topic: 'Graphs' },
      { q: 'Find First and Last Position of Element', topic: 'Binary Search' },
      { q: 'Word Ladder', topic: 'Graphs' }
    ]
  },
  'Amazon': { 
    required: 350, 
    color: '#FF9900', 
    focus: ['Arrays', 'Trees', 'BFS/DFS', 'OOP Design'],
    suggestions: [
      { q: 'Number of Islands', topic: 'Graphs/BFS' },
      { q: 'Merge k Sorted Lists', topic: 'Heaps' },
      { q: 'Binary Tree Level Order Traversal', topic: 'Trees' },
      { q: 'Trapping Rain Water', topic: 'Two Pointers' }
    ]
  },
  'Meta': { 
    required: 400, 
    color: '#1877F2', 
    focus: ['Graphs', 'Recursion', 'Sliding Window', 'DP'],
    suggestions: [
      { q: 'Subarray Sum Equals K', topic: 'Hash Map' },
      { q: 'Minimum Window Substring', topic: 'Sliding Window' },
      { q: 'Lowest Common Ancestor', topic: 'Trees' },
      { q: 'Vertical Order Traversal', topic: 'Trees' }
    ]
  },
  'Microsoft': { 
    required: 300, 
    color: '#00A4EF', 
    focus: ['Arrays', 'Trees', 'Strings', 'System Design'],
    suggestions: [
      { q: 'Valid Parentheses', topic: 'Stack' },
      { q: 'Reverse Linked List', topic: 'Linked List' },
      { q: 'Group Anagrams', topic: 'Strings' },
      { q: 'Binary Tree Inorder Traversal', topic: 'Trees' }
    ]
  },
  'Startup': { 
    required: 150, 
    color: '#10b981', 
    focus: ['Full Stack', 'APIs', 'Arrays', 'Strings'],
    suggestions: [
      { q: 'Two Sum', topic: 'Arrays' },
      { q: 'Valid Palindrome', topic: 'Strings' },
      { q: 'Best Time to Buy and Sell Stock', topic: 'Arrays' },
      { q: 'Maximum Subarray', topic: 'Arrays' }
    ]
  },
};

const REVISION_POOL = [
  { q: 'Two Sum', topic: 'Arrays', difficulty: 'Easy' },
  { q: 'Reverse Linked List', topic: 'Linked List', difficulty: 'Easy' },
  { q: 'Valid Anagram', topic: 'Strings', difficulty: 'Easy' },
  { q: 'Binary Search', topic: 'Binary Search', difficulty: 'Easy' },
  { q: 'Climbing Stairs', topic: 'DP', difficulty: 'Easy' },
  { q: 'Merge Two Sorted Lists', topic: 'Linked List', difficulty: 'Easy' },
  { q: 'Maximum Depth of Binary Tree', topic: 'Trees', difficulty: 'Easy' },
  { q: 'Invert Binary Tree', topic: 'Trees', difficulty: 'Easy' },
  { q: 'Best Time to Buy and Sell Stock', topic: 'Arrays', difficulty: 'Easy' },
  { q: 'Linked List Cycle', topic: 'Linked List', difficulty: 'Easy' },
  { q: 'Coin Change', topic: 'DP', difficulty: 'Medium' },
  { q: '3Sum', topic: 'Arrays', difficulty: 'Medium' },
  { q: 'Group Anagrams', topic: 'Strings', difficulty: 'Medium' },
  { q: 'Binary Tree Level Order Traversal', topic: 'Trees', difficulty: 'Medium' },
  { q: 'Search in Rotated Sorted Array', topic: 'Binary Search', difficulty: 'Medium' },
  { q: 'Number of Islands', topic: 'Graphs', difficulty: 'Medium' },
  { q: 'Jump Game', topic: 'Arrays', difficulty: 'Medium' },
  { q: 'Top K Frequent Elements', topic: 'Heaps', difficulty: 'Medium' },
  { q: 'Validate Binary Search Tree', topic: 'Trees', difficulty: 'Medium' },
  { q: 'Product of Array Except Self', topic: 'Arrays', difficulty: 'Medium' },
  { q: 'House Robber', topic: 'DP', difficulty: 'Medium' },
  { q: 'Course Schedule', topic: 'Graphs', difficulty: 'Medium' },
  { q: 'LRU Cache', topic: 'Design', difficulty: 'Medium' },
  { q: 'Container With Most Water', topic: 'Two Pointers', difficulty: 'Medium' },
  { q: 'Longest Substring Without Repeating Characters', topic: 'Sliding Window', difficulty: 'Medium' },
];

const DSATracker = () => {
  const { leetcodeData, dsaProgress, updateDSAProgress, recordStreakDay } = useUser();
  const [selectedCompany, setSelectedCompany] = useState(dsaProgress.targetCompany || 'Google');
  const [manualSolved, setManualSolved] = useState('');
  const [dailyRevision, setDailyRevision] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('daily_revision');
    const storedData = stored ? JSON.parse(stored) : null;

    if (storedData && storedData.date === today) {
      setDailyRevision(storedData.questions);
      setCompletedToday(storedData.completed || []);
    } else {
      // Pick 3 random questions from pool
      const shuffled = [...REVISION_POOL].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      const newData = { date: today, questions: selected, completed: [] };
      localStorage.setItem('daily_revision', JSON.stringify(newData));
      setDailyRevision(selected);
      setCompletedToday([]);
    }
  }, []);

  const toggleComplete = (qName) => {
    const newCompleted = completedToday.includes(qName)
      ? completedToday.filter(n => n !== qName)
      : [...completedToday, qName];
    
    setCompletedToday(newCompleted);
    const stored = JSON.parse(localStorage.getItem('daily_revision'));
    localStorage.setItem('daily_revision', JSON.stringify({ ...stored, completed: newCompleted }));
    
    if (newCompleted.length > completedToday.length) {
      recordStreakDay();
    }
  };

  const totalSolved = leetcodeData?.totalSolved || dsaProgress.solved || 0;
  const easySolved = leetcodeData?.easySolved || 0;
  const mediumSolved = leetcodeData?.mediumSolved || 0;
  const hardSolved = leetcodeData?.hardSolved || 0;

  const companyInfo = COMPANY_DATA[selectedCompany];
  const progress = Math.min(100, Math.round((totalSolved / companyInfo.required) * 100));
  const remaining = Math.max(0, companyInfo.required - totalSolved);

  const difficultyData = [
    { name: 'Easy', solved: easySolved, total: 800, color: '#4ade80' },
    { name: 'Medium', solved: mediumSolved, total: 1700, color: '#fbbf24' },
    { name: 'Hard', solved: hardSolved, total: 600, color: '#f87171' },
  ];

  const companyCompare = Object.entries(COMPANY_DATA).map(([name, data]) => ({
    name,
    required: data.required,
    solved: Math.min(totalSolved, data.required),
    gap: Math.max(0, data.required - totalSolved),
  }));

  const getStatus = () => {
    if (progress >= 100) return { text: 'Interview Ready! 🎯', color: '#10b981' };
    if (progress >= 70) return { text: 'Strong Foundation 💪', color: '#06b6d4' };
    if (progress >= 40) return { text: 'Building Momentum 📈', color: '#fbbf24' };
    return { text: 'Getting Started 🌱', color: '#f87171' };
  };

  const status = getStatus();

  const handleManualUpdate = () => {
    const num = parseInt(manualSolved);
    if (!isNaN(num) && num > 0) {
      updateDSAProgress({ solved: num, targetCompany: selectedCompany });
      recordStreakDay();
      setManualSolved('');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          DSA Progress Tracker
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'var(--text-dim)', margin: 0 }}>
            Track your problem-solving journey against company-specific hiring bars
          </p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1rem', 
            background: 'rgba(16, 185, 129, 0.1)', 
            borderRadius: '2rem',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '0.8rem',
            color: '#10b981',
            fontWeight: '600'
          }}>
            <RefreshCw size={14} className={completedToday.length === 3 ? '' : 'animate-spin-slow'} />
            Daily Goal: {completedToday.length}/3 Completed
          </div>
        </div>
      </motion.div>

      {/* Company Selector */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '2rem', padding: 0 }}>
        {Object.entries(COMPANY_DATA).map(([name, data], idx) => (
          <motion.div
            key={name}
            className={`glass-card ${selectedCompany === name ? 'card-active' : ''}`}
            onClick={() => {
              setSelectedCompany(name);
              updateDSAProgress({ targetCompany: name });
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              padding: '1rem',
              border: selectedCompany === name ? `2px solid ${data.color}` : '1px solid var(--border)',
              background: selectedCompany === name ? `${data.color}11` : 'var(--card-bg)',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: data.color }}>{name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>{data.required} problems</div>
          </motion.div>
        ))}
      </div>

      {/* Daily Revision Section */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(6, 182, 212, 0.05))' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={20} color="#8b5cf6" />
              Daily Revision Tasks
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Handpicked problems to keep your core topics fresh. Resets in 24h.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {dailyRevision.map((item, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '1rem',
              background: completedToday.includes(item.q) ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
              borderRadius: '0.75rem',
              border: completedToday.includes(item.q) ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border)',
              transition: 'all 0.3s ease'
            }}>
              <div 
                onClick={() => toggleComplete(item.q)}
                style={{ 
                  cursor: 'pointer',
                  color: completedToday.includes(item.q) ? '#10b981' : 'var(--text-dim)',
                  transition: 'transform 0.2s ease'
                }}
              >
                {completedToday.includes(item.q) ? <CheckCircle2 size={24} /> : <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border)' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600',
                  textDecoration: completedToday.includes(item.q) ? 'line-through' : 'none',
                  color: completedToday.includes(item.q) ? 'var(--text-dim)' : 'white'
                }}>
                  {item.q}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    {item.topic}
                  </span>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    color: item.difficulty === 'Easy' ? '#4ade80' : item.difficulty === 'Medium' ? '#fbbf24' : '#f87171',
                    fontWeight: 'bold'
                  }}>
                    {item.difficulty}
                  </span>
                </div>
              </div>
              <a 
                href={`https://leetcode.com/problems/${item.q.toLowerCase().replace(/ /g, '-')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '0.5rem' }}
              >
                Solve ↗
              </a>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="dashboard-grid" style={{ padding: 0 }}>
        {/* Main Progress Card */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ gridColumn: 'span 2' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>Progress for {selectedCompany}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {companyInfo.focus.map(f => (
                  <span key={f} style={{ 
                    fontSize: '0.7rem', 
                    padding: '0.2rem 0.5rem', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '4px',
                    border: '1px solid var(--border)'
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              background: `${status.color}22`,
              color: status.color,
              border: `1px solid ${status.color}44`
            }}>
              {status.text}
            </div>
          </div>

          {/* Big Numbers */}
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: 1 }}>{totalSolved}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Solved</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: 1, color: 'var(--text-dim)' }}>{companyInfo.required}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Required</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: 1, color: remaining > 0 ? '#f87171' : '#10b981' }}>{remaining}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Remaining</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{progress}% Complete</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${companyInfo.color}, ${companyInfo.color}aa)`,
                  borderRadius: '6px',
                }}
              />
            </div>
          </div>

          {/* Manual Update */}
          {!leetcodeData && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <input
                type="number"
                placeholder="Total problems solved"
                value={manualSolved}
                onChange={e => setManualSolved(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.85rem',
                }}
              />
              <button className="btn-primary" onClick={handleManualUpdate} style={{ padding: '0.6rem 1.2rem' }}>
                Update
              </button>
            </div>
          )}
        </motion.div>

        {/* Difficulty Breakdown */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 style={{ marginBottom: '1rem' }}>Difficulty Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {difficultyData.map(d => (
              <div key={d.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.85rem', color: d.color, fontWeight: '600' }}>{d.name}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{d.solved}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (d.solved / (d.total * 0.3)) * 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{ height: '100%', background: d.color, borderRadius: '4px' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pie Summary */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <PieChart width={160} height={160}>
              <Pie
                data={difficultyData.map(d => ({ name: d.name, value: d.solved || 1 }))}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {difficultyData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </div>
        </motion.div>

        {/* Company Comparison Chart */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ gridColumn: 'span 2' }}
        >
          <h3 style={{ marginBottom: '1rem' }}>
            <TrendingUp size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Company Comparison
          </h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyCompare} barGap={8}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="solved" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Your Progress" />
                <Bar dataKey="gap" fill="#1e293b" radius={[4, 4, 0, 0]} name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        {/* Recommendations Section */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ gridColumn: 'span 2' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} color="#8b5cf6" />
              Focus Areas & Suggestions
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Based on {selectedCompany} Hiring Bar
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {/* Topic Focus */}
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-dim)' }}>Priority Topics</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {companyInfo.focus.map((topic, i) => (
                  <div key={topic} style={{ 
                    padding: '0.75rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '0.5rem',
                    borderLeft: `3px solid ${i === 0 ? '#ef4444' : i === 1 ? '#fbbf24' : '#06b6d4'}`
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{topic}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                      {i === 0 ? 'High Priority: Frequent in recent interviews' : 'Essential: Core requirement for this role'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions to Solve */}
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-dim)' }}>Questions for you</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {companyInfo.suggestions.map((item, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.q}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{item.topic}</div>
                    </div>
                    <a 
                      href={`https://leetcode.com/problems/${item.q.toLowerCase().replace(/ /g, '-')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        fontSize: '0.7rem', 
                        color: '#8b5cf6', 
                        textDecoration: 'none',
                        padding: '0.2rem 0.5rem',
                        border: '1px solid #8b5cf6',
                        borderRadius: '4px'
                      }}
                    >
                      Solve ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        {/* Tips Card */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 style={{ marginBottom: '1rem' }}>
            <Trophy size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#fbbf24' }} />
            Pro Tips
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Flame size={14} color="#f97316" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Solve at least 3 problems daily to maintain interview readiness</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Flame size={14} color="#f97316" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Focus on Medium difficulty — they make up 60% of real interviews</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Flame size={14} color="#f97316" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Practice {companyInfo.focus.join(', ')} for {selectedCompany}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Flame size={14} color="#f97316" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>Revisit solved problems weekly to solidify patterns</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DSATracker;
