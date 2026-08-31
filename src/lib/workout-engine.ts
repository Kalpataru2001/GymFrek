/**
 * GymFrek — Workout Plan Engine
 * Generates structured weekly workout plans based on fitness level, goal, and equipment.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Exercise Database ────────────────────────────────────────────────────────

// Each exercise entry includes variants for all three equipment tiers.
// The database is keyed by a logical exercise slot and equipment tier.

interface ExerciseDB {
  full_gym: Exercise;
  dumbbells_only: Exercise;
  no_equipment: Exercise;
}

// Helper to quickly build an Exercise object
function ex(
  name: string,
  sets: number,
  reps: string,
  rest: string,
  muscleGroup: string,
  instructions: string,
  difficulty: FitnessLevel
): Exercise {
  return { name, sets, reps, rest, muscleGroup, instructions, difficulty };
}

/**
 * Comprehensive exercise database (40+ entries) organised by slot name.
 * Each slot provides three equipment variants.
 */
const EXERCISE_DB: Record<string, ExerciseDB> = {

  // ── Chest ─────────────────────────────────────────────────────────────────

  chest_press_compound: {
    full_gym: ex(
      'Barbell Bench Press', 4, '6-10', '90s', 'Chest',
      'Lie flat on bench, grip barbell slightly wider than shoulder-width. Lower bar to chest, pause briefly, then press explosively back up. Keep feet flat on floor and maintain a slight arch in lower back.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Dumbbell Bench Press', 4, '8-12', '75s', 'Chest',
      'Hold one dumbbell in each hand at chest level, lying on a flat bench or floor. Press upward until arms are nearly straight, then lower with control. Keep elbows at about 45° from torso.',
      'beginner'
    ),
    no_equipment: ex(
      'Push-Up', 4, '10-20', '60s', 'Chest',
      'Start in a high plank with hands slightly wider than shoulders. Lower chest to just above the floor with elbows at ~45°, then push back up. Keep core braced and body in a straight line throughout.',
      'beginner'
    ),
  },

  chest_incline: {
    full_gym: ex(
      'Incline Barbell Press', 3, '8-12', '75s', 'Upper Chest',
      'Set bench to 30-45°. Grip barbell just wider than shoulders. Lower bar to upper chest under control, then press up. Focus on squeezing upper pecs at the top.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Incline Dumbbell Press', 3, '10-12', '75s', 'Upper Chest',
      'Set a bench to 30-45° incline. Press dumbbells from shoulder level upward in an arc, touching at the top. Lower slowly over 2-3 seconds to upper chest.',
      'beginner'
    ),
    no_equipment: ex(
      'Decline Push-Up', 3, '10-15', '60s', 'Upper Chest',
      'Elevate feet on a chair or step, hands on floor shoulder-width apart. Perform push-ups in this angled position to emphasise upper chest and anterior deltoids.',
      'beginner'
    ),
  },

  chest_fly: {
    full_gym: ex(
      'Cable Chest Fly', 3, '12-15', '60s', 'Chest',
      'Set cables to shoulder height. Stand in split stance, pull handles in a hugging arc meeting in front of chest. Maintain slight elbow bend throughout. Squeeze pecs at the centre.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Dumbbell Chest Fly', 3, '12-15', '60s', 'Chest',
      'Lie on bench holding dumbbells above chest, palms facing each other. Lower dumbbells in wide arcs until you feel a stretch, then bring back together squeezing chest.',
      'beginner'
    ),
    no_equipment: ex(
      'Wide Push-Up', 3, '12-15', '60s', 'Chest',
      'Place hands wider than shoulder-width. Perform push-ups, focusing on the outer chest by keeping elbows more flared than a standard push-up.',
      'beginner'
    ),
  },

  chest_dips: {
    full_gym: ex(
      'Weighted Dips', 3, '8-12', '75s', 'Chest / Triceps',
      'Attach weight belt or hold dumbbell between legs. Lean forward slightly to bias chest. Lower until elbows reach 90°, then press back up powerfully.',
      'advanced'
    ),
    dumbbells_only: ex(
      'Close-Grip Dumbbell Press', 3, '10-12', '60s', 'Chest / Triceps',
      'Hold two dumbbells pressed together at chest. Press up in a straight line keeping dumbbells in contact throughout. Squeeze chest and triceps at top.',
      'intermediate'
    ),
    no_equipment: ex(
      'Diamond Push-Up', 3, '10-15', '60s', 'Chest / Triceps',
      'Form a diamond shape with thumbs and index fingers on the floor. Perform push-ups keeping elbows close to body. Primarily targets triceps and inner chest.',
      'intermediate'
    ),
  },

  // ── Back ──────────────────────────────────────────────────────────────────

  back_compound_row: {
    full_gym: ex(
      'Barbell Bent-Over Row', 4, '6-10', '90s', 'Back',
      'Hinge at hips until torso is 45° to floor. Pull barbell to lower chest/upper abdomen, driving elbows back. Lower with control. Keep back flat, core tight. Avoid rounding lower back.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Dumbbell Bent-Over Row', 4, '10-12', '75s', 'Back',
      'Hinge at hips holding dumbbells, knees slightly bent. Row dumbbells up to hip level, elbows close to body. Squeeze shoulder blades together at the top. Lower with control.',
      'beginner'
    ),
    no_equipment: ex(
      'Bodyweight Row (Table Row)', 4, '10-15', '60s', 'Back',
      'Lie under a sturdy table. Grip the edge with both hands, body straight from heels to head. Pull chest up to table while keeping core tight. Lower with control.',
      'beginner'
    ),
  },

  back_pulldown: {
    full_gym: ex(
      'Lat Pulldown', 3, '10-12', '75s', 'Lats',
      'Grip bar wider than shoulders. Sit with thighs under pads. Pull bar to upper chest while driving elbows down and back. Lean slightly back. Slowly return bar overhead.',
      'beginner'
    ),
    dumbbells_only: ex(
      'Single-Arm Dumbbell Row', 3, '10-12', '60s', 'Lats',
      'Brace one knee and hand on bench. Row dumbbell from hanging position to hip level, driving elbow straight back. Keep torso parallel to floor. Switch sides.',
      'beginner'
    ),
    no_equipment: ex(
      'Pull-Up', 3, '5-10', '90s', 'Lats',
      'Hang from bar with overhand grip slightly wider than shoulders. Pull body up until chin clears the bar, leading with elbows down. Lower with control over 2-3 seconds.',
      'intermediate'
    ),
  },

  back_deadlift: {
    full_gym: ex(
      'Romanian Deadlift', 3, '8-10', '90s', 'Hamstrings / Lower Back',
      'Stand with barbell at hip height, soft knee bend. Hinge at hips pushing them back, bar sliding down legs until hamstring stretch. Drive hips forward to stand. Keep bar close throughout.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Dumbbell Romanian Deadlift', 3, '10-12', '75s', 'Hamstrings / Lower Back',
      'Hold dumbbells in front of thighs. Hinge forward at hips with slight knee bend, lowering dumbbells along legs. Feel hamstring stretch, then drive hips forward to return to standing.',
      'beginner'
    ),
    no_equipment: ex(
      'Good Morning', 3, '12-15', '60s', 'Hamstrings / Lower Back',
      'Stand feet hip-width apart, hands behind head. Hinge at hips pushing them back, torso drops parallel to floor. Squeeze glutes and hamstrings to return upright. Keep back neutral throughout.',
      'beginner'
    ),
  },

  back_face_pull: {
    full_gym: ex(
      'Cable Face Pull', 3, '15-20', '45s', 'Rear Delts / Upper Back',
      'Set cable at head height with rope attachment. Pull rope to face, separating hands at the end. Hold 1s, elbows should be level with or above shoulders. Great for posture and shoulder health.',
      'beginner'
    ),
    dumbbells_only: ex(
      'Dumbbell Rear Delt Fly', 3, '15-20', '45s', 'Rear Delts',
      'Hinge forward 45°. Raise dumbbells out to sides with slight elbow bend, pinching shoulder blades together at the top. Use light weight; control the movement.',
      'beginner'
    ),
    no_equipment: ex(
      'Superman Hold', 3, '30 sec', '45s', 'Lower Back / Rear Delts',
      'Lie face-down, arms extended overhead. Simultaneously lift arms, chest, and legs off floor. Hold at top for duration. Squeeze glutes and lower back. Lower with control.',
      'beginner'
    ),
  },

  // ── Shoulders ─────────────────────────────────────────────────────────────

  shoulder_press_compound: {
    full_gym: ex(
      'Overhead Press (Barbell)', 4, '6-10', '90s', 'Shoulders',
      'Grip barbell just outside shoulder-width at collar-bone height. Press straight up, slightly behind nose. Lock out overhead with biceps near ears. Lower under control.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Dumbbell Shoulder Press', 4, '10-12', '75s', 'Shoulders',
      'Sit or stand holding dumbbells at shoulder height, palms forward. Press overhead until arms are nearly straight. Lower slowly to starting position. Keep core engaged to protect lower back.',
      'beginner'
    ),
    no_equipment: ex(
      'Pike Push-Up', 4, '10-15', '60s', 'Shoulders',
      'Start in downward-dog position with hips high. Bend elbows lowering head towards floor between hands. Push back up explosively. The more vertical your body, the greater the shoulder stimulus.',
      'beginner'
    ),
  },

  shoulder_lateral: {
    full_gym: ex(
      'Cable Lateral Raise', 3, '15-20', '45s', 'Side Deltoids',
      'Stand sideways to low cable with handle in far hand. Raise arm out to side to shoulder height, maintaining slight elbow bend. Lower with control. Cables provide constant tension.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Dumbbell Lateral Raise', 3, '15-20', '45s', 'Side Deltoids',
      'Stand holding dumbbells at sides. Raise arms out to shoulder height with thumbs slightly up. Avoid shrugging. Lower in 2 seconds. Use controlled momentum only on last rep.',
      'beginner'
    ),
    no_equipment: ex(
      'Wall Handstand Hold', 3, '20-30 sec', '60s', 'Shoulders',
      'Place hands shoulder-width on floor 6 inches from wall. Kick up into handstand with heels on wall. Hold bracing core and pressing floor away. Build time progressively.',
      'advanced'
    ),
  },

  shoulder_front: {
    full_gym: ex(
      'Plate Front Raise', 3, '12-15', '45s', 'Front Deltoids',
      'Hold weight plate with both hands at waist. Raise plate in front of you to shoulder height. Lower with control. Avoid using momentum — keep the motion deliberate.',
      'beginner'
    ),
    dumbbells_only: ex(
      'Alternating Dumbbell Front Raise', 3, '12-15', '45s', 'Front Deltoids',
      'Stand holding dumbbells at sides. Raise one dumbbell in front to shoulder height, lower it, then repeat on the other side. Keep a slight elbow bend throughout.',
      'beginner'
    ),
    no_equipment: ex(
      'Hindu Push-Up', 3, '10-12', '60s', 'Shoulders / Chest',
      'Start in downward-dog. Sweep nose toward floor in a diving arc, extend hips forward into upward-dog, then push back to start. Combines shoulder press and chest movement.',
      'intermediate'
    ),
  },

  // ── Arms ──────────────────────────────────────────────────────────────────

  bicep_curl: {
    full_gym: ex(
      'Barbell Curl', 3, '10-12', '60s', 'Biceps',
      'Stand with barbell at hip level, supinated grip. Curl bar toward chin by flexing elbows, keeping upper arms stationary. Squeeze at top. Lower over 2-3 seconds.',
      'beginner'
    ),
    dumbbells_only: ex(
      'Alternating Dumbbell Curl', 3, '10-12', '60s', 'Biceps',
      'Stand holding dumbbells at sides, palms forward. Curl one dumbbell toward shoulder, supinating wrist at top. Lower fully before curling the other arm.',
      'beginner'
    ),
    no_equipment: ex(
      'Chin-Up', 3, '6-10', '90s', 'Biceps / Back',
      'Hang from bar with underhand grip shoulder-width. Pull body up until chin clears bar, driving elbows toward hips. The underhand grip shifts emphasis to biceps. Lower with control.',
      'intermediate'
    ),
  },

  tricep_pushdown: {
    full_gym: ex(
      'Cable Tricep Pushdown', 3, '12-15', '60s', 'Triceps',
      'Grip rope or bar attachment overhead on cable machine. Keep elbows pinned at sides. Push handle down until arms fully extended. Squeeze triceps hard. Control the return.',
      'beginner'
    ),
    dumbbells_only: ex(
      'Dumbbell Tricep Kickback', 3, '12-15', '60s', 'Triceps',
      'Hinge forward 45° holding dumbbell. Pin upper arm parallel to floor. Extend forearm back until arm is straight. Squeeze tricep. Lower with control. Keep upper arm stationary.',
      'beginner'
    ),
    no_equipment: ex(
      'Tricep Dip (Chair)', 3, '12-15', '60s', 'Triceps',
      'Place hands on chair edge behind you, legs extended. Lower hips toward floor by bending elbows to 90°. Push back up extending arms. Keep back close to chair throughout.',
      'beginner'
    ),
  },

  tricep_overhead: {
    full_gym: ex(
      'EZ-Bar Skull Crusher', 3, '10-12', '60s', 'Triceps',
      'Lie on bench holding EZ-bar overhead. Lower bar toward forehead by bending elbows, upper arms perpendicular to floor. Extend back up. Keep elbows from flaring.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Overhead Dumbbell Tricep Extension', 3, '10-12', '60s', 'Triceps',
      'Hold one dumbbell with both hands overhead. Lower behind head by bending elbows, keeping upper arms close to ears. Extend back to start. Feel the long head stretch.',
      'beginner'
    ),
    no_equipment: ex(
      'Close-Grip Push-Up', 3, '10-15', '60s', 'Triceps',
      'Set hands directly under shoulders or slightly narrower. Perform push-up keeping elbows tucked close to ribs throughout. This shifts emphasis from chest to triceps.',
      'beginner'
    ),
  },

  // ── Legs ──────────────────────────────────────────────────────────────────

  legs_squat: {
    full_gym: ex(
      'Barbell Back Squat', 4, '6-10', '120s', 'Quads / Glutes',
      'Bar rests on upper traps (high bar) or rear delts (low bar). Feet shoulder-width, toes slightly out. Descend until thighs are at least parallel to floor. Drive through heels to stand. Keep chest up.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Dumbbell Goblet Squat', 4, '12-15', '75s', 'Quads / Glutes',
      'Hold one dumbbell vertically at chest level with both hands. Feet shoulder-width apart. Squat down keeping chest upright, elbows inside knees at bottom. Drive through heels to stand.',
      'beginner'
    ),
    no_equipment: ex(
      'Bodyweight Squat', 4, '15-20', '60s', 'Quads / Glutes',
      'Stand feet shoulder-width, toes slightly out, arms extended forward. Lower into squat keeping chest tall and knees tracking over toes. Pause briefly at bottom. Squeeze glutes to stand.',
      'beginner'
    ),
  },

  legs_lunge: {
    full_gym: ex(
      'Barbell Walking Lunge', 3, '10 each leg', '75s', 'Quads / Glutes',
      'Bar on upper back. Step forward into deep lunge, back knee nearly touching floor. Push off front foot to bring feet together, then lunge with the other leg. Walk forward continuously.',
      'advanced'
    ),
    dumbbells_only: ex(
      'Dumbbell Reverse Lunge', 3, '10-12 each leg', '60s', 'Quads / Glutes',
      'Hold dumbbells at sides. Step one foot back into a lunge, lowering back knee to just above floor. Return to start and alternate legs. Reverse lunge is easier on knees than forward lunge.',
      'beginner'
    ),
    no_equipment: ex(
      'Bodyweight Reverse Lunge', 3, '12-15 each leg', '60s', 'Quads / Glutes',
      'Stand with feet together. Step one leg back, lower back knee to just above the floor, front shin vertical. Push through front heel to return to standing. Alternate sides.',
      'beginner'
    ),
  },

  legs_hip_hinge: {
    full_gym: ex(
      'Barbell Hip Thrust', 4, '10-12', '75s', 'Glutes',
      'Sit with upper back on bench edge, barbell across hips. Drive hips upward by squeezing glutes until body forms a straight line from knees to shoulders. Hold 1s. Lower with control.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Dumbbell Single-Leg Hip Thrust', 3, '12-15 each', '60s', 'Glutes',
      'Upper back on bench, one foot on floor with dumbbell on hip. Extend other leg. Drive hips up by squeezing glute until body is straight. Hold, lower. Complete reps then switch.',
      'intermediate'
    ),
    no_equipment: ex(
      'Glute Bridge', 4, '15-20', '45s', 'Glutes',
      'Lie on back, knees bent, feet flat on floor near hips. Squeeze glutes and lift hips until body is straight from knees to shoulders. Hold 2 seconds at top. Lower with control.',
      'beginner'
    ),
  },

  legs_calf: {
    full_gym: ex(
      'Standing Calf Raise (Machine)', 3, '15-20', '45s', 'Calves',
      'Place shoulders under pads, balls of feet on platform edge. Lower heels as far as possible for full stretch, then rise up as high as possible squeezing calves. Pause at top and bottom.',
      'beginner'
    ),
    dumbbells_only: ex(
      'Dumbbell Calf Raise', 3, '20-25', '45s', 'Calves',
      'Stand holding dumbbells at sides on a step edge. Lower heels below step level for full stretch. Rise onto toes as high as possible. Control the descent. Can be done one leg at a time.',
      'beginner'
    ),
    no_equipment: ex(
      'Bodyweight Calf Raise', 3, '25-30', '45s', 'Calves',
      'Stand on edge of a step with heels hanging off. Lower heels below step level. Rise onto toes as high as possible. Perform slowly, pausing at top and bottom for maximum muscle engagement.',
      'beginner'
    ),
  },

  legs_leg_press: {
    full_gym: ex(
      'Leg Press', 3, '12-15', '75s', 'Quads / Glutes',
      'Sit in leg press machine, feet shoulder-width on platform. Lower weight until knees reach 90°. Press platform away explosively without locking knees at the top. Keep lower back on pad.',
      'beginner'
    ),
    dumbbells_only: ex(
      'Bulgarian Split Squat', 3, '10-12 each leg', '75s', 'Quads / Glutes',
      'Rear foot on bench, holding dumbbells. Lower front knee to 90° keeping torso upright. Drive through front heel to stand. This is a highly effective unilateral quad and glute exercise.',
      'intermediate'
    ),
    no_equipment: ex(
      'Bulgarian Split Squat (BW)', 3, '12-15 each leg', '60s', 'Quads / Glutes',
      'Rear foot elevated on bench or chair, hands on hips or extended for balance. Lower into deep lunge until front thigh is parallel to floor. Push up through front foot. Alternate legs.',
      'intermediate'
    ),
  },

  legs_hamstring: {
    full_gym: ex(
      'Lying Leg Curl', 3, '12-15', '60s', 'Hamstrings',
      'Lie prone on leg curl machine. Curl legs toward glutes squeezing hamstrings. Hold 1s at top. Lower slowly over 3 seconds. Avoid letting hips rise off pad during the movement.',
      'beginner'
    ),
    dumbbells_only: ex(
      'Dumbbell Nordic Curl', 3, '6-10', '90s', 'Hamstrings',
      'Kneel on mat, have partner hold ankles or anchor under heavy dumbbell. Slowly lower torso toward floor using hamstrings. Catch yourself with hands and use arms to push back up. Advanced movement.',
      'advanced'
    ),
    no_equipment: ex(
      'Single-Leg Romanian Deadlift (BW)', 3, '12 each leg', '60s', 'Hamstrings',
      'Stand on one leg, slight knee bend. Hinge at hip, extending other leg behind for balance. Lower until torso is parallel to floor. Return to standing by squeezing glute and hamstring.',
      'intermediate'
    ),
  },

  // ── Core ──────────────────────────────────────────────────────────────────

  core_plank: {
    full_gym: ex(
      'Weighted Plank', 3, '30-45 sec', '45s', 'Core',
      'Standard plank with a weight plate on lower back (have partner place it). Brace abs as if absorbing a punch. Squeeze glutes and quads. Keep hips level — neither sagging nor raised.',
      'advanced'
    ),
    dumbbells_only: ex(
      'Plank with Dumbbell Row', 3, '8-10 each side', '60s', 'Core / Back',
      'In push-up position with dumbbells as handles. Row one dumbbell to hip while maintaining rigid core (no rotation). Alternate sides. The anti-rotation demand makes this highly effective.',
      'intermediate'
    ),
    no_equipment: ex(
      'Forearm Plank', 3, '30-60 sec', '45s', 'Core',
      'Rest on forearms and toes, elbows under shoulders. Keep body in straight line from head to heels. Brace all core muscles. Breathe normally. Squeeze glutes to protect lower back.',
      'beginner'
    ),
  },

  core_crunch: {
    full_gym: ex(
      'Cable Crunch', 3, '15-20', '45s', 'Abs',
      'Kneel below cable pulley with rope attachment behind head. Crunch downward rounding thoracic spine, bringing elbows toward knees. Hold contraction 1s. Return fully.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Dumbbell Side Bend', 3, '15-20 each', '45s', 'Obliques',
      'Stand holding dumbbell in one hand. Bend laterally toward dumbbell side, then return upright. Keep movement controlled and avoid leaning forward or backward. Switch sides.',
      'beginner'
    ),
    no_equipment: ex(
      'Bicycle Crunch', 3, '20-30', '45s', 'Abs / Obliques',
      'Lie on back, hands behind head, legs off floor. Bring one knee to chest while rotating opposite elbow toward it. Alternate in a cycling motion. Fully extend each leg. Don\'t pull neck.',
      'beginner'
    ),
  },

  core_leg_raise: {
    full_gym: ex(
      'Hanging Leg Raise', 3, '10-15', '60s', 'Lower Abs',
      'Hang from pull-up bar. Raise legs straight in front until parallel to floor (or higher for advanced). Lower with control. Avoid swinging. Can be done with bent knees for regression.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Dumbbell Pullover Crunch', 3, '12-15', '60s', 'Abs',
      'Lie on back holding one dumbbell above chest. Simultaneously bring knees to chest and pull dumbbell overhead toward knees. Extend back out to start. Controlled throughout.',
      'intermediate'
    ),
    no_equipment: ex(
      'Lying Leg Raise', 3, '12-15', '60s', 'Lower Abs',
      'Lie flat on back, legs straight. Place hands under glutes for support. Raise both legs to 90°, then lower slowly without touching floor. Keep lower back pressed into mat throughout.',
      'beginner'
    ),
  },

  core_rotation: {
    full_gym: ex(
      'Cable Woodchop', 3, '12-15 each', '45s', 'Obliques / Core',
      'Set cable high on one side. Pull handle diagonally downward across body in a chopping motion, rotating through core. Keep hips square. Return under control. Switch sides.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Russian Twist', 3, '20-30', '45s', 'Obliques',
      'Sit on floor, lean back ~45°, feet raised or on floor. Hold dumbbell with both hands. Rotate torso side to side, touching weight to floor on each side. Keep chest up and back straight.',
      'beginner'
    ),
    no_equipment: ex(
      'Mountain Climber', 3, '30-40', '45s', 'Core / Cardio',
      'High plank position. Drive alternating knees to chest in a running motion, keeping hips level. Keep pace controlled for muscle focus or fast for cardio effect. Core stays braced throughout.',
      'beginner'
    ),
  },

  // ── Cardio / Conditioning ─────────────────────────────────────────────────

  cardio_hiit: {
    full_gym: ex(
      'Battle Ropes', 3, '30 sec', '30s', 'Full Body / Cardio',
      'Hold one rope end in each hand. Create alternating wave motions driving arms rapidly up and down. Keep feet shoulder-width, slight knee bend. Engage core. Drive intensity for full duration.',
      'intermediate'
    ),
    dumbbells_only: ex(
      'Dumbbell Thruster', 3, '12-15', '60s', 'Full Body',
      'Hold dumbbells at shoulders. Squat to parallel then explosively stand, pressing dumbbells overhead in one fluid motion. Lower dumbbells to shoulders as you descend for next rep.',
      'intermediate'
    ),
    no_equipment: ex(
      'Burpee', 3, '10-15', '60s', 'Full Body / Cardio',
      'From standing, squat down, place hands on floor, jump feet back to plank, perform push-up, jump feet forward, then explode upward into jump with arms overhead. Modify by stepping instead of jumping.',
      'intermediate'
    ),
  },

  cardio_steady: {
    full_gym: ex(
      'Rowing Machine', 1, '10 min', '—', 'Full Body / Cardio',
      'Drive with legs first (60%), then lean back (20%), then pull handle to lower chest (20%). Reverse to return. Maintain 22-26 strokes per minute for steady-state cardio.',
      'beginner'
    ),
    dumbbells_only: ex(
      'Dumbbell Farmer\'s Walk', 3, '40 m', '60s', 'Full Body / Grip',
      'Hold heavy dumbbells at sides with firm grip. Walk with controlled steps keeping torso tall, core braced, and shoulders back. Builds grip strength, traps, and core stability.',
      'beginner'
    ),
    no_equipment: ex(
      'Jump Rope (or Jump Rope Simulation)', 1, '5 min', '—', 'Cardio',
      'Jump with both feet or alternate feet, keeping light on the balls of your feet. Without a rope, mimic the wrist rotation and jumping rhythm. Great cardiovascular warm-up or finisher.',
      'beginner'
    ),
  },
};

