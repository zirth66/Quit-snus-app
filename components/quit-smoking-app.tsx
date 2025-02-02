"use client"

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Timer, Trophy, Star, Settings } from 'lucide-react';

interface AppState {
  timeLeft: number | null;
  currentStreak: number;
  dayCount: number;
  dailyLimit: number;
  usagesLeft: number;
  xpPoints: number;
  lastUsageDate: string;
  canEarnXp: boolean;
}

const QuitApp = () => {
  const INITIAL_DAILY_LIMIT = 10;
  const WAKE_HOURS = 16;
  const XP_PER_WAIT = 10;

  // Make sure all initial states are correct
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dayCount, setDayCount] = useState(1);
  const [dailyLimit, setDailyLimit] = useState(INITIAL_DAILY_LIMIT);
  const [usagesLeft, setUsagesLeft] = useState(INITIAL_DAILY_LIMIT);
  const [xpPoints, setXpPoints] = useState(0);
  const [lastUsageDate, setLastUsageDate] = useState<string>(new Date().toDateString());
  const [canEarnXp, setCanEarnXp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsLimit, setSettingsLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      const state: AppState = JSON.parse(savedState);
      setTimeLeft(state.timeLeft);
      setCurrentStreak(state.currentStreak);
      setDayCount(state.dayCount);
      setDailyLimit(state.dailyLimit);
      setUsagesLeft(state.usagesLeft);
      setXpPoints(state.xpPoints);
      setLastUsageDate(state.lastUsageDate);
      setCanEarnXp(state.canEarnXp);
    }
    setIsLoading(false);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const state: AppState = {
      timeLeft,
      currentStreak,
      dayCount,
      dailyLimit,
      usagesLeft,
      xpPoints,
      lastUsageDate,
      canEarnXp
    };
    localStorage.setItem('appState', JSON.stringify(state));
  }, [timeLeft, currentStreak, dayCount, dailyLimit, usagesLeft, xpPoints, lastUsageDate, canEarnXp]);

  // Remove getWaitTime from component scope
  const handleUsage = () => {
    if (usagesLeft > 0) {
      setUsagesLeft(prev => prev - 1);
      
      if (canEarnXp) {
        setXpPoints(prev => prev + XP_PER_WAIT);
        setCurrentStreak(prev => prev + 1);
      } else {
        setCurrentStreak(0);
      }

      const minutesBetweenUses = (WAKE_HOURS * 60) / dailyLimit;
      const waitTimeInSeconds = Math.floor(minutesBetweenUses * 60);
      const nextUsageTimestamp = Date.now() + (waitTimeInSeconds * 1000);
      
      localStorage.setItem('nextUsageTimestamp', nextUsageTimestamp.toString());
      setTimeLeft(waitTimeInSeconds);
      setCanEarnXp(false);
      setLastUsageDate(new Date().toDateString());
    }
  };

  // Update the timer useEffect to use timestamps
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timeLeft !== null) {
      const nextUsageTimestamp = localStorage.getItem('nextUsageTimestamp');
      if (nextUsageTimestamp) {
        const remainingTime = Math.ceil((parseInt(nextUsageTimestamp) - Date.now()) / 1000);
        if (remainingTime > 0) {
          setTimeLeft(remainingTime);
        } else {
          setTimeLeft(null);
          setCanEarnXp(true);
          localStorage.removeItem('nextUsageTimestamp');
          return;
        }
      }

      interval = setInterval(() => {
        setTimeLeft(current => {
          if (!current || current <= 1) {
            setCanEarnXp(true);
            localStorage.removeItem('nextUsageTimestamp');
            return null;
          }
          return current - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const createSegments = () => {
    const segments = [];
    const radius = 120;
    const center = 132;
    const gapDegrees = 2;
    const segmentDegrees = (360 - (gapDegrees * dailyLimit)) / dailyLimit;
    
    for (let i = 0; i < dailyLimit; i++) {
      const startAngle = i * (segmentDegrees + gapDegrees) - 90;
      const endAngle = startAngle + segmentDegrees;
      
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArcFlag = segmentDegrees > 180 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      ].join(' ');

      segments.push({
        path: pathData,
        active: i >= dailyLimit - usagesLeft,
      });
    }
    return segments;
  };

  const SettingsModal = () => {
    if (!showSettings) return null;
    
    const handleSave = () => {
      const settings = { initialLimit: settingsLimit };
      localStorage.setItem('snusSettings', JSON.stringify(settings));
      setDailyLimit(settingsLimit);
      setUsagesLeft(settingsLimit);
      setShowSettings(false);
    };

    const handleReset = () => {
      if (confirm('Är du säker? Detta kommer nollställa all din progress.')) {
        localStorage.clear();
        setDailyLimit(10);
        setUsagesLeft(10);
        setCurrentStreak(0);
        setDayCount(1);
        setXpPoints(0);
        setTimeLeft(null);
        setShowSettings(false);
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Inställningar</h2>
          <div className="setting-item">
            <label>Antal snus per dag (start)</label>
            <input 
              type="number" 
              value={settingsLimit}
              onChange={(e) => setSettingsLimit(parseInt(e.target.value))}
              min="1"
              max="50"
            />
          </div>
          <div className="modal-buttons">
            <Button onClick={handleSave}>Spara</Button>
            <Button variant="destructive" onClick={handleReset}>Nollställ</Button>
            <Button onClick={() => setShowSettings(false)}>Stäng</Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="app-wrapper relative">
        <button 
          className="settings-button" 
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-6 w-6" />
        </button>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading">Laddar...</div>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Dag</span>
                <div className="stat-circle">
                  <div className="stat-content">
                    <span className="stat-value">{dayCount}</span>
                  </div>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-label">Kvar</span>
                <div className="stat-circle">
                  <div className="stat-content">
                    <span className="stat-value">{usagesLeft}</span>
                  </div>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-label">Streak</span>
                <div className="stat-circle">
                  <div className="stat-content">
                    <span className="stat-value">{currentStreak}</span>
                  </div>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-label">XP</span>
                <div className="stat-circle">
                  <div className="stat-content">
                    <span className="stat-value">{xpPoints}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="circle-container">
              <svg width="264" height="264">
                {createSegments().map((segment, index) => (
                  <path
                    key={index}
                    d={segment.path}
                    stroke={segment.active ? "rgba(20,184,166,0.7)" : "rgba(0,0,0,0.1)"}
                    strokeWidth="8"
                    fill="none"
                  />
                ))}
              </svg>
              <div className="circle-content">
                <div>
                  {timeLeft === null ? (
                    <>
                      {usagesLeft > 0 ? (
                        <Button
                          className="register-button"
                          onClick={handleUsage}
                        >
                          Registrera
                        </Button>
                      ) : (
                        <div className="daily-limit-reached">
                          Dagens gräns nådd
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="countdown">
                      <div className="time">{formatTime(timeLeft)}</div>
                      <div className="label">till nästa</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="milestone-card">
              <div className="milestone-header">
                <Trophy className="icon" />
                <div className="title">Nästa milstolpe</div>
              </div>
              <div className="milestone-text">
                Efter 24 timmar: Ditt blodtryck börjar normaliseras och risken för hjärtproblem minskar.
              </div>
            </div>
          </>
        )}
        <SettingsModal />
      </div>
    </div>
  );
};

export default QuitApp;

