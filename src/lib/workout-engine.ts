/**
 * GymFrek â€” Workout Plan Engine
 * Generates structured weekly workout plans based on fitness level, goal, and equipment.
 */

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_fitness';
export type Equipment = 'full_gym' | 'dumbbells_only' | 'no_equipment';

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  muscleGroup: string;
  instructions: string;
  difficulty: FitnessLevel;
  videoUrl?: string;
  alternativeVideos?: string[];
  gifUrl?: string;
  targetMuscles?: string[];
  equipment?: string;
  tips?: string[];
  commonMistakes?: string[];
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
  isRestDay: boolean;
}

export interface WorkoutPlan {
  level: FitnessLevel;
  goal: Goal;
  daysPerWeek: number;
  planType: string;
  schedule: WorkoutDay[];
  weeklyProgressionNote: string;
}

// â”€â”€â”€ Verified Alternative Videos Database â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const EXERCISE_ALTERNATIVE_VIDEOS: Record<string, string[]> = {
  chest_machine: ['xUm0BiKGcwE', 'rT7DgCr-3pg', 'VmB1G1K7v94', 'Iwe6AmxVf7o'],
  chest_bench: ['rT7DgCr-3pg', '4Y2ZdHCOXok', 'vcBig73ojpE', 'VmB1G1K7v94'],
  chest_incline: ['SrqOu55lrYU', '8iPEnn-ltC8', '0G2_kJ7444c', 'SKPab2YC8BE'],
  chest_fly: ['Iwe6AmxVf7o', 'eozdVDA78K0', 'rr6eFNNDQJE', '2z8JmcrW-As'],
  chest_dips: ['2z8JmcrW-As', 'Ym_N2K790eU', 'J0DnG1_S92I', '0326dy_-CzM'],

  legs_press: ['IZxyjW7MPJQ', 'CHPHn7v5s5Q', 's9_Jc4U2pG8', 'bEv6CCg2BC8'],
  legs_extension: ['m0Bg-w0j47Y', '1Tq3QdYUuHs', '8kXWb1tU81Y', 'IZxyjW7MPJQ'],
  legs_squat: ['bEv6CCg2BC8', 'ultWZbUMPL8', 'MeIiIdhvXT4', 'aclHkVaku9U'],
  legs_lunge: ['L8fvypPrzzs', '7jA_RkgN3k0', 'wrwwXE_x-pQ', 'bEv6CCg2BC8'],

  back_row: ['GZbfZ033f74', '9efgc2Wg0PQ', '6TSzcG1bZ8I', 'xQNrFHEMhI4'],
  back_pulldown: ['CAwf7n6Luuc', 'HNb446a8yK0', 'pYcpY20QaE8', 'eGo4IYlbE5g'],
  back_deadlift: ['_oyxCn2iSjU', 'hCDzSR6bW10', 'op9kVnSso6Q', 'rgn4nN9F0i8'],
  back_facepull: ['rep-qVOkqgk', 'EA7u4Q_84es', 'cc6UVRS7PW4', 'GZbfZ033f74'],

  shoulder_press: ['2yjwXTZQDDI', 'qEwKCR5JCog', 'B-aVuyhvLHU', 'q8m_iX46q_U'],
  shoulder_lateral: ['3VcKaXpzqRo', 'PzsMitRdI_8', 'kDqklX1ZESo', '140EXPBNXXU'],

  arms_biceps: ['kwG2ipFRgfo', 'in7PaeYlhrM', 'zC3nLlEvin4', 'ykJmrZ5v0Oo'],
  arms_triceps: ['vB5OHsJ3EME', '2-LAMcpzODU', '_gsUokN_Abg', '0326dy_-CzM'],

  core_abs: ['hdng3Nm1x_E', 'ASdvN_XEl_c', 'wkD8rjkodUI', '1919eP5nB_E'],
  stretching: ['L_xrDAtyPqI', 'g_tea8ZNk5A', 'sTxC3J3gQEU', 'eOz1_8LXZHk'],
  cardio: ['3gK-mYmO6Qk', 'auBLPXO8Fww', 'u3zgHI8QnqE', 'nmwgirgXLYM'],
};

// â”€â”€â”€ Exercise Database â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ExerciseDB {
  full_gym: Exercise;
  dumbbells_only: Exercise;
  no_equipment: Exercise;
}

function ex(
  name: string,
  sets: number,
  reps: string,
  rest: string,
  muscleGroup: string,
  instructions: string,
  difficulty: FitnessLevel,
  videoUrl?: string,
  targetMuscles?: string[],
  equipment?: string,
  tips?: string[],
  commonMistakes?: string[],
  alternativeVideos?: string[]
): Exercise {
  return {
    name,
    sets,
    reps,
    rest,
    muscleGroup,
    instructions,
    difficulty,
    videoUrl,
    alternativeVideos: alternativeVideos || (videoUrl ? [videoUrl] : []),
    targetMuscles: targetMuscles || [muscleGroup],
    equipment: equipment || 'Gym Equipment',
    tips: tips || ['Maintain steady breathing throughout each repetition.', 'Focus on mind-muscle connection and controlled tempo.'],
    commonMistakes: commonMistakes || ['Rushing through the reps with momentum.', 'Sacrificing full range of motion for heavier weight.'],
  };
}

