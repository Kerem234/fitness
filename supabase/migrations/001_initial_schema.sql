-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (Users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PROFILES (Details)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm INTEGER,
  goal_type TEXT CHECK (goal_type IN ('lose_weight', 'maintain', 'gain_muscle', 'improve_fitness')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  target_calories INTEGER,
  target_protein_g INTEGER,
  target_carbs_g INTEGER,
  target_fat_g INTEGER,
  timezone TEXT DEFAULT 'UTC',
  unit_system TEXT DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- WEIGHTS
CREATE TABLE weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  weight_kg DECIMAL(5,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_weights_user_date ON weights(user_id, recorded_at DESC);

-- MEALS
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_time TIMESTAMPTZ NOT NULL,
  total_calories INTEGER DEFAULT 0,
  total_protein_g DECIMAL(6,2) DEFAULT 0,
  total_carbs_g DECIMAL(6,2) DEFAULT 0,
  total_fat_g DECIMAL(6,2) DEFAULT 0,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_meals_user_time ON meals(user_id, meal_time DESC);

-- MEAL ITEMS
CREATE TABLE meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  food_source TEXT CHECK (food_source IN ('usda', 'openfoodfacts', 'photo_ai', 'manual')),
  external_id TEXT,
  serving_size_g DECIMAL(8,2),
  serving_unit TEXT,
  quantity DECIMAL(6,2) DEFAULT 1,
  calories INTEGER,
  protein_g DECIMAL(6,2),
  carbs_g DECIMAL(6,2),
  fat_g DECIMAL(6,2),
  is_estimate BOOLEAN DEFAULT FALSE,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_meal_items_meal ON meal_items(meal_id);

-- FOODS CACHE
CREATE TABLE foods_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT CHECK (source IN ('usda', 'openfoodfacts')),
  external_id TEXT NOT NULL,
  food_name TEXT NOT NULL,
  brand_name TEXT,
  calories_per_100g INTEGER,
  protein_per_100g DECIMAL(6,2),
  carbs_per_100g DECIMAL(6,2),
  fat_per_100g DECIMAL(6,2),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, external_id)
);
CREATE INDEX idx_foods_cache_lookup ON foods_cache(source, external_id);

-- WORKOUT PLANS
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  goal TEXT,
  is_ai_generated BOOLEAN DEFAULT TRUE,
  weekly_schedule JSONB,
  active_from DATE,
  active_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_workout_plans_user_active ON workout_plans(user_id, is_active);

-- WORKOUTS
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES workout_plans(id),
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  workout_type TEXT,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, scheduled_date DESC);

-- EXERCISES
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight_kg DECIMAL(6,2),
  duration_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_tier TEXT CHECK (subscription_tier IN ('free_trial', 'basic', 'pro')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT FALSE,
  is_trial BOOLEAN DEFAULT FALSE,
  revenuecat_subscriber_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- COACH MESSAGES
CREATE TABLE coach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message_type TEXT CHECK (message_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  is_proactive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_coach_messages_user_time ON coach_messages(user_id, created_at DESC);

-- NOTIFICATION PREFERENCES
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  breakfast_time TIME,
  lunch_time TIME,
  dinner_time TIME,
  snack_time TIME,
  workout_reminder_time TIME,
  weekly_checkin_day INTEGER,
  weekly_checkin_time TIME,
  expo_push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ANALYTICS EVENTS
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  event_name TEXT NOT NULL,
  event_properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name, created_at DESC);

-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- User Profiles: Users can view/update their own
CREATE POLICY "Users can view own detailed profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own detailed profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own detailed profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Weights
CREATE POLICY "Users can view own weights" ON weights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weights" ON weights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Meals
CREATE POLICY "Users can view own meals" ON meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON meals FOR DELETE USING (auth.uid() = user_id);

-- Meal Items (via meal_id check ideally, but simplified to using join in logic or trusted backend, here using basic check if user_id was on it - but meal_items doesn't have user_id. 
-- WE NEED TO ADD user_id to meal_items OR use EXISTS clause)
-- Correcting schema to make RLS easier: Adding user_id to meal_items is redundant but good for RLS, or we join.
-- Let's use EXISTS for standard normalization.
CREATE POLICY "Users can view own meal items" ON meal_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid())
);
CREATE POLICY "Users can insert own meal items" ON meal_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_id AND meals.user_id = auth.uid())
);
CREATE POLICY "Users can update own meal items" ON meal_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid())
);
CREATE POLICY "Users can delete own meal items" ON meal_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid())
);

-- Foods Cache: Publicly readable, insertable by auth users (or service role only?)
-- Let's allow everyone to read
CREATE POLICY "Everyone can read foods cache" ON foods_cache FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert cache" ON foods_cache FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Workouts
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);

-- Workout Plans
CREATE POLICY "Users can view own plans" ON workout_plans FOR SELECT USING (auth.uid() = user_id);

-- Exercises (via workout_id)
CREATE POLICY "Users can view own exercises" ON exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM workouts WHERE workouts.id = exercises.workout_id AND workouts.user_id = auth.uid())
);

-- Subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Coach Messages
CREATE POLICY "Users can view own messages" ON coach_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert user messages" ON coach_messages FOR INSERT WITH CHECK (auth.uid() = user_id AND message_type = 'user');
