'use client';
import { useState, useEffect, useMemo } from 'react';
import type { Exercise } from '@/lib/workout-engine';
import { getAllPreloadedExercises, findExerciseVideo, normalizeGymQuery } from '@/lib/workout-engine';
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
  Bot,
  Loader2,
  Flame,
  Activity,
  HeartPulse,
  Target,
  Shield,
  RefreshCw,
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
  const [alternativeVideos, setAlternativeVideos] = useState<string[]>([]);
  const [videoCycleIndex, setVideoCycleIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewVideo, setPreviewVideo] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (initialExercise) {
      setName(initialExercise.name || '');
      setMuscleGroup(initialExercise.muscleGroup || 'Chest');
      setSets(initialExercise.sets || 3);
      setReps(initialExercise.reps || '8-12');
      setRest(initialExercise.rest || '60s');
      setInstructions(initialExercise.instructions || '');
      setVideoUrl(initialExercise.videoUrl || '');
      setAlternativeVideos(initialExercise.alternativeVideos || (initialExercise.videoUrl ? [initialExercise.videoUrl] : []));
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
      setAlternativeVideos([]);
      setDifficulty('intermediate');
      setSearchQuery('');
    }
    setVideoCycleIndex(0);
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
    setAlternativeVideos(exItem.alternativeVideos || (exItem.videoUrl ? [exItem.videoUrl] : []));
    setVideoCycleIndex(0);
    setDifficulty(exItem.difficulty);
    setSearchQuery('');
    setPreviewVideo(true);
  };

  // Handle typing custom name and auto-matching video + instructions with typo correction
  const handleNameChange = (val: string) => {
    setName(val);
    const matched = findExerciseVideo(val, 0);
    if (matched) {
      if (matched.videoUrl) setVideoUrl(matched.videoUrl);
      if (matched.alternativeVideos) setAlternativeVideos(matched.alternativeVideos);
      if (matched.muscleGroup && (muscleGroup === 'Chest' || !muscleGroup)) setMuscleGroup(matched.muscleGroup);
      if (matched.instructions && !instructions) setInstructions(matched.instructions);
    }
  };

  // Auto-match video button with cyclic re-matching
  const handleAutoMatchVideo = (customTargetName?: string) => {
    const target = (customTargetName || name).trim();
    if (!target) return;
    const nextIdx = videoCycleIndex + 1;
    setVideoCycleIndex(nextIdx);

    const matched = findExerciseVideo(target, nextIdx);
    if (matched) {
      if (matched.videoUrl) setVideoUrl(matched.videoUrl);
      if (matched.alternativeVideos) setAlternativeVideos(matched.alternativeVideos);
      if (matched.muscleGroup) setMuscleGroup(matched.muscleGroup);
      if (matched.instructions) setInstructions(matched.instructions);
      setPreviewVideo(true);
    }
  };

  // 1-Click AI Search & Generator
  const handleGenerateWithAI = async (customQuery?: string) => {
    const q = (customQuery || searchQuery || name).trim();
    if (!q) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.success && data.exercise) {
        const ex = data.exercise;
        const matched = findExerciseVideo(q, 0);
        setName(ex.name);
        setMuscleGroup(ex.muscleGroup);
        setSets(ex.sets || 3);
        setReps(ex.reps || '10-12');
        setRest(ex.rest || '60s');
        setInstructions(ex.instructions);
        setVideoUrl(matched?.videoUrl || ex.videoUrl || 'bEv6CCg2BC8');
        setAlternativeVideos(matched?.alternativeVideos || ex.alternativeVideos || ['bEv6CCg2BC8', 'MeIiIdhvXT4']);
        setDifficulty(ex.difficulty || 'beginner');
        setSearchQuery('');
        setPreviewVideo(true);
      }
    } catch (e) {
      console.error('AI exercise generator error:', e);
      handleNameChange(q);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const matched = findExerciseVideo(name, videoCycleIndex);

    const savedExercise: Exercise = {
      name: name.trim(),
      muscleGroup: muscleGroup.trim() || 'General Fitness',
      sets: Number(sets) || 3,
      reps: reps.trim() || '10-12',
      rest: rest.trim() || '60s',
      instructions: instructions.trim() || `Perform ${name.trim()} with controlled form, proper breathing, and steady cadence.`,
      difficulty,
      videoUrl: cleanYouTubeId || videoUrl.trim() || (matched?.videoUrl || 'bEv6CCg2BC8'),
      alternativeVideos: alternativeVideos.length > 0 ? alternativeVideos : [cleanYouTubeId || videoUrl.trim() || 'bEv6CCg2BC8'],
      targetMuscles: matched?.targetMuscles || [muscleGroup],
      equipment: matched?.equipment || 'Gym Equipment',
      tips: matched?.tips || ['Focus on controlled tempo and full range of motion.'],
      commonMistakes: matched?.commonMistakes || ['Rushing repetitions using momentum.'],
    };

    onSave(savedExercise);
  };

  // Typo-tolerant tokenized multi-word search
  const filteredLibrary = useMemo(() => {
    if (!searchQuery.trim()) return allLibraryExercises.slice(0, 10);
    const rawQ = searchQuery.toLowerCase().trim();
    const normQ = normalizeGymQuery(rawQ);
    const tokens = normQ.split(/\s+/).filter(t => t.length > 1);

    return allLibraryExercises.filter(e => {
      const exName = e.name.toLowerCase();
      const normExName = normalizeGymQuery(exName);
      const exMuscle = e.muscleGroup.toLowerCase();

      if (normExName.includes(normQ) || exMuscle.includes(normQ) || exName.includes(rawQ)) return true;
      return tokens.every(t => normExName.includes(t) || exMuscle.includes(t));
    });
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
        <div className="bg-gray-750 p-3.5 rounded-xl border border-gray-700 space-y-2.5">
          <label className="block text-xs font-semibold text-gray-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-orange-400" />
              Pick from Exercise Library (Auto-attaches video & instructions):
            </span>
          </label>

          <div className="relative">
            <input
              type="text"
              placeholder="Search exercise (e.g. Dumbbell Squats, Cardio, Machine Chest Press, Stretching)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Quick Category Chips with Lucide Icons */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {[
              { label: 'Cardio / HIIT', q: 'cardio', Icon: HeartPulse },
              { label: 'Dumbbell Squats', q: 'dumbbell squat', Icon: Target },
              { label: 'Chest Press', q: 'chest press', Icon: Dumbbell },
              { label: 'Stretching', q: 'stretching', Icon: Activity },
              { label: 'Warm-Up', q: 'warmup', Icon: Flame },
              { label: 'Back & Rows', q: 'row', Icon: Shield },
              { label: 'Biceps & Triceps', q: 'curl', Icon: Dumbbell },
              { label: 'Abs & Core', q: 'plank', Icon: Target },
            ].map(chip => {
              const IconComp = chip.Icon;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setSearchQuery(chip.q)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 transition-colors flex items-center gap-1 font-medium"
                >
                  <IconComp className="w-3 h-3 text-orange-400" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Suggestions List & 1-Click AI Search Fallback */}
          {searchQuery.trim() !== '' && (
            <div className="max-h-48 overflow-y-auto bg-gray-800 border border-gray-600 rounded-lg p-1.5 space-y-1 shadow-lg mt-1">
              {filteredLibrary.length > 0 ? (
                filteredLibrary.map((exItem, idx) => (
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
                ))
              ) : (
                <div className="p-3 text-center space-y-2">
                  <p className="text-xs text-gray-400">
                    &quot;{searchQuery}&quot; is not in the quick catalog.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerateWithAI(searchQuery)}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3.5 py-2 rounded-lg transition-colors shadow-md"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating Exercise Details & Video...
                      </>
                    ) : (
                      <>
                        <Bot className="w-3.5 h-3.5 text-purple-200" />
                        AI Generate & Attach Video for &quot;{searchQuery}&quot;
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Exercise Name & AI Search Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-300">
              Exercise Name <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAutoMatchVideo()}
                className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold"
                title="Click to cycle through different matching video tutorials"
              >
                <RefreshCw className="w-3 h-3" />
                {videoCycleIndex > 0 ? `Switch Video (${(videoCycleIndex % 4) + 1}/4)` : 'Auto-match video'}
              </button>

              <button
                type="button"
                onClick={() => handleGenerateWithAI(name)}
                disabled={aiLoading || !name.trim()}
                className="text-[11px] text-purple-400 hover:text-purple-300 disabled:opacity-50 flex items-center gap-1 font-semibold"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    AI Auto-Match
                  </>
                )}
              </button>
            </div>
          </div>
          <input
            type="text"
            required
            placeholder="e.g. Dumbbell Squats, Treadmill Running, Machine Chest Press"
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
            <div className="flex items-center gap-2.5">
              {cleanYouTubeId && (
                <button
                  type="button"
                  onClick={() => setPreviewVideo(p => !p)}
                  className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-orange-500 text-orange-500" />
                  {previewVideo ? 'Hide Preview' : 'Preview Video'}
                </button>
              )}
              {name.trim() && (
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' exercise form tutorial')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                >
                  Search on YouTube <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <div className="relative">
            <Link2 className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. MeIiIdhvXT4 or https://www.youtube.com/watch?v=MeIiIdhvXT4"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg text-xs focus:outline-none focus:border-orange-500 font-mono text-[11px]"
            />
          </div>

          {/* Alternative Video Quick Selector Pills */}
          {alternativeVideos.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-gray-400 font-medium">Alternative Videos:</span>
              {alternativeVideos.map((vidId, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setVideoUrl(vidId);
                    setPreviewVideo(true);
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                    cleanYouTubeId === vidId
                      ? 'bg-orange-500 text-white font-bold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>Video #{i + 1}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleAutoMatchVideo()}
                className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-0.5 ml-1"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Try Next
              </button>
            </div>
          )}

          {previewVideo && cleanYouTubeId && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-gray-600 shadow-md">
              <iframe
                key={cleanYouTubeId}
                src={`https://www.youtube-nocookie.com/embed/${cleanYouTubeId}?autoplay=0&rel=0&modestbranding=1`}
                title="Exercise Demonstration Preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Muscle Group & Difficulty */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Muscle Group / Category</label>
            <input
              type="text"
              placeholder="e.g. Quads / Glutes, Cardio & Conditioning, Chest, Back"
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
              <Layers className="w-3.5 h-3.5 text-orange-400" /> Sets
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
              <Repeat className="w-3.5 h-3.5 text-blue-400" /> Reps / Duration
            </label>
            <input
              type="text"
              placeholder="e.g. 10-12, 15 min, 45 sec"
              value={reps}
              onChange={e => setReps(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-2.5 py-1.5"
            />
          </div>

          <div>
            <label className="text-gray-300 font-medium mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-green-400" /> Rest
            </label>
            <input
              type="text"
              placeholder="e.g. 15s, 60s, 90s"
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
            placeholder="Describe setup, movement path, breathing, and stretching/lockout cues..."
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