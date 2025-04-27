import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';

interface HealthInsightsProps {
  activities: any[];
  nutritionLogs: any[];
  moodLogs: any[];
  waterIntake: any[];
}

export const HealthInsights: React.FC<HealthInsightsProps> = ({
  activities,
  nutritionLogs,
  moodLogs,
  waterIntake,
}) => {
  const generateInsights = () => {
    const insights = [];

    // Activity insights
    if (activities.length > 0) {
      const totalCalories = activities.reduce(
        (sum, activity) => sum + (activity.calories_burned || 0),
        0
      );
      const avgCalories = totalCalories / activities.length;

      if (avgCalories > 300) {
        insights.push({
          type: 'success',
          message: 'Great job maintaining an active lifestyle! Keep it up!',
          icon: <TrendingUp className="text-green-500" />,
        });
      }
    }

    // Nutrition insights
    if (nutritionLogs.length > 0) {
      const totalProtein = nutritionLogs.reduce(
        (sum, log) => sum + (log.protein || 0),
        0
      );
      if (totalProtein < 50) {
        insights.push({
          type: 'warning',
          message: 'Consider increasing your protein intake for better recovery.',
          icon: <AlertTriangle className="text-yellow-500" />,
        });
      }
    }

    // Mood insights
    if (moodLogs.length > 0) {
      const avgMood =
        moodLogs.reduce((sum, log) => sum + log.mood_rating, 0) /
        moodLogs.length;
      if (avgMood > 4) {
        insights.push({
          type: 'success',
          message: "You've been in a great mood lately! That's wonderful!",
          icon: <Brain className="text-blue-500" />,
        });
      }
    }

    // Water intake insights
    if (waterIntake.length > 0) {
      const totalWater = waterIntake.reduce(
        (sum, log) => sum + (log.amount_ml || 0),
        0
      );
      if (totalWater < 2000) {
        insights.push({
          type: 'warning',
          message:
            'Try to drink more water throughout the day for better hydration.',
          icon: <AlertTriangle className="text-yellow-500" />,
        });
      }
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="text-purple-500" />
        <h2 className="text-lg font-semibold">AI Health Insights</h2>
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg flex items-start gap-3 ${
              insight.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/30'
                : 'bg-yellow-50 dark:bg-yellow-900/30'
            }`}
          >
            {insight.icon}
            <p
              className={`${
                insight.type === 'success'
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}
            >
              {insight.message}
            </p>
          </motion.div>
        ))}
        {insights.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Add more data to receive personalized insights!
          </p>
        )}
      </div>
    </div>
  );
};