// ─── Rest Day Template ────────────────────────────────────────────────────────

function restDay(day: string): WorkoutDay {
  return {
    day,
    focus: 'Rest & Recovery',
    exercises: [],
    isRestDay: true,
  };
}

// ─── Exercise Selector ───────────────────────────────────────────────────────

/** Pick the correct equipment variant from a database entry */
function pick(slot: string, equipment: Equipment): Exercise {
  return EXERCISE_DB[slot][equipment];
}

// ─── Plan Builders ────────────────────────────────────────────────────────────

function buildBeginnerPlan(goal: Goal, equipment: Equipment): WorkoutDay[] {
  // 3-day Full Body: Mon / Wed / Fri
  const fullBodyA: WorkoutDay = {
    day: 'Monday',
    focus: 'Full Body A',
    isRestDay: false,
    exercises: [
      pick('legs_squat', equipment),
      pick('chest_press_compound', equipment),
      pick('back_compound_row', equipment),
      pick('shoulder_press_compound', equipment),
      pick('core_plank', equipment),
      pick('cardio_steady', equipment),
    ],
  };

  const fullBodyB: WorkoutDay = {
    day: 'Wednesday',
    focus: 'Full Body B',
    isRestDay: false,
    exercises: [
      pick('legs_lunge', equipment),
      pick('chest_incline', equipment),
      pick('back_pulldown', equipment),
      pick('bicep_curl', equipment),
      pick('tricep_pushdown', equipment),
      pick('core_crunch', equipment),
    ],
  };

  const fullBodyC: WorkoutDay = {
    day: 'Friday',
    focus: 'Full Body C',
    isRestDay: false,
    exercises: [
      pick('legs_hip_hinge', equipment),
      pick('chest_dips', equipment),
      pick('back_face_pull', equipment),
      pick('shoulder_lateral', equipment),
      pick('core_leg_raise', equipment),
      pick('cardio_hiit', equipment),
    ],
  };

  return [
    fullBodyA,
    restDay('Tuesday'),
    fullBodyB,
    restDay('Thursday'),
    fullBodyC,
    restDay('Saturday'),
    restDay('Sunday'),
  ];
}