/**
 * Comprehensive exercise database with Gym Machines, Barbells, Dumbbells, Bodyweight & Stretching.
 */
const EXERCISE_DB: Record<string, ExerciseDB> = {
  // â”€â”€ Machine & Free-Weight Chest â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  chest_machine_press: {
    full_gym: ex(
      'Machine Chest Press (Seated Chest Press)', 3, '10-12', '60s', 'Chest',
      'Adjust seat height so handles align with mid-chest. Plant feet firmly, brace core, and press handles forward smoothly until arms are almost fully extended. Lower with a 2-second control.',
      'beginner',
      'xUm0BiKGcwE',
      ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
      'Seated Chest Press Machine',
      ['Keep shoulder blades pinned against the back pad throughout the movement.', 'Do not bounce the weight stack at the bottom.'],
      ['Shrugging shoulders upward during the press.'],
      EXERCISE_ALTERNATIVE_VIDEOS.chest_machine
    ),
    dumbbells_only: ex(
      'Dumbbell Floor Press', 3, '10-12', '60s', 'Chest',
      'Lie on floor with dumbbells at chest level. Press up until arms extend, lower until triceps touch floor.',
      'beginner',
      'uUGDRwge4F8',
      ['Chest', 'Triceps'],
      'Dumbbells & Floor',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.chest_bench
    ),
    no_equipment: ex(
      'Push-Up with Slow Eccentric', 3, '10-15', '60s', 'Chest',
      'Standard pushup taking 3 full seconds to lower chest to floor before pushing up explosively.',
      'beginner',
      'IODxDxX7oi4',
      ['Pectoralis Major', 'Core', 'Triceps'],
      'Bodyweight / Floor',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.chest_bench
    ),
  },

  chest_press_compound: {
    full_gym: ex(
      'Barbell Bench Press', 4, '6-10', '90s', 'Chest',
      'Lie flat on bench, grip barbell slightly wider than shoulder-width. Lower bar with elbows at 45 degrees to mid-chest, pause briefly, then press explosively back up. Keep feet flat on floor and shoulder blades pinched together.',
      'intermediate',
      'rT7DgCr-3pg',
      ['Pectoralis Major', 'Anterior Deltoids', 'Triceps Brachii'],
      'Barbell & Flat Bench',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.chest_bench
    ),
    dumbbells_only: ex(
      'Dumbbell Bench Press', 4, '8-12', '75s', 'Chest',
      'Hold one dumbbell in each hand at chest level, lying on a flat bench or floor. Press upward in a slight triangle arc until arms are extended, then lower with control.',
      'beginner',
      'VmB1G1K7v94',
      ['Pectoralis Major', 'Triceps', 'Shoulders'],
      'Pair of Dumbbells',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.chest_bench
    ),
    no_equipment: ex(
      'Push-Up', 4, '10-20', '60s', 'Chest',
      'Start in a high plank with hands slightly wider than shoulders. Lower chest to just above the floor with elbows at 45 degrees, then push back up.',
      'beginner',
      'IODxDxX7oi4',
      ['Pectoralis Major', 'Core / Abs', 'Triceps'],
      'Bodyweight / Floor',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.chest_bench
    ),
  },

  chest_incline: {
    full_gym: ex(
      'Incline Barbell Press', 3, '8-12', '75s', 'Upper Chest',
      'Set bench to 30-45 degrees. Grip barbell just wider than shoulders. Lower bar to upper chest under control, then press up. Focus on squeezing upper pecs.',
      'intermediate',
      'SrqOu55lrYU',
      ['Clavicular Upper Pecs', 'Anterior Deltoids', 'Triceps'],
      'Barbell & Incline Bench',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.chest_incline
    ),
    dumbbells_only: ex(
      'Incline Dumbbell Press', 3, '10-12', '75s', 'Upper Chest',
      'Set a bench to 30-45 degree incline. Press dumbbells from shoulder level upward in an arc, converging at the top.',
      'beginner',
      '8iPEnn-ltC8',
      ['Upper Pectorals', 'Front Delts', 'Triceps'],
      'Incline Bench & Dumbbells',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.chest_incline
    ),
    no_equipment: ex(
      'Decline Push-Up', 3, '10-15', '60s', 'Upper Chest',
      'Elevate feet on a chair, bed or step with hands on the floor. Perform push-ups in this angled position to place maximum resistance onto upper chest.',
      'beginner',
      'SKPab2YC8BE',
      ['Upper Chest', 'Anterior Delts', 'Triceps'],
      'Chair or Elevated Surface',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.chest_incline
    ),
  },

  chest_fly: {
    full_gym: ex(
      'Pec Deck Machine Fly / Cable Fly', 3, '12-15', '60s', 'Chest',
      'Sit on pec deck machine with back flat against pad. Grip handles and bring arms together in a hugging motion, squeezing pecs for 1 full second at peak contraction.',
      'beginner',
      'Iwe6AmxVf7o',
      ['Inner & Outer Pectorals', 'Anterior Deltoids'],
      'Pec Deck Machine / Cables',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.chest_fly
    ),
    dumbbells_only: ex(
      'Dumbbell Chest Fly', 3, '12-15', '60s', 'Chest',
      'Lie on bench holding dumbbells above chest, palms facing each other. Lower dumbbells in wide arcs until you feel a comfortable chest stretch.',
      'beginner',
      'eozdVDA78K0',
      ['Pectoralis Major', 'Chest Stretch'],
      'Dumbbells & Bench',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.chest_fly
    ),
    no_equipment: ex(
      'Wide Push-Up', 3, '12-15', '60s', 'Chest',
      'Place hands 1.5x wider than shoulder-width. Lower slowly to maximize stretch across the pectoral fibers, then press back up.',
      'beginner',
      'rr6eFNNDQJE',
      ['Outer Pectorals', 'Serratus Anterior'],
      'Bodyweight / Floor',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.chest_fly
    ),
  },

  // â”€â”€ Machine & Free-Weight Legs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  legs_machine_press: {
    full_gym: ex(
      'Leg Press (Machine)', 4, '10-12', '75s', 'Quads / Glutes',
      'Place feet shoulder-width on footplate. Release safety bars and lower platform until knees are at 90 degrees. Press platform back up through midfoot and heels. Never lock knees violently.',
      'beginner',
      'IZxyjW7MPJQ',
      ['Quadriceps', 'Gluteus Maximus', 'Hamstrings'],
      '45-Degree Leg Press Machine',
      ['Keep lower back pressed firmly into the backrest at all times.'],
      ['Hyperextending and locking out knees at the top.'],
      EXERCISE_ALTERNATIVE_VIDEOS.legs_press
    ),
    dumbbells_only: ex(
      'Dumbbell Goblet Squat', 4, '10-12', '75s', 'Quads / Glutes',
      'Hold a heavy dumbbell vertically against chest. Squat down between knees, keeping torso upright.',
      'beginner',
      'MeIiIdhvXT4',
      ['Quads', 'Glutes', 'Core'],
      'Single Heavy Dumbbell',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.legs_squat
    ),
    no_equipment: ex(
      'Bodyweight Air Squat', 4, '15-20', '60s', 'Quads / Glutes',
      'Stand with feet shoulder-width. Lower hips down and back below knee level, keeping heels planted, then drive back up to standing.',
      'beginner',
      'aclHkVaku9U',
      ['Quadriceps', 'Glutes', 'Hamstrings'],
      'Bodyweight / Floor',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.legs_squat
    ),
  },

  legs_machine_extension_curl: {
    full_gym: ex(
      'Leg Extension & Lying Leg Curl (Machine)', 3, '12-15', '60s', 'Quads & Hamstrings',
      'Sit in leg extension machine with pad against lower shins. Extend knees fully, pausing 1s at top for quads. Follow with lying leg curl machine for hamstring isolation.',
      'beginner',
      'm0Bg-w0j47Y',
      ['Quadriceps Isolation', 'Hamstrings'],
      'Leg Extension & Leg Curl Machine',
      ['Adjust back pad so your knee joint aligns directly with the machine pivot.'],
      ['Kicking with momentum instead of contracting quads.'],
      EXERCISE_ALTERNATIVE_VIDEOS.legs_extension
    ),
    dumbbells_only: ex(
      'Dumbbell Romanian Deadlift', 3, '10-12', '75s', 'Hamstrings / Lower Back',
      'Hold dumbbells against front of thighs. Push hips backwards, lowering dumbbells just below knees, feeling deep stretch in hamstrings.',
      'beginner',
      'hCDzSR6bW10',
      ['Hamstrings', 'Glutes'],
      'Pair of Dumbbells',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.back_deadlift
    ),
    no_equipment: ex(
      'Single-Leg Glute Bridge', 3, '12-15 each', '45s', 'Glutes & Hamstrings',
      'Lie on back with one leg extended in air. Drive heel of working foot into ground to raise hips.',
      'beginner',
      '0aW_eY23Yt8',
      ['Glutes', 'Hamstrings'],
      'Bodyweight / Floor',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.legs_squat
    ),
  },

  legs_squat: {
    full_gym: ex(
      'Barbell Back Squat', 4, '6-10', '90s', 'Quads / Glutes',
      'Rest bar across upper traps. Stand shoulder-width, toes angled slightly out. Sit hips back and down until thighs are parallel to floor, then drive through mid-foot to stand.',
      'intermediate',
      'bEv6CCg2BC8',
      ['Quadriceps', 'Gluteus Maximus', 'Adductors', 'Core'],
      'Barbell & Squat Rack',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.legs_squat
    ),
    dumbbells_only: ex(
      'Dumbbell Goblet Squat', 4, '10-12', '75s', 'Quads / Glutes',
      'Hold a heavy dumbbell vertically against chest. Squat down between knees, keeping torso upright.',
      'beginner',
      'MeIiIdhvXT4',
      ['Quads', 'Glutes', 'Core'],
      'Single Heavy Dumbbell',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.legs_squat
    ),
    no_equipment: ex(
      'Bodyweight Air Squat', 4, '15-20', '60s', 'Quads / Glutes',
      'Stand with feet shoulder-width. Lower hips down and back below knee level, keeping heels planted.',
      'beginner',
      'aclHkVaku9U',
      ['Quadriceps', 'Glutes', 'Hamstrings'],
      'Bodyweight / Floor',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.legs_squat
    ),
  },

  legs_lunge: {
    full_gym: ex(
      'Walking Dumbbell Lunges', 3, '10-12 each', '60s', 'Quads / Glutes',
      'Step forward with one leg, lowering hips until both knees are at 90 degrees. Drive off front heel to step into the next rep.',
      'beginner',
      'L8fvypPrzzs',
      ['Quads', 'Glutes', 'Hamstrings', 'Balance'],
      'Pair of Dumbbells',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.legs_lunge
    ),
    dumbbells_only: ex(
      'Dumbbell Reverse Lunges', 3, '10-12 each', '60s', 'Quads / Glutes',
      'Hold dumbbells at sides. Step backward with one leg and lower rear knee toward floor. Push through front foot to return.',
      'beginner',
      '7jA_RkgN3k0',
      ['Quads', 'Glutes'],
      'Pair of Dumbbells',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.legs_lunge
    ),
    no_equipment: ex(
      'Walking Lunges (Bodyweight)', 3, '12-15 each', '60s', 'Quads / Glutes',
      'Step forward in smooth walking cadence, dropping back knee gently toward floor. Keep torso upright.',
      'beginner',
      'wrwwXE_x-pQ',
      ['Quads', 'Glutes'],
      'Bodyweight',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.legs_lunge
    ),
  },

  // â”€â”€ Back & Machine Rows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  back_machine_row: {
    full_gym: ex(
      'Seated Cable Row / Machine Row', 3, '10-12', '60s', 'Back',
      'Sit at low cable row with feet on footrests. Pull handle to abdomen, driving elbows back and squeezing shoulder blades together. Slowly extend arms with control.',
      'beginner',
      'GZbfZ033f74',
      ['Latissimus Dorsi', 'Rhomboids', 'Middle Traps', 'Biceps'],
      'Seated Cable Row Station',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.back_row
    ),
    dumbbells_only: ex(
      'Dumbbell Bent-Over Row', 4, '10-12', '75s', 'Back',
      'Hinge at hips holding dumbbells with neutral grip. Row dumbbells up to hip level, pinching shoulder blades at the top.',
      'beginner',
      '6TSzcG1bZ8I',
      ['Lats', 'Upper Back', 'Biceps'],
      'Pair of Dumbbells',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.back_row
    ),
    no_equipment: ex(
      'Inverted Table Row', 4, '10-15', '60s', 'Back',
      'Lie under a sturdy table, grip the edge, and pull chest up to table keeping body straight. Lower with control.',
      'beginner',
      'hXTc1mDNnOI',
      ['Lats', 'Rhomboids', 'Rear Delts'],
      'Sturdy Table or Low Bar',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.back_row
    ),
  },

  back_pulldown: {
    full_gym: ex(
      'Lat Pulldown (Machine / Cable)', 3, '10-12', '75s', 'Lats',
      'Grip bar wider than shoulders. Sit with thighs under pads. Pull bar to upper collarbone driving elbows down and back. Slowly extend arms overhead.',
      'beginner',
      'CAwf7n6Luuc',
      ['Latissimus Dorsi', 'Teres Major', 'Biceps'],
      'Lat Pulldown Cable Station',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.back_pulldown
    ),
    dumbbells_only: ex(
      'Single-Arm Dumbbell Row', 3, '10-12', '60s', 'Lats',
      'Place one knee and hand on flat bench. Row dumbbell from dead-hang to hip socket, pulling elbow back. Switch sides.',
      'beginner',
      'pYcpY20QaE8',
      ['Latissimus Dorsi', 'Rhomboids'],
      'Flat Bench & Dumbbell',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.back_pulldown
    ),
    no_equipment: ex(
      'Pull-Up', 3, '5-10', '90s', 'Lats',
      'Hang from bar with overhand grip. Pull body up until chin clears the bar, leading with elbows. Lower over 2-3 seconds.',
      'intermediate',
      'eGo4IYlbE5g',
      ['Lats', 'Upper Back', 'Biceps', 'Grip'],
      'Pull-Up Bar',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.back_pulldown
    ),
  },

  back_deadlift: {
    full_gym: ex(
      'Romanian Deadlift (Barbell RDL)', 3, '8-10', '90s', 'Hamstrings / Lower Back',
      'Stand with barbell at hip height, soft knees. Hinge at hips pushing buttocks back while bar glides down shins until deep hamstring stretch. Drive hips forward to stand.',
      'intermediate',
      '_oyxCn2iSjU',
      ['Hamstrings', 'Gluteus Maximus', 'Erector Spinae'],
      'Barbell & Plates',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.back_deadlift
    ),
    dumbbells_only: ex(
      'Dumbbell Romanian Deadlift', 3, '10-12', '75s', 'Hamstrings / Lower Back',
      'Hold dumbbells against front of thighs. Push hips backwards, lowering dumbbells just below knees, feeling stretch in hamstrings.',
      'beginner',
      'hCDzSR6bW10',
      ['Hamstrings', 'Glutes', 'Lower Back'],
      'Pair of Dumbbells',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.back_deadlift
    ),
    no_equipment: ex(
      'Good Morning (Bodyweight)', 3, '12-15', '60s', 'Hamstrings / Lower Back',
      'Stand feet hip-width, hands behind head. Push hips backward, bowing forward until torso is parallel to floor.',
      'beginner',
      'rgn4nN9F0i8',
      ['Hamstrings', 'Glutes', 'Lower Back'],
      'Bodyweight',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.back_deadlift
    ),
  },

  // â”€â”€ Shoulders & Overhead â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  shoulder_press_compound: {
    full_gym: ex(
      'Overhead Barbell Military Press / Machine Shoulder Press', 4, '6-10', '90s', 'Shoulders',
      'Press barbell or machine handles vertically overhead, locking out with biceps aligned near ears. Lower with control to collarbone.',
      'intermediate',
      '2yjwXTZQDDI',
      ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps', 'Core'],
      'Barbell & Rack / Shoulder Machine',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.shoulder_press
    ),
    dumbbells_only: ex(
      'Seated Dumbbell Shoulder Press', 4, '10-12', '75s', 'Shoulders',
      'Sit on bench holding dumbbells at shoulder level. Press overhead until arms are nearly locked out, then lower with control.',
      'beginner',
      'qEwKCR5JCog',
      ['Front & Side Deltoids', 'Triceps'],
      'Dumbbells & Bench',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.shoulder_press
    ),
    no_equipment: ex(
      'Pike Push-Up', 4, '10-15', '60s', 'Shoulders',
      'Form an inverted V shape with hips elevated high. Lower top of head toward floor between hands, then press back up explosively.',
      'beginner',
      'q8m_iX46q_U',
      ['Anterior Deltoids', 'Triceps', 'Core'],
      'Bodyweight / Floor',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.shoulder_press
    ),
  },

  shoulder_lateral: {
    full_gym: ex(
      'Dumbbell / Cable Lateral Raise', 4, '12-15', '45s', 'Side Deltoids',
      'Stand holding dumbbells or low cables at sides. Raise arms laterally to shoulder height with slight elbow bend. Lower under 2-second control.',
      'beginner',
      '3VcKaXpzqRo',
      ['Lateral Deltoid (Boulder Shoulders)'],
      'Pair of Dumbbells / Cable',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.shoulder_lateral
    ),
    dumbbells_only: ex(
      'Dumbbell Lateral Raise', 4, '12-15', '45s', 'Side Deltoids',
      'Stand holding dumbbells at sides. Raise arms out to shoulder height with slight elbow bend. Avoid shrugging traps.',
      'beginner',
      '3VcKaXpzqRo',
      ['Side Delts'],
      'Dumbbells',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.shoulder_lateral
    ),
    no_equipment: ex(
      'Lateral Arm Circles & Pulses', 3, '45 sec', '30s', 'Side Deltoids',
      'Extend arms straight out to sides at shoulder height. Make small controlled circles for 45s continuously.',
      'beginner',
      '140EXPBNXXU',
      ['Deltoids Endurance'],
      'Bodyweight',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.shoulder_lateral
    ),
  },

  // â”€â”€ Arms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  arms_biceps: {
    full_gym: ex(
      'Barbell Bicep Curl / Preacher Machine Curl', 3, '10-12', '60s', 'Biceps',
      'Grip barbell or machine handles shoulder-width. Curl upward towards shoulders, squeezing biceps at top. Lower over 2 seconds.',
      'beginner',
      'kwG2ipFRgfo',
      ['Biceps Brachii', 'Brachialis', 'Forearms'],
      'Barbell / EZ Bar / Machine',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.arms_biceps
    ),
    dumbbells_only: ex(
      'Dumbbell Hammer Curl', 3, '10-12', '60s', 'Biceps / Forearms',
      'Hold dumbbells with palms facing each other (neutral grip). Curl weights upward keeping wrists neutral.',
      'beginner',
      'zC3nLlEvin4',
      ['Brachialis', 'Biceps', 'Brachioradialis Forearm'],
      'Dumbbells',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.arms_biceps
    ),
    no_equipment: ex(
      'Towel Bicep Curl / Isometric', 3, '12-15', '45s', 'Biceps',
      'Loop a sturdy towel under feet, grip both ends and pull upward with maximal bicep tension.',
      'beginner',
      'p_8pWj1bB9k',
      ['Biceps Brachii'],
      'Towel / Resistance',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.arms_biceps
    ),
  },

  arms_triceps: {
    full_gym: ex(
      'Cable Triceps Rope Pushdown', 3, '12-15', '45s', 'Triceps',
      'Grip rope attachment with high cable. Push hands down and spread rope apart at the bottom, locking out triceps with maximal contraction.',
      'beginner',
      'vB5OHsJ3EME',
      ['Lateral & Medial Triceps Heads'],
      'Cable Machine & Rope',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.arms_triceps
    ),
    dumbbells_only: ex(
      'Overhead Dumbbell Triceps Extension', 3, '10-12', '60s', 'Triceps',
      'Hold one dumbbell with both hands overhead. Lower weight behind head until forearms hit biceps, then press back overhead.',
      'beginner',
      '_gsUokN_Abg',
      ['Long Head of Triceps'],
      'Single Dumbbell',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.arms_triceps
    ),
    no_equipment: ex(
      'Bench / Chair Triceps Dips', 3, '12-15', '45s', 'Triceps',
      'Place hands on edge of chair behind you. Lower body by bending elbows to 90 degrees, then push through palms.',
      'beginner',
      '0326dy_-CzM',
      ['Triceps', 'Front Shoulders'],
      'Chair or Bed Edge',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.arms_triceps
    ),
  },

  // â”€â”€ Core / Abs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  core_plank: {
    full_gym: ex(
      'Hanging Leg Raise / Cable Crunch', 3, '12-15', '60s', 'Core / Abs',
      'Hang from pull-up bar. Without swinging, lift knees or straight legs up to 90 degrees, tilting pelvis up into lower abs.',
      'intermediate',
      'hdng3Nm1x_E',
      ['Lower Rectus Abdominis', 'Hip Flexors', 'Grip'],
      'Pull-Up Bar Station',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.core_abs
    ),
    dumbbells_only: ex(
      'Dumbbell Russian Twist', 3, '20 total', '45s', 'Obliques / Abs',
      'Sit on floor with knees bent and feet elevated. Rotate dumbbell from side to side touching the ground.',
      'beginner',
      'wkD8rjkodUI',
      ['Internal & External Obliques', 'Rectus Abdominis'],
      'Single Dumbbell',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.core_abs
    ),
    no_equipment: ex(
      'Forearm Plank Hold', 3, '45-60 sec', '45s', 'Core',
      'Rest on forearms and toes. Keep body in rigid straight line, squeezing glutes and pulling belly button in toward spine.',
      'beginner',
      'ASdvN_XEl_c',
      ['Transverse Abdominis', 'Rectus Abdominis', 'Lower Back'],
      'Floor Mat',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.core_abs
    ),
  },

  // â”€â”€ Stretching & Mobility â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  stretching_full_body: {
    full_gym: ex(
      'Full Body Dynamic & Static Stretching Routine', 3, '30-45 sec per stretch', '15s', 'Mobility & Stretching',
      'Head-to-toe stretching sequence: neck rolls, shoulder pass-throughs, cat-cow spine flexion, standing hamstring fold, hip flexor stretch, and butterfly.',
      'beginner',
      'L_xrDAtyPqI',
      ['Full Body Mobility', 'Hamstrings', 'Hip Flexors', 'Chest', 'Spine'],
      'Mat / Resistance Band',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.stretching
    ),
    dumbbells_only: ex(
      'Post-Workout Full Body Stretching', 3, '30 sec each', '15s', 'Mobility & Stretching',
      'Standing quad stretch, cross-body shoulder stretch, downward dog calf stretch, world greatest stretch, and child pose.',
      'beginner',
      'g_tea8ZNk5A',
      ['Hamstrings', 'Quadriceps', 'Shoulders', 'Lats'],
      'Floor Mat',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.stretching
    ),
    no_equipment: ex(
      'Daily Full Body Stretching & Mobility', 3, '30-45 sec', '15s', 'Mobility & Stretching',
      'Forward fold for hamstrings, cobra pose for abs/lower back, pigeon pose for glutes, and doorway chest stretch.',
      'beginner',
      'sTxC3J3gQEU',
      ['Full Body Flexibility', 'Spine', 'Hips', 'Hamstrings'],
      'Bodyweight / Floor',
      undefined, undefined,
      EXERCISE_ALTERNATIVE_VIDEOS.stretching
    ),
  },
};

