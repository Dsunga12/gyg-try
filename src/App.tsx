/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef, Component } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  BarChart3, 
  Medal,
  Flame,
  Target,
  Shield,
  Crown,
  Upload,
  ChevronRight,
  Info,
  Star,
  Award,
  Sun,
  Moon,
  Users,
  Map,
  DollarSign,
  Activity,
  Sparkles,
  Clock,
  ChevronDown,
  CircleDot,
  Flag,
  Goal,
  Globe,
  Milestone,
  Square,
  AlertTriangle,
  XOctagon,
  Ban,
  Play,
  Pause,
  Layers
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Cell,
  ReferenceLine
} from 'recharts';
import { 
  INITIAL_CSV, 
  combineCSVData,
  ZONES, 
  getWeekLabels, 
  RestaurantData 
} from './data';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  doc, 
  onSnapshot, 
  setDoc, 
  Timestamp, 
  handleFirestoreError, 
  OperationType,
  User,
  testConnection
} from './firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ZONE_ICONS: Record<string, React.ReactNode> = {
  Aguila: <img src="https://res.cloudinary.com/dnce4cxfo/image/upload/v1778046287/Aguila_ol4ba0.png" className="w-full h-full object-contain filter drop-shadow-md" alt="Aguila" referrerPolicy="no-referrer" />,
  Triunfo: <img src="https://res.cloudinary.com/dnce4cxfo/image/upload/v1778046287/Triunfo_f6mwuf.png" className="w-full h-full object-contain filter drop-shadow-md" alt="Triunfo" referrerPolicy="no-referrer" />,
  Fuego: <img src="https://res.cloudinary.com/dnce4cxfo/image/upload/v1778046287/Fuego_txfkti.png" className="w-full h-full object-contain filter drop-shadow-md" alt="Fuego" referrerPolicy="no-referrer" />,
  Impetu: <img src="https://res.cloudinary.com/dnce4cxfo/image/upload/v1778046287/Impetu_zhp3ok.png" className="w-full h-full object-contain filter drop-shadow-md" alt="Impetu" referrerPolicy="no-referrer" />,
  Dominio: <img src="https://res.cloudinary.com/dnce4cxfo/image/upload/v1778046287/Dominio_z94asi.png" className="w-full h-full object-contain filter drop-shadow-md" alt="Dominio" referrerPolicy="no-referrer" />,
};

const ZONE_COLORS: Record<string, string> = {
  Aguila: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  Triunfo: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  Fuego: 'bg-orange-50 border-orange-200 text-orange-700',
  Impetu: 'bg-purple-50 border-purple-200 text-purple-700',
  Dominio: 'bg-blue-50 border-blue-200 text-blue-700',
};

const ZONE_ICON_BG: Record<string, string> = {
  Aguila: 'bg-emerald-500',
  Triunfo: 'bg-yellow-500',
  Fuego: 'bg-orange-600',
  Impetu: 'bg-purple-500',
  Dominio: 'bg-blue-500',
};

const ZONE_TEXT_COLORS: Record<string, string> = {
  Aguila: 'text-emerald-600',
  Triunfo: 'text-yellow-600',
  Fuego: 'text-orange-600',
  Impetu: 'text-purple-600',
  Dominio: 'text-blue-600',
};

const RANK_COLORS = [
  'bg-yellow-400 border-yellow-500 text-black shadow-xl shadow-yellow-400/40 ring-4 ring-yellow-400/20',
  'bg-slate-300 border-slate-400 text-slate-900 shadow-lg shadow-slate-300/30 ring-4 ring-slate-300/20',
  'bg-orange-400 border-orange-500 text-white shadow-lg shadow-orange-400/30 ring-4 ring-orange-400/20',
  'bg-slate-50 border-slate-200 text-slate-900 shadow-sm',
];

