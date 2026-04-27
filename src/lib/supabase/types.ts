export type TaskStatus = "ACTIVE" | "ARCHIVED";
export type BookStatus = "TO_READ" | "READING" | "FINISHED" | "ABANDONED";
export type MovieStatus = "TO_WATCH" | "WATCHING" | "WATCHED" | "ABANDONED";
export type AppointmentStatus = "SCHEDULED" | "DONE" | "CANCELED";
export type ReminderStatus = "PENDING" | "DONE" | "CANCELED";
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH";
export type MedicationFrequency =
  | "DAILY"
  | "WEEKLY"
  | "CUSTOM"
  | "AS_NEEDED";
export type ExamStatus = "PLANNED" | "SCHEDULED" | "DONE" | "REVIEWED";

export type Profile = {
  user_id: string;
  full_name: string;
  timezone: string;
  daily_water_goal_ml: number | null;
  created_at: string;
  updated_at: string;
};

export type WaterGoal = {
  user_id: string;
  daily_goal_ml: number;
  created_at: string;
  updated_at: string;
};

export type WaterLog = {
  id: string;
  user_id: string;
  amount_ml: number;
  occurred_at: string;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  status: TaskStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TaskLog = {
  id: string;
  user_id: string;
  task_id: string;
  occurred_on: string;
  completed: boolean;
  created_at: string;
};

export type WorkoutPlan = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkoutDay = {
  id: string;
  workout_plan_id: string;
  week_day: number;
  title: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type WorkoutExercise = {
  id: string;
  workout_day_id: string;
  name: string;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MealPlan = {
  id: string;
  user_id: string;
  name: string;
  reference_month: number | null;
  reference_year: number | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MealSection = {
  id: string;
  meal_plan_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MealItem = {
  id: string;
  meal_section_id: string;
  description: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  year_bucket: number | null;
  current_page: number | null;
  total_pages: number | null;
  rating: number | null;
  status: BookStatus;
  started_at: string | null;
  finished_at: string | null;
  notes: string | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Movie = {
  id: string;
  user_id: string;
  title: string;
  genre: string | null;
  release_year: number | null;
  watched_at: string | null;
  rating: number | null;
  status: MovieStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Appointment = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  meeting_url: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
};

export type Reminder = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  priority: PriorityLevel;
  recurrence_rule: string | null;
  status: ReminderStatus;
  created_at: string;
  updated_at: string;
};

export type Medication = {
  id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  instructions: string | null;
  frequency_type: MedicationFrequency;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MedicationSchedule = {
  id: string;
  medication_id: string;
  time_label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BoardModel = "CHECKLIST" | "CATALOG" | "COUNTER" | "SCHEDULE" | "NOTE";

export type Board = {
  id: string;
  user_id: string;
  name: string;
  model: BoardModel;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BoardItem = {
  id: string;
  board_id: string;
  title: string;
  description: string | null;
  amount: number | null;
  status: string | null;
  occurred_at: string | null;
  completed: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Exam = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  notes: string | null;
  recurrence_days: number | null;
  current_status: ExamStatus;
  scheduled_at: string | null;
  performed_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};
