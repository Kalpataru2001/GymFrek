'use client';
import { useState } from 'react';
import type { Exercise } from '@/lib/workout-engine';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Target,
  Sparkles,
  ExternalLink,
  Dumbbell,
  Clock,
  Repeat,
  Layers,
} from 'lucide-react';

interface ExerciseVisualModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

const diffColor: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  beginner: 'green',
  intermediate: 'yellow',
  advanced: 'red',
};

export default function ExerciseVisualModal({ exercise, isOpen, onClose }: ExerciseVisualModalProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'instructions'>('video');

  if (!exercise) return null;

  // Extract YouTube ID if full URL or ID is passed
  const getYouTubeId = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1]?.split('&')[0];
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0];
    }
    return url;
  };

  const videoId = getYouTubeId(exercise.videoUrl);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exercise.name} size="lg">
      <div className="space-y-5 max-h-[78vh] overflow-y-auto pr-1">
        {/* Header Badges & Quick Stats */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-700/70 pb-3">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="blue">{exercise.muscleGroup}</Badge>
            <Badge variant={diffColor[exercise.difficulty] || 'gray'} className="capitalize">
              {exercise.difficulty}
            </Badge>
            {exercise.equipment && (
              <span className="text-[11px] text-gray-300 bg-gray-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Dumbbell className="w-3 h-3 text-orange-400" />
                {exercise.equipment}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1 font-medium text-white">
              <Layers className="w-3.5 h-3.5 text-orange-400" /> {exercise.sets} Sets
            </span>
            <span>|</span>
            <span className="flex items-center gap-1 font-medium text-white">
              <Repeat className="w-3.5 h-3.5 text-blue-400" /> {exercise.reps} Reps
            </span>
            <span>|</span>
            <span className="flex items-center gap-1 font-medium text-white">
              <Clock className="w-3.5 h-3.5 text-green-400" /> Rest {exercise.rest}
            </span>
          </div>
        </div>

        {/* Video Player / Demo Section */}
        {videoId ? (
          <div className="space-y-2">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-gray-700 shadow-xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                title={`${exercise.name} Exercise Video Demonstration`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-gray-400 px-1">
              <span className="flex items-center gap-1 text-orange-400 font-semibold">
                <Play className="w-3 h-3" /> Form Demonstration Video
              </span>
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                Watch on YouTube <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-8 text-center space-y-2">
            <Dumbbell className="w-10 h-10 text-orange-400 mx-auto animate-pulse" />
            <h4 className="text-sm font-semibold text-white">Visual Technique Guide</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Follow the step-by-step form cues and coaching tips below for optimal muscle engagement.
            </p>
          </div>
        )}

        {/* Target Muscles */}
        {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
          <div className="bg-gray-750 p-3.5 rounded-xl border border-gray-700 space-y-2">
            <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-orange-400" />
              Primary & Secondary Muscles Engaged
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {exercise.targetMuscles.map((muscle, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${
                    idx === 0
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold'
                      : 'bg-gray-700 text-gray-300 border-gray-600'
                  }`}
                >
                  {muscle} {idx === 0 && 'ðŸ”¥ (Primary)'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="bg-gray-750 p-4 rounded-xl border border-gray-700 space-y-2.5">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Step-by-Step Technique & Execution
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
            {exercise.instructions}
          </p>
        </div>

        {/* Form Coaching Tips */}
        {exercise.tips && exercise.tips.length > 0 && (
          <div className="bg-emerald-950/20 border border-emerald-500/40 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Pro Tips & Mind-Muscle Connection
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              {exercise.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">â€¢</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Mistakes to Avoid */}
        {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
          <div className="bg-rose-950/20 border border-rose-500/40 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Common Mistakes to Avoid
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              {exercise.commonMistakes.map((mistake, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">â€¢</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}