const CHART_COLORS = [
  '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', 
  '#f97316', '#06b6d4', '#ec4899', '#4b5563', '#14b8a6',
  '#f43f5e', '#a855f7', '#6366f1', '#10b981', '#d946ef'
];

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<any, any> {
  state: any;
  props: any;
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-red-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="text-red-500 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              An unexpected error occurred. Please try refreshing the page or contact support if the issue persists.
            </p>
            <div className="bg-red-50 p-4 rounded-xl mb-6 text-left overflow-auto max-h-40">
              <code className="text-xs text-red-600 break-all">{this.state.errorInfo}</code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-yellow-400/30"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


export default function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [trxCsv, setTrxCsv] = useState(INITIAL_CSV);
  const [salesCsv, setSalesCsv] = useState(INITIAL_CSV);
  const [penaltyCsv, setPenaltyCsv] = useState('');
  const [processedData, setProcessedData] = useState<RestaurantData[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [rankingMode, setRankingMode] = useState<'total' | 'wow' | 'sales' | 'net'>('net');
  const [raceView, setRaceView] = useState<'restaurant' | 'zone'>('restaurant');
  const isOwner = useMemo(() => {
    if (!user?.email) return false;
    return user.email.toLowerCase().trim() === "magpantay.jervi@gmail.com";
  }, [user]);
  const isAuthorizedToToggle = useMemo(() => {
    if (!user?.email) return false;
    const email = user.email.toLowerCase().trim();
    return ["magpantay.jervi@gmail.com", "ben@gyg.com.sg", "daniel.sunga@gyg.com.sg"].includes(email);
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      console.log("Current user authorized:", isAuthorizedToToggle, "Email:", user.email);
    }
  }, [user, isAuthorizedToToggle]);
  const [isRaceActive, setIsRaceActive] = useState(false);
  const [raceWeek, setRaceWeek] = useState(0);
  const [chartTheme, setChartTheme] = useState<'dark' | 'light'>('light');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [lastTrxUpdate, setLastTrxUpdate] = useState<string | null>(null);
  const [lastSalesUpdate, setLastSalesUpdate] = useState<string | null>(null);
  const [lastPenaltyUpdate, setLastPenaltyUpdate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const salesInputRef = useRef<HTMLInputElement>(null);
  const penaltyInputRef = useRef<HTMLInputElement>(null);

  const weekLabels = useMemo(() => {
    const numWeeks = processedData.length > 0 ? processedData[0].weeklyTotals.length : 1;
    return getWeekLabels(numWeeks);
  }, [processedData]);

  const top5Overall = useMemo(() => {
    return [...processedData]
      .sort((a, b) => {
        if (rankingMode === 'total') {
          return b.weeklyTotals[selectedWeek] - a.weeklyTotals[selectedWeek];
        } else if (rankingMode === 'sales') {
          return b.weeklySales[selectedWeek] - a.weeklySales[selectedWeek];
        } else if (rankingMode === 'net') {
          const aPenalty = a.weeklyPenalties[selectedWeek] || { kds: 0, sc: 0, missing: 0, fouls: 0 };
          const bPenalty = b.weeklyPenalties[selectedWeek] || { kds: 0, sc: 0, missing: 0, fouls: 0 };
          const aTotalPenalty = (aPenalty.kds || 0) + (aPenalty.sc || 0) + (aPenalty.missing || 0) + (aPenalty.fouls || 0);
          const bTotalPenalty = (bPenalty.kds || 0) + (bPenalty.sc || 0) + (bPenalty.missing || 0) + (bPenalty.fouls || 0);
          const aNet = (selectedWeek > 0 ? a.wowChanges[selectedWeek - 1] : 0) - aTotalPenalty;
          const bNet = (selectedWeek > 0 ? b.wowChanges[selectedWeek - 1] : 0) - bTotalPenalty;
          return bNet - aNet;
        } else {
          const aWow = a.wowChanges[selectedWeek - 1] || 0;
          const bWow = b.wowChanges[selectedWeek - 1] || 0;
          return bWow - aWow;
        }
      })
      .slice(0, 5);
  }, [processedData, selectedWeek, rankingMode]);

  const zoneData = useMemo(() => {
    return Object.keys(ZONES).map(zoneName => {
      const restaurants = processedData
        .filter(d => d.zone === zoneName)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      const total = restaurants.reduce((sum, o) => sum + o.weeklyTotals[selectedWeek], 0);
      const prevTotal = selectedWeek > 0 
        ? restaurants.reduce((sum, o) => sum + o.weeklyTotals[selectedWeek - 1], 0)
        : total;
      const wow = prevTotal === 0 ? 0 : ((total - prevTotal) / prevTotal) * 100;
      const change = total - prevTotal;

      const totalSales = restaurants.reduce((sum, o) => sum + o.weeklySales[selectedWeek], 0);
      const prevTotalSales = selectedWeek > 0
        ? restaurants.reduce((sum, o) => sum + o.weeklySales[selectedWeek - 1], 0)
        : totalSales;
      const wowSales = prevTotalSales === 0 ? 0 : ((totalSales - prevTotalSales) / prevTotalSales) * 100;

      const totalPenalties = restaurants.reduce((acc, rest) => {
        const p = rest.weeklyPenalties[selectedWeek] || { kds: 0, sc: 0, missing: 0, fouls: 0 };
        return {
          kds: acc.kds + (p.kds || 0),
          sc: acc.sc + (p.sc || 0),
          missing: acc.missing + (p.missing || 0),
          fouls: acc.fouls + (p.fouls || 0)
        };
      }, { kds: 0, sc: 0, missing: 0, fouls: 0 });

      const zoneTotalPenaltyCount = totalPenalties.kds + totalPenalties.sc + totalPenalties.missing + totalPenalties.fouls;
      const netScore = wow - zoneTotalPenaltyCount;
      
      return { zoneName, restaurants, total, wow, change, totalSales, wowSales, totalPenalties, zoneTotalPenaltyCount, netScore };
    });
  }, [processedData, selectedWeek]);

  const podiumData = useMemo(() => {
    return [...zoneData].sort((a, b) => b.netScore - a.netScore);
  }, [zoneData]);

  useEffect(() => {
    setProcessedData(combineCSVData(trxCsv, salesCsv, penaltyCsv));
  }, [trxCsv, salesCsv, penaltyCsv]);

  useEffect(() => {
    if (weekLabels.length > 0) {
      setSelectedWeek(weekLabels.length - 1);
    }
  }, [weekLabels.length]);

  useEffect(() => {
    let interval: any;
    if (isRaceActive) {
      setRaceWeek(0);
      const maxWeek = weekLabels.length - 1;
      interval = setInterval(() => {
        setRaceWeek((prev) => {
          if (prev >= maxWeek) {
            setIsRaceActive(false);
            return maxWeek;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isRaceActive, weekLabels.length]);

  useEffect(() => {
    if (podiumData.length > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#94a3b8', '#b45309']
      });
    }
  }, [selectedWeek, podiumData.length]);

  // Auth State Listener
  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAuthReady(true);
      
      if (u) {
        // Sync user document
        try {
          await setDoc(doc(db, 'users', u.uid), {
            email: u.email,
            role: (u.email === "magpantay.jervi@gmail.com" || u.email === "ben@gyg.com.sg" || u.email === "daniel.sunga@gyg.com.sg") ? 'admin' : 'user'
          }, { merge: true });
        } catch (error) {
          console.error("User sync failed", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore Data Listener
  useEffect(() => {
    if (!isAuthReady || !user) return;

    const path = 'dashboard_data/latest';
    const unsubscribe = onSnapshot(doc(db, 'dashboard_data', 'latest'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setTrxCsv(data.transactions || INITIAL_CSV);
        setSalesCsv(data.sales || INITIAL_CSV);
        setPenaltyCsv(data.penalties || '');
        
        const trxTs = data.lastUpdatedTrx as Timestamp;
        if (trxTs) {
          const date = trxTs.toDate();
          const formatted = date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
          setLastTrxUpdate(formatted);
        }

        const salesTs = data.lastUpdatedSales as Timestamp;
        if (salesTs) {
          const date = salesTs.toDate();
          const formatted = date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
          setLastSalesUpdate(formatted);
        }

        const penaltyTs = data.lastUpdatedPenalty as Timestamp;
        if (penaltyTs) {
          const date = penaltyTs.toDate();
          const formatted = date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
          setLastPenaltyUpdate(formatted);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  const accumulatedPoints = useMemo(() => {
    return processedData.map(restaurant => {
      const points = restaurant.wowChanges.reduce((sum, wow) => sum + wow, 0);
      return { ...restaurant, points };
    }).sort((a, b) => b.points - a.points);
  }, [processedData]);

  const chartData = useMemo(() => {
    return weekLabels.map((week, idx) => {
      const entry: any = { name: week.label };
      
      if (raceView === 'restaurant') {
        const weekValues = processedData.map(restaurant => ({
          name: restaurant.name,
          value: rankingMode === 'total' ? restaurant.weeklyTotals[idx] : 
                 rankingMode === 'sales' ? restaurant.weeklySales[idx] :
                 (idx === 0 ? 0 : restaurant.wowChanges[idx - 1])
        })).sort((a, b) => b.value - a.value);

        processedData.forEach(restaurant => {
          const val = rankingMode === 'total' ? restaurant.weeklyTotals[idx] : 
                      rankingMode === 'sales' ? restaurant.weeklySales[idx] :
                      (idx === 0 ? 0 : restaurant.wowChanges[idx - 1]);
          entry[restaurant.name] = val;
          entry[`${restaurant.name}_rank`] = weekValues.findIndex(v => v.name === restaurant.name) + 1;
        });
      } else {
        const weekValues = Object.keys(ZONES).map(zoneName => {
          const restaurants = processedData.filter(r => r.zone === zoneName);
          const total = restaurants.reduce((sum, r) => sum + (rankingMode === 'total' ? r.weeklyTotals[idx] : 
                                                              rankingMode === 'sales' ? r.weeklySales[idx] : 
                                                              (idx === 0 ? 0 : r.wowChanges[idx - 1])), 0);
          return { name: zoneName, value: total };
        }).sort((a, b) => b.value - a.value);

        Object.keys(ZONES).forEach(zoneName => {
          const restaurants = processedData.filter(r => r.zone === zoneName);
          const val = restaurants.reduce((sum, r) => sum + (rankingMode === 'total' ? r.weeklyTotals[idx] : 
                                                            rankingMode === 'sales' ? r.weeklySales[idx] : 
                                                            (idx === 0 ? 0 : r.wowChanges[idx - 1])), 0);
          entry[zoneName] = val;
          entry[`${zoneName}_rank`] = weekValues.findIndex(v => v.name === zoneName) + 1;
        });
      }
      return entry;
    });
  }, [processedData, rankingMode, raceView, weekLabels]);

  const currentRaceTop10 = useMemo(() => {
    const weekIdx = isRaceActive ? raceWeek : weekLabels.length - 1;
    if (raceView === 'restaurant') {
      return [...processedData]
        .map(restaurant => ({
          name: restaurant.name,
          zone: restaurant.zone,
          value: rankingMode === 'total' ? restaurant.weeklyTotals[weekIdx] : 
                 rankingMode === 'sales' ? restaurant.weeklySales[weekIdx] :
                 (weekIdx === 0 ? 0 : restaurant.wowChanges[weekIdx - 1])
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    } else {
      return Object.keys(ZONES).map(zoneName => {
        const restaurants = processedData.filter(r => r.zone === zoneName);
        const val = restaurants.reduce((sum, r) => sum + (rankingMode === 'total' ? r.weeklyTotals[weekIdx] : 
                                                          rankingMode === 'sales' ? r.weeklySales[weekIdx] : 
                                                          (weekIdx === 0 ? 0 : r.wowChanges[weekIdx - 1])), 0);
        return { name: zoneName, zone: zoneName, value: val };
      }).sort((a, b) => b.value - a.value);
    }
  }, [processedData, rankingMode, isRaceActive, raceWeek, raceView, weekLabels.length]);

  const championshipRef = useRef(null);
  const topRef = useRef(null);
  const isChampionshipInView = useInView(championshipRef, { amount: 0.3 });
  const isTopInView = useInView(topRef, { amount: 0.1 });

  useEffect(() => {
    let interval: any;
    if (isChampionshipInView || isTopInView) {
      const duration = 2 * 1000;
      const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      interval = setInterval(() => {
        confetti({ ...defaults, particleCount: 30, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount: 30, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isChampionshipInView, isTopInView]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateFirestoreData = async (fields: any) => {
    if (!user) {
      alert("You must be logged in to upload data.");
      return;
    }
    const path = 'dashboard_data/latest';
    console.log("Starting Firestore update for path:", path, "with fields:", Object.keys(fields));
    try {
      await setDoc(doc(db, 'dashboard_data', 'latest'), {
        ...fields,
        updatedBy: user.uid
      }, { merge: true });
      console.log("Firestore update successful!");
      // Pulse animation effect or small notification
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { y: 0.8 },
        colors: ['#22c55e']
      });
    } catch (error) {
      console.error("Firestore Write Error:", error);
      alert("Failed to update data. Please check your permissions.");
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected for Trx:", file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        updateFirestoreData({ 
          transactions: text,
          lastUpdatedTrx: Timestamp.now()
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.onerror = (err) => console.error("File Reader Error (Trx):", err);
      reader.readAsText(file);
    }
  };

  const handleSalesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected for Sales:", file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        updateFirestoreData({ 
          sales: text,
          lastUpdatedSales: Timestamp.now()
        });
        if (salesInputRef.current) salesInputRef.current.value = '';
      };
      reader.onerror = (err) => console.error("File Reader Error (Sales):", err);
      reader.readAsText(file);
    }
  };

  const handlePenaltyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected for Penalties:", file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        updateFirestoreData({ 
          penalties: text,
          lastUpdatedPenalty: Timestamp.now()
        });
        if (penaltyInputRef.current) penaltyInputRef.current.value = '';
      };
      reader.onerror = (err) => console.error("File Reader Error (Penalties):", err);
      reader.readAsText(file);
    }
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props;
    const currentIdx = weekLabels.findIndex(w => w.label === payload.name);
    
    if (isRaceActive && currentIdx > raceWeek) return null;
    if (!isRaceActive && currentIdx >= weekLabels.length) return null;

    const rank = payload[`${dataKey}_rank`];
    const isSelected = raceView === 'restaurant' ? selectedRestaurant === dataKey : selectedZone === dataKey;
    const hasSelection = raceView === 'restaurant' ? selectedRestaurant !== null : selectedZone !== null;
    
    if (hasSelection && !isSelected) return null;

    let dotColor = "#FFD700"; 
    let dotSize = isSelected ? 8 : 5;

    if (rank === 1) { dotColor = "#fbbf24"; dotSize = isSelected ? 10 : 7; } 
    else if (rank === 2) { dotColor = "#94a3b8"; dotSize = isSelected ? 9 : 6; } 
    else if (rank === 3) { dotColor = "#b45309"; dotSize = isSelected ? 9 : 6; } 
    else if (rank <= 5) { dotColor = "#fef08a"; dotSize = isSelected ? 8 : 5; } 

    return (
      <g>
        <circle 
          cx={cx} 
          cy={cy} 
          r={dotSize} 
          fill={dotColor} 
          stroke={isSelected ? (chartTheme === 'dark' ? "#fff" : "#000") : "#000"} 
          strokeWidth={isSelected ? 3 : 1.5} 
          className={cn(isSelected && "animate-pulse")}
        />
        {(rank <= 5 || isSelected) && (
          <text 
            x={cx} 
            y={cy - 14} 
            textAnchor="middle" 
            fill={chartTheme === 'dark' ? dotColor : '#000'} 
            fontSize={isSelected ? 12 : 10} 
            fontWeight="900"
            className="pointer-events-none uppercase tracking-tighter"
          >
            {dataKey}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-yellow-400 selection:text-black pb-20 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.4]"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop')`, 
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-white/95" />
      </div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-6 py-3 shadow-lg">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Guzman_y_Gomez_Logo.png/960px-Guzman_y_Gomez_Logo.png?_=20240404055806" 
                alt="GYG Logo" 
                className="w-24 h-24 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none text-slate-900">GYG Singapore</h1>
              <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">Peak Hour Championship</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="appearance-none bg-slate-100 border border-slate-200 rounded-lg px-6 py-2.5 text-xs font-black uppercase tracking-tight cursor-pointer hover:bg-slate-200 focus:ring-1 focus:ring-yellow-400 outline-none text-slate-900 min-w-[240px]"
              >
                {weekLabels.map((week, idx) => (
                  <option key={week.label} value={idx}>
                    {week.label} ({week.date})
                  </option>
                ))}
              </select>
            </div>

            {isOwner && (
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Rankings</span>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setRankingMode('net')}
                    className={cn(
                      "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                      rankingMode === 'net' ? "bg-white text-black shadow-sm" : "text-slate-400"
                    )}
                  >
                    Net
                  </button>
                  <button
                    onClick={() => setRankingMode('wow')}
                    className={cn(
                      "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                      rankingMode === 'wow' ? "bg-white text-black shadow-sm" : "text-slate-400"
                    )}
                  >
                    WoW%
                  </button>
                  <button
                    onClick={() => setRankingMode('total')}
                    className={cn(
                      "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                      rankingMode === 'total' ? "bg-white text-black shadow-sm" : "text-slate-400"
                    )}
                  >
                    Txns
                  </button>
                  <button
                    onClick={() => setRankingMode('sales')}
                    className={cn(
                      "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                      rankingMode === 'sales' ? "bg-white text-black shadow-sm" : "text-slate-400"
                    )}
                  >
                    Sales
                  </button>
                </div>
              </div>
            )}

            {isOwner ? (
              <div className="flex items-center gap-3 px-4 border-l border-r border-slate-100">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-black shadow-sm"
                  >
                    <Activity size={12} /> Import Trx
                  </button>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">{lastTrxUpdate || 'No data'}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => salesInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-black shadow-sm"
                  >
                    <DollarSign size={12} /> Import Sales
                  </button>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">{lastSalesUpdate || 'No data'}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => penaltyInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-black shadow-sm"
                  >
                    <Flag size={12} /> Import Penalty
                  </button>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">{lastPenaltyUpdate || 'No data'}</span>
                </div>
              </div>
            ) : (
              <div className="hidden">
                {/* Auth debug for developers: {user?.email} */}
              </div>
            )}

            {!user ? (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase tracking-widest rounded-lg transition-all shadow-md"
              >
                Login
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
              >
                <Activity size={18} />
              </button>
            )}
          </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".csv" 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={salesInputRef} 
          onChange={handleSalesUpload} 
          accept=".csv" 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={penaltyInputRef} 
          onChange={handlePenaltyUpload} 
          accept=".csv" 
          className="hidden" 
        />
      </nav>

      <main className="max-w-[1600px] mx-auto p-8 space-y-12">
        
        {/* Top Performers Section */}
        <section ref={topRef} className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-600/20">
                <Trophy className="text-white w-8 h-8 opacity-100" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 drop-shadow-sm">Top 5 Restaurants</h2>
                <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Based on selected week</p>
              </div>
            </div>

            {/* Net Score Legend */}
            <div className="hidden lg:flex flex-col gap-0.5 bg-white/80 px-4 py-2 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-sm">
               <div className="flex items-center gap-1.5">
                 <Info size={12} className="text-yellow-600" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-800 underline decoration-yellow-400 decoration-2 underline-offset-2">Formula: Net Score = WOW% - Penalties</span>
               </div>
               <span className="text-[8px] font-bold text-slate-400 italic ml-4.5">Ex: WOW % = 5.6%, Penalties = 4, Net Score = 1.6</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {top5Overall.length > 0 ? (
              top5Overall.map((restaurant, idx) => {
                const change = selectedWeek > 0 
                  ? restaurant.weeklyTotals[selectedWeek] - restaurant.weeklyTotals[selectedWeek - 1]
                  : 0;
                const salesChange = selectedWeek > 0
                  ? restaurant.weeklySales[selectedWeek] - restaurant.weeklySales[selectedWeek - 1]
                  : 0;

                return (
                  <motion.div
                    key={restaurant.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative bg-white p-8 rounded-[2.5rem] group overflow-hidden shadow-2xl hover:scale-105 transition-all"
                  >
                    {/* Sporty Pitch Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                      <div className="absolute inset-0" style={{ 
                        backgroundImage: 'repeating-linear-gradient(90deg, #059669, #059669 2px, transparent 2px, transparent 40px)' 
                      }} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-emerald-900 rounded-full" />
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-b-4 border-x-4 border-emerald-900" />
                    </div>
                    
                    <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                      <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl border-4 transform -rotate-12 shadow-2xl bg-white",
                        idx === 0 ? "border-yellow-400 text-yellow-600" : 
                        idx === 1 ? "border-slate-300 text-slate-400" : 
                        idx === 2 ? "border-orange-400 text-orange-600" : 
                        "border-slate-100 text-slate-300"
                      )}>
                        {idx === 0 ? <Crown size={40} className="fill-yellow-400" /> : idx + 1}
                      </div>
                      
                      <div>
                        <span className="font-black text-2xl lg:text-3xl uppercase tracking-tighter block leading-tight text-slate-900 drop-shadow-sm">{restaurant.name}</span>
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-slate-100 text-slate-500 mt-2 inline-block border border-slate-200")}>
                          {restaurant.zone}
                        </span>
                      </div>

                      <div className="space-y-1 bg-slate-50 w-full py-4 rounded-2xl border border-slate-200 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                        <div className="text-4xl font-mono font-black tracking-tighter text-emerald-600">
                          {(() => {
                            const p = restaurant.weeklyPenalties[selectedWeek] || { kds: 0, sc: 0, missing: 0, fouls: 0 };
                            const tp = (p.kds || 0) + (p.sc || 0) + (p.missing || 0) + (p.fouls || 0);
                            const growth = selectedWeek > 0 ? (restaurant.wowChanges[selectedWeek - 1] || 0) : 0;
                            const netScore = growth - tp;
                            return netScore.toFixed(1);
                          })()}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1">
                          Weekly Net Score
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between px-2 w-full">
                         <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">WOW%</span>
                            <div className="flex flex-col items-center leading-none mt-1">
                              <span className="text-sm font-black text-slate-700">
                                {(selectedWeek > 0 ? (restaurant.wowChanges[selectedWeek - 1] || 0) : 0).toFixed(1)}%
                              </span>
                              <span className={cn(
                                "text-[9px] font-bold",
                                (restaurant.weeklyTotals[selectedWeek] - (selectedWeek > 0 ? restaurant.weeklyTotals[selectedWeek - 1] : 0)) >= 0 ? "text-emerald-500" : "text-red-500"
                              )}>
                                {(restaurant.weeklyTotals[selectedWeek] - (selectedWeek > 0 ? restaurant.weeklyTotals[selectedWeek - 1] : 0)) >= 0 ? '+' : ''}
                                {(restaurant.weeklyTotals[selectedWeek] - (selectedWeek > 0 ? restaurant.weeklyTotals[selectedWeek - 1] : 0)).toLocaleString()}
                              </span>
                            </div>
                         </div>
                         <div className="w-px h-8 bg-slate-200" />
                         <div className="flex flex-col items-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Penalties</span>
                            <div className="flex items-center gap-1.5 mt-1 leading-none">
                              <AlertTriangle size={12} className="text-red-500" />
                              <span className="text-sm font-black text-slate-700">
                                {(() => {
                                  const p = restaurant.weeklyPenalties[selectedWeek] || { kds: 0, sc: 0, missing: 0, fouls: 0 };
                                  return (p.kds || 0) + (p.sc || 0) + (p.missing || 0) + (p.fouls || 0);
                                })()}
                              </span>
                            </div>
                         </div>
                      </div>

                      {/* Penalties Grid */}
                      <div className="grid grid-cols-4 gap-2 w-full">
                        <div className="flex flex-col items-center p-1.5 rounded-xl bg-slate-50 border border-slate-200">
                          <Square size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-black text-slate-900 mt-1">{restaurant.weeklyPenalties[selectedWeek]?.kds || 0}</span>
                          <span className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">KDS</span>
                        </div>
                        <div className="flex flex-col items-center p-1.5 rounded-xl bg-slate-50 border border-slate-200">
                          <Square size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-black text-slate-900 mt-1">{restaurant.weeklyPenalties[selectedWeek]?.sc || 0}</span>
                          <span className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">SC</span>
                        </div>
                        <div className="flex flex-col items-center p-1.5 rounded-xl bg-slate-50 border border-slate-200">
                          <Square size={16} className="text-red-500 fill-red-500" />
                          <span className="text-xs font-black text-slate-900 mt-1">{restaurant.weeklyPenalties[selectedWeek]?.missing || 0}</span>
                          <span className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Miss</span>
                        </div>
                        <div className="flex flex-col items-center p-1.5 rounded-xl bg-slate-50 border border-slate-200">
                          <Flag size={16} className="text-orange-500" />
                          <span className="text-xs font-black text-slate-900 mt-1">{restaurant.weeklyPenalties[selectedWeek]?.fouls || 0}</span>
                          <span className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Foul</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-5 bg-white p-12 rounded-[2.5rem] border border-gray-100 text-center shadow-lg">
                <Info className="mx-auto text-gray-300 w-12 h-12 mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest">No comparison data available</p>
              </div>
            )}
          </div>

          {/* Zone Rankings Section */}
          <div ref={championshipRef} className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden relative backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="absolute top-4 right-8 flex items-center gap-4">
            {isAuthorizedToToggle && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Mode</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            )}
              <button 
                onClick={() => {
                  const duration = 3 * 1000;
                  const animationEnd = Date.now() + duration;
                  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

                  const interval: any = setInterval(function() {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                      return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                  }, 250);
                }}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-400 hover:text-yellow-600 shadow-sm"
              >
                <Sparkles size={20} />
              </button>
            </div>

            <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-40 flex items-center justify-center gap-4 relative z-10 text-center">
              Zone Championship Podium
            </h3>

            <div className="flex items-end justify-center gap-2 md:gap-4 max-w-5xl mx-auto h-[400px] relative z-10">
              {/* 4th Place */}
              {podiumData[3] && (
                <div className="flex flex-col items-center group w-1/5">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: '140px' }}
                    className="w-full bg-slate-100 rounded-t-2xl border-x border-t border-slate-200 flex flex-col items-center justify-end pb-6 gap-2 relative group-hover:bg-slate-200 transition-colors shadow-sm"
                  >
                    <div className="absolute -top-20 flex flex-col items-center">
                      <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center border-2 shadow-sm mb-2 p-3 bg-white", ZONE_COLORS[podiumData[3].zoneName])}>
                        {ZONE_ICONS[podiumData[3].zoneName]}
                      </div>
                    </div>
                    <span className="text-sm font-black uppercase tracking-tighter whitespace-nowrap mb-2 text-slate-400">4th Seed</span>
                    <span className="text-3xl font-black text-slate-300">04</span>
                  </motion.div>
                  <div className="mt-4 text-center">
                    <div className="text-xl font-black text-slate-900">
                      {podiumData[3].netScore.toFixed(1)}
                    </div>
                  </div>
                </div>
              )}

              {/* 2nd Place */}
              {podiumData[1] && (
                <div className="flex flex-col items-center group w-1/5">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: '220px' }}
                    className="w-full bg-slate-300 rounded-t-3xl border-x border-t border-slate-400 flex flex-col items-center justify-end pb-8 gap-2 relative group-hover:bg-slate-400 transition-colors shadow-lg"
                  >
                    <div className="absolute -top-24 flex flex-col items-center">
                      <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center border-2 shadow-md mb-2 p-4 bg-white", ZONE_COLORS[podiumData[1].zoneName])}>
                        {ZONE_ICONS[podiumData[1].zoneName]}
                      </div>
                    </div>
                    <span className="text-base font-black uppercase tracking-tight whitespace-nowrap mb-2 text-slate-600">Silver Finish</span>
                    <span className="text-5xl font-black text-white/50">02</span>
                  </motion.div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-black text-slate-900">
                      {podiumData[1].netScore.toFixed(1)}
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {podiumData[0] && (
                <div className="flex flex-col items-center group w-1/3 relative">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: '300px' }}
                    className="w-full bg-yellow-400 rounded-t-[3rem] border-x border-t border-yellow-500 flex flex-col items-center justify-end pb-12 gap-2 relative group-hover:bg-yellow-500 transition-colors shadow-2xl shadow-yellow-400/30"
                  >
                    <div className="absolute -top-32 flex flex-col items-center">
                      <motion.div 
                         animate={{ y: [0, -10, 0] }}
                         transition={{ repeat: Infinity, duration: 2 }}
                         className={cn("w-28 h-28 rounded-3xl flex items-center justify-center border-4 shadow-xl mb-4 bg-white p-5", ZONE_COLORS[podiumData[0].zoneName])}
                       >
                         {ZONE_ICONS[podiumData[0].zoneName]}
                       </motion.div>
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest whitespace-nowrap text-slate-900/40">Zone Champion</span>
                    <span className="text-xl font-black uppercase tracking-tight whitespace-nowrap mb-2 text-black">{podiumData[0].zoneName}</span>
                    <motion.div 
                      animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="relative z-10"
                    >
                      <Trophy size={64} className="text-black drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] mb-2" />
                    </motion.div>
                    <span className="text-8xl font-black text-black/5 absolute bottom-4">01</span>
                  </motion.div>
                  <div className="mt-4 text-center">
                    <div className="text-4xl font-black text-yellow-600 drop-shadow-md">
                      {podiumData[0].netScore.toFixed(1)}
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {podiumData[2] && (
                <div className="flex flex-col items-center group w-1/5">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: '180px' }}
                    className="w-full bg-orange-400 rounded-t-3xl border-x border-t border-orange-500 flex flex-col items-center justify-end pb-8 gap-2 relative group-hover:bg-orange-500 transition-colors shadow-lg"
                  >
                    <div className="absolute -top-24 flex flex-col items-center">
                      <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center border-2 shadow-md mb-2 p-4 bg-white", ZONE_COLORS[podiumData[2].zoneName])}>
                        {ZONE_ICONS[podiumData[2].zoneName]}
                      </div>
                    </div>
                    <span className="text-base font-black uppercase tracking-tight whitespace-nowrap mb-2 text-orange-950/60">Bronze Finish</span>
                    <span className="text-4xl font-black text-white/40">03</span>
                  </motion.div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-black text-slate-900">
                      {podiumData[2].netScore.toFixed(1)}
                    </div>
                  </div>
                </div>
              )}

              {/* 5th Place */}
              {podiumData[4] && (
                <div className="flex flex-col items-center group w-1/5">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: '100px' }}
                    className="w-full bg-slate-50 rounded-t-xl border-x border-t border-slate-200 flex flex-col items-center justify-end pb-6 gap-2 relative group-hover:bg-slate-100 transition-colors"
                  >
                    <div className="absolute -top-20 flex flex-col items-center">
                      <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center border-2 shadow-sm mb-2 p-3 bg-white", ZONE_COLORS[podiumData[4].zoneName])}>
                        {ZONE_ICONS[podiumData[4].zoneName]}
                      </div>
                    </div>
                    <span className="text-sm font-black uppercase tracking-tighter whitespace-nowrap mb-2 text-slate-400">5th Seed</span>
                    <span className="text-2xl font-black text-slate-300">05</span>
                  </motion.div>
                  <div className="mt-4 text-center">
                    <div className="text-xl font-black text-slate-900">
                      {podiumData[4].netScore.toFixed(1)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
             {/* Divisional Standings Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
              <Shield className="text-white w-8 h-8 opacity-100" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 drop-shadow-sm">Zone Leagues</h2>
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Restaurant Standings by Zone</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 relative">
            {zoneData.map((zone) => (
              <div key={zone.zoneName} className="space-y-4">
                <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-xl relative z-10 transition-all">
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-14 h-14 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center p-3 bg-white", ZONE_COLORS[zone.zoneName])}>
                        {ZONE_ICONS[zone.zoneName]}
                      </div>
                      <span className="font-black uppercase tracking-tight text-lg text-slate-900">{zone.zoneName}</span>
                    </div>
                  </div>

                  <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between shadow-inner mb-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Net Score</span>
                      <div className={cn(
                        "text-3xl font-mono font-black tracking-tighter leading-none",
                        zone.netScore >= 0 ? "text-emerald-600" : "text-red-600"
                      )}>
                        {zone.netScore >= 0 ? '+' : ''}{zone.netScore.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">WOW%</span>
                        <span className="text-xs font-black text-slate-700">{zone.wow.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold text-red-400 uppercase">Penalty</span>
                        <span className={cn("text-xs font-black", zone.zoneTotalPenaltyCount > 0 ? "text-red-500" : "text-slate-400")}>
                          {zone.zoneTotalPenaltyCount > 0 ? `-${zone.zoneTotalPenaltyCount.toFixed(1)}` : '0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Trx</span>
                      <span className="text-lg font-black text-slate-700">{(zone.total || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Trx Change</span>
                      <span className={cn("text-lg font-black", zone.change >= 0 ? "text-emerald-600" : "text-red-600")}>
                        {zone.change >= 0 ? '↑' : '↓'} {zone.change >= 0 ? '+' : ''}{zone.change.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Zone Penalty Aggregates */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-4 gap-2">
                    <div className="flex flex-col items-center">
                      <Square size={20} className="text-yellow-400 fill-yellow-400 mb-1" />
                      <span className="text-lg font-black text-slate-900 leading-none">{zone.totalPenalties.kds}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">KDS</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Square size={20} className="text-yellow-400 fill-yellow-400 mb-1" />
                      <span className="text-lg font-black text-slate-900 leading-none">{zone.totalPenalties.sc}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">SC</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Square size={20} className="text-red-500 fill-red-500 mb-1" />
                      <span className="text-lg font-black text-slate-900 leading-none">{zone.totalPenalties.missing}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Miss</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Flag size={20} className="text-orange-500 mb-1" />
                      <span className="text-lg font-black text-slate-900 leading-none">{zone.totalPenalties.fouls}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Foul</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden relative z-10 transition-all">
                  <div className="bg-slate-300 grid grid-cols-1 gap-0.5">
                    {zone.restaurants.map((restaurant) => {
                      const change = selectedWeek > 0 
                        ? restaurant.weeklyTotals[selectedWeek] - restaurant.weeklyTotals[selectedWeek - 1]
                        : 0;
                      return (
                        <div key={restaurant.name} className="p-4 flex flex-col gap-4 bg-white hover:bg-slate-300 transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="text-base font-black uppercase tracking-tight text-slate-900 drop-shadow-sm">{restaurant.name}</div>
                              <div className={cn(
                                "text-xs font-black",
                                (() => {
                                  const p = restaurant.weeklyPenalties[selectedWeek] || { kds: 0, sc: 0, missing: 0, fouls: 0 };
                                  const tp = (p.kds || 0) + (p.sc || 0) + (p.missing || 0) + (p.fouls || 0);
                                  const growth = selectedWeek > 0 ? (restaurant.wowChanges[selectedWeek - 1] || 0) : 0;
                                  return (growth - tp) >= 0 ? "text-emerald-600" : "text-red-600";
                                })()
                              )}>
                                {(() => {
                                  const p = restaurant.weeklyPenalties[selectedWeek] || { kds: 0, sc: 0, missing: 0, fouls: 0 };
                                  const tp = (p.kds || 0) + (p.sc || 0) + (p.missing || 0) + (p.fouls || 0);
                                  const growth = selectedWeek > 0 ? (restaurant.wowChanges[selectedWeek - 1] || 0) : 0;
                                  const net = growth - tp;
                                  return (net >= 0 ? '+' : '') + net.toFixed(1);
                                })()}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 shrink-0">
                                <div className="flex flex-col items-end">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">WOW%</span>
                                  <div className={cn(
                                    "text-lg font-mono font-black leading-none",
                                    (restaurant.wowChanges[selectedWeek - 1] || 0) >= 0 ? "text-emerald-600" : "text-red-600"
                                  )}>
                                    {(restaurant.wowChanges[selectedWeek - 1] || 0) >= 0 ? '+' : ''}{(restaurant.wowChanges[selectedWeek - 1] || 0).toFixed(1)}%
                                  </div>
                                </div>
                                <div className="w-px h-8 bg-slate-100" />
                                <div className="flex flex-col items-end">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Trx</span>
                                  <div className="text-sm font-black leading-none text-slate-700">
                                    {(restaurant.weeklyTotals[selectedWeek] || 0).toLocaleString()}
                                    <span className={cn(
                                      "ml-1 text-[10px] font-bold",
                                      change >= 0 ? "text-emerald-500" : "text-red-500"
                                    )}>
                                      ({change >= 0 ? '+' : ''}{change.toLocaleString()})
                                    </span>
                                  </div>
                                </div>
                            </div>
                          </div>
                          
                          {/* Penalty Indicators */}
                          <div className="grid grid-cols-4 gap-1">
                            <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                              <Square size={18} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-black text-slate-900 leading-none mt-1">{restaurant.weeklyPenalties[selectedWeek]?.kds || 0}</span>
                              <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mt-0.5">KDS</span>
                            </div>
                            <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                              <Square size={18} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-black text-slate-900 leading-none mt-1">{restaurant.weeklyPenalties[selectedWeek]?.sc || 0}</span>
                              <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mt-0.5">SC</span>
                            </div>
                            <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                              <Square size={18} className="text-red-500 fill-red-500" />
                              <span className="text-sm font-black text-slate-900 leading-none mt-1">{restaurant.weeklyPenalties[selectedWeek]?.missing || 0}</span>
                              <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mt-0.5">Miss</span>
                            </div>
                            <div className="flex flex-col items-center p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                              <Flag size={18} className="text-orange-500" />
                              <span className="text-sm font-black text-slate-900 leading-none mt-1">{restaurant.weeklyPenalties[selectedWeek]?.fouls || 0}</span>
                              <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mt-0.5">Foul</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Accumulated Points Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-400 p-3 rounded-2xl shadow-lg shadow-yellow-400/20">
              <Star className="text-black w-8 h-8 opacity-100" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 drop-shadow-sm">Accumulated Points</h2>
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Overall Restaurant Standings</p>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-300 shadow-2xl overflow-hidden relative z-10 transition-all">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-0.5 bg-slate-300">
               {accumulatedPoints.map((restaurant, idx) => {
                const totalKds = restaurant.weeklyPenalties.reduce((sum, p) => sum + (p.kds || 0), 0);
                const totalSc = restaurant.weeklyPenalties.reduce((sum, p) => sum + (p.sc || 0), 0);
                const totalMissing = restaurant.weeklyPenalties.reduce((sum, p) => sum + (p.missing || 0), 0);
                const totalFouls = restaurant.weeklyPenalties.reduce((sum, p) => sum + (p.fouls || 0), 0);
                const totalPenaltyPoints = totalKds + totalSc + totalMissing + totalFouls;
                const netPoints = restaurant.points - totalPenaltyPoints;

                return (
                  <div key={restaurant.name} className="bg-white p-6 flex flex-col gap-6 hover:bg-slate-300 transition-colors h-full">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border-2 shrink-0",
                          idx === 0 ? RANK_COLORS[0] : 
                          idx === 1 ? RANK_COLORS[1] : 
                          idx === 2 ? RANK_COLORS[2] : 
                          RANK_COLORS[3]
                        )}>
                          {idx + 1}
                        </div>
                        <div className="text-right flex-1 min-w-0">
                          <div className="text-xl font-black uppercase tracking-tight text-slate-900 truncate mb-0.5">{restaurant.name}</div>
                          <div className={cn("text-[11px] font-black uppercase tracking-widest", ZONE_TEXT_COLORS[restaurant.zone] || "text-slate-400")}>
                            {restaurant.zone}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between shadow-inner">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Net Score</span>
                        <div className={cn(
                          "text-3xl font-mono font-black tracking-tighter leading-none",
                          netPoints >= 0 ? "text-emerald-600" : "text-red-600"
                        )}>
                          {netPoints >= 0 ? '+' : ''}{netPoints.toFixed(1)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">WOW%</span>
                          <span className="text-xs font-black text-slate-700">{restaurant.points.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-red-400 uppercase">Penalty</span>
                          <span className="text-xs font-black text-red-500">{totalPenaltyPoints > 0 ? `-${totalPenaltyPoints.toFixed(1)}` : '0.0'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                       <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                          <Square size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-black text-slate-900 leading-none">{totalKds}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">KDS</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                          <Square size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-black text-slate-900 leading-none">{totalSc}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">SC</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                          <Square size={16} className="text-red-500 fill-red-500" />
                          <span className="text-sm font-black text-slate-900 leading-none">{totalMissing}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">Mis Ord</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                          <Flag size={16} className="text-orange-500" />
                          <span className="text-sm font-black text-slate-900 leading-none">{totalFouls}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase">Foul</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
         {/* Performance Replay Section */}
        <section className={cn(
          "p-12 rounded-[3.5rem] relative overflow-hidden shadow-2xl transition-all duration-500 border-4 z-10",
          chartTheme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className={cn(
            "absolute top-0 right-0 p-12 transition-colors",
            chartTheme === 'dark' ? "text-slate-100 opacity-20" : "text-slate-900 opacity-40"
          )}>
            <BarChart3 size={300} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-12 mb-16">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "p-5 rounded-3xl border-4 transition-all duration-500 bg-slate-50",
                  chartTheme === 'dark' ? "border-slate-700 bg-slate-800" : "border-emerald-600 bg-slate-50"
                )}>
                  <BarChart3 className={cn("w-12 h-12", chartTheme === 'dark' ? "text-yellow-400" : "text-yellow-600")} />
                </div>
                <div>
                  <h2 className={cn(
                    "text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 font-sans transition-colors whitespace-nowrap",
                    chartTheme === 'dark' ? "text-white" : "text-slate-900"
                  )}>Statistics Replay</h2>
                  <div className="flex items-center gap-4">
                    <p className={cn(
                      "text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap",
                      chartTheme === 'dark' ? "text-slate-400" : "text-slate-500"
                    )}>Weekly performance trend</p>
                    {(selectedRestaurant || selectedZone) && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2",
                          chartTheme === 'dark' ? "bg-yellow-400/10 text-yellow-500 border border-yellow-400/20" : "bg-yellow-400/20 text-yellow-700 border border-yellow-400/30"
                        )}
                      >
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        Focus Mode: {raceView === 'restaurant' ? selectedRestaurant : selectedZone}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 flex-1">
                {/* View Toggle */}
                <div className={cn(
                  "flex p-1 rounded-xl border bg-slate-100 border-slate-200"
                )}>
                  <button
                    onClick={() => setRaceView('restaurant')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                      raceView === 'restaurant' ? "bg-white text-black shadow-sm" : "text-slate-500"
                    )}
                  >
                    <Users size={12} />
                    Restaurants
                  </button>
                  <button
                    onClick={() => setRaceView('zone')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                      raceView === 'zone' ? "bg-white text-black shadow-sm" : "text-slate-500"
                    )}
                  >
                    <Map size={12} />
                    Zones
                  </button>
                </div>

                {/* Selector */}
                {raceView === 'restaurant' ? (
                  <select 
                    value={selectedRestaurant || ''} 
                    onChange={(e) => setSelectedRestaurant(e.target.value || null)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all outline-none min-w-[150px] bg-slate-50 border-slate-200 text-slate-900 focus:border-yellow-500"
                    )}
                  >
                    <option value="">All Restaurants</option>
                    {processedData.map(o => (
                      <option key={o.name} value={o.name}>{o.name}</option>
                    ))}
                  </select>
                ) : (
                  <select 
                    value={selectedZone || ''} 
                    onChange={(e) => setSelectedZone(e.target.value || null)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all outline-none min-w-[150px] bg-slate-50 border-slate-200 text-slate-900 focus:border-yellow-500"
                    )}
                  >
                    <option value="">All Zones</option>
                    {Object.keys(ZONES).map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                )}

                {/* Theme Toggle */}
                <button
                  onClick={() => setChartTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    "p-3 rounded-xl border transition-all bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {chartTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button
                  onClick={() => setIsRaceActive(true)}
                  disabled={isRaceActive}
                  className={cn(
                    "flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 shadow-red-600/20 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50",
                  )}
                >
                  <Play size={18} fill="white" />
                  {isRaceActive ? 'Replaying...' : 'Start Replay'}
                </button>
              </div>
            </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
              <div className="h-[800px] flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.slice(0, isRaceActive ? raceWeek + 1 : weekLabels.length)}>
                    <defs>
                      <filter id="shadow" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.2"/>
                      </filter>
                    </defs>
                    {isRaceActive && (
                      <ReferenceLine 
                        x={weekLabels[raceWeek]?.label} 
                        stroke={chartTheme === 'dark' ? "#fbbf24" : "#eab308"} 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        label={{ position: 'top', value: 'Replaying...', fill: '#eab308', fontSize: 10, fontWeight: 'black' }}
                      />
                    )}
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={chartTheme === 'dark' ? "#ffffff20" : "#00000015"} 
                      vertical={false} 
                      strokeWidth={1}
                    />
                    <XAxis 
                      dataKey="name" 
                      stroke={chartTheme === 'dark' ? "#ffffff60" : "#00000060"} 
                      fontSize={14} 
                      fontWeight="900"
                      tickLine={false} 
                      axisLine={false} 
                      dy={15}
                    />
                    <YAxis 
                      stroke={chartTheme === 'dark' ? "#ffffff60" : "#00000060"} 
                      fontSize={14} 
                      fontWeight="900"
                      tickLine={false} 
                      axisLine={false} 
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => rankingMode === 'total' ? `${(val/1000).toFixed(1)}k` : rankingMode === 'sales' ? `$${(val/1000).toFixed(0)}k` : `${val.toFixed(1)}%`}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className={cn(
                              "border rounded-2xl p-6 shadow-2xl min-w-[200px]",
                              chartTheme === 'dark' ? "bg-gray-950 border-gray-800" : "bg-white border-gray-100"
                            )}>
                              <p className="text-yellow-500 font-black uppercase tracking-widest text-xs mb-4 border-b border-gray-800 pb-2">{label}</p>
                              <div className="space-y-3">
                                {payload
                                  .sort((a, b) => (b.value as number) - (a.value as number))
                                  .filter((item: any, idx: number) => idx < 10 || (raceView === 'restaurant' ? selectedRestaurant === item.name : selectedZone === item.name))
                                  .map((item: any) => {
                                    const rank = item.payload[`${item.name}_rank`];
                                    const isSelected = raceView === 'restaurant' ? selectedRestaurant === item.name : selectedZone === item.name;
                                    return (
                                      <div key={item.name} className={cn(
                                        "flex items-center justify-between gap-6 p-1 rounded-lg",
                                        isSelected ? "bg-yellow-400/10" : ""
                                      )}>
                                        <div className="flex items-center gap-3">
                                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                          <span className={cn(
                                            "font-black text-[10px] uppercase tracking-tight",
                                            chartTheme === 'dark' ? "text-white" : "text-slate-900"
                                          )}>{item.name}</span>
                                        </div>
                                        <span className={cn(
                                          "font-mono text-xs font-black",
                                          chartTheme === 'dark' ? "text-slate-400" : "text-slate-600"
                                        )}>
                                          {typeof item.value === 'number' ? (rankingMode === 'sales' ? '$' + (item.value || 0).toLocaleString() : (item.value || 0).toFixed(1)) : (item.value || '')}
                                          {rankingMode === 'wow' && '%'}
                                          <span className="text-yellow-600 ml-2">({rank})</span>
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {(raceView === 'restaurant' ? processedData : Object.keys(ZONES).map(z => ({ name: z }))).map((item: any, i) => {
                      const isSelected = raceView === 'restaurant' ? selectedRestaurant === item.name : selectedZone === item.name;
                      const hasSelection = raceView === 'restaurant' ? selectedRestaurant !== null : selectedZone !== null;
                      
                      return (
                        <Line
                          key={item.name}
                          type="monotone"
                          dataKey={item.name}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          strokeWidth={isSelected ? 6 : (hasSelection ? 1 : 3)}
                          dot={<CustomDot />}
                          activeDot={{ r: 10, strokeWidth: 4, stroke: '#fff', fill: CHART_COLORS[i % CHART_COLORS.length] }}
                          animationDuration={isSelected ? 1000 : 2000}
                          animationEasing="ease-in-out"
                          filter="url(#shadow)"
                          opacity={hasSelection && !isSelected ? 0.1 : 1}
                          isAnimationActive={true}
                          connectNulls
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Regional Standings Sidebar */}
              <div className={cn(
                "w-full lg:w-96 rounded-[2.5rem] border p-8 pb-12 backdrop-blur-sm flex flex-col min-h-[850px]",
                chartTheme === 'dark' ? "bg-slate-900/50 border-emerald-800" : "bg-gray-50 border-gray-200 shadow-inner"
              )}>
                <div className="flex items-center justify-between mb-10">
                  <h3 className={cn("text-3xl font-black uppercase tracking-[0.1em]", chartTheme === 'dark' ? "text-emerald-400" : "text-emerald-950")}>Regional Standings</h3>
                  <div className={cn("text-sm font-mono font-bold", chartTheme === 'dark' ? "text-emerald-500/50" : "text-gray-400")}>
                    {weekLabels[isRaceActive ? raceWeek : weekLabels.length - 1]?.label}
                  </div>
                </div>
                <div className="space-y-6 flex-1">
                  {currentRaceTop10.map((item, idx) => (
                    <motion.div 
                      key={item.name}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex items-center gap-6 group p-3 rounded-2xl transition-all",
                        (raceView === 'restaurant' ? selectedRestaurant === item.name : selectedZone === item.name) ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-black/5"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shadow-md shrink-0",
                        chartTheme === 'dark' ? (
                          idx === 0 ? "bg-yellow-400 border-2 border-yellow-500 text-black shadow-lg shadow-yellow-400/40" : 
                          idx === 1 ? "bg-slate-300 border-2 border-slate-400 text-slate-900 shadow-md shadow-slate-300/30" :
                          idx === 2 ? "bg-orange-400 border-2 border-orange-500 text-white shadow-md shadow-orange-400/30" : 
                          "bg-slate-800/50 border border-emerald-900 text-emerald-400"
                        ) : (
                          idx === 0 ? RANK_COLORS[0] : 
                          idx === 1 ? RANK_COLORS[1] : 
                          idx === 2 ? RANK_COLORS[2] : 
                          RANK_COLORS[3]
                        )
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-lg font-black uppercase tracking-tight truncate", chartTheme === 'dark' ? "text-white" : "text-gray-900")}>{item.name}</div>
                        <div className={cn("text-xs font-bold uppercase tracking-widest opacity-40", chartTheme === 'dark' ? "text-white" : "text-black")}>
                          {item.zone}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-lg font-black font-mono", chartTheme === 'dark' ? "text-emerald-400" : "text-emerald-950")}>
                          {rankingMode === 'total' ? (item.value / 1000).toFixed(1) + 'k' : rankingMode === 'sales' ? '$' + (item.value / 1000).toFixed(0) + 'k' : item.value.toFixed(1) + '%'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-10 pt-8 border-t border-gray-200/20 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    {isRaceActive ? "Live Trail Analysis..." : "Weekly Consolidated View"}
                  </p>
                </div>
              </div>
            </div>
        </section>

      </main>

      <footer className="max-w-[1600px] mx-auto p-12 mt-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-4">
              {Object.entries(ZONES).map(([name, _], idx) => (
                <div 
                  key={name}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-4 border-emerald-950 shadow-lg text-xl",
                    ZONE_COLORS[name]
                  )}
                  style={{ zIndex: 10 - idx }}
                >
                  {ZONE_ICONS[name]}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-emerald-800">GYG Singapore Peak Hour Championship</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Official Performance Dashboard • v2.2.0 • Last Updated: 2026-05-06 14:21:42 GMT+8</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Status</p>
              <div className="flex items-center gap-2 justify-end">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-tighter text-slate-900">Live Metrics Active</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
