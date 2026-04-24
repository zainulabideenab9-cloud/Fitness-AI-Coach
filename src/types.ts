export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Exercise {
  name: string;
  duration: number; // in seconds
  description: string;
  difficulty: Difficulty;
  muscle: string;
  instruction3D: string;
  videoLink: string;
  thumbnail: string;
  formTips: string[];
}

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export interface WorkoutPlan {
  [key: string]: Exercise[];
}

export interface UserStats {
  workoutsCompleted: number;
  totalCalories: number;
  totalTime: number;
  unlockedLevels: Level[];
}
