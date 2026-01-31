export interface Exercise {
    id: string
    name: string
    muscle_group: string
    video_url?: string
    instructions?: string
}

export interface WorkoutSet {
    reps: number
    weight_kg?: number
    rpe?: number
}

export interface WorkoutExercise {
    exercise: Exercise
    sets: number
    target_reps: string
    rest_seconds: number
    notes?: string
}

export interface WorkoutSession {
    id: string
    day_name: string // 'Monday', 'Tuesday' etc.
    focus_area: string // 'Push', 'Legs'
    exercises: WorkoutExercise[]
    is_completed: boolean
}

export interface WeeklyPlan {
    id: string
    week_number: number
    goal: string
    days: WorkoutSession[]
}
