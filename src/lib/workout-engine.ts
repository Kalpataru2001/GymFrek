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
  reps: string;        // e.g. "8-12" or "30 sec"
  rest: string;        // e.g. "60s"
  muscleGroup: string;
  instructions: string;
  difficulty: FitnessLevel;
  videoUrl?: string;   // YouTube Video Form Guide ID (e.g. rT7DgCr-3pg)
  gifUrl?: string;     // Animated demonstration GIF/SVG
  targetMuscles?: string[];
  equipment?: string;
  tips?: string[];
  commonMistakes?: string[];
}

export interface WorkoutDay {
  day: string;         // "Monday", "Wednesday" etc.
  focus: string;       // "Full Body", "Push", "Pull", "Legs", "Upper", "Lower"
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
  commonMistakes?: string[]
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
    targetMuscles: targetMuscles || [muscleGroup],
    equipment: equipment || 'Gym Equipment',
    tips: tips || ['Maintain steady breathing throughout each repetition.', 'Focus on mind-muscle connection and controlled tempo.'],
    commonMistakes: commonMistakes || ['Rushing through the reps with momentum.', 'Sacrificing full range of motion for heavier weight.'],
  };
}

/**
 * Comprehensive exercise database (40+ entries) with HD video demos, muscle anatomy, and form tips.
 */
