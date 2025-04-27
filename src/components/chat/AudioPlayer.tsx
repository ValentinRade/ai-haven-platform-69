
import React from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface AudioPlayerProps {
  audioContent: string;
  duration: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioContent, duration }) => {
  const {
    isPlaying,
    progress,
    currentTime,
    handlePlay,
    handleSliderChange,
    getDisplayTime
  } = useAudioPlayer(audioContent, duration);

  return (
    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-3">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-full h-10 w-10",
          isPlaying ? "text-primary bg-primary/10" : "text-gray-600 hover:text-primary"
        )}
        onClick={handlePlay}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </Button>
      <div className="flex-1">
        <Slider
          value={[progress]}
          onValueChange={handleSliderChange}
          max={100}
          step={1}
          className="my-2"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {getDisplayTime()}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(duration)}
          </span>
        </div>
      </div>
      <Volume2 size={20} className="text-gray-400" />
    </div>
  );
};

function formatTime(time: number): string {
  return `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;
}
