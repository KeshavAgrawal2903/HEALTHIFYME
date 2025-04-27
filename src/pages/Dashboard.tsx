import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import {
  Activity,
  Moon,
  Droplets,
  Heart,
  Scale,
  Utensils,
  Smile,
  Target,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth-store';
import { DataInputModal } from '../components/DataInputModal';
import { HealthInsights } from '../components/HealthInsights';
import type {
  Activity as ActivityType,
  SleepLog,
  WaterIntake,
  VitalSigns,
  Measurement,
  NutritionLog,
  MoodLog,
  Goal,
} from '../types/database';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [waterIntake, setWaterIntake] = useState<WaterIntake[]>([]);
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalType, setModalType] = useState<
    'activity' | 'nutrition' | 'mood' | 'water' | 'vitals' | null
  >(null);
  const [addingSampleData, setAddingSampleData] = useState(false);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const [
        activitiesData,
        sleepData,
        waterData,
        vitalsData,
        measurementsData,
        nutritionData,
        moodData,
        goalsData,
      ] = await Promise.all([
        supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .order('date_performed', { ascending: false })
          .limit(7),
        supabase
          .from('sleep_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('sleep_start', { ascending: false })
          .limit(7),
        supabase
          .from('water_intake')
          .select('*')
          .eq('user_id', user.id)
          .order('consumed_at', { ascending: false })
          .limit(7),
        supabase
          .from('vital_signs')
          .select('*')
          .eq('user_id', user.id)
          .order('measured_at', { ascending: false })
          .limit(1),
        supabase
          .from('measurements')
          .select('*')
          .eq('user_id', user.id)
          .order('measured_at', { ascending: false })
          .limit(1),
        supabase
          .from('nutrition_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('meal_time', { ascending: false })
          .limit(7),
        supabase
          .from('mood_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('logged_at', { ascending: false })
          .limit(7),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'in_progress'),
      ]);

      if (activitiesData.data) setActivities(activitiesData.data);
      if (sleepData.data) setSleepLogs(sleepData.data);
      if (waterData.data) setWaterIntake(waterData.data);
      if (vitalsData.data) setVitalSigns(vitalsData.data);
      if (measurementsData.data) setMeasurements(measurementsData.data);
      if (nutritionData.data) setNutritionLogs(nutritionData.data);
      if (moodData.data) setMoodLogs(moodData.data);
      if (goalsData.data) setGoals(goalsData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSampleData = async () => {
    if (!user) return;
    
    try {
      setAddingSampleData(true);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to add sample data');
      }

      await fetchData();
    } catch (error) {
      console.error('Error adding sample data:', error);
    } finally {
      setAddingSampleData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const latestVitals = vitalSigns[0];
  const latestMeasurements = measurements[0];

  const activityData = activities
    .map((activity) => ({
      name: format(new Date(activity.date_performed), 'MMM d'),
      calories: activity.calories_burned || 0,
    }))
    .reverse();

  const moodData = moodLogs
    .map((log) => ({
      name: format(new Date(log.logged_at), 'MMM d'),
      mood: log.mood_rating,
      energy: log.energy_level,
      stress: log.stress_level,
    }))
    .reverse();

  const QuickStatButton = ({
    icon,
    label,
    value,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    onClick: () => void;
  }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow w-full"
    >
      <div className="flex items-center gap-3">
        {icon}
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
        <Plus className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
      </div>
    </motion.button>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
        >
          Dashboard
        </motion.h1>
        
        <button
          onClick={addSampleData}
          disabled={addingSampleData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${addingSampleData ? 'animate-spin' : ''}`} />
          {addingSampleData ? 'Adding Data...' : 'Add Sample Data'}
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatButton
          icon={<Heart className="text-red-500" />}
          label="Heart Rate"
          value={`${latestVitals?.heart_rate || '--'} bpm`}
          onClick={() => setModalType('vitals')}
        />
        <QuickStatButton
          icon={<Scale className="text-blue-500" />}
          label="Weight"
          value={`${latestMeasurements?.weight || '--'} kg`}
          onClick={() => setModalType('vitals')}
        />
        <QuickStatButton
          icon={<Moon className="text-purple-500" />}
          label="Sleep"
          value={`${sleepLogs[0]?.quality_rating || '--'}/5`}
          onClick={() => setModalType('mood')}
        />
        <QuickStatButton
          icon={<Droplets className="text-cyan-500" />}
          label="Water"
          value={`${waterIntake[0]?.amount_ml || '--'} ml`}
          onClick={() => setModalType('water')}
        />
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <HealthInsights
          activities={activities}
          nutritionLogs={nutritionLogs}
          moodLogs={moodLogs}
          waterIntake={waterIntake}
        />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-green-500" />
              <h2 className="text-lg font-semibold">Activity History</h2>
            </div>
            <button
              onClick={() => setModalType('activity')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <Plus className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Mood Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Smile className="text-yellow-500" />
              <h2 className="text-lg font-semibold">Mood Tracking</h2>
            </div>
            <button
              onClick={() => setModalType('mood')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <Plus className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#eab308"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activities and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-500" />
              <h2 className="text-lg font-semibold">Recent Activities</h2>
            </div>
            <button
              onClick={() => setModalType('activity')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <Plus className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium">{activity.activity_type}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(activity.date_performed), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {activity.calories_burned || '--'} kcal
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.duration}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-purple-500" />
            <h2 className="text-lg font-semibold">Active Goals</h2>
          </div>
          <div className="space-y-4">
            {goals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium">{goal.goal_type}</p>
                  <p className="text-sm text-gray-500">
                    Target: {goal.target_value}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Progress:{' '}
                    {((goal.current_value || 0) / goal.target_value) * 100}%
                  </p>
                  <p className="text-sm text-gray-500">
                    Current: {goal.current_value || 0}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Nutrition Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="text-orange-500" />
            <h2 className="text-lg font-semibold">Today's Nutrition</h2>
          </div>
          <button
            onClick={() => setModalType('nutrition')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <Plus className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nutritionLogs.slice(0, 3).map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <p className="font-medium">{log.food_name}</p>
              <p className="text-sm text-gray-500">{log.meal_type}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="font-medium">{log.calories}</p>
                  <p className="text-gray-500">kcal</p>
                </div>
                <div>
                  <p className="font-medium">{log.protein}g</p>
                  <p className="text-gray-500">protein</p>
                </div>
                <div>
                  <p className="font-medium">{log.carbohydrates}g</p>
                  <p className="text-gray-500">carbs</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Data Input Modal */}
      <DataInputModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        onSuccess={fetchData}
        type={modalType || 'activity'}
      />
    </div>
  );
};

export default Dashboard;