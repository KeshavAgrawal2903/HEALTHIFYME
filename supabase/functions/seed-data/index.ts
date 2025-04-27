import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { addDays, subDays, format } from 'npm:date-fns@3.3.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const activities = [
  'Running', 'Cycling', 'Swimming', 'Yoga', 'Weight Training'
];

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const foods = [
  { name: 'Oatmeal with Berries', calories: 350, protein: 12, carbs: 60 },
  { name: 'Chicken Salad', calories: 400, protein: 35, carbs: 20 },
  { name: 'Salmon with Quinoa', calories: 550, protein: 40, carbs: 45 },
  { name: 'Greek Yogurt', calories: 150, protein: 15, carbs: 10 },
  { name: 'Turkey Sandwich', calories: 450, protein: 28, carbs: 48 }
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const { user_id } = await req.json();
    const today = new Date();
    const days = Array.from({ length: 20 }, (_, i) => subDays(today, i));

    for (const date of days) {
      // Add activities
      const numActivities = randomInt(1, 3);
      for (let i = 0; i < numActivities; i++) {
        await supabase.from('activities').insert({
          user_id,
          activity_type: randomItem(activities),
          duration: `${randomInt(15, 120)} minutes`,
          calories_burned: randomInt(100, 800),
          heart_rate_avg: randomInt(60, 150),
          date_performed: format(date, 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
        });
      }

      // Add nutrition logs
      const numMeals = randomInt(3, 5);
      for (let i = 0; i < numMeals; i++) {
        const food = randomItem(foods);
        await supabase.from('nutrition_logs').insert({
          user_id,
          meal_type: randomItem(mealTypes),
          food_name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbohydrates: food.carbs,
          meal_time: format(addDays(date, i/numMeals), 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
        });
      }

      // Add mood log
      await supabase.from('mood_logs').insert({
        user_id,
        mood_rating: randomInt(2, 5),
        energy_level: randomInt(2, 5),
        stress_level: randomInt(1, 4),
        logged_at: format(date, 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
      });

      // Add water intake
      const numWaterLogs = randomInt(4, 8);
      for (let i = 0; i < numWaterLogs; i++) {
        await supabase.from('water_intake').insert({
          user_id,
          amount_ml: randomInt(200, 500),
          drink_type: Math.random() > 0.8 ? 'tea' : 'water',
          consumed_at: format(addDays(date, i/numWaterLogs), 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
        });
      }

      // Add vitals
      await supabase.from('vital_signs').insert({
        user_id,
        heart_rate: randomInt(60, 100),
        blood_pressure_systolic: randomInt(110, 130),
        blood_pressure_diastolic: randomInt(70, 85),
        temperature: randomFloat(36.1, 37.2),
        measured_at: format(date, 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
      });

      // Add measurements
      if (Math.random() > 0.7) { // Only add measurements some days
        await supabase.from('measurements').insert({
          user_id,
          weight: randomFloat(70, 72),
          body_fat_percentage: randomFloat(15, 18),
          measured_at: format(date, 'yyyy-MM-dd\'T\'HH:mm:ssXXX'),
        });
      }
    }

    return new Response(
      JSON.stringify({ message: 'Sample data added successfully' }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});