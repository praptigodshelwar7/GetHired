import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertCircle, CheckCircle2, ArrowRight, Upload, FileCheck, Loader2, Sparkles, Brain, Zap } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload your resume first!");
      return;
    }
    setAnalyzing(true);
    setParsing(true);

    try {
      // Step 1: Extract raw text from PDF in the browser using PDF.js
      const resumeText = await extractTextFromPDF(file);
      console.log("Extracted Text Length:", resumeText.length);
      setParsing(false);

      // Step 2: Send extracted text + selected role to the Java backend for analysis
      const response = await axios.post(`${API_BASE_URL}/resume/analyze`, {
        resumeText,
        role,
      });

      const analysisResult = { ...response.data, role };

      setResult(analysisResult);
      // Save to context so Roadmap can use it
      updateAnalysisResult(analysisResult);
      updateTargetRole(role);
      setAnalyzing(false);
    } catch (err) {
      console.error("Analysis Error:", err);
      alert(err.response?.data?.message || "Analysis failed. Please try again.");
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
                  {parsing ? 'Parsing PDF...' : 'AI is Analyzing...'}
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <Brain size={16} />
                  Analyze with AI
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

            {/* AI or Fallback Badge */}
            {result.aiPowered ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '0.75rem', padding: '0.6rem 1rem',
                  marginBottom: '1rem', fontSize: '0.8rem', color: '#c4b5fd',
                }}
              >
                <Sparkles size={14} color="#a78bfa" />
                <span>Powered by AI — this analysis uses deep contextual understanding, not just keyword matching.</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(234, 179, 8, 0.12)',
                  border: '1px solid rgba(234, 179, 8, 0.35)',
                  borderRadius: '0.75rem', padding: '0.6rem 1rem',
                  marginBottom: '1rem', fontSize: '0.82rem', color: '#fde047',
                }}
              >
                <AlertCircle size={15} color="#facc15" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Rule-Based Analysis:</strong> {result.fallbackReason || 'Configure GEMINI_API_KEY in the backend to enable AI analysis.'}
                </span>
              </motion.div>
            )}

            {/* Summary */}
            {result.summary && (
              <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                style={{
                  marginBottom: '1.5rem',
                  background: result.aiPowered
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.06), rgba(139, 92, 246, 0.06))'
                    : 'linear-gradient(135deg, rgba(234, 179, 8, 0.05), rgba(139, 92, 246, 0.05))',
                  borderLeft: result.aiPowered ? '3px solid #8b5cf6' : '3px solid #eab308',
                }}
              >
                <h4 style={{ color: result.aiPowered ? '#a78bfa' : '#facc15', marginBottom: '0.75rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Brain size={16} /> {result.aiPowered ? 'AI Summary' : 'Profile Summary (Rule-Based Match)'}
                </h4>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text)' }}>
                  {result.summary}
                </p>
              </motion.div>
            )}

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

              {/* Strengths (AI only) */}
              {result.strengths && result.strengths.length > 0 && (
                <div className="glass-card" style={{ background: 'rgba(139, 92, 246, 0.03)' }}>
                  <h4 style={{ color: '#a78bfa', marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={14} /> Key Strengths
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {result.strengths.map((strength, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <Sparkles size={14} color="#a78bfa" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
