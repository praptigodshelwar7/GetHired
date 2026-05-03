import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';

const StreakCard = () => {
  const { leetcodeStreak, streakDays, getStreakCount } = useUser();

  // Use LeetCode streak if available, otherwise fall back to local tracking
  const streak = leetcodeStreak?.streak ?? getStreakCount();
  const totalActiveDays = leetcodeStreak?.totalActiveDays ?? streakDays.length;
  const source = leetcodeStreak ? 'LeetCode' : 'Local';

  // Generate day names dynamically for the last 7 days
  const days = useMemo(() => {
    const today = new Date();
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      result.push(dayNames[d.getDay()]);
    }
    return result;
  }, []);

  // Parse submission calendar from LeetCode to get last 7 days activity
  const activeDays = useMemo(() => {
    const today = new Date();
    const result = [];

    if (leetcodeStreak?.submissionCalendar) {
      try {
        const calendar = typeof leetcodeStreak.submissionCalendar === 'string'
          ? JSON.parse(leetcodeStreak.submissionCalendar)
          : leetcodeStreak.submissionCalendar;

        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          // LeetCode calendar uses UTC midnight Unix timestamps (seconds) as keys
          const dayStart = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 1000);
          result.push(!!calendar[dayStart.toString()]);
        }
        return result;
      } catch (e) {
        console.warn('Failed to parse submission calendar', e);
      }
    }

    // Fallback to local streakDays
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      result.push(streakDays.includes(dateStr));
    }
    return result;
  }, [leetcodeStreak, streakDays]);

  const level = streak >= 30 ? 5 : streak >= 14 ? 4 : streak >= 7 ? 3 : streak >= 3 ? 2 : streak >= 1 ? 1 : 0;
  const nextGoal = streak < 3 ? 3 : streak < 7 ? 7 : streak < 14 ? 14 : streak < 30 ? 30 : 60;

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(249, 115, 22, 0.08))' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flame color="#ef4444" fill="#ef4444" size={22} />
          <h3 style={{ fontSize: '1.1rem' }}>Coding Streak</h3>
        </div>
        <div style={{
          background: level > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100,116,139,0.2)',
          padding: '0.2rem 0.6rem', borderRadius: '1rem',
          fontSize: '0.7rem', color: level > 0 ? '#ef4444' : '#64748b', fontWeight: 'bold',
        }}>
          LEVEL {level}
        </div>
      </div>

      <div style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1 }}>
        {streak} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: '500' }}>Day{streak !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        {days.map((day, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: activeDays[i] ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '0.25rem',
              boxShadow: activeDays[i] ? '0 0 12px rgba(239, 68, 68, 0.4)' : 'none',
              transition: 'all 0.3s ease',
            }}>
              {activeDays[i] && <Trophy size={12} color="white" />}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{day}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Calendar size={13} />
          <span>Next Goal: {nextGoal} Days</span>
        </div>
        {totalActiveDays > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Zap size={13} color="#fbbf24" />
            <span>{totalActiveDays} total active days</span>
          </div>
        )}
        <div style={{
          marginLeft: 'auto',
          background: 'rgba(139, 92, 246, 0.15)',
          padding: '0.1rem 0.5rem', borderRadius: '0.5rem',
          fontSize: '0.65rem', color: '#a78bfa',
        }}>
          via {source}
        </div>
      </div>
    </motion.div>
  );
};

export default StreakCard;
