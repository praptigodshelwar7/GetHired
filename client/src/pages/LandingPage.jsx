import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Search, BarChart3, Map, ArrowRight, Code, FileText, Target } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    className="glass-card landing-feature-card"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="landing-feature-icon">
      <Icon size={24} />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
  </motion.div>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <motion.div
          className="landing-hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="landing-badge">
            <Zap size={14} />
            <span>AI-Powered Career Intelligence</span>
          </div>
          <h1 className="landing-title">
            <span className="gradient-text-hero">Bridge the Gap</span>
            <br />
            Between You & Your Dream Job
          </h1>
          <p className="landing-subtitle">
            Track your GitHub, LeetCode, and resume alignment in real-time. 
            Get a personalized roadmap to increase your hiring probability at top companies.
          </p>
          <div className="landing-cta-group">
            <button
              className="btn-primary btn-lg landing-cta"
              onClick={() => navigate('/dashboard')}
            >
              Get Started <ArrowRight size={18} />
            </button>
            <button
              className="btn-outline btn-lg"
              onClick={() => navigate('/analysis')}
            >
              Analyze Resume
            </button>
          </div>
        </motion.div>

        {/* Floating Stats Cards */}
        <motion.div
          className="landing-hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="landing-stats-grid">
            <div className="glass-card landing-stat-card">
              <div className="landing-stat-value gradient-text">86%</div>
              <div className="landing-stat-label">Hiring Probability</div>
              <div className="landing-stat-bar">
                <motion.div
                  className="landing-stat-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: '86%' }}
                  transition={{ delay: 0.8, duration: 1 }}
                />
              </div>
            </div>
            <div className="glass-card landing-stat-card">
              <div className="landing-stat-value" style={{ color: '#10b981' }}>352</div>
              <div className="landing-stat-label">LeetCode Solved</div>
              <div className="landing-stat-detail">
                <span style={{ color: '#4ade80' }}>Easy 180</span>
                <span style={{ color: '#fbbf24' }}>Med 130</span>
                <span style={{ color: '#f87171' }}>Hard 42</span>
              </div>
            </div>
            <div className="glass-card landing-stat-card">
              <div className="landing-stat-value" style={{ color: '#8b5cf6' }}>7 🔥</div>
              <div className="landing-stat-label">Day Streak</div>
            </div>
            <div className="glass-card landing-stat-card">
              <div className="landing-stat-value" style={{ color: '#06b6d4' }}>SDE</div>
              <div className="landing-stat-label">Target Role</div>
              <div className="landing-stat-detail">
                <span>Google · Amazon · Meta</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <motion.h2
          className="landing-section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Everything You Need to <span className="gradient-text">Get Hired</span>
        </motion.h2>
        <div className="landing-features-grid">
          <FeatureCard
            icon={Code}
            title="Profile Tracing"
            description="Connect GitHub & LeetCode to track your coding activity, repos, contributions, and problem-solving stats in real-time."
            delay={0.1}
          />
          <FeatureCard
            icon={FileText}
            title="Resume Alignment"
            description="Upload your resume as PDF. We parse it and match skills against your target role — SDE, Data Scientist, or Frontend Dev."
            delay={0.2}
          />
          <FeatureCard
            icon={Search}
            title="Gap Analysis"
            description="Instantly see which skills you're missing for your dream role with actionable recommendations to fill each gap."
            delay={0.3}
          />
          <FeatureCard
            icon={BarChart3}
            title="DSA Tracker"
            description="Track your DSA progress against company-specific requirements. Know exactly how many more problems to solve for Google, Amazon, or Meta."
            delay={0.4}
          />
          <FeatureCard
            icon={Target}
            title="Hiring Probability"
            description="A real-time score combining your GitHub, LeetCode, resume, and consistency data into a single hiring readiness percentage."
            delay={0.5}
          />
          <FeatureCard
            icon={Map}
            title="Personalized Roadmap"
            description="Get a step-by-step, phase-by-phase plan tailored to your gaps. Every milestone is based on what you're actually missing."
            delay={0.6}
          />
        </div>
      </section>

      {/* CTA Footer */}
      <section className="landing-footer-cta">
        <motion.div
          className="glass-card landing-footer-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Ready to accelerate your career?</h2>
          <p>Start tracking your progress and close the gap to your dream role.</p>
          <button
            className="btn-primary btn-lg landing-cta"
            onClick={() => navigate('/dashboard')}
          >
            Launch Dashboard <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
