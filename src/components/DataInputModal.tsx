import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';

interface DataInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'activity' | 'nutrition' | 'mood' | 'water' | 'vitals';
}

export const DataInputModal: React.FC<DataInputModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  type,
}) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const data = {
        ...formData,
        user_id: user.id,
        created_at: now,
      };

      // Add specific timestamp fields based on type
      switch (type) {
        case 'activity':
          data.date_performed = now;
          break;
        case 'nutrition':
          data.meal_time = now;
          break;
        case 'mood':
          data.logged_at = now;
          break;
        case 'water':
          data.consumed_at = now;
          break;
        case 'vitals':
          data.measured_at = now;
          break;
      }

      const { error: supabaseError } = await supabase
        .from(getTableName(type))
        .insert([data]);

      if (supabaseError) throw supabaseError;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving data');
    } finally {
      setLoading(false);
    }
  };

  const getTableName = (type: string) => {
    switch (type) {
      case 'activity':
        return 'activities';
      case 'nutrition':
        return 'nutrition_logs';
      case 'mood':
        return 'mood_logs';
      case 'water':
        return 'water_intake';
      case 'vitals':
        return 'vital_signs';
      default:
        return '';
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'activity':
        return (
          <>
            <select
              className="input-field"
              value={formData.activity_type || ''}
              onChange={(e) =>
                setFormData({ ...formData, activity_type: e.target.value })
              }
              required
            >
              <option value="">Select Activity Type</option>
              <option value="Running">Running</option>
              <option value="Cycling">Cycling</option>
              <option value="Swimming">Swimming</option>
              <option value="Yoga">Yoga</option>
              <option value="Weight Training">Weight Training</option>
            </select>
            <input
              type="number"
              placeholder="Duration (minutes)"
              className="input-field"
              value={formData.duration || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  duration: `${Math.max(0, parseInt(e.target.value, 10) || 0)} minutes`,
                })
              }
              min="0"
              required
            />
            <input
              type="number"
              placeholder="Calories Burned"
              className="input-field"
              value={formData.calories_burned || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  calories_burned: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              min="0"
              required
            />
          </>
        );

      case 'nutrition':
        return (
          <>
            <input
              type="text"
              placeholder="Food Name"
              className="input-field"
              value={formData.food_name || ''}
              onChange={(e) =>
                setFormData({ ...formData, food_name: e.target.value })
              }
              required
            />
            <select
              className="input-field"
              value={formData.meal_type || ''}
              onChange={(e) =>
                setFormData({ ...formData, meal_type: e.target.value })
              }
              required
            >
              <option value="">Select Meal Type</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snack">Snack</option>
            </select>
            <input
              type="number"
              placeholder="Calories"
              className="input-field"
              value={formData.calories || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  calories: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              min="0"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Protein (g)"
                className="input-field"
                value={formData.protein || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    protein: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                min="0"
                step="0.1"
              />
              <input
                type="number"
                placeholder="Carbs (g)"
                className="input-field"
                value={formData.carbohydrates || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    carbohydrates: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                min="0"
                step="0.1"
              />
            </div>
          </>
        );

      case 'mood':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mood Rating (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  className="w-full"
                  value={formData.mood_rating || 3}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mood_rating: parseInt(e.target.value),
                    })
                  }
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>😢</span>
                  <span>😐</span>
                  <span>😊</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Energy Level (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  className="w-full"
                  value={formData.energy_level || 3}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      energy_level: parseInt(e.target.value),
                    })
                  }
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stress Level (1-5)
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  className="w-full"
                  value={formData.stress_level || 3}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stress_level: parseInt(e.target.value),
                    })
                  }
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Relaxed</span>
                  <span>Moderate</span>
                  <span>Stressed</span>
                </div>
              </div>
              <textarea
                placeholder="Notes (optional)"
                className="input-field"
                value={formData.notes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </>
        );

      case 'water':
        return (
          <>
            <input
              type="number"
              placeholder="Amount (ml)"
              className="input-field"
              value={formData.amount_ml || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount_ml: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              min="0"
              required
            />
            <select
              className="input-field"
              value={formData.drink_type || 'water'}
              onChange={(e) =>
                setFormData({ ...formData, drink_type: e.target.value })
              }
            >
              <option value="water">Water</option>
              <option value="tea">Tea</option>
              <option value="coffee">Coffee</option>
            </select>
          </>
        );

      case 'vitals':
        return (
          <>
            <input
              type="number"
              placeholder="Heart Rate (bpm)"
              className="input-field"
              value={formData.heart_rate || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  heart_rate: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
              min="0"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Blood Pressure (Systolic)"
                className="input-field"
                value={formData.blood_pressure_systolic || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    blood_pressure_systolic: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                min="0"
              />
              <input
                type="number"
                placeholder="Blood Pressure (Diastolic)"
                className="input-field"
                value={formData.blood_pressure_diastolic || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    blood_pressure_diastolic: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                min="0"
              />
            </div>
            <input
              type="number"
              placeholder="Temperature (°C)"
              className="input-field"
              value={formData.temperature || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  temperature: parseFloat(e.target.value) || 0,
                })
              }
              step="0.1"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Add New {type.charAt(0).toUpperCase() + type.slice(1)} Data
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {renderForm()}
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};