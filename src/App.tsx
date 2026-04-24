import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  ChevronRight, 
  Trophy, 
  Flame, 
  Clock, 
  RotateCcw, 
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  SkipForward,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { WORKOUT_DATA } from './constants';
import { Exercise, Level, UserStats } from './types';
import { Humanoid } from './components/Humanoid';
import { cn } from './lib/utils';

export default function App() {
  const [view, setView] = useState<'menu' | 'workout' | 'stats'>('menu');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    workoutsCompleted: 0,
    totalCalories: 0,
    totalTime: 0,
    unlockedLevels: ['Beginner']
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeExercises = selectedLevel ? WORKOUT_DATA[selectedLevel] : [];
  const currentExercise = activeExercises[activeExerciseIndex];

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (sessionActive && !isPaused && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && sessionActive) {
      handleNextExercise();
    }
    return () => clearInterval(interval);
  }, [sessionActive, isPaused, timer]);

  const startLevel = (level: Level) => {
    setSelectedLevel(level);
    setActiveExerciseIndex(0);
    setTimer(WORKOUT_DATA[level][0].duration);
    setSessionActive(true);
    setView('workout');
  };

  const handleNextExercise = () => {
    if (activeExerciseIndex < activeExercises.length - 1) {
      const nextIndex = activeExerciseIndex + 1;
      setActiveExerciseIndex(nextIndex);
      setTimer(activeExercises[nextIndex].duration);
    } else {
      finishWorkout();
    }
  };

  const handlePrevExercise = () => {
    if (activeExerciseIndex > 0) {
      const nextIndex = activeExerciseIndex - 1;
      setActiveExerciseIndex(nextIndex);
      setTimer(activeExercises[nextIndex].duration);
    }
  };

  const finishWorkout = () => {
    setSessionActive(false);
    setView('stats');
    const workoutTime = activeExercises.reduce((acc, ex) => acc + ex.duration, 0);
    setStats(prev => ({
      ...prev,
      workoutsCompleted: prev.workoutsCompleted + 1,
      totalCalories: prev.totalCalories + (selectedLevel === 'Beginner' ? 150 : selectedLevel === 'Intermediate' ? 300 : 500),
      totalTime: prev.totalTime + workoutTime
    }));
  };

  return (
    <div className="min-h-screen bg-background text-text-main font-sans selection:bg-accent/30 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {view === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen border-4 border-border m-2 md:m-4 bg-background"
          >
            <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-surface">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center font-bold text-black">Σ</div>
                <span className="text-xl font-bold tracking-widest uppercase">Cali3D <span className="text-accent">Aero</span></span>
              </div>
              <div className="hidden md:flex gap-8">
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-text-muted tracking-widest">Global Rank</span>
                    <span className="text-sm font-semibold text-warning">Elite Candidate</span>
                 </div>
              </div>
            </header>

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16">
              <div className="text-center mb-16">
                <h1 className="text-7xl font-black tracking-tighter uppercase mb-4 italic">Push Gravity</h1>
                <p className="text-text-dim max-w-xl mx-auto">Precision calisthenics powered by real-time bio-mechanical feedback.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-1 mb-16 border-t border-l border-border bg-border">
                {(['Beginner', 'Intermediate', 'Advanced'] as Level[]).map((level, idx) => (
                  <LevelCard 
                    key={level} 
                    level={level} 
                    count={WORKOUT_DATA[level].length}
                    unlocked={stats.unlockedLevels.includes(level)}
                    onClick={() => startLevel(level)}
                    index={idx}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-border border border-border">
                <StatCard icon={<Flame size={20} />} label="Energy Expended" value={`${stats.totalCalories} KCAL`} color="text-warning" />
                <StatCard icon={<Clock size={20} />} label="Total Duration" value={`${Math.round(stats.totalTime / 60)} MIN`} color="text-accent" />
                <StatCard icon={<Trophy size={20} />} label="Milestones" value={`${stats.workoutsCompleted} COMPLETE`} color="text-text-main" />
              </div>
            </main>
          </motion.div>
        )}

        {view === 'workout' && selectedLevel && currentExercise && (
          <motion.div 
            key="workout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col bg-background border-4 border-border overflow-hidden"
          >
            {/* Theme Header */}
            <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-surface shrink-0">
               <div className="flex items-center gap-3">
                  <button onClick={() => setView('menu')} className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center font-bold text-black hover:bg-accent/80 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-xl font-bold tracking-widest uppercase">Cali3D <span className="text-accent">Aero</span></span>
               </div>
               <div className="flex gap-8">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-text-muted tracking-widest">Difficulty</span>
                    <span className="text-sm font-semibold text-warning uppercase">{selectedLevel} Phase</span>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] uppercase text-text-muted tracking-widest">Active Burn</span>
                    <span className="text-sm font-semibold">{(activeExerciseIndex * 15) + (currentExercise.duration - timer)} KCAL</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-text-muted tracking-widest">Time</span>
                    <span className="text-sm font-semibold font-mono">{Math.floor((activeExercises.reduce((acc, ex, i) => i < activeExerciseIndex ? acc + ex.duration : acc, 0) + (currentExercise.duration - timer)) / 60).toString().padStart(2, '0')}:{(activeExercises.reduce((acc, ex, i) => i < activeExerciseIndex ? acc + ex.duration : acc, 0) + (currentExercise.duration - timer) % 60).toString().padStart(2, '0')}</span>
                  </div>
               </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
              {/* Left Sidebar: Queue */}
              <aside className="hidden lg:flex w-72 border-r border-border p-6 flex-col gap-4 bg-background overflow-y-auto">
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Workout Queue</h2>
                <div className="space-y-3">
                  {activeExercises.map((ex, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "p-3 border-l-4 transition-all",
                        i === activeExerciseIndex 
                          ? "bg-border border-accent rounded-r" 
                          : i < activeExerciseIndex 
                            ? "bg-surface border-transparent opacity-40" 
                            : "bg-surface border-transparent opacity-60"
                      )}
                    >
                      <div className="text-xs font-semibold uppercase truncate">{ex.name}</div>
                      <div className="text-[10px] text-text-dim">
                        {i === activeExerciseIndex ? `Current Set • ${timer}s` : i < activeExerciseIndex ? 'Completed' : `Upcoming • ${ex.duration}s`}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto border-t border-border pt-4">
                  <div className="text-[10px] text-text-muted uppercase mb-2">Muscular Exhaustion</div>
                  <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent" 
                      animate={{ width: `${((activeExerciseIndex + 1) / activeExercises.length) * 100}%` }}
                    />
                  </div>
                </div>
              </aside>

              {/* Center: 3D Viewport */}
              <section className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_#111827_0%,_#0a0c10_100%)]">
                {/* Patterns */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[100px] bg-accent/5 border border-accent/20" style={{ transform: 'perspective(400px) rotateX(60deg)' }}></div>

                {/* 3D Model */}
                <div className="absolute inset-0">
                   <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={50} />
                    <OrbitControls enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.5} enableDamping />
                    <Environment preset="city" />
                    <ambientLight intensity={0.5} />
                    <Humanoid instruction={currentExercise.instruction3D} />
                    <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
                  </Canvas>
                </div>

                {/* Timer Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-80 h-80 border-2 border-dashed border-accent/30 rounded-full flex flex-col items-center justify-center relative">
                    <div className="w-24 h-48 bg-accent/20 rounded-full blur-2xl animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="text-center z-10">
                      <div className="text-accent font-mono text-7xl mb-2 drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">{timer.toString().padStart(2, '0')}</div>
                      <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">Seconds Remaining</div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-6 left-6 space-y-2 pointer-events-none">
                  <div className="bg-surface border border-border px-3 py-1.5 rounded flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">AeroTrack Active: V1.2</span>
                  </div>
                  <div className="bg-surface border border-border px-3 py-1.5 rounded flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Form Correction Engaged</span>
                  </div>
                </div>
              </section>

              {/* Right Sidebar: Details */}
              <aside className="hidden xl:flex w-80 border-l border-border p-6 bg-background flex-col gap-6 overflow-y-auto">
                <div>
                  <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Live Reference</h2>
                  <div className="aspect-video bg-border rounded relative overflow-hidden group">
                    <img 
                      src={currentExercise.thumbnail} 
                      alt="Reference" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                       <a href={currentExercise.videoLink} target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-sm transition-colors">
                        <Play fill="white" size={16} className="ml-1" />
                      </a>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                      <span className="text-[8px] uppercase font-bold bg-black/60 px-2 py-0.5 rounded tracking-widest">Video Study</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Bio-Mech Correction</h2>
                  <ul className="space-y-4">
                    {currentExercise.formTips.map((tip, i) => (
                      <li key={i} className="flex gap-3">
                        <div className={cn("w-1 h-10 mt-1 shrink-0", i === 0 ? "bg-warning" : "bg-accent")}></div>
                        <div>
                          <div className="text-xs font-bold text-text-main uppercase tracking-wider mb-1">{tip.split(' ')[0]} Focus</div>
                          <div className="text-[10px] text-text-dim leading-relaxed">{tip}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <div className="bg-accent-dim p-4 rounded-lg border border-accent/20">
                    <div className="text-[10px] text-accent uppercase font-bold mb-2 tracking-widest">Target Recruitment</div>
                    <div className="flex flex-wrap gap-2">
                       <span className="px-3 py-1 bg-border rounded text-[9px] uppercase font-bold border border-border/50">{currentExercise.muscle}</span>
                       <span className="px-3 py-1 bg-border rounded text-[9px] uppercase font-bold border border-border/50">Core Stabilizers</span>
                    </div>
                  </div>
                </div>
              </aside>
            </main>

            {/* Theme Footer */}
            <footer className="h-20 border-t border-border bg-surface px-8 flex items-center justify-between shrink-0">
               <div className="flex gap-2">
                  <button 
                    onClick={handlePrevExercise}
                    disabled={activeExerciseIndex === 0}
                    className="px-6 py-2 bg-border hover:bg-border/70 disabled:opacity-40 rounded font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    Prev
                  </button>
                  <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className="px-6 py-2 bg-accent text-background hover:bg-accent/80 rounded font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    {isPaused ? 'Resume' : 'Pause Workout'}
                  </button>
                  <button 
                    onClick={handleNextExercise}
                    className="px-6 py-2 bg-border hover:bg-border/70 rounded font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    Skip
                  </button>
               </div>
               
               <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] text-text-muted uppercase tracking-widest">Rel Performance</span>
                    <span className="text-lg font-bold text-emerald-500 uppercase">Optimal</span>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-border"></div>
                  <div className="flex flex-col min-w-[200px]">
                    <span className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Session Progress</span>
                    <div className="flex items-center gap-3">
                       <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-accent" 
                            animate={{ width: `${((activeExerciseIndex + 1) / activeExercises.length) * 100}%` }}
                          />
                       </div>
                       <span className="text-[10px] font-bold text-accent">{Math.round(((activeExerciseIndex + 1) / activeExercises.length) * 100)}%</span>
                    </div>
                  </div>
               </div>
            </footer>
          </motion.div>
        )}

        {view === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen border-4 border-border m-4 bg-background relative"
          >
             <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
             <main className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center relative z-10">
                <div className="w-20 h-20 bg-accent rounded-sm flex items-center justify-center mb-8 rotate-45 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                  <Trophy size={40} className="text-black -rotate-45" />
                </div>
                <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Phase Terminated</h1>
                <p className="text-text-dim text-lg mb-12 uppercase tracking-wide">Elite performance metrics recorded. Next phase calibration ready.</p>
                
                <div className="grid grid-cols-2 gap-1 bg-border w-full border border-border mb-12">
                   <div className="bg-background p-10 flex flex-col items-center justify-center">
                      <div className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-2">Total Output</div>
                      <div className="text-4xl font-black text-accent">+{selectedLevel === 'Beginner' ? 150 : selectedLevel === 'Intermediate' ? 300 : 500} <span className="text-sm">KCAL</span></div>
                   </div>
                   <div className="bg-background p-10 flex flex-col items-center justify-center">
                      <div className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-2">Neural Link</div>
                      <div className="text-4xl font-black text-warning">STABLE</div>
                   </div>
                </div>

                <button 
                  onClick={() => setView('menu')}
                  className="w-full py-6 bg-accent text-black hover:bg-accent/80 font-black text-xl uppercase tracking-[0.2em] transition-all"
                >
                  Confirm & Sync
                </button>
             </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LevelCard({ level, count, unlocked, onClick, index }: { level: Level, count: number, unlocked: boolean, onClick: () => void, index: number }) {
  const highlights = {
    Beginner: 'border-emerald-500/20 text-emerald-400',
    Intermediate: 'border-accent/20 text-accent',
    Advanced: 'border-warning/20 text-warning'
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      onClick={unlocked ? onClick : undefined}
      className={cn(
        "relative text-left p-10 bg-surface transition-all group overflow-hidden active:scale-[0.98] border-r border-b border-border",
        !unlocked && "opacity-30 grayscale pointer-events-none"
      )}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className={cn("text-[10px] font-bold uppercase tracking-[0.3em] mb-4", highlights[level])}>PHASE 0{index + 1}</div>
        <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-2 group-hover:translate-x-1 transition-transform">{level}</h3>
        <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-12">{count} RE-CALIBRATED ROUTINES</p>
        
        <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black px-5 py-2.5 bg-text-main group-hover:bg-accent transition-colors shrink-0">
              Engage <Play fill="black" size={10} className="translate-x-0.5" />
            </div>
            <div className="text-border group-hover:text-accent/20 transition-colors uppercase font-mono text-[10px]">
                {level === 'Advanced' ? 'Critical' : 'Nominal'}
            </div>
        </div>
      </div>
      
      {/* Background Decorative */}
      <div className="absolute -bottom-8 -right-8 font-black text-9xl text-white/5 pointer-events-none select-none tracking-tighter italic opacity-0 group-hover:opacity-100 transition-opacity">
        {level[0]}
      </div>
    </motion.button>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-surface p-8 flex items-center gap-6 hover:bg-surface/80 transition-colors">
      <div className="w-12 h-12 border border-border flex items-center justify-center shrink-0">
        <div className={color}>{icon}</div>
      </div>
      <div>
        <div className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">{label}</div>
        <div className="text-xl font-black tracking-tighter uppercase italic">{value}</div>
      </div>
    </div>
  );
}