// â”€â”€â”€ Plan Generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function generateWorkoutPlan(
  level: FitnessLevel = 'beginner',
  goal: Goal = 'maintain',
  equipment: Equipment = 'full_gym'
): WorkoutPlan {
  const getEx = (slotKey: string) => {
    const slot = EXERCISE_DB[slotKey];
    if (!slot) return EXERCISE_DB['chest_press_compound'][equipment];
    return slot[equipment];
  };

  const schedule: WorkoutDay[] = [
    {
      day: 'Monday',
      focus: 'Chest & Triceps (Push)',
      isRestDay: false,
      exercises: [
        getEx('chest_press_compound'),
        getEx('chest_machine_press'),
        getEx('chest_incline'),
        getEx('chest_fly'),
        getEx('shoulder_press_compound'),
        getEx('shoulder_lateral'),
        getEx('arms_triceps'),
      ],
    },
    {
      day: 'Tuesday',
      focus: 'Back & Biceps (Pull)',
      isRestDay: false,
      exercises: [
        getEx('back_deadlift'),
        getEx('back_machine_row'),
        getEx('back_pulldown'),
        getEx('arms_biceps'),
        getEx('core_plank'),
      ],
    },
    {
      day: 'Wednesday',
      focus: 'Active Rest & Recovery',
      isRestDay: true,
      exercises: [
        getEx('stretching_full_body'),
      ],
    },
    {
      day: 'Thursday',
      focus: 'Legs & Core',
      isRestDay: false,
      exercises: [
        getEx('legs_squat'),
        getEx('legs_machine_press'),
        getEx('legs_lunge'),
        getEx('legs_machine_extension_curl'),
        getEx('core_plank'),
      ],
    },
    {
      day: 'Friday',
      focus: 'Upper Body Hypertrophy',
      isRestDay: false,
      exercises: [
        getEx('chest_machine_press'),
        getEx('back_machine_row'),
        getEx('shoulder_press_compound'),
        getEx('arms_biceps'),
        getEx('arms_triceps'),
      ],
    },
    {
      day: 'Saturday',
      focus: 'Lower Body & Conditioning',
      isRestDay: false,
      exercises: [
        getEx('legs_machine_press'),
        getEx('legs_lunge'),
        getEx('core_plank'),
      ],
    },
    {
      day: 'Sunday',
      focus: 'Rest & Full Recovery',
      isRestDay: true,
      exercises: [
        getEx('stretching_full_body'),
      ],
    },
  ];

  return {
    level,
    goal,
    daysPerWeek: level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5,
    planType: `${level.toUpperCase()} Split (${equipment.replace('_', ' ').toUpperCase()})`,
    schedule,
    weeklyProgressionNote: 'Increase weight or add 1 rep each week while maintaining strict exercise form and controlled tempo.',
  };
}

