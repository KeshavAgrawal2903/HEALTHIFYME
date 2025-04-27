/*
  # Health Tracking Database Schema

  1. New Tables
    - `user_profiles`
      - Basic user information and health metrics
    - `activities`
      - Exercise and physical activity tracking
    - `nutrition_logs`
      - Food and meal tracking
    - `vital_signs`
      - Health vitals monitoring
    - `sleep_logs`
      - Sleep tracking and quality
    - `water_intake`
      - Hydration tracking
    - `mood_logs`
      - Mental wellness tracking
    - `goals`
      - User health and fitness goals
    - `measurements`
      - Body measurements tracking
    - `workout_plans`
      - Exercise routines and plans

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  first_name text,
  last_name text,
  date_of_birth date,
  gender text,
  height numeric(5,2),
  weight numeric(5,2),
  activity_level text,
  fitness_level text,
  health_conditions text[],
  dietary_restrictions text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activities Table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  activity_type text NOT NULL,
  duration interval NOT NULL,
  distance numeric(10,2),
  calories_burned integer,
  heart_rate_avg integer,
  heart_rate_max integer,
  steps integer,
  intensity text,
  notes text,
  date_performed timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Nutrition Logs Table
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  meal_type text NOT NULL,
  food_name text NOT NULL,
  portion_size numeric(10,2),
  calories integer,
  protein numeric(10,2),
  carbohydrates numeric(10,2),
  fats numeric(10,2),
  fiber numeric(10,2),
  sugar numeric(10,2),
  sodium numeric(10,2),
  meal_time timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Vital Signs Table
CREATE TABLE IF NOT EXISTS vital_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  heart_rate integer,
  temperature numeric(4,1),
  oxygen_saturation integer,
  respiratory_rate integer,
  measured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Sleep Logs Table
CREATE TABLE IF NOT EXISTS sleep_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  sleep_start timestamptz NOT NULL,
  sleep_end timestamptz NOT NULL,
  duration interval,
  quality_rating integer CHECK (quality_rating BETWEEN 1 AND 5),
  deep_sleep_duration interval,
  light_sleep_duration interval,
  rem_sleep_duration interval,
  times_awake integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Water Intake Table
CREATE TABLE IF NOT EXISTS water_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  amount_ml numeric(10,2) NOT NULL,
  drink_type text DEFAULT 'water',
  consumed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Mood Logs Table
CREATE TABLE IF NOT EXISTS mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  mood_rating integer CHECK (mood_rating BETWEEN 1 AND 5),
  energy_level integer CHECK (energy_level BETWEEN 1 AND 5),
  stress_level integer CHECK (stress_level BETWEEN 1 AND 5),
  notes text,
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  goal_type text NOT NULL,
  target_value numeric(10,2),
  current_value numeric(10,2),
  start_date timestamptz NOT NULL,
  target_date timestamptz,
  status text DEFAULT 'in_progress',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Measurements Table
CREATE TABLE IF NOT EXISTS measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  weight numeric(5,2),
  body_fat_percentage numeric(4,1),
  chest numeric(5,2),
  waist numeric(5,2),
  hips numeric(5,2),
  biceps numeric(5,2),
  thighs numeric(5,2),
  calves numeric(5,2),
  measured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Workout Plans Table
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  description text,
  difficulty text,
  duration interval,
  frequency text,
  exercises jsonb NOT NULL,
  is_active boolean DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Users can manage their own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage their own activities"
  ON activities
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own nutrition logs"
  ON nutrition_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own vital signs"
  ON vital_signs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sleep logs"
  ON sleep_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own water intake"
  ON water_intake
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own mood logs"
  ON mood_logs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals"
  ON goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own measurements"
  ON measurements
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own workout plans"
  ON workout_plans
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);