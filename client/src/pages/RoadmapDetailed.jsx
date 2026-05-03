import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Code, Database, Globe, Layers, Terminal, ChevronDown, AlertCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';

const RoadmapTopic = ({ topic }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      style={{
        padding: '1rem',
        background: topic.isGap ? 'rgba(248, 113, 113, 0.05)' : 'rgba(255,255,255,0.03)',
        borderRadius: '1rem',
        border: topic.isGap ? '1px solid rgba(248, 113, 113, 0.2)' : '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {topic.isGap && <AlertCircle size={14} color="#f87171" />}
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{topic.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatusBadge status={topic.status} />
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown size={14} color="var(--text-dim)" />
          </motion.div>
        </div>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{topic.detail}</p>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginBottom: '0.25rem', fontWeight: '600' }}>
                Recommended Resources:
              </div>
              <ul style={{ fontSize: '0.75rem', color: 'var(--text-dim)', paddingLeft: '1rem', margin: 0, lineHeight: 1.8 }}>
                {topic.resources ? topic.resources.map((r, i) => (
                  <li key={i}>{r}</li>
                )) : (
                  <>
                    <li>Official Documentation</li>
                    <li>Guided Roadmap on Roadmap.sh</li>
                    <li>Practice Problems (Topic-wise)</li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    completed: '#10b981',
    'in-progress': '#f59e0b',
    pending: '#64748b',
    gap: '#f87171',
  };
  return (
    <span style={{
      fontSize: '0.6rem',
      padding: '0.15rem 0.5rem',
      borderRadius: '0.4rem',
      background: `${colors[status]}22`,
      color: colors[status],
      border: `1px solid ${colors[status]}44`,
      fontWeight: '600',
    }}>
      {status === 'gap' ? 'SKILL GAP' : status.toUpperCase()}
    </span>
  );
};

const RoadmapDetailed = () => {
  const { analysisResult, targetRole } = useUser();
  const missingSkills = analysisResult?.missingSkills || [];

  // Build personalized sections based on gap analysis
  const buildSections = () => {
    const base = [
      {
        title: 'Phase 1: Foundation (Month 1-2)',
        icon: <Terminal size={24} color="#8b5cf6" />,
        topics: [
          { name: 'Data Structures', detail: 'Arrays, Linked Lists, Stacks, Queues — the building blocks', status: missingSkills.includes('Data Structures') ? 'gap' : 'completed', isGap: missingSkills.includes('Data Structures'), resources: ['NeetCode 150', 'Striver A2Z DSA Sheet', 'LeetCode Easy Collection'] },
          { name: 'Algorithms', detail: 'Sorting, Searching, Complexity Analysis, Two Pointers', status: missingSkills.includes('Algorithms') ? 'gap' : 'completed', isGap: missingSkills.includes('Algorithms'), resources: ['Abdul Bari Algorithm Series', 'CLRS Textbook', 'Codeforces Problemset'] },
          { name: 'Web Basics', detail: 'HTML5, CSS3 (Modern layouts), JavaScript ES6+', status: (missingSkills.includes('HTML') || missingSkills.includes('CSS') || missingSkills.includes('JavaScript')) ? 'gap' : 'completed', isGap: missingSkills.includes('HTML') || missingSkills.includes('CSS') || missingSkills.includes('JavaScript'), resources: ['MDN Web Docs', 'freeCodeCamp', 'JavaScript.info'] },
        ]
      },
      {
        title: 'Phase 2: Deep Dive (Month 3-4)',
        icon: <Code size={24} color="#06b6d4" />,
        topics: [
          { name: 'Advanced DSA', detail: 'Trees, Graphs, Dynamic Programming, Greedy', status: 'in-progress', isGap: false, resources: ['NeetCode Roadmap', 'LeetCode Medium/Hard Collection', 'DP Patterns Guide'] },
          { name: 'Backend Mastery', detail: 'Java/Spring Boot, REST APIs, Authentication, Testing', status: missingSkills.includes('SpringBoot') || missingSkills.includes('Java') ? 'gap' : 'pending', isGap: missingSkills.includes('SpringBoot') || missingSkills.includes('Java'), resources: ['Spring Boot Official Guides', 'Baeldung Tutorials', 'Telusko YouTube'] },
          { name: 'System Design', detail: 'HLD, LLD, Database Indexing, Caching, Load Balancing', status: missingSkills.includes('System Design') ? 'gap' : 'pending', isGap: missingSkills.includes('System Design'), resources: ['System Design Primer (GitHub)', 'Grokking System Design', 'Alex Xu - System Design Interview'] },
        ]
      },
      {
        title: 'Phase 3: Production Ready (Month 5-6)',
        icon: <Layers size={24} color="#10b981" />,
        topics: [
          { name: 'DevOps & Cloud', detail: 'Docker, Kubernetes, AWS/Azure Basics, CI/CD', status: missingSkills.includes('Docker') || missingSkills.includes('Kubernetes') ? 'gap' : 'pending', isGap: missingSkills.includes('Docker') || missingSkills.includes('Kubernetes'), resources: ['Docker Official Getting Started', 'KodeKloud', 'AWS Free Tier Labs'] },
          { name: 'Projects', detail: 'Full Stack Capstone with Microservices architecture', status: missingSkills.includes('Microservices') ? 'gap' : 'pending', isGap: missingSkills.includes('Microservices'), resources: ['Build a real SaaS product', 'Contribute to Open Source', 'Create portfolio on GitHub'] },
          { name: 'Interview Prep', detail: 'Mock Interviews, OS, Networking, DBMS, Behavioral', status: 'pending', isGap: false, resources: ['Pramp (Free Mock Interviews)', 'InterviewBit', 'STAR Method for Behavioral'] },
        ]
      },
    ];

    // Add role-specific topics
    if (targetRole === 'Data Scientist') {
      base[1].topics.push({
        name: 'Machine Learning',
        detail: 'Supervised & Unsupervised Learning, Neural Networks, Feature Engineering',
        status: missingSkills.includes('Machine Learning') || missingSkills.includes('TensorFlow') || missingSkills.includes('PyTorch') ? 'gap' : 'pending',
        isGap: missingSkills.includes('Machine Learning') || missingSkills.includes('TensorFlow') || missingSkills.includes('PyTorch'),
        resources: ['Andrew Ng ML Course (Coursera)', 'Kaggle Learn', 'fast.ai Practical Deep Learning'],
      });
    }

    if (targetRole === 'Frontend Dev') {
      base[1].topics[1] = {
        name: 'React Ecosystem',
        detail: 'React, Redux/Zustand, TypeScript, Next.js, Testing',
        status: missingSkills.includes('React') || missingSkills.includes('TypeScript') || missingSkills.includes('Next.js') ? 'gap' : 'pending',
        isGap: missingSkills.includes('React') || missingSkills.includes('TypeScript') || missingSkills.includes('Next.js'),
        resources: ['React Official Docs', 'TypeScript Handbook', 'Next.js Learn Course'],
      };
    }

    return base;
  };

  const sections = buildSections();
  const gapCount = sections.reduce((acc, s) => acc + s.topics.filter(t => t.isGap).length, 0);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {targetRole} Career Roadmap 2026
        </h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          Personalized based on your gap analysis
        </p>
        {gapCount > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.75rem',
            background: 'rgba(248, 113, 113, 0.1)', color: '#f87171',
            border: '1px solid rgba(248, 113, 113, 0.2)', fontWeight: '600',
            marginBottom: '1.5rem',
          }}>
            <AlertCircle size={12} />
            {gapCount} skill gap{gapCount > 1 ? 's' : ''} detected — highlighted below
          </div>
        )}
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {sections.map((section, idx) => (
          <motion.div
            key={idx}
            className="glass-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                {section.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem' }}>{section.title}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {section.topics.map((topic, tidx) => (
                <RoadmapTopic key={tidx} topic={topic} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {!analysisResult && (
        <motion.div
          className="glass-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem', background: 'rgba(139, 92, 246, 0.05)' }}
        >
          <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>
            💡 Run a <strong>Gap Analysis</strong> first to see a personalized roadmap with your skill gaps highlighted
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default RoadmapDetailed;