function buildIntermediatePlan(goal: Goal, equipment: Equipment): WorkoutDay[] {
  // 4-day Upper / Lower split: Mon / Tue / Thu / Fri
  const upperA: WorkoutDay = {
    day: 'Monday',
    focus: 'Upper A (Push + Pull)',
    isRestDay: false,
    exercises: [
      pick('chest_press_compound', equipment),
      pick('back_compound_row', equipment),
      pick('shoulder_press_compound', equipment),
      pick('chest_incline', equipment),
      pick('back_pulldown', equipment),
      pick('shoulder_lateral', equipment),
    ],
  };

  const lowerA: WorkoutDay = {
    day: 'Tuesday',
    focus: 'Lower A (Quad Focus)',
    isRestDay: false,
    exercises: [
      pick('legs_squat', equipment),
      pick('legs_lunge', equipment),
      pick('legs_leg_press', equipment),
      pick('legs_calf', equipment),
      pick('core_plank', equipment),
      pick('core_leg_raise', equipment),
    ],
  };

  const upperB: WorkoutDay = {
    day: 'Thursday',
    focus: 'Upper B (Arms Focus)',
    isRestDay: false,
    exercises: [
      pick('chest_dips', equipment),
      pick('back_face_pull', equipment),
      pick('bicep_curl', equipment),
      pick('tricep_overhead', equipment),
      pick('tricep_pushdown', equipment),
      pick('core_rotation', equipment),
    ],
  };

  const lowerB: WorkoutDay = {
    day: 'Friday',
    focus: 'Lower B (Posterior Chain)',
    isRestDay: false,
    exercises: [
      pick('back_deadlift', equipment),
      pick('legs_hip_hinge', equipment),
      pick('legs_hamstring', equipment),
      pick('legs_calf', equipment),
      pick('core_crunch', equipment),
      pick('cardio_hiit', equipment),
    ],
  };

  return [
    upperA,
    lowerA,
    restDay('Wednesday'),
    upperB,
    lowerB,
    restDay('Saturday'),
    restDay('Sunday'),
  ];
}

