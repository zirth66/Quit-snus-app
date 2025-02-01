"use client"

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Timer, Trophy, Star } from 'lucide-react';

const QuitApp = () => {
  const INITIAL_DAILY_LIMIT = 10;
  const WAKE_HOURS = 16; // 16 hours of wake time

  const [currentStreak, setCurrentStreak] = useState(0);
  const [xpPoints, setXpPoints] = useState(0);
  const [dayCount, setDayCount] = useState(1);
  const [dailyLimit, setDailyLimit] = useState(INITIAL_DAILY_LIMIT);
  const [usagesLeft, setUsagesLeft] = useState(INITIAL_DAILY_LIMIT);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [lastUsageDate, setLastUsageDate] = useState<string>(new Date().toDateString());

  // Calculate wait time based on remaining uses and wake hours
  const getWaitTime = () => {
    const minutesBetweenUses = (WAKE_HOURS * 60) / dailyLimit;
    return Math.floor(minutesBetweenUses * 60); // Convert to seconds
  };

  // Check for new day
  useEffect(() => {
    const checkNewDay = () => {
      const today = new Date().toDateString();
      if (today !== lastUsageDate) {
        setDayCount(prev => prev + 1);
        const newLimit = Math.max(0, INITIAL_DAILY_LIMIT - (dayCount));
        setDailyLimit(newLimit);
        setUsagesLeft(newLimit);
        setLastUsageDate(today);
      }
    };

    checkNewDay();
    const interval = setInterval(checkNewDay, 60000);
    return () => clearInterval(interval);
  }, [lastUsageDate, dayCount]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 0) {
            setIsRunning(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft]);

  const handleUsage = () => {
    if (usagesLeft > 0 && !isRunning) {
      setUsagesLeft(prev => prev - 1);
      setXpPoints(prev => prev + 10);
      setCurrentStreak(prev => prev + 1);
      setTimeLeft(getWaitTime());
      setIsRunning(true);
      setLastUsageDate(new Date().toDateString());
    }
  };

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

  return (
    <div className="container">
      <div className="app-wrapper">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-label">Day</span>
            <span className="stat-value">{dayCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">XP</span>
            <span className="stat-value">{xpPoints}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Streak</span>
            <span className="stat-value">{currentStreak}</span>
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
              <div className="count">{usagesLeft}/{dailyLimit}</div>
              <div className="label">kvar idag</div>
              <Button
                className="register-button"
                onClick={handleUsage}
                disabled={isRunning || usagesLeft === 0}
              >
                Registrera
              </Button>
              <div className="timer">
                {timeLeft > 0 ? `Nästa om: ${formatTime(timeLeft)}` : 'Redo!'}
              </div>
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

        <div className="achievements-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="achievement-card">
              <Star className="icon" />
              <div className="text">
                {i === 0 ? '1 timme' : i === 1 ? '12 timmar' : '24 timmar'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuitApp;