/**
 * Intelligent fuzzy matcher to find videos and tutorials for ANY exercise name or keyword, with cyclic index support.
 */
export function findExerciseVideo(name: string, cycleIndex: number = 0): Partial<Exercise> | null {
  if (!name || !name.trim()) return null;
  const q = name.toLowerCase().trim();

  // Helper to pick video at cycleIndex
  const pickVideo = (vList: string[]) => {
    if (!vList || vList.length === 0) return 'rT7DgCr-3pg';
    const safeIdx = Math.abs(cycleIndex) % vList.length;
    return vList[safeIdx];
  };

  // 1. Direct Search in EXERCISE_DB
  for (const slotKey of Object.keys(EXERCISE_DB)) {
    const slot = EXERCISE_DB[slotKey];
    for (const eq of ['full_gym', 'dumbbells_only', 'no_equipment'] as Equipment[]) {
      const exItem = slot[eq];
      if (
        exItem.name.toLowerCase() === q ||
        exItem.name.toLowerCase().includes(q) ||
        q.includes(exItem.name.toLowerCase())
      ) {
        const alts = exItem.alternativeVideos && exItem.alternativeVideos.length > 0
          ? exItem.alternativeVideos
          : [exItem.videoUrl || 'rT7DgCr-3pg'];
        return {
          name: exItem.name,
          videoUrl: pickVideo(alts),
          alternativeVideos: alts,
          muscleGroup: exItem.muscleGroup,
          instructions: exItem.instructions,
          targetMuscles: exItem.targetMuscles,
          equipment: exItem.equipment,
          tips: exItem.tips,
          commonMistakes: exItem.commonMistakes,
        };
      }
    }
  }

  // 2. Multi-word Tokenized Fuzzy Search
  const tokens = q.split(/\s+/).filter(t => t.length > 2);
  for (const slotKey of Object.keys(EXERCISE_DB)) {
    const slot = EXERCISE_DB[slotKey];
    for (const eq of ['full_gym', 'dumbbells_only', 'no_equipment'] as Equipment[]) {
      const exItem = slot[eq];
      const exLower = exItem.name.toLowerCase();
      const matchCount = tokens.filter(t => exLower.includes(t)).length;
      if (matchCount >= 2 || (tokens.length === 1 && matchCount === 1)) {
        const alts = exItem.alternativeVideos && exItem.alternativeVideos.length > 0
          ? exItem.alternativeVideos
          : [exItem.videoUrl || 'rT7DgCr-3pg'];
        return {
          name: exItem.name,
          videoUrl: pickVideo(alts),
          alternativeVideos: alts,
          muscleGroup: exItem.muscleGroup,
          instructions: exItem.instructions,
          targetMuscles: exItem.targetMuscles,
          equipment: exItem.equipment,
          tips: exItem.tips,
          commonMistakes: exItem.commonMistakes,
        };
      }
    }
  }

  // 3. Category Fallback Mapping
  if (q.includes('extension') || q.includes('leg curl') || (q.includes('machine') && q.includes('leg'))) {
    return {
      name: 'Leg Extension & Curl Machine',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.legs_extension),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.legs_extension,
      muscleGroup: 'Quads & Hamstrings',
      instructions: 'Contract quads to full knee extension or curl heels back towards buttocks under strict control.',
      targetMuscles: ['Quadriceps', 'Hamstrings'],
      equipment: 'Leg Machine',
    };
  }

  if (q.includes('machine') && q.includes('chest')) {
    return {
      name: 'Machine Chest Press',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.chest_machine),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.chest_machine,
      muscleGroup: 'Chest',
      instructions: 'Sit with handles at mid-chest height. Press forward smoothly until arms are nearly extended, lower with a 2-second control.',
      targetMuscles: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps'],
      equipment: 'Seated Chest Press Machine',
    };
  }

  if (q.includes('leg press')) {
    return {
      name: 'Leg Press Machine',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.legs_press),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.legs_press,
      muscleGroup: 'Quads / Glutes',
      instructions: 'Place feet shoulder-width on footplate. Lower platform to 90 degrees knee bend, press back up without locking knees.',
      targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
      equipment: 'Leg Press Machine',
    };
  }

  if (q.includes('stretch') || q.includes('mobility') || q.includes('flexibility') || q.includes('yoga')) {
    return {
      name: 'Full Body Dynamic & Static Stretching',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.stretching),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.stretching,
      muscleGroup: 'Mobility & Stretching',
      instructions: 'Head-to-toe stretching sequence: hold each stretch for 30 seconds while breathing deeply to release muscular tension and improve recovery.',
      targetMuscles: ['Full Body Flexibility', 'Hamstrings', 'Hips', 'Shoulders', 'Spine'],
      equipment: 'Mat / Bodyweight',
    };
  }

  if (q.includes('warmup') || q.includes('warm up')) {
    return {
      name: 'Dynamic Warm-Up Routine',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.stretching),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.stretching,
      muscleGroup: 'Full Body Warm-Up',
      instructions: 'Arm circles, leg swings, hip openers, and bodyweight squats to prime muscles and joints before training.',
      targetMuscles: ['Joints', 'Cardiovascular', 'Mobility'],
      equipment: 'Bodyweight',
    };
  }

  if (q.includes('cardio') || q.includes('treadmill') || q.includes('running') || q.includes('walk')) {
    return {
      name: 'Cardio & Incline Treadmill Walk',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.cardio),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.cardio,
      muscleGroup: 'Cardio & Conditioning',
      instructions: 'Maintain steady pace at 10-12% incline or alternate jogging intervals for maximum caloric expenditure.',
      targetMuscles: ['Cardiovascular System', 'Calves', 'Glutes'],
      equipment: 'Treadmill / Track',
    };
  }

  if (q.includes('curl') || q.includes('bicep')) {
    return {
      name: 'Bicep Curl',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.arms_biceps),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.arms_biceps,
      muscleGroup: 'Biceps',
      instructions: 'Curl weight upward squeezing biceps at peak contraction. Lower with a 2-second eccentric phase.',
      targetMuscles: ['Biceps Brachii', 'Forearms'],
      equipment: 'Dumbbells / Barbell / Cable',
    };
  }

  if (q.includes('tricep') || q.includes('pushdown') || q.includes('extension') || q.includes('dip')) {
    return {
      name: 'Triceps Extension / Pushdown',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.arms_triceps),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.arms_triceps,
      muscleGroup: 'Triceps',
      instructions: 'Extend forearms downward locking out elbows to contract all three triceps heads.',
      targetMuscles: ['Triceps Brachii'],
      equipment: 'Cable or Dumbbell',
    };
  }

  if (q.includes('squat') || q.includes('leg') || q.includes('quad')) {
    return {
      name: 'Squat',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.legs_squat),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.legs_squat,
      muscleGroup: 'Quads / Glutes',
      instructions: 'Sit hips down and back with knees aligned over toes. Drive through midfoot to stand.',
      targetMuscles: ['Quadriceps', 'Glutes'],
      equipment: 'Barbell / Dumbbell / Bodyweight',
    };
  }

  if (q.includes('bench') || q.includes('press') || q.includes('chest') || q.includes('pushup') || q.includes('push up')) {
    return {
      name: 'Chest Press',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.chest_bench),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.chest_bench,
      muscleGroup: 'Chest',
      instructions: 'Lower weight with elbows at 45 degrees until chest stretch, then press back up explosively.',
      targetMuscles: ['Pectoralis Major', 'Triceps', 'Front Delts'],
      equipment: 'Bench & Barbell / Dumbbells',
    };
  }

  if (q.includes('row') || q.includes('pull') || q.includes('lat') || q.includes('back')) {
    return {
      name: 'Back Row / Pulldown',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.back_row),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.back_row,
      muscleGroup: 'Back',
      instructions: 'Pull weight towards lower ribs driving elbows back and squeezing shoulder blades.',
      targetMuscles: ['Lats', 'Rhomboids', 'Biceps'],
      equipment: 'Barbell / Cable / Dumbbells',
    };
  }

  if (q.includes('shoulder') || q.includes('delt') || q.includes('overhead') || q.includes('raise')) {
    return {
      name: 'Shoulder Press / Lateral Raise',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.shoulder_lateral),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.shoulder_lateral,
      muscleGroup: 'Shoulders',
      instructions: 'Raise weight with controlled tempo to shoulder height without shrugging traps.',
      targetMuscles: ['Deltoids'],
      equipment: 'Dumbbells / Barbell',
    };
  }

  if (q.includes('plank') || q.includes('ab') || q.includes('core') || q.includes('crunch')) {
    return {
      name: 'Plank & Core Exercise',
      videoUrl: pickVideo(EXERCISE_ALTERNATIVE_VIDEOS.core_abs),
      alternativeVideos: EXERCISE_ALTERNATIVE_VIDEOS.core_abs,
      muscleGroup: 'Core / Abs',
      instructions: 'Hold rigid plank posture bracing abdominal wall and glutes.',
      targetMuscles: ['Rectus Abdominis', 'Transverse Abdominis'],
      equipment: 'Bodyweight / Floor',
    };
  }

  return null;
}

/**
 * Returns all unique exercises in the system with their video URLs and metadata.
 */
export function getAllPreloadedExercises(): Exercise[] {
  const seen = new Set<string>();
  const results: Exercise[] = [];

  for (const slotKey of Object.keys(EXERCISE_DB)) {
    const slot = EXERCISE_DB[slotKey];
    for (const eq of ['full_gym', 'dumbbells_only', 'no_equipment'] as Equipment[]) {
      const exItem = slot[eq];
      if (!seen.has(exItem.name)) {
        seen.add(exItem.name);
        results.push(exItem);
      }
    }
  }
  return results;
}