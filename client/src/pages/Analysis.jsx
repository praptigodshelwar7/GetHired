import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, CheckCircle2, ArrowRight, Upload, FileCheck, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { useUser } from '../context/UserContext';

// Initialize PDF.js worker with a reliable CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const Analysis = () => {
  const { targetRole, updateAnalysisResult, updateTargetRole } = useUser();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState(targetRole);
  const [analyzing, setAnalyzing] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(" ");
      fullText += pageText + " ";
    }
    return fullText;
  };

  const ROLE_SKILLS = {
    'SDE': ["Java", "SpringBoot", "Docker", "Kubernetes", "System Design", "SQL", "Algorithms", "Data Structures", "Microservices"],
    'Data Scientist': ["Python", "TensorFlow", "PyTorch", "Pandas", "Scikit-Learn", "Machine Learning", "Statistics", "SQL", "Data Visualization"],
    'Frontend Dev': ["React", "JavaScript", "CSS", "HTML", "TypeScript", "Tailwind", "Redux", "Framer Motion", "Next.js"],
    'AI/ML Engineer': ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "MLOps", "Model Deployment"],
    'DevOps Engineer': ["Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions", "AWS", "Terraform", "Linux", "Bash Scripting", "Monitoring"]
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload your resume first!");
      return;
    }
    setAnalyzing(true);
    setParsing(true);

    try {
      const resumeText = await extractTextFromPDF(file);
      console.log("Extracted Text Length:", resumeText.length);
      setParsing(false);

      const targetSkills = ROLE_SKILLS[role] || ROLE_SKILLS['SDE'];

      const missing = targetSkills.filter(skill =>
        !resumeText.toLowerCase().includes(skill.toLowerCase())
      );

      const score = Math.round(((targetSkills.length - missing.length) / targetSkills.length) * 100);

      const analysisResult = {
        score,
        missingSkills: missing,
        matchedSkills: targetSkills.filter(s => !missing.includes(s)),
        role,
        roadmap: missing.length > 0
          ? missing.map(skill => `Complete a production project using ${skill} to bridge the gap.`)
          : [`You are ready for ${role}! Focus on advanced mock interviews.`, 'Master system scalability', 'Contribute to Open Source'],
      };

      setTimeout(() => {
        setResult(analysisResult);
        // Save to context so Roadmap can use it
        updateAnalysisResult(analysisResult);
        updateTargetRole(role);
        setAnalyzing(false);
      }, 800);
    } catch (err) {
      console.error("PDF Parsing Error:", err);
      alert("Failed to parse PDF. Please try a different file.");
      setAnalyzing(false);
      setParsing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          Profile Gap Analysis
        </h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
          Upload your resume and select a target role to identify skill gaps
        </p>
      </motion.div>

      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* File Upload Area */}
          <div
            onClick={() => fileInputRef.current.click()}
            style={{
              border: '2px dashed var(--border)',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: file ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
              borderColor: file ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)',
              transition: 'all 0.3s ease',
            }}
          >
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".pdf" onChange={handleFileChange} />
            {file ? (
              <div style={{ color: '#10b981' }}>
                <FileCheck size={40} style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: '600' }}>{file.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>Click to change</p>
              </div>
            ) : (
              <div style={{ color: 'var(--text-dim)' }}>
                <Upload size={40} style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: '600' }}>Upload Resume (PDF)</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Drag & drop or click to browse</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>GitHub Username (optional)</label>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} size={16} />
                <input
                  type="text"
                  placeholder="e.g. octocat"
                  style={{
                    width: '100%', padding: '0.7rem 1rem 0.7rem 2.25rem',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                    borderRadius: '0.75rem', color: 'white', fontSize: '0.85rem',
                  }}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.3rem' }}>Target Role</label>
              <select
                style={{
                  width: '100%', padding: '0.7rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                  borderRadius: '0.75rem', color: 'white', fontSize: '0.85rem',
                }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="SDE">Software Development Engineer (SDE)</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Frontend Dev">Frontend Developer</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </div>
            <button className="btn-primary" onClick={handleAnalyze} disabled={analyzing || !file} style={{ marginTop: 'auto' }}>
              {analyzing ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={16} className="animate-spin" />
                  {parsing ? 'Parsing PDF...' : 'Analyzing...'}
                </span>
              ) : 'Analyze Gaps'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Score Header */}
            <div className="glass-card" style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.08))' }}>
              <div style={{ fontSize: '3rem', fontWeight: '800' }}>
                <span style={{ color: result.score >= 70 ? '#10b981' : result.score >= 40 ? '#fbbf24' : '#f87171' }}>
                  {result.score}%
                </span>
              </div>
              <p style={{ color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                Alignment with <strong style={{ color: 'var(--text)' }}>{role}</strong> Role
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Matched Skills */}
              {result.matchedSkills.length > 0 && (
                <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.03)' }}>
                  <h4 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '0.95rem' }}>✅ Skills Matched</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {result.matchedSkills.map(skill => (
                      <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <CheckCircle2 size={14} color="#10b981" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              <div className="glass-card" style={{ background: 'rgba(248, 113, 113, 0.03)' }}>
                <h4 style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.95rem' }}>⚠️ Skill Gaps Identified</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {result.missingSkills.length > 0 ? result.missingSkills.map(skill => (
                    <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <AlertCircle size={14} color="#f87171" />
                      <span>Missing: <strong>{skill}</strong></span>
                    </div>
                  )) : <p style={{ color: '#10b981' }}>All core skills matched! 🎉</p>}
                </div>
              </div>

              {/* Roadmap */}
              <div className="glass-card" style={{ gridColumn: 'span 1' }}>
                <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>🗺️ Recommended Next Steps</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {result.roadmap.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <CheckCircle2 size={14} color="#4ade80" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Download */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                className="btn-primary"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `CareerPath_${role}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download Full Career Path <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analysis;
