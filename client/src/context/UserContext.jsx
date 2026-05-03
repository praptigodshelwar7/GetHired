import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const DEFAULT_STATE = {
  handles: { github: '', leetcode: '' },
  githubData: null,
  leetcodeData: null,
  leetcodeStreak: null,
  analysisResult: null,
  targetRole: 'SDE',
  streakDays: [],
  dsaProgress: { solved: 0, targetCompany: 'Google' },
};

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('gethired_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const [state, setState] = useState(DEFAULT_STATE);

  // Setup axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('gethired_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('gethired_token');
    }
  }, [token]);

  // Load profile from database if token exists
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/profile`);
        const dbUser = res.data;
        
        setUser({ username: dbUser.username, email: dbUser.email });
        
        let initialGithubData = null;
        if (dbUser.githubHandle) {
          try {
            const response = await fetch(`https://api.github.com/users/${dbUser.githubHandle}`);
            if (!response.ok) throw new Error('GitHub API failed');
            const data = await response.json();
            initialGithubData = {
              publicRepos: data.public_repos,
              followers: data.followers,
              avatar: data.avatar_url,
              bio: data.bio,
              name: data.name,
              reliabilityScore: Math.min(100, (data.public_repos * 5) + (data.followers * 2)),
            };
          } catch (ghErr) {
            console.warn('Initial GitHub fetch failed:', ghErr.message);
          }
        }
        
        // Map DB fields back to state
        setState({
          handles: { github: dbUser.githubHandle || '', leetcode: dbUser.leetcodeHandle || '' },
          githubData: initialGithubData,
          leetcodeData: {
            totalSolved: dbUser.leetcodeSolved,
            easySolved: dbUser.leetcodeEasy,
            mediumSolved: dbUser.leetcodeMedium,
            hardSolved: dbUser.leetcodeHard,
          },
          leetcodeStreak: {
            streak: dbUser.leetcodeStreak,
          },
          analysisResult: dbUser.analysisResultJson ? JSON.parse(dbUser.analysisResultJson) : null,
          targetRole: dbUser.targetRole || 'SDE',
          streakDays: dbUser.streakDaysJson ? JSON.parse(dbUser.streakDaysJson) : [],
          dsaProgress: { 
            solved: dbUser.leetcodeSolved, 
            targetCompany: dbUser.targetRole === 'SDE' ? 'Google' : 'Startup' 
          },
        });
      } catch (e) {
        console.error('Failed to load profile', e);
        if (e.response?.status === 403 || e.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const login = async (username, password) => {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
    setToken(res.data.token);
    return res.data;
  };

  const signup = async (username, email, password) => {
    await axios.post(`${API_BASE_URL}/auth/signup`, { username, email, password });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setState(DEFAULT_STATE);
  };

  const saveProfileToDB = async (newState) => {
    if (!token) return;
    try {
      await axios.put(`${API_BASE_URL}/profile`, {
        githubHandle: newState.handles.github,
        leetcodeHandle: newState.handles.leetcode,
        targetRole: newState.targetRole,
        leetcodeSolved: newState.leetcodeData?.totalSolved || 0,
        leetcodeEasy: newState.leetcodeData?.easySolved || 0,
        leetcodeMedium: newState.leetcodeData?.mediumSolved || 0,
        leetcodeHard: newState.leetcodeData?.hardSolved || 0,
        leetcodeStreak: newState.leetcodeStreak?.streak || 0,
        analysisResultJson: newState.analysisResult ? JSON.stringify(newState.analysisResult) : null,
        streakDaysJson: JSON.stringify(newState.streakDays),
      });
    } catch (e) {
      console.error('Failed to save profile to DB', e);
    }
  };

  const updateHandles = (handles) => {
    setState(prev => {
      const next = { ...prev, handles };
      saveProfileToDB(next);
      return next;
    });
  };

  const updateGithubData = (data) => {
    setState(prev => ({ ...prev, githubData: data }));
  };

  const updateLeetcodeData = (data) => {
    setState(prev => {
      const next = { ...prev, leetcodeData: data };
      saveProfileToDB(next);
      return next;
    });
  };

  const updateAnalysisResult = (result) => {
    setState(prev => {
      const next = { ...prev, analysisResult: result };
      saveProfileToDB(next);
      return next;
    });
  };

  const updateTargetRole = (role) => {
    setState(prev => {
      const next = { ...prev, targetRole: role };
      saveProfileToDB(next);
      return next;
    });
  };

  const updateDSAProgress = (progress) => {
    setState(prev => {
      const next = { ...prev, dsaProgress: { ...prev.dsaProgress, ...progress } };
      saveProfileToDB(next);
      return next;
    });
  };

  const updateLeetcodeStreak = (data) => {
    setState(prev => {
      const next = { ...prev, leetcodeStreak: data };
      saveProfileToDB(next);
      return next;
    });
  };

  const recordStreakDay = () => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      if (prev.streakDays.includes(today)) return prev;
      const updated = [...prev.streakDays, today].slice(-30);
      const next = { ...prev, streakDays: updated };
      saveProfileToDB(next);
      return next;
    });
  };

  const getHiringProbability = () => {
    let score = 0;
    let factors = 0;
    if (state.githubData) {
      score += Math.min(25, (state.githubData.publicRepos * 2) + (state.githubData.followers * 0.5));
      factors += 25;
    }
    if (state.leetcodeData) {
      score += Math.min(30, (state.leetcodeData.totalSolved / 500) * 30);
      factors += 30;
    }
    if (state.analysisResult) {
      score += (state.analysisResult.score / 100) * 30;
      factors += 30;
    }
    const streakVal = state.leetcodeStreak?.streak || getStreakCount();
    score += Math.min(15, (streakVal / 7) * 15);
    factors += 15;
    return factors === 0 ? 0 : Math.round((score / factors) * 100);
  };

  const getStreakCount = () => {
    if (state.streakDays.length === 0) return 0;
    const sorted = [...state.streakDays].sort().reverse();
    const today = new Date();
    let count = 0;
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i]);
      const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
      if (diffDays === i) count++;
      else break;
    }
    return count;
  };

  const value = {
    ...state,
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
    updateHandles,
    updateGithubData,
    updateLeetcodeData,
    updateLeetcodeStreak,
    updateAnalysisResult,
    updateTargetRole,
    updateDSAProgress,
    recordStreakDay,
    getHiringProbability,
    getStreakCount,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

export default UserContext;