function buildAdvancedPlan(goal: Goal, equipment: Equipment): WorkoutDay[] {
  // 5-day PPL + Upper/Lower: Mon=Push, Tue=Pull, Wed=Legs, Thu=Upper, Fri=Lower
  const push: WorkoutDay = {
    day: 'Monday',
    focus: 'Push (Chest / Shoulders / Triceps)',
    isRestDay: false,
    exercises: [
      pick('chest_press_compound', equipment),
      pick('chest_incline', equipment),
      pick('shoulder_press_compound', equipment),
      pick('chest_fly', equipment),
      pick('shoulder_lateral', equipment),
      pick('tricep_overhead', equipment),
      pick('tricep_pushdown', equipment),
    ],
  };

  const pull: WorkoutDay = {
    day: 'Tuesday',
    focus: 'Pull (Back / Biceps / Rear Delts)',
    isRestDay: false,
    exercises: [
      pick('back_compound_row', equipment),
      pick('back_pulldown', equipment),
      pick('back_deadlift', equipment),
      pick('back_face_pull', equipment),
      pick('bicep_curl', equipment),
      pick('shoulder_front', equipment),
      pick('core_rotation', equipment),
    ],
  };

  const legs: WorkoutDay = {
    day: 'Wednesday',
    focus: 'Legs (Full Leg Day)',
    isRestDay: false,
    exercises: [
      pick('legs_squat', equipment),
      pick('legs_leg_press', equipment),
      pick('legs_lunge', equipment),
      pick('legs_hip_hinge', equipment),
      pick('legs_hamstring', equipment),
      pick('legs_calf', equipment),
      pick('core_plank', equipment),
    ],
  };

  const upper: WorkoutDay = {
    day: 'Thursday',
    focus: 'Upper (Volume & Hypertrophy)',
    isRestDay: false,
    exercises: [
      pick('chest_dips', equipment),
      pick('back_compound_row', equipment),
      pick('chest_incline', equipment),
      pick('back_face_pull', equipment),
      pick('shoulder_lateral', equipment),
      pick('bicep_curl', equipment),
      pick('tricep_pushdown', equipment),
    ],
  };

  const lower: WorkoutDay = {
    day: 'Friday',
    focus: 'Lower (Strength & Power)',
    isRestDay: false,
    exercises: [
      pick('back_deadlift', equipment),
      pick('legs_squat', equipment),
      pick('legs_hip_hinge', equipment),
      pick('legs_lunge', equipment),
      pick('legs_calf', equipment),
      pick('core_leg_raise', equipment),
      pick('cardio_hiit', equipment),
    ],
  };

  return [
    push,
    pull,
    legs,
    upper,
    lower,
    restDay('Saturday'),
    restDay('Sunday'),
  ];
}

