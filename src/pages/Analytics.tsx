import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format, subDays } from 'date-fns';
import {
  BarChart3,
  Activity,
  Heart,
  Scale,
  Droplets,
  Utensils,
  Smile,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/auth-store';

const Analytics = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    activities: [],
    nutrition: [],
    water: [],
    mood: [],
    vitals: [],
    measurements: [],
  });
  const [dateRange, setDateRange] = useState(30);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const startDate = subDays(new Date(), dateRange).toISOString();

      const [
        activitiesData,
        nutritionData,
        waterData,
        moodData,
        vitalsData,
        measurementsData,
      ] = await Promise.all([
        supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id)
          .gte('date_performed', startDate)
          .order('date_performed', { ascending: true }),
        supabase
          .from('nutrition_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('meal_time', startDate)
          .order('meal_time', { ascending: true }),
        supabase
          .from('water_intake')
          .select('*')
          .eq('user_id', user.id)
          .gte('consumed_at', startDate)
          .order('consumed_at', { ascending: true }),
        supabase
          .from('mood_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', startDate)
          .order('logged_at', { ascending: true }),
        supabase
          .from('vital_signs')
          .select('*')
          .eq('user_id', user.id)
          .gte('measured_at', startDate)
          .order('measured_at', { ascending: true }),
        supabase
          .from('measurements')
          .select('*')
          .eq('user_id', user.id)
          .gte('measured_at', startDate)
          .order('measured_at', { ascending: true }),
      ]);

      setData({
        activities: activitiesData.data || [],
        nutrition: nutritionData.data || [],
        water: waterData.data || [],
        mood: moodData.data || [],
        vitals: vitalsData.data || [],
        measurements: measurementsData.data || [],
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [user, dateRange]);

  const ChartCard = ({
    title,
    icon,
    children,
    id,
  }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    id: string;
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
        selectedChart === id ? 'col-span-2 row-span-2' : ''
      }`}
      onClick={() => setSelectedChart(selectedChart === id ? null : id)}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              {icon}
            </motion.div>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <motion.div
            animate={{ rotate: selectedChart === id ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowRight className="text-gray-400" />
          </motion.div>
        </div>
        <div className={`h-${selectedChart === id ? '96' : '64'} transition-all duration-300`}>
          {children}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{
            rotate: 360,
            borderRadius: ['25%', '50%'],
          }}
          transition={{
            duration: 2,
            ease: 'linear',
            repeat: Infinity,
          }}
          className="h-32 w-32 border-t-4 border-b-4 border-blue-500"
        />
      </div>
    );
  }

  const activityData = data.activities.map((activity) => ({
    date: format(new Date(activity.date_performed), 'MMM d'),
    calories: activity.calories_burned || 0,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg"
          >
            <BarChart3 className="text-blue-500 h-6 w-6" />
          </motion.div>
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
        <div className="flex items-center gap-4">
          {[7, 30, 90].map((range) => (
            <motion.button
              key={range}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {range} Days
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          <ChartCard title="Activity Calories" icon={<Activity className="text-green-500" />} id="activity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="calories" stroke="#22c55e" fillOpacity={1} fill="url(#colorCalories)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          {/* Add more ChartCards here for other categories like water, nutrition, mood, vitals, etc. */}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Analytics;
