
import { useState, useEffect, useRef } from 'react';
import { formatTime } from '@/utils/timeUtils';

export const useAudioPlayer = (audioContent: string, duration: number) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [actualDuration, setActualDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInitialized = useRef(false);

  // Create audio element only once
  useEffect(() => {
    if (!audioInitialized.current && audioContent) {
      audioInitialized.current = true;
      const newAudio = new Audio(`data:audio/webm;base64,${audioContent}`);
      audioRef.current = newAudio;
      
      newAudio.addEventListener('loadedmetadata', () => {
        // Prefer the duration from Supabase if it exists
        if (duration) {
          setActualDuration(duration);
        } else if (newAudio.duration && isFinite(newAudio.duration)) {
          // Fallback to calculated duration if no Supabase duration
          setActualDuration(newAudio.duration);
        }
      });
      
      newAudio.addEventListener('timeupdate', () => {
        setCurrentTime(newAudio.currentTime);
        // Use Supabase duration or calculated duration
        const currentDuration = actualDuration;
        const calculatedProgress = (newAudio.currentTime / currentDuration) * 100;
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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [audioContent, duration]);

  // Update actual duration whenever audio metadata loads
  useEffect(() => {
    if (audio && audio.duration && isFinite(audio.duration)) {
      setActualDuration(audio.duration);
    }
  }, [audio]);

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
    if (!audio) return;
    
    setProgress(value[0]);
    // Use actual duration for calculating the time position
    const currentDuration = actualDuration || duration;
    const newTime = (value[0] / 100) * currentDuration;
    setCurrentTime(newTime);
    
    try {
      audio.currentTime = newTime;
    } catch (error) {
      console.error('Error setting audio current time:', error);
    }
  };

  const getDisplayTime = () => {
    if (progress === 0) {
      return '0:00';
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