const EXERCISE_DB: Record<string, ExerciseDB> = {
  // â”€â”€ Chest â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  chest_press_compound: {
    full_gym: ex(
      'Barbell Bench Press', 4, '6-10', '90s', 'Chest',
      'Lie flat on bench, grip barbell slightly wider than shoulder-width. Lower bar with elbows at 45 degrees to mid-chest, pause briefly, then press explosively back up. Keep feet flat on floor and shoulder blades pinched together.',
      'intermediate',
      'rT7DgCr-3pg',
      ['Pectoralis Major', 'Anterior Deltoids', 'Triceps Brachii'],
      'Barbell & Flat Bench',
      ['Pinch your shoulder blades and drive your feet firmly into the ground.', 'Lower the bar slowly over 2-3 seconds for maximum pec stretch.'],
      ['Bouncing the barbell off your sternum.', 'Flaring elbows out at a 90-degree angle which strains rotator cuffs.']
    ),
    dumbbells_only: ex(
      'Dumbbell Bench Press', 4, '8-12', '75s', 'Chest',
      'Hold one dumbbell in each hand at chest level, lying on a flat bench or floor. Press upward in a slight triangle arc until arms are extended, then lower with control.',
      'beginner',
      'VmB1G1K7v94',
      ['Pectoralis Major', 'Triceps', 'Shoulders'],
      'Pair of Dumbbells',
      ['Allow dumbbells to give you a deeper, safer stretch at the bottom than a barbell.', 'Squeeze pecs at the top of the movement.'],
      ['Clinking dumbbells aggressively at the top.', 'Arching lower back off the bench excessively.']
    ),
    no_equipment: ex(
      'Push-Up', 4, '10-20', '60s', 'Chest',
      'Start in a high plank with hands slightly wider than shoulders. Lower chest to just above the floor with elbows at 45 degrees, then push back up through the palms while keeping core tight.',
      'beginner',
      'IODxDxX7oi4',
      ['Pectoralis Major', 'Core / Abs', 'Triceps', 'Front Shoulders'],
      'Bodyweight / Floor',
      ['Keep your glutes and abs squeezed tight to maintain a straight line from neck to heels.', 'Push the ground away actively at the top.'],
      ['Sagging hips or piking your buttocks up in the air.', 'Flaring elbows straight out to the sides.']
    ),
  },

  chest_incline: {
    full_gym: ex(
      'Incline Barbell Press', 3, '8-12', '75s', 'Upper Chest',
      'Set bench to 30-45 degrees. Grip barbell just wider than shoulders. Lower bar to upper chest under control, then press up. Focus on squeezing upper pecs at the top.',
      'intermediate',
      'SrqOu55lrYU',
      ['Clavicular Upper Pecs', 'Anterior Deltoids', 'Triceps'],
      'Barbell & Incline Bench',
      ['Keep bench angle between 30 to 45 degrees to avoid shifting load to front shoulders.', 'Drive barbell straight up and lock in your clavicular head.'],
      ['Using too steep an incline angle (>45 degrees) turning it into an overhead press.']
    ),
    dumbbells_only: ex(
      'Incline Dumbbell Press', 3, '10-12', '75s', 'Upper Chest',
      'Set a bench to 30-45 degree incline. Press dumbbells from shoulder level upward in an arc, converging at the top. Lower slowly over 2-3 seconds to upper chest level.',
      'beginner',
      '8iPEnn-ltC8',
      ['Upper Pectorals', 'Front Delts', 'Triceps'],
      'Incline Bench & Dumbbells',
      ['Rotate palms slightly inward (neutral grip) for optimal upper chest fiber alignment.'],
      ['Letting dumbbells drift too far back behind your head.']
    ),
    no_equipment: ex(
      'Decline Push-Up', 3, '10-15', '60s', 'Upper Chest',
      'Elevate feet on a chair, bed or step with hands on the floor. Perform push-ups in this angled position to place maximum resistance onto upper chest and shoulders.',
      'beginner',
      'SKPab2YC8BE',
      ['Upper Chest', 'Anterior Delts', 'Triceps', 'Serratus Anterior'],
      'Chair or Elevated Surface',
      ['Brace your core so your lower back does not hyperextend under elevated gravity.']
    ),
  },

  chest_fly: {
    full_gym: ex(
      'Cable Chest Fly', 3, '12-15', '60s', 'Chest',
      'Set cables to chest height. Stand in split stance, pull handles together in a hugging arc meeting in front of chest. Maintain slight elbow bend throughout. Squeeze pecs hard for 1 second.',
      'intermediate',
      'Iwe6AmxVf7o',
      ['Inner & Outer Pectorals', 'Anterior Deltoids'],
      'Dual Cable Machine',
      ['Think of hugging a giant tree trunk to keep elbow bend consistent.']
    ),
    dumbbells_only: ex(
      'Dumbbell Chest Fly', 3, '12-15', '60s', 'Chest',
      'Lie on bench holding dumbbells above chest, palms facing each other. Lower dumbbells in wide arcs until you feel a comfortable chest stretch, then bring back together.',
      'beginner',
      'eozdVDA78K0',
      ['Pectoralis Major', 'Chest Stretch'],
      'Dumbbells & Bench',
      ['Maintain a constant 15-degree bend in elbows; do not turn this into a press.']
    ),
    no_equipment: ex(
      'Wide Push-Up', 3, '12-15', '60s', 'Chest',
      'Place hands 1.5x wider than shoulder-width. Lower slowly to maximize stretch across the pectoral fibers, then press back up.',
      'beginner',
      'rr6eFNNDQJE',
      ['Outer Pectorals', 'Serratus Anterior'],
      'Bodyweight / Floor'
    ),
  },

  chest_dips: {
    full_gym: ex(
      'Chest Dips', 3, '8-12', '75s', 'Chest / Triceps',
      'Grip parallel dip bars. Lean torso forward 30 degrees to bias chest fibers. Lower until elbows reach 90 degrees, then press back up powerfully.',
      'intermediate',
      '2z8JmcrW-As',
      ['Lower Pectorals', 'Triceps Brachii', 'Front Deltoids'],
      'Parallel Dip Bars'
    ),
    dumbbells_only: ex(
      'Close-Grip Dumbbell Press', 3, '10-12', '60s', 'Chest / Triceps',
      'Hold two dumbbells pressed firmly together at chest. Press up in a straight line keeping dumbbells squeezed together throughout.',
      'intermediate',
      'Ym_N2K790eU',
      ['Inner Chest', 'Triceps'],
      'Dumbbells & Bench'
    ),
    no_equipment: ex(
      'Diamond Push-Up', 3, '10-15', '60s', 'Chest / Triceps',
      'Form a diamond shape with thumbs and index fingers under chest. Perform push-ups keeping elbows tucked close to sides.',
      'intermediate',
      'J0DnG1_S92I',
      ['Triceps', 'Inner Chest Pecs'],
      'Bodyweight / Floor'
    ),
  },

  // â”€â”€ Back â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  back_compound_row: {
    full_gym: ex(
      'Barbell Bent-Over Row', 4, '6-10', '90s', 'Back',
      'Hinge at hips to 45 degrees, back straight. Pull barbell to lower abdomen, driving elbows back. Squeeze shoulder blades together, lower under control.',
      'intermediate',
      '9efgc2Wg0PQ',
      ['Latissimus Dorsi', 'Rhomboids', 'Trapezius', 'Biceps'],
      'Barbell & Weight Plates',
      ['Pull with your elbows, not your hands, to maximize back engagement.']
    ),
    dumbbells_only: ex(
      'Dumbbell Bent-Over Row', 4, '10-12', '75s', 'Back',
      'Hinge at hips holding dumbbells with neutral grip. Row dumbbells up to hip level, pinching shoulder blades at the top.',
      'beginner',
      '6TSzcG1bZ8I',
      ['Lats', 'Upper Back', 'Biceps'],
      'Pair of Dumbbells'
    ),
    no_equipment: ex(
      'Inverted Table Row', 4, '10-15', '60s', 'Back',
      'Lie under a sturdy table, grip the edge, and pull chest up to table keeping body straight. Lower with control.',
      'beginner',
      'hXTc1mDNnOI',
      ['Lats', 'Rhomboids', 'Rear Delts'],
      'Sturdy Table or Low Bar'
    ),
  },

  back_pulldown: {
    full_gym: ex(
      'Lat Pulldown', 3, '10-12', '75s', 'Lats',
      'Grip bar wider than shoulders. Sit with thighs under pads. Pull bar to upper collarbone driving elbows down and back. Slowly extend arms overhead.',
      'beginner',
      'CAwf7n6Luuc',
      ['Latissimus Dorsi', 'Teres Major', 'Biceps'],
      'Lat Pulldown Cable Station'
    ),
    dumbbells_only: ex(
      'Single-Arm Dumbbell Row', 3, '10-12', '60s', 'Lats',
      'Place one knee and hand on flat bench. Row dumbbell from dead-hang to hip socket, pulling elbow back. Switch sides.',
      'beginner',
      'pYcpY20QaE8',
      ['Latissimus Dorsi', 'Rhomboids'],
      'Flat Bench & Dumbbell'
    ),
    no_equipment: ex(
      'Pull-Up', 3, '5-10', '90s', 'Lats',
      'Hang from bar with overhand grip. Pull body up until chin clears the bar, leading with elbows. Lower over 2-3 seconds.',
      'intermediate',
      'eGo4IYlbE5g',
      ['Lats', 'Upper Back', 'Biceps', 'Grip'],
      'Pull-Up Bar'
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
      ['Keep bar in continuous contact with your thighs and shins throughout.']
    ),
    dumbbells_only: ex(
      'Dumbbell Romanian Deadlift', 3, '10-12', '75s', 'Hamstrings / Lower Back',
      'Hold dumbbells against front of thighs. Push hips backwards, lowering dumbbells just below knees, feeling stretch in hamstrings, then contract glutes to return upright.',
      'beginner',
      'hCDzSR6bW10',
      ['Hamstrings', 'Glutes', 'Lower Back'],
      'Pair of Dumbbells'
    ),
    no_equipment: ex(
      'Good Morning (Bodyweight)', 3, '12-15', '60s', 'Hamstrings / Lower Back',
      'Stand feet hip-width, hands behind head. Push hips backward, bowing forward until torso is parallel to floor. Squeeze hamstrings to stand.',
      'beginner',
      'rgn4nN9F0i8',
      ['Hamstrings', 'Glutes', 'Lower Back'],
      'Bodyweight'
    ),
  },

  back_face_pull: {
    full_gym: ex(
      'Cable Face Pull', 3, '15-20', '45s', 'Rear Delts / Upper Back',
      'Set cable at eye level with rope attachment. Pull rope towards eyes, pulling hands apart and externally rotating shoulders. Hold 1 second.',
      'beginner',
      'rep-qVOkqgk',
      ['Rear Deltoids', 'Rotator Cuff', 'Trapezius'],
      'Cable Machine with Rope Attachment'
    ),
    dumbbells_only: ex(
      'Dumbbell Rear Delt Fly', 3, '15-20', '45s', 'Rear Delts',
      'Hinge forward 45 degrees. Raise dumbbells out to sides with slight elbow bend, pinching shoulder blades together at top.',
      'beginner',
      'EA7u4Q_84es',
      ['Rear Deltoids', 'Rhomboids'],
      'Light Dumbbells'
    ),
    no_equipment: ex(
      'Superman Hold', 3, '30 sec', '45s', 'Lower Back / Rear Delts',
      'Lie face down on floor. Simultaneously lift chest, arms, and legs off ground. Hold at top for 30s squeezing glutes and back.',
      'beginner',
      'cc6UVRS7PW4',
      ['Erector Spinae', 'Glutes', 'Rear Delts'],
      'Floor Mat'
    ),
  },

  // â”€â”€ Shoulders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  shoulder_press_compound: {
    full_gym: ex(
      'Overhead Barbell Military Press', 4, '6-10', '90s', 'Shoulders',
      'Stand with barbell at collarbone. Press barbell vertically overhead, locking out with biceps aligned near ears. Lower with control to upper chest.',
      'intermediate',
      '2yjwXTZQDDI',
      ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps', 'Core'],
      'Barbell & Rack'
    ),
    dumbbells_only: ex(
      'Seated Dumbbell Shoulder Press', 4, '10-12', '75s', 'Shoulders',
      'Sit on bench holding dumbbells at shoulder level. Press overhead until arms are nearly locked out, then lower with control.',
      'beginner',
      'qEwKCR5JCog',
      ['Front & Side Deltoids', 'Triceps'],
      'Dumbbells & Bench'
    ),
    no_equipment: ex(
      'Pike Push-Up', 4, '10-15', '60s', 'Shoulders',
      'Form an inverted V shape with hips elevated high. Lower top of head toward floor between hands, then press back up explosively.',
      'beginner',
      'q8m_iX46q_U',
      ['Anterior Deltoids', 'Triceps', 'Core'],
      'Bodyweight / Floor'
    ),
  },

  shoulder_lateral: {
    full_gym: ex(
      'Dumbbell Lateral Raise', 4, '12-15', '45s', 'Side Deltoids',
      'Stand holding dumbbells at sides. Raise arms laterally to shoulder height with slight elbow bend. Lower under 2-second control.',
      'beginner',
      '3VcKaXpzqRo',
      ['Lateral Deltoid (Boulder Shoulders)'],
      'Pair of Dumbbells',
      ['Lead with your elbows and pour the pitch of water slightly at top.']
    ),
    dumbbells_only: ex(
      'Dumbbell Lateral Raise', 4, '12-15', '45s', 'Side Deltoids',
      'Stand holding dumbbells at sides. Raise arms out to shoulder height with slight elbow bend. Avoid shrugging traps.',
      'beginner',
      '3VcKaXpzqRo',
      ['Side Delts'],
      'Dumbbells'
    ),
    no_equipment: ex(
      'Lateral Arm Circles & Pulses', 3, '45 sec', '30s', 'Side Deltoids',
      'Extend arms straight out to sides at shoulder height. Make small controlled circles for 45s continuously without dropping arms.',
      'beginner',
      '140EXPBNXXU',
      ['Deltoids Endurance'],
      'Bodyweight'
    ),
  },

  // â”€â”€ Legs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  legs_squat: {
    full_gym: ex(
      'Barbell Back Squat', 4, '6-10', '90s', 'Quads / Glutes',
      'Rest bar across upper traps. Stand shoulder-width, toes angled slightly out. Sit hips back and down until thighs are parallel to floor, then drive through mid-foot to stand.',
      'intermediate',
      'bEv6CCg2BC8',
      ['Quadriceps', 'Gluteus Maximus', 'Adductors', 'Core'],
      'Barbell & Squat Rack',
      ['Keep chest proud and knees tracking in line with your toes.']
    ),
    dumbbells_only: ex(
      'Dumbbell Goblet Squat', 4, '10-12', '75s', 'Quads / Glutes',
      'Hold a heavy dumbbell vertically against chest with palms cupping the top plate. Squat down between knees, keeping torso upright.',
      'beginner',
      'MeIiIdhvXT4',
      ['Quads', 'Glutes', 'Core'],
      'Single Heavy Dumbbell'
    ),
    no_equipment: ex(
      'Bodyweight Air Squat', 4, '15-20', '60s', 'Quads / Glutes',
      'Stand with feet shoulder-width. Lower hips down and back below knee level, keeping heels planted, then drive back up to full standing.',
      'beginner',
      'aclHkVaku9U',
      ['Quadriceps', 'Glutes', 'Hamstrings'],
      'Bodyweight / Floor'
    ),
  },

  legs_lunge: {
    full_gym: ex(
      'Walking Dumbbell Lunges', 3, '10-12 each', '60s', 'Quads / Glutes',
      'Step forward with one leg, lowering hips until both knees are at 90 degrees. Drive off front heel to step into the next rep.',
      'beginner',
      'L8fvypPrzzs',
      ['Quads', 'Glutes', 'Hamstrings', 'Balance'],
      'Pair of Dumbbells'
    ),
    dumbbells_only: ex(
      'Dumbbell Reverse Lunges', 3, '10-12 each', '60s', 'Quads / Glutes',
      'Hold dumbbells at sides. Step backward with one leg and lower rear knee toward floor. Push through front foot to return.',
      'beginner',
      '7jA_RkgN3k0',
      ['Quads', 'Glutes'],
      'Pair of Dumbbells'
    ),
    no_equipment: ex(
      'Walking Lunges (Bodyweight)', 3, '12-15 each', '60s', 'Quads / Glutes',
      'Step forward in smooth walking cadence, dropping back knee gently toward floor. Keep torso upright.',
      'beginner',
      'wrwwXE_x-pQ',
      ['Quads', 'Glutes'],
      'Bodyweight'
    ),
  },

  // â”€â”€ Arms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  arms_biceps: {
    full_gym: ex(
      'Barbell Bicep Curl', 3, '10-12', '60s', 'Biceps',
      'Grip barbell shoulder-width, elbows tucked against ribs. Curl bar up towards shoulders, squeezing biceps at top. Lower over 2 seconds.',
      'beginner',
      'kwG2ipFRgfo',
      ['Biceps Brachii', 'Brachialis', 'Forearms'],
      'Barbell / EZ Bar'
    ),
    dumbbells_only: ex(
      'Dumbbell Hammer Curl', 3, '10-12', '60s', 'Biceps / Forearms',
      'Hold dumbbells with palms facing each other (neutral grip). Curl weights upward keeping wrists neutral, maximizing brachialis thickness.',
      'beginner',
      'zC3nLlEvin4',
      ['Brachialis', 'Biceps', 'Brachioradialis Forearm'],
      'Dumbbells'
    ),
    no_equipment: ex(
      'Towel Bicep Curl / Isometric', 3, '12-15', '45s', 'Biceps',
      'Loop a sturdy towel under feet, grip both ends and pull upward with maximal bicep tension.',
      'beginner',
      'p_8pWj1bB9k',
      ['Biceps Brachii'],
      'Towel / Resistance'
    ),
  },

  arms_triceps: {
    full_gym: ex(
      'Cable Triceps Rope Pushdown', 3, '12-15', '45s', 'Triceps',
      'Grip rope attachment with high cable. Push hands down and spread rope apart at the bottom, locking out triceps with maximal contraction.',
      'beginner',
      'vB5OHsJ3EME',
      ['Lateral & Medial Triceps Heads'],
      'Cable Machine & Rope'
    ),
    dumbbells_only: ex(
      'Overhead Dumbbell Triceps Extension', 3, '10-12', '60s', 'Triceps',
      'Hold one dumbbell with both hands overhead. Lower weight behind head until forearms hit biceps, then press back overhead.',
      'beginner',
      '_gsUokN_Abg',
      ['Long Head of Triceps'],
      'Single Dumbbell'
    ),
    no_equipment: ex(
      'Bench / Chair Triceps Dips', 3, '12-15', '45s', 'Triceps',
      'Place hands on edge of chair behind you. Lower body by bending elbows to 90 degrees, then push through palms to lock out triceps.',
      'beginner',
      '0326dy_-CzM',
      ['Triceps', 'Front Shoulders'],
      'Chair or Bed Edge'
    ),
  },

  // â”€â”€ Core / Abs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  core_plank: {
    full_gym: ex(
      'Hanging Leg Raise', 3, '12-15', '60s', 'Core / Abs',
      'Hang from pull-up bar. Without swinging, lift knees or straight legs up to 90 degrees, tilting pelvis up into lower abs.',
      'intermediate',
      'hdng3Nm1x_E',
      ['Lower Rectus Abdominis', 'Hip Flexors', 'Grip'],
      'Pull-Up Bar Station'
    ),
    dumbbells_only: ex(
      'Dumbbell Russian Twist', 3, '20 total', '45s', 'Obliques / Abs',
      'Sit on floor with knees bent and feet elevated. Rotate dumbbell from side to side touching the ground, engaging obliques.',
      'beginner',
      'wkD8rjkodUI',
      ['Internal & External Obliques', 'Rectus Abdominis'],
      'Single Dumbbell'
    ),
    no_equipment: ex(
      'Forearm Plank Hold', 3, '45-60 sec', '45s', 'Core',
      'Rest on forearms and toes. Keep body in rigid straight line, squeezing glutes and pulling belly button in toward spine.',
      'beginner',
      'ASdvN_XEl_c',
      ['Transverse Abdominis', 'Rectus Abdominis', 'Lower Back'],
      'Floor Mat'
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
        getEx('back_compound_row'),
        getEx('back_pulldown'),
        getEx('back_face_pull'),
        getEx('arms_biceps'),
        getEx('core_plank'),
      ],
    },
    {
      day: 'Wednesday',
      focus: 'Active Rest & Recovery',
      isRestDay: true,
      exercises: [],
    },
    {
      day: 'Thursday',
      focus: 'Legs & Core',
      isRestDay: false,
      exercises: [
        getEx('legs_squat'),
        getEx('legs_lunge'),
        getEx('back_deadlift'),
        getEx('shoulder_lateral'),
        getEx('core_plank'),
      ],
    },
    {
      day: 'Friday',
      focus: 'Upper Body Hypertrophy',
      isRestDay: false,
      exercises: [
        getEx('chest_press_compound'),
        getEx('back_compound_row'),
        getEx('shoulder_press_compound'),
        getEx('arms_biceps'),
        getEx('arms_triceps'),
      ],
    },
    {
      day: 'Saturday',
      focus: 'Lower Body & Core',
      isRestDay: false,
      exercises: [
        getEx('legs_squat'),
        getEx('legs_lunge'),
        getEx('core_plank'),
      ],
    },
    {
      day: 'Sunday',
      focus: 'Rest & Full Recovery',
      isRestDay: true,
      exercises: [],
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
 * Searches the exercise database to auto-match video demonstrations and form instructions for any exercise name.
 */
export function findExerciseVideo(name: string): Partial<Exercise> | null {
  if (!name || !name.trim()) return null;
  const q = name.toLowerCase().trim();

  // Search through all exercises in EXERCISE_DB
  for (const slotKey of Object.keys(EXERCISE_DB)) {
    const slot = EXERCISE_DB[slotKey];
    for (const eq of ['full_gym', 'dumbbells_only', 'no_equipment'] as Equipment[]) {
      const exItem = slot[eq];
      if (
        exItem.name.toLowerCase() === q ||
        exItem.name.toLowerCase().includes(q) ||
        q.includes(exItem.name.toLowerCase())
      ) {
        return {
          name: exItem.name,
          videoUrl: exItem.videoUrl,
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