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
 * Comprehensive exercise database (50+ entries) with HD video demos, muscle anatomy, and form tips.
 */
const EXERCISE_DB: Record<string, ExerciseDB> = {
  // â”€â”€ Stretching & Mobility (New!) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  stretching_full_body: {
    full_gym: ex(
      'Full Body Dynamic & Static Stretching Routine', 3, '30-45 sec per stretch', '15s', 'Mobility & Stretching',
      'Perform a head-to-toe stretching sequence: neck rolls, shoulder dislocation pass-throughs with band, cat-cow spine flexion, standing hamstring fold, deep lunging hip flexor stretch, and seated butterfly. Hold each stretch for 30 seconds while taking deep diaphragmatic breaths.',
      'beginner',
      'L_xrDAtyPqI',
      ['Full Body Mobility', 'Hamstrings', 'Hip Flexors', 'Chest', 'Spine'],
      'Mat / Resistance Band',
      ['Breathe deeply in through your nose and out through your mouth into the stretch.', 'Never bounce aggressively in a static stretch; ease into tension gently.'],
      ['Holding your breath during deep stretches.', 'Forcing joints past their comfortable range of motion.']
    ),
    dumbbells_only: ex(
      'Post-Workout Full Body Stretching', 3, '30 sec each', '15s', 'Mobility & Stretching',
      'Complete routine: standing quad stretch, cross-body shoulder stretch, downward dog calf stretch, world greatest stretch (lunge with thoracic twist), and child pose.',
      'beginner',
      'L_xrDAtyPqI',
      ['Hamstrings', 'Quadriceps', 'Shoulders', 'Lats', 'Hips'],
      'Floor Mat'
    ),
    no_equipment: ex(
      'Daily Full Body Stretching & Mobility', 3, '30-45 sec', '15s', 'Mobility & Stretching',
      'Head-to-toe mobility sequence: forward fold for hamstrings, cobra pose for abs/lower back, pigeon pose for glutes, and doorway chest stretch.',
      'beginner',
      'L_xrDAtyPqI',
      ['Full Body Flexibility', 'Spine', 'Hips', 'Hamstrings'],
      'Bodyweight / Floor'
    ),
  },

  stretching_upper_body: {
    full_gym: ex(
      'Chest, Shoulder & Upper Back Mobility Stretch', 3, '30 sec per side', '15s', 'Shoulders / Chest Mobility',
      'Use a resistance band or doorway to stretch anterior deltoids and chest pectorals. Follow with cross-body arm stretch for rear delts and overhead triceps latch stretch.',
      'beginner',
      'g_tea8ZNk5A',
      ['Pectorals', 'Deltoids', 'Rotator Cuff', 'Thoracic Spine'],
      'Doorway or Wall'
    ),
    dumbbells_only: ex(
      'Shoulder & Thoracic Spine Mobility', 3, '30 sec', '15s', 'Shoulders / Upper Back',
      'Doorway chest stretch, wall angels, and kneeling thread-the-needle for upper back rotation.',
      'beginner',
      'g_tea8ZNk5A',
      ['Shoulders', 'Chest', 'Upper Back'],
      'Wall / Mat'
    ),
    no_equipment: ex(
      'Doorway Chest & Shoulder Opener Stretch', 3, '30 sec', '15s', 'Upper Body Flexibility',
      'Place forearm against doorframe at 90 degrees and step forward until deep stretch is felt across pecs and shoulder.',
      'beginner',
      'g_tea8ZNk5A',
      ['Chest Pecs', 'Anterior Delts'],
      'Doorframe'
    ),
  },

  stretching_lower_body: {
    full_gym: ex(
      'Hamstring, Hip Flexor & Glute Deep Stretch', 3, '40 sec per side', '15s', 'Legs & Hips Flexibility',
      'Pigeon pose for piriformis/glute release, half-kneeling hip flexor lunge, standing toe touch for hamstrings, and standing quad pull.',
      'beginner',
      'eOz1_8LXZHk',
      ['Hamstrings', 'Iliopsoas Hip Flexors', 'Glutes', 'Calves'],
      'Mat'
    ),
    dumbbells_only: ex(
      'Hamstring & Quad Stretching Routine', 3, '30 sec', '15s', 'Legs Flexibility',
      'Seated single-leg hamstring reach, kneeling couch stretch for hip flexors, and frog pose for adductors.',
      'beginner',
      'eOz1_8LXZHk',
      ['Hamstrings', 'Quadriceps', 'Adductors'],
      'Floor Mat'
    ),
    no_equipment: ex(
      'Lower Body Hamstring & Hip Mobility Flow', 3, '30 sec each', '15s', 'Legs & Hips',
      'Downward facing dog to stretch calves and hamstrings, followed by deep yogic squat (Malasana) for hip opening.',
      'beginner',
      'eOz1_8LXZHk',
      ['Calves', 'Hamstrings', 'Groin', 'Hips'],
      'Bodyweight / Floor'
    ),
  },

  // â”€â”€ Cardio & Conditioning (New!) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  cardio_hiit: {
    full_gym: ex(
      'Treadmill Incline Walk / Sprints', 1, '15-20 min', '60s', 'Cardio & Conditioning',
      'Set incline to 10-12% and speed to 4.5-5.5 km/h for steady state fat burn, or alternate 30s sprint / 60s walk for HIIT conditioning.',
      'beginner',
      '3gK-mYmO6Qk',
      ['Cardiovascular Endurance', 'Calves', 'Glutes', 'Hamstrings'],
      'Treadmill'
    ),
    dumbbells_only: ex(
      'Jump Rope (Skipping) HIIT', 4, '60 sec on / 30 sec off', '30s', 'Cardio & Calves',
      'Bounce lightly on balls of feet with wrists rotating rope smoothly. Keep core tight and elbows tucked.',
      'beginner',
      'u3zgHI8QnqE',
      ['Cardio Endurance', 'Calves', 'Forearms', 'Footwork'],
      'Jump Rope'
    ),
    no_equipment: ex(
      'Burpees & Jumping Jacks HIIT', 4, '45 sec on / 15 sec rest', '30s', 'Full Body Cardio',
      'Drop down into pushup, kick feet back in, and jump up with hands overhead. Great for maximum calorie burn.',
      'beginner',
      'auBLPXO8Fww',
      ['Full Body Cardio', 'Quads', 'Chest', 'Core'],
      'Bodyweight / Floor'
    ),
  },

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
      'Barbell & Incline Bench'
    ),
    dumbbells_only: ex(
      'Incline Dumbbell Press', 3, '10-12', '75s', 'Upper Chest',
      'Set a bench to 30-45 degree incline. Press dumbbells from shoulder level upward in an arc, converging at the top.',
      'beginner',
      '8iPEnn-ltC8',
      ['Upper Pectorals', 'Front Delts', 'Triceps'],
      'Incline Bench & Dumbbells'
    ),
    no_equipment: ex(
      'Decline Push-Up', 3, '10-15', '60s', 'Upper Chest',
      'Elevate feet on a chair, bed or step with hands on the floor. Perform push-ups in this angled position to place maximum resistance onto upper chest and shoulders.',
      'beginner',
      'SKPab2YC8BE',
      ['Upper Chest', 'Anterior Delts', 'Triceps'],
      'Chair or Elevated Surface'
    ),
  },

  chest_fly: {
    full_gym: ex(
      'Cable Chest Fly', 3, '12-15', '60s', 'Chest',
      'Set cables to chest height. Stand in split stance, pull handles together in a hugging arc meeting in front of chest. Squeeze pecs hard for 1 second.',
      'intermediate',
      'Iwe6AmxVf7o',
      ['Inner & Outer Pectorals', 'Anterior Deltoids'],
      'Dual Cable Machine'
    ),
    dumbbells_only: ex(
      'Dumbbell Chest Fly', 3, '12-15', '60s', 'Chest',
      'Lie on bench holding dumbbells above chest, palms facing each other. Lower dumbbells in wide arcs until you feel a comfortable chest stretch, then bring back together.',
      'beginner',
      'eozdVDA78K0',
      ['Pectoralis Major', 'Chest Stretch'],
      'Dumbbells & Bench'
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
      'Barbell & Weight Plates'
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
      'Barbell & Plates'
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
      'Pair of Dumbbells'
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
      'Barbell & Squat Rack'
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
      focus: 'Lower Body & Conditioning',
      isRestDay: false,
      exercises: [
        getEx('legs_squat'),
        getEx('legs_lunge'),
        getEx('core_plank'),
        getEx('stretching_lower_body'),
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
 * Intelligent fuzzy matcher to find videos and tutorials for ANY exercise name or keyword.
 */
export function findExerciseVideo(name: string): Partial<Exercise> | null {
  if (!name || !name.trim()) return null;
  const q = name.toLowerCase().trim();

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

  // 2. Semantic Keyword Routing Fallback
  if (q.includes('stretch') || q.includes('mobility') || q.includes('flexibility') || q.includes('yoga')) {
    return {
      name: 'Full Body Dynamic & Static Stretching',
      videoUrl: 'L_xrDAtyPqI',
      muscleGroup: 'Mobility & Stretching',
      instructions: 'Head-to-toe stretching sequence: hold each stretch for 30 seconds while breathing deeply to release muscular tension and improve recovery.',
      targetMuscles: ['Full Body Flexibility', 'Hamstrings', 'Hips', 'Shoulders', 'Spine'],
      equipment: 'Mat / Bodyweight',
      tips: ['Breathe deeply and ease into each stretch without bouncing.'],
    };
  }

  if (q.includes('warmup') || q.includes('warm up')) {
    return {
      name: 'Dynamic Warm-Up Routine',
      videoUrl: 'g_tea8ZNk5A',
      muscleGroup: 'Full Body Warm-Up',
      instructions: 'Arm circles, leg swings, hip openers, and bodyweight squats to prime muscles and joints before training.',
      targetMuscles: ['Joints', 'Cardiovascular', 'Mobility'],
      equipment: 'Bodyweight',
      tips: ['Gradually increase range of motion with each repetition.'],
    };
  }

  if (q.includes('cardio') || q.includes('treadmill') || q.includes('running') || q.includes('walk') || q.includes('jog')) {
    return {
      name: 'Cardio & Incline Treadmill Walk',
      videoUrl: '3gK-mYmO6Qk',
      muscleGroup: 'Cardio & Conditioning',
      instructions: 'Maintain steady pace at 10-12% incline or alternate jogging intervals for maximum caloric expenditure and heart health.',
      targetMuscles: ['Cardiovascular System', 'Calves', 'Glutes'],
      equipment: 'Treadmill / Track',
    };
  }

  if (q.includes('jump rope') || q.includes('skipping')) {
    return {
      name: 'Jump Rope Conditioning',
      videoUrl: 'u3zgHI8QnqE',
      muscleGroup: 'Cardio & Calves',
      instructions: 'Bounce lightly on the balls of your feet with wrists driving the rope.',
      targetMuscles: ['Calves', 'Cardiovascular Endurance'],
      equipment: 'Jump Rope',
    };
  }

  if (q.includes('burpee')) {
    return {
      name: 'Burpees HIIT',
      videoUrl: 'auBLPXO8Fww',
      muscleGroup: 'Full Body HIIT',
      instructions: 'Drop into plank, perform a pushup, jump feet back into hands and explode upward.',
      targetMuscles: ['Full Body', 'Cardio', 'Chest', 'Quads'],
      equipment: 'Bodyweight',
    };
  }

  if (q.includes('curl') || q.includes('bicep')) {
    return {
      name: 'Bicep Curl',
      videoUrl: 'kwG2ipFRgfo',
      muscleGroup: 'Biceps',
      instructions: 'Curl barbell or dumbbells upward squeezing biceps at peak contraction. Lower with a 2-second eccentric phase.',
      targetMuscles: ['Biceps Brachii', 'Forearms'],
      equipment: 'Dumbbells / Barbell',
    };
  }

  if (q.includes('tricep') || q.includes('pushdown') || q.includes('extension') || q.includes('dip')) {
    return {
      name: 'Triceps Extension / Pushdown',
      videoUrl: 'vB5OHsJ3EME',
      muscleGroup: 'Triceps',
      instructions: 'Extend forearms downward locking out elbows to contract all three triceps heads.',
      targetMuscles: ['Triceps Brachii'],
      equipment: 'Cable or Dumbbell',
    };
  }

  if (q.includes('squat') || q.includes('leg') || q.includes('quad')) {
    return {
      name: 'Squat',
      videoUrl: 'bEv6CCg2BC8',
      muscleGroup: 'Quads / Glutes',
      instructions: 'Sit hips down and back with knees aligned over toes. Drive through midfoot to stand.',
      targetMuscles: ['Quadriceps', 'Glutes'],
      equipment: 'Barbell / Dumbbell / Bodyweight',
    };
  }

  if (q.includes('bench') || q.includes('press') || q.includes('chest') || q.includes('pushup') || q.includes('push up')) {
    return {
      name: 'Chest Press',
      videoUrl: 'rT7DgCr-3pg',
      muscleGroup: 'Chest',
      instructions: 'Lower weight with elbows at 45 degrees until chest stretch, then press back up explosively.',
      targetMuscles: ['Pectoralis Major', 'Triceps', 'Front Delts'],
      equipment: 'Bench & Barbell / Dumbbells',
    };
  }

  if (q.includes('row') || q.includes('pull') || q.includes('lat') || q.includes('back')) {
    return {
      name: 'Back Row',
      videoUrl: '9efgc2Wg0PQ',
      muscleGroup: 'Back',
      instructions: 'Pull weight towards lower ribs driving elbows back and squeezing shoulder blades.',
      targetMuscles: ['Lats', 'Rhomboids', 'Biceps'],
      equipment: 'Barbell / Cable / Dumbbells',
    };
  }

  if (q.includes('shoulder') || q.includes('delt') || q.includes('overhead') || q.includes('raise')) {
    return {
      name: 'Shoulder Press / Lateral Raise',
      videoUrl: '3VcKaXpzqRo',
      muscleGroup: 'Shoulders',
      instructions: 'Raise weight with controlled tempo to shoulder height without shrugging traps.',
      targetMuscles: ['Deltoids'],
      equipment: 'Dumbbells / Barbell',
    };
  }

  if (q.includes('plank') || q.includes('ab') || q.includes('core') || q.includes('crunch')) {
    return {
      name: 'Plank & Core Exercise',
      videoUrl: 'ASdvN_XEl_c',
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