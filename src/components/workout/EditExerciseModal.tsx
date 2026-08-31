'use client';
import { useState, useEffect, useMemo } from 'react';
import type { Exercise } from '@/lib/workout-engine';
import { getAllPreloadedExercises, findExerciseVideo } from '@/lib/workout-engine';
import Modal from '@/components/ui/Modal';
import {
  Play,
  Search,
  Dumbbell,
  Sparkles,
  Link2,
  Trash2,
  Check,
  Layers,
  Repeat,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface EditExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: Exercise) => void;
  onDelete?: () => void;
  initialExercise?: Exercise | null;
  dayName: string;
}

export default function EditExerciseModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialExercise,
  dayName,
}: EditExerciseModalProps) {
  const allLibraryExercises = useMemo(() => getAllPreloadedExercises(), []);

  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState('8-12');
  const [rest, setRest] = useState('60s');
  const [instructions, setInstructions] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewVideo, setPreviewVideo] = useState(false);

  useEffect(() => {
    if (initialExercise) {
      setName(initialExercise.name || '');
      setMuscleGroup(initialExercise.muscleGroup || 'Chest');
      setSets(initialExercise.sets || 3);
      setReps(initialExercise.reps || '8-12');
      setRest(initialExercise.rest || '60s');
      setInstructions(initialExercise.instructions || '');
      setVideoUrl(initialExercise.videoUrl || '');
      setDifficulty(initialExercise.difficulty || 'intermediate');
      setSearchQuery('');
    } else {
      setName('');
      setMuscleGroup('Chest');
      setSets(3);
      setReps('8-12');
      setRest('60s');
      setInstructions('');
      setVideoUrl('');
      setDifficulty('intermediate');
      setSearchQuery('');
    }
    setPreviewVideo(false);
  }, [initialExercise, isOpen]);

  // Extract clean YouTube ID from URL or raw ID
  const cleanYouTubeId = useMemo(() => {
    if (!videoUrl) return null;
    const v = videoUrl.trim();
    if (v.includes('youtube.com/watch?v=')) {
      return v.split('v=')[1]?.split('&')[0];
    }
    if (v.includes('youtu.be/')) {
      return v.split('youtu.be/')[1]?.split('?')[0];
    }
    if (v.includes('youtube.com/embed/')) {
      return v.split('embed/')[1]?.split('?')[0];
    }
    return v;
  }, [videoUrl]);

  // Handle selecting an exercise from library
  const handleSelectLibraryExercise = (exItem: Exercise) => {
    setName(exItem.name);
    setMuscleGroup(exItem.muscleGroup);
    setSets(exItem.sets);
    setReps(exItem.reps);
    setRest(exItem.rest);
    setInstructions(exItem.instructions);
    setVideoUrl(exItem.videoUrl || '');
    setDifficulty(exItem.difficulty);
    setSearchQuery('');
  };

  // Handle typing custom name and auto-matching
  const handleNameChange = (val: string) => {
    setName(val);
    const matched = findExerciseVideo(val);
    if (matched) {
      if (matched.videoUrl && !videoUrl) setVideoUrl(matched.videoUrl);
      if (matched.muscleGroup && muscleGroup === 'Chest') setMuscleGroup(matched.muscleGroup);
      if (matched.instructions && !instructions) setInstructions(matched.instructions);
    }
  };

  const handleAutoMatchVideo = () => {
    const matched = findExerciseVideo(name);
    if (matched) {
      if (matched.videoUrl) setVideoUrl(matched.videoUrl);
      if (matched.muscleGroup) setMuscleGroup(matched.muscleGroup);
      if (matched.instructions) setInstructions(matched.instructions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matched = findExerciseVideo(name);

    const savedExercise: Exercise = {
      name: name.trim(),
      muscleGroup: muscleGroup.trim(),
      sets: Number(sets),
      reps: reps.trim(),
      rest: rest.trim(),
      instructions: instructions.trim() || `Perform ${name.trim()} with controlled form and steady breathing.`,
      difficulty,
      videoUrl: cleanYouTubeId || videoUrl.trim(),
      targetMuscles: matched?.targetMuscles || [muscleGroup],
      equipment: matched?.equipment || 'Gym Equipment',
      tips: matched?.tips || ['Focus on controlled tempo and full range of motion.'],
      commonMistakes: matched?.commonMistakes || ['Rushing repetitions using momentum.'],
    };

    onSave(savedExercise);
  };

  const filteredLibrary = useMemo(() => {
    if (!searchQuery.trim()) return allLibraryExercises.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return allLibraryExercises.filter(e =>
      e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q)
    );
  }, [allLibraryExercises, searchQuery]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialExercise ? `Edit Exercise : ${initialExercise.name}` : `Add Exercise to ${dayName}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Quick Search from Library */}
        <div className="bg-gray-750 p-3.5 rounded-xl border border-gray-700 space-y-2">
          <label className="block text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-orange-400" />
              Pick from Exercise Library (Auto-attaches video & instructions):
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search exercise library (e.g. Bench Press, Squat, Pull-Up, Lateral Raise)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          {searchQuery.trim() !== '' && (
            <div className="max-h-36 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg p-1 space-y-1 shadow-lg">
              {filteredLibrary.map((exItem, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLibraryExercise(exItem)}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-gray-700 text-xs text-white flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">{exItem.name}</span>
                  <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                    {exItem.muscleGroup}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Exercise Name & Auto-Match */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-300">
              Exercise Name <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={handleAutoMatchVideo}
              className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold"
            >
              <Sparkles className="w-3 h-3" /> Auto-match video demo
            </button>
          </div>
          <input
            type="text"
            required
            placeholder="e.g. Incline Dumbbell Bench Press"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-500 font-medium"
          />
        </div>

        {/* Video Tutorial URL / YouTube ID & Live Preview */}
        <div className="bg-gray-750 p-3.5 rounded-xl border border-gray-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-orange-400" />
              Exercise Video Tutorial (YouTube Link or ID)
            </label>
            {cleanYouTubeId && (
              <button
                type="button"
                onClick={() => setPreviewVideo(p => !p)}
                className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                {previewVideo ? 'Hide Preview' : 'â–¶ï¸ Preview Video'}
              </button>
            )}
          </div>

          <div className="relative">
            <Link2 className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. https://www.youtube.com/watch?v=VmB1G1K7v94 or VmB1G1K7v94"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg text-xs focus:outline-none focus:border-orange-500 font-mono text-[11px]"
            />
          </div>

          {previewVideo && cleanYouTubeId && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-gray-600 shadow-md">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${cleanYouTubeId}?autoplay=0&rel=0&modestbranding=1`}
                title="Exercise Demonstration Preview"
                allowFullScreen
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Muscle Group & Difficulty */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Muscle Group</label>
            <input
              type="text"
              placeholder="e.g. Chest, Back, Quads, Shoulders, Biceps"
              value={muscleGroup}
              onChange={e => setMuscleGroup(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Experience Level</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-2.5 py-2 capitalize"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Sets, Reps, Rest Period */}
        <div className="grid grid-cols-3 gap-2.5 text-xs">
          <div>
            <label className="text-gray-300 font-medium mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-orange-400" /> Sets
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={sets}
              onChange={e => setSets(Math.max(1, Number(e.target.value)))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-2.5 py-1.5"
            />
          </div>

          <div>
            <label className="text-gray-300 font-medium mb-1 flex items-center gap-1">
              <Repeat className="w-3 h-3 text-blue-400" /> Reps
            </label>
            <input
              type="text"
              placeholder="e.g. 8-12, 15, 30s"
              value={reps}
              onChange={e => setReps(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-2.5 py-1.5"
            />
          </div>

          <div>
            <label className="text-gray-300 font-medium mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-green-400" /> Rest
            </label>
            <input
              type="text"
              placeholder="e.g. 60s, 90s, 2m"
              value={rest}
              onChange={e => setRest(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-2.5 py-1.5"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-300">
            Form Instructions & Technique Cues
          </label>
          <textarea
            rows={3}
            placeholder="Describe setup, movement path, breathing, and lockout cues..."
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove Exercise
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:bg-gray-700 border border-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Save Exercise
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}