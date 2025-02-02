"use client"

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Timer, Trophy, Star } from 'lucide-react';

const QuitApp = () => {
  const INITIAL_DAILY_LIMIT = 10;
  const WAKE_HOURS = 16;
  const XP_PER_WAIT = 10;
  const BONUS_XP_PER_UNUSED = 20; // Bonus XP for each unused snus

  // Make sure all initial states are correct
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dayCount, setDayCount] = useState(1);
  const [dailyLimit, setDailyLimit] = useState(INITIAL_DAILY_LIMIT);
  const [usagesLeft, setUsagesLeft] = useState(INITIAL_DAILY_LIMIT);
  const [xpPoints, setXpPoints] = useState(0);
  const [lastUsageDate, setLastUsageDate] = useState<string>(new Date().toDateString());
  const [canEarnXp, setCanEarnXp] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);

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

      // Calculate wait time directly here
      const minutesBetweenUses = (WAKE_HOURS * 60) / dailyLimit;
      const waitTime = Math.floor(minutesBetweenUses * 60);
      
      setTimeLeft(waitTime);
      setCanEarnXp(false);
      setLastUsageDate(new Date().toDateString());
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timeLeft && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(current => {
          if (!current || current <= 1) {
            setCanEarnXp(true);
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

  // Add check for day change and bonus calculation
  useEffect(() => {
    const checkNewDay = () => {
      const today = new Date().toDateString();
      if (today !== lastUsageDate) {
        // Calculate bonus for unused snus from previous day
        const unusedCount = usagesLeft;
        if (unusedCount > 0) {
          const bonus = unusedCount * BONUS_XP_PER_UNUSED;
          setBonusAmount(bonus);
          setShowBonus(true);
          setXpPoints(prev => prev + bonus);
          
          // Reset for new day after applying bonus
          const newLimit = Math.max(0, INITIAL_DAILY_LIMIT - dayCount);
          setDailyLimit(newLimit);
          setUsagesLeft(newLimit);
          setDayCount(prev => prev + 1);
        }
        setLastUsageDate(today);
      }
    };

    checkNewDay();
    const interval = setInterval(checkNewDay, 60000);
    return () => clearInterval(interval);
  }, [lastUsageDate, usagesLeft, dayCount]);

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

  // Add bonus display component
  const BonusDisplay = () => {
    if (!showBonus) return null;

    return (
      <div className="bonus-overlay" onClick={() => setShowBonus(false)}>
        <div className="bonus-card">
          <div className="bonus-header">
            <Star className="icon" />
            <h2>Daglig Bonus!</h2>
          </div>
          <div className="bonus-content">
            <p>Du klarade dig med {usagesLeft} färre snus igår!</p>
            <div className="bonus-xp">+{bonusAmount} XP</div>
          </div>
          <Button onClick={() => setShowBonus(false)}>
            Awesome!
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="app-wrapper">
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
      </div>
      <BonusDisplay />
    </div>
  );
};

export default QuitApp;

