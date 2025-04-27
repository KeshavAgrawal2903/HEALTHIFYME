import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import {
  Activity as ActivityIcon,
  Calendar,
  Clock,
  Flame,
  Heart,
  Plus,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/auth-store';
import { DataInputModal } from '../components/DataInputModal';
import type { Activity as ActivityType } from '../types/database';

const Activities = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const fetchActivities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('date_performed', { ascending: false })
        .limit(30);

      if (error) throw error;
      if (data) setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.activity_type.toLowerCase() === filter;
  });

  const activityTypes = ['all', ...new Set(activities.map(a => a.activity_type.toLowerCase()))];

  const ActivityCard = ({ activity }: { activity: ActivityType }) => {
    const isExpanded = selectedActivity === activity.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
          isExpanded ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div 
          className="p-6 cursor-pointer"
          onClick={() => setSelectedActivity(isExpanded ? null : activity.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="p-3 bg-green-100 dark:bg-green-900 rounded-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ActivityIcon className="text-green-600 dark:text-green-400 h-6 w-6" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold">{activity.activity_type}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(activity.date_performed), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="text-gray-400" />
            </motion.div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 space-y-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-medium">{activity.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Calories</p>
                      <p className="font-medium">{activity.calories_burned || '--'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Avg HR</p>
                      <p className="font-medium">{activity.heart_rate_avg || '--'} bpm</p>
                    </div>
                  </div>
                </div>

                {activity.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {activity.notes}
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteActivity(activity.id);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{
            rotate: 360,
            borderRadius: ["25%", "50%"],
          }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity,
          }}
          className="h-32 w-32 border-t-4 border-b-4 border-blue-500"
        />
      </div>
    );
  }

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
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg"
          >
            <Calendar className="text-blue-500 h-6 w-6" />
          </motion.div>
          <h1 className="text-2xl font-bold">Activity History</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-5 w-5" />
          Add Activity
        </motion.button>
      </motion.div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {activityTypes.map((type) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </motion.button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </AnimatePresence>
      </motion.div>

      {activities.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <ActivityIcon className="mx-auto h-16 w-16 text-gray-400" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No activities yet
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Start tracking your fitness journey by adding your first activity.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6"
          >
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Activity
            </button>
          </motion.div>
        </motion.div>
      )}

      <DataInputModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchActivities}
        type="activity"
      />
    </div>
  );
};

export default Activities;