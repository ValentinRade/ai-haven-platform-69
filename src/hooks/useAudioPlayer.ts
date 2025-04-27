
import { useState, useEffect, useRef } from 'react';
import { formatTime } from '@/utils/timeUtils';

export const useAudioPlayer = (audioContent: string, duration: number) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [actualDuration, setActualDuration] = useState(duration);
  const audioInitialized = useRef(false);

  useEffect(() => {
    if (!audioInitialized.current) {
      audioInitialized.current = true;
      const newAudio = new Audio(`data:audio/webm;base64,${audioContent}`);
      
      newAudio.addEventListener('loadedmetadata', () => {
        // Use the actual audio duration instead of the passed duration if available
        if (newAudio.duration && isFinite(newAudio.duration)) {
          setActualDuration(newAudio.duration);
        }
      });
      
      newAudio.addEventListener('timeupdate', () => {
        setCurrentTime(newAudio.currentTime);
        // Use actualDuration for progress calculation
        const calculatedProgress = (newAudio.currentTime / actualDuration) * 100;
        setProgress(Math.min(calculatedProgress, 100));
      });
      
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
        try {
          newAudio.currentTime = 0;
        } catch (error) {
          console.error('Error resetting audio time:', error);
        }
      });
      
      newAudio.preload = 'metadata';
      newAudio.load();
      setAudio(newAudio);
    }
    
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audioContent, duration]);

  // Update actual duration when the prop changes
  useEffect(() => {
    setActualDuration(duration);
  }, [duration]);

  const handlePlay = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => console.error('Error playing audio:', err));
      setIsPlaying(true);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (!audio || !actualDuration) return;
    
    setProgress(value[0]);
    const newTime = (value[0] / 100) * actualDuration;
    setCurrentTime(newTime);
    
    try {
      audio.currentTime = newTime;
    } catch (error) {
      console.error('Error setting audio current time:', error);
    }
  };

  const getDisplayTime = () => {
    if (progress === 0) {
      return formatTime(actualDuration);
    }
    return formatTime(currentTime);
  };

  return {
    isPlaying,
    progress,
    currentTime,
    actualDuration,
    handlePlay,
    handleSliderChange,
    getDisplayTime
  };
};