// ─── Progression Notes ────────────────────────────────────────────────────────

function getProgressionNote(level: FitnessLevel, goal: Goal): string {
  const base: Record<FitnessLevel, string> = {
    beginner:
      'Add 2.5 kg (or 5 lb) to compound lifts each week when you can complete all sets with perfect form. ' +
      'Prioritise consistency and sleep. Rest 48h between full-body sessions.',
    intermediate:
      'Apply progressive overload by increasing weight ~2–5% when you hit the top of a rep range. ' +
      'Track your lifts. Deload every 4–6 weeks by reducing volume by 40%.',
    advanced:
      'Use periodisation: alternate strength blocks (4-6 reps, 3-4 min rest) with hypertrophy blocks (8-12 reps, 60-90s rest). ' +
      'Deload every 4 weeks. Track RPE and bar speed as auto-regulation tools.',
  };

  const goalSuffix: Record<Goal, string> = {
    lose_weight: ' Keep cardio sessions 3–4×/week and maintain a ~500 kcal daily deficit.',
    maintain: ' Caloric balance is key — focus on strength gains and skill development.',
    gain_muscle: ' Eat in a 200–300 kcal surplus and prioritise protein ≥2g/kg bodyweight.',
    improve_fitness: ' Combine strength training with dedicated cardio 3–5×/week to build overall capacity.',
  };

  return base[level] + goalSuffix[goal];
}

