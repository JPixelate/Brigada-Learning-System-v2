import { useState, useEffect, useRef } from 'react';

interface UseComponentTimerProps {
  componentId: string;
  moduleId: string;
  employeeId: string;
  onTimeUpdate: (seconds: number) => void;
  isActive?: boolean; // Whether the timer should be running
}

export const useComponentTimer = ({
  componentId,
  moduleId,
  employeeId,
  onTimeUpdate,
  isActive = true
}: UseComponentTimerProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Load saved time from localStorage
    const savedKey = `timer_${employeeId}_${moduleId}_${componentId}`;
    const savedTime = localStorage.getItem(savedKey);
    if (savedTime) {
      setElapsedSeconds(parseInt(savedTime, 10));
    }
  }, [componentId, moduleId, employeeId]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start the timer
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => {
        const newTime = prev + 1;
        
        // Save to localStorage every second
        const savedKey = `timer_${employeeId}_${moduleId}_${componentId}`;
        localStorage.setItem(savedKey, newTime.toString());
        
        // Call the update callback every 5 seconds to avoid too many updates
        if (newTime % 5 === 0) {
          onTimeUpdate(newTime);
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, componentId, moduleId, employeeId, onTimeUpdate]);

  const resetTimer = () => {
    setElapsedSeconds(0);
    const savedKey = `timer_${employeeId}_${moduleId}_${componentId}`;
    localStorage.removeItem(savedKey);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    elapsedSeconds,
    formattedTime: formatTime(elapsedSeconds),
    resetTimer
  };
};
