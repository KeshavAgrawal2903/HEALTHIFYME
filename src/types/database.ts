export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  activity_level: string | null;
  fitness_level: string | null;
  health_conditions: string[] | null;
  dietary_restrictions: string[] | null;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  user_id: string;
  activity_type: string;
  duration: string;
  distance: number | null;
  calories_burned: number | null;
  heart_rate_avg: number | null;
  heart_rate_max: number | null;
  steps: number | null;
  intensity: string | null;
  notes: string | null;
  date_performed: string;
  created_at: string;
};

export type NutritionLog = {
  id: string;
  user_id: string;
  meal_type: string;
  food_name: string;
  portion_size: number | null;
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fats: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  meal_time: string;
  created_at: string;
};

export type VitalSigns = {
  id: string;
  user_id: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  oxygen_saturation: number | null;
  respiratory_rate: number | null;
  measured_at: string;
  created_at: string;
};

export type SleepLog = {
  id: string;
  user_id: string;
  sleep_start: string;
  sleep_end: string;
  duration: string;
  quality_rating: number | null;
  deep_sleep_duration: string | null;
  light_sleep_duration: string | null;
  rem_sleep_duration: string | null;
  times_awake: number | null;
  notes: string | null;
  created_at: string;
};

export type WaterIntake = {
  id: string;
  user_id: string;
  amount_ml: number;
  drink_type: string;
  consumed_at: string;
  created_at: string;
};

export type MoodLog = {
  id: string;
  user_id: string;
  mood_rating: number;
  energy_level: number;
  stress_level: number;
  notes: string | null;
  logged_at: string;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  goal_type: string;
  target_value: number;
  current_value: number | null;
  start_date: string;
  target_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Measurement = {
  id: string;
  user_id: string;
  weight: number | null;
  body_fat_percentage: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  biceps: number | null;
  thighs: number | null;
  calves: number | null;
  measured_at: string;
  created_at: string;
};

export type WorkoutPlan = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  difficulty: string | null;
  duration: string;
  frequency: string | null;
  exercises: any; // This will be a structured JSON object
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  user_profiles: UserProfile;
  activities: Activity;
  nutrition_logs: NutritionLog;
  vital_signs: VitalSigns;
  sleep_logs: SleepLog;
  water_intake: WaterIntake;
  mood_logs: MoodLog;
  goals: Goal;
  measurements: Measurement;
  workout_plans: WorkoutPlan;
};