// ─── Plan Metadata ────────────────────────────────────────────────────────────

function getPlanType(level: FitnessLevel): string {
  switch (level) {
    case 'beginner':     return '3-Day Full Body';
    case 'intermediate': return '4-Day Upper / Lower Split';
    case 'advanced':     return '5-Day PPL + Upper / Lower';
  }
}

function getDaysPerWeek(level: FitnessLevel): number {
  switch (level) {
    case 'beginner':     return 3;
    case 'intermediate': return 4;
    case 'advanced':     return 5;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generates a complete weekly workout plan tailored to the user's fitness level,
 * goal, and available equipment.
 *
 * @param level     Fitness level: 'beginner' | 'intermediate' | 'advanced'
 * @param goal      Training goal: 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_fitness'
 * @param equipment Equipment available: 'full_gym' | 'dumbbells_only' | 'no_equipment'
 * @returns         A fully-structured WorkoutPlan object
 */
export function generateWorkoutPlan(
  level: FitnessLevel,
  goal: Goal,
  equipment: Equipment
): WorkoutPlan {
  let schedule: WorkoutDay[];

  switch (level) {
    case 'beginner':
      schedule = buildBeginnerPlan(goal, equipment);
      break;
    case 'intermediate':
      schedule = buildIntermediatePlan(goal, equipment);
      break;
    case 'advanced':
      schedule = buildAdvancedPlan(goal, equipment);
      break;
  }

  return {
    level,
    goal,
    daysPerWeek: getDaysPerWeek(level),
    planType: getPlanType(level),
    schedule,
    weeklyProgressionNote: getProgressionNote(level, goal),
  };
}
