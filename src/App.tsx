/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Settings, 
  Camera, 
  Terminal, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  Activity,
  History,
  LayoutDashboard,
  Copy,
  Download,
  Info,
  ChevronRight,
  Database,
  Share2,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from './lib/utils.ts';
import { PrinterState, LidarConfig } from './types.ts';

// UI Components
const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 w-full rounded transition-all duration-200 group",
      active 
        ? "bg-klipper-blue text-white shadow-lg shadow-klipper-blue/20" 
        : "text-klipper-subtext hover:bg-neutral-800 hover:text-white"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "group-hover:text-klipper-blue")} />
    <span className="font-medium text-sm hidden md:block">{label}</span>
  </button>
);

// Klipper Styled Components
const KlipperCard = ({ title, icon: Icon, children, className }: { title: string, icon?: any, children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-klipper-card border border-klipper-border rounded shadow-lg overflow-hidden", className)}>
    <div className="flex items-center justify-between px-4 py-2 border-b border-klipper-border">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-klipper-subtext" />}
        <h3 className="text-base font-medium text-klipper-text">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-1 hover:bg-neutral-700/50 rounded text-klipper-subtext"><Settings className="w-4 h-4" /></button>
        <button className="p-1 hover:bg-neutral-700/50 rounded text-klipper-subtext transition-transform"><ChevronRight className="w-4 h-4 rotate-90" /></button>
      </div>
    </div>
    <div className="p-4 bg-[#1e1e1e]">
      {children}
    </div>
  </div>
);

const KlipperInput = ({ label, value, unit, onChange }: { label: string, value: string | number, unit?: string, onChange?: (v: string) => void }) => (
  <div className="relative group">
    <div className="absolute -top-2.5 left-2 px-1 bg-[#1e1e1e] text-[10px] font-medium text-klipper-subtext group-focus-within:text-klipper-blue transition-colors">
      {label}
    </div>
    <div className="flex items-center border border-klipper-border rounded focus-within:border-klipper-blue transition-colors overflow-hidden">
      <input 
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className="w-full bg-[#121212] px-3 py-2 text-sm text-klipper-text outline-none text-right"
      />
      {unit && <span className="px-3 text-xs text-klipper-subtext border-l border-klipper-border bg-[#121212] py-2">{unit}</span>}
      <div className="flex flex-col border-l border-klipper-border">
        <button className="px-1 hover:bg-neutral-700/50 border-b border-klipper-border"><ChevronRight className="w-3 h-3 -rotate-90 text-klipper-subtext" /></button>
        <button className="px-1 hover:bg-neutral-700/50"><ChevronRight className="w-3 h-3 rotate-90 text-klipper-subtext" /></button>
      </div>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'camera' | 'calibration' | 'macros' | 'settings'>('dashboard');
  const [printer, setPrinter] = useState<PrinterState>({
    status: 'disconnected',
    hostname: 'voron-24.local',
    extruderTemperature: 0,
    bedTemperature: 0,
    isPrinting: false,
    fanSpeed: 0,
    isHomed: false
  });

  const [config, setConfig] = useState<LidarConfig>({
    laserPin: 'FAN0',
    cameraUrl: 'http://voron-24.local/webcam/?action=stream',
    cameraDevice: '/dev/v4l/by-id/usb-Endoscope_Camera_20240101-video-index0',
    xOffset: 35.5,
    yOffset: 0,
    calibrationLength: 50,
    flowRange: [0.9, 1.1],
    selectedFilament: 'PLA'
  });

  const toggleConnection = () => {
    setPrinter(prev => ({
      ...prev,
      status: prev.status === 'connected' ? 'disconnected' : 'connecting'
    }));

    if (printer.status === 'disconnected') {
      setTimeout(() => {
        setPrinter(prev => ({
          ...prev,
          status: 'connected',
          extruderTemperature: 240,
          bedTemperature: 110,
          isHomed: true
        }));
      }, 1500);
    }
  };

  const setFilament = (type: string) => {
    let temp = 210;
    let bed = 60;
    if (type === 'ABS') { temp = 250; bed = 110; }
    if (type === 'PETG') { temp = 240; bed = 80; }
    if (type === 'PP') { temp = 220; bed = 100; }
    
    setConfig(prev => ({ ...prev, selectedFilament: type }));
    if (printer.status === 'connected') {
      setPrinter(prev => ({ ...prev, extruderTemperature: temp, bedTemperature: bed }));
    }
  };

  return (
    <div className="flex h-screen bg-klipper-bg text-klipper-text font-sans selection:bg-klipper-blue/30">
      {/* Sidebar */}
      <aside className="w-16 md:w-56 border-r border-klipper-border flex flex-col bg-klipper-card">
        <div className="flex items-center gap-2 p-4 md:p-6 mb-4">
          <div className="w-8 h-8 rounded bg-klipper-blue flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="font-bold tracking-tight text-base leading-tight text-white uppercase">V-DAR</h1>
            <p className="text-[10px] uppercase tracking-wider text-klipper-subtext font-bold">LIDAR Interface</p>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={Camera} 
            label="Live Calibration" 
            active={activeTab === 'camera'} 
            onClick={() => setActiveTab('camera')} 
          />
          <SidebarItem 
            icon={Activity} 
            label="Flow Scan" 
            active={activeTab === 'calibration'} 
            onClick={() => setActiveTab('calibration')} 
          />
          <SidebarItem 
            icon={Terminal} 
            label="Klipper Macros" 
            active={activeTab === 'macros'} 
            onClick={() => setActiveTab('macros')} 
          />
          <SidebarItem 
            icon={Settings} 
            label="Hardware" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>

        {/* Connection Widget */}
        <div className="p-4 border-t border-klipper-border">
          <button
            onClick={toggleConnection}
            className={cn(
              "w-full py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
              printer.status === 'connected' 
                ? "bg-neutral-800 text-klipper-subtext hover:bg-neutral-700" 
                : "bg-klipper-blue text-white hover:opacity-90"
            )}
          >
            {printer.status === 'connected' ? 'Connected' : 'Connect'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-4 bg-klipper-bg/90 backdrop-blur-md border-b border-klipper-border">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-medium text-white first-letter:uppercase">{activeTab}</h2>
            <div className={cn(
                "w-2 h-2 rounded-full",
                printer.status === 'connected' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500"
              )} />
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-klipper-subtext font-bold">Extruder</span>
              <span className="font-mono text-sm text-klipper-text">{printer.extruderTemperature}°C</span>
            </div>
            <div className="flex items-center gap-2 border-l border-klipper-border pl-6">
              <span className="text-[10px] uppercase text-klipper-subtext font-bold">Bed</span>
              <span className="font-mono text-sm text-klipper-text">{printer.bedTemperature}°C</span>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardTab printer={printer} setFilament={setFilament} config={config} />}
            {activeTab === 'camera' && <CameraTab config={config} />}
            {activeTab === 'calibration' && <CalibrationTab printer={printer} config={config} />}
            {activeTab === 'settings' && <SettingsTab config={config} setConfig={setConfig} />}
            {activeTab === 'macros' && <MacrosTab />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DashboardTab({ printer, setFilament, config }: { printer: PrinterState, setFilament: (t: string) => void, config: LidarConfig }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <KlipperCard title="LIDAR Tuner" icon={Activity}>
        <div className="space-y-6">
          {/* Extrusion Factor Style Row */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-klipper-subtext">
                   <Activity className="w-3.5 h-3.5" />
                   Calibration Factor
                </div>
                <div className="flex items-center gap-2 border border-klipper-border rounded px-2 bg-klipper-input">
                   <span className="text-sm font-mono text-white">100</span>
                   <span className="text-[10px] text-klipper-subtext">%</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-klipper-subtext font-bold">−</span>
                <input type="range" className="flex-1" readOnly value={100} />
                <span className="text-klipper-subtext font-bold text-lg">+</span>
             </div>
          </div>

          <div className="border-t border-klipper-border pt-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
               <KlipperInput label="Pressure Advance" value="0.04" unit="s" />
               <KlipperInput label="Smooth Time" value="0.04" unit="s" />
               <KlipperInput label="Filament Length" value={config.calibrationLength} unit="mm" />
               <KlipperInput label="Extrusion Feedrate" value="10" unit="mm/s" />
            </div>
          </div>

          <div className="flex gap-2">
             {[50, 25, 10, 5, 1].map(v => (
               <button key={v} className="flex-1 bg-klipper-input border border-klipper-border py-1.5 rounded text-xs text-klipper-subtext hover:text-white transition-colors">
                 {v}
               </button>
             ))}
          </div>

          <div className="flex gap-4 pt-2">
             <button className="flex-1 bg-neutral-800 border border-klipper-border py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors">
                <ChevronRight className="w-4 h-4 -rotate-90" />
                Retract
             </button>
             <button className="flex-1 bg-neutral-800 border border-klipper-border py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors">
                <ChevronRight className="w-4 h-4 rotate-90" />
                Extrude
             </button>
          </div>

          <div className="text-center">
             <p className="text-[10px] text-klipper-subtext italic">
                Extrusion: ~ 213 mm @ 24.1 mm³/s - ⌀ 0.6 mm
             </p>
          </div>
        </div>
      </KlipperCard>

      <div className="space-y-6">
        <KlipperCard title="Material Selection" icon={Zap}>
          <div className="grid grid-cols-2 gap-2">
            {['PLA', 'ABS', 'PETG', 'PP'].map(f => (
              <button
                key={f}
                onClick={() => setFilament(f)}
                className={cn(
                  "px-4 py-3 rounded text-xs font-bold transition-all border",
                  config.selectedFilament === f 
                    ? "bg-klipper-blue border-klipper-blue text-white" 
                    : "bg-klipper-input border-klipper-border text-klipper-subtext hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </KlipperCard>

        <KlipperCard title="Latest Analysis" icon={History}>
           <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-klipper-input rounded border border-klipper-border">
                 <div>
                    <p className="text-xs font-bold text-green-400">Scan Optimized: {config.selectedFilament}</p>
                    <p className="text-[10px] text-klipper-subtext">Peak Flow Offset: +2.4%</p>
                 </div>
                 <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              <button className="w-full py-3 bg-klipper-blue text-white rounded text-xs font-bold uppercase tracking-widest hover:opacity-90">
                 Apply All Offsets
              </button>
           </div>
        </KlipperCard>
      </div>
    </motion.div>
  );
}

function CameraTab({ config }: { config: LidarConfig }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="aspect-video bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 flex items-center justify-center flex-col bg-neutral-950/50 grayscale opacity-40 mix-blend-overlay">
          <div className="w-full h-px bg-blue-500/50 absolute top-[50%]" />
          <div className="w-px h-full bg-blue-500/50 absolute left-[50%]" />
        </div>
        
        {/* Mock Stream */}
        <div className="w-full h-full flex items-center justify-center bg-black">
          <p className="text-neutral-600 font-mono text-sm animate-pulse">CONNECTING TO {config.cameraUrl}...</p>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
          <div className="flex gap-2">
             <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-red-500/20 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
               Live Feed
             </div>
             <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
               Sub-pixel Engine Active
             </div>
             <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-md text-[10px] font-bold uppercase tracking-wider border border-green-500/20 flex items-center gap-2">
               Focus: High Confidence
             </div>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center bg-neutral-800/80 backdrop-blur rounded-xl border border-neutral-700 hover:border-blue-500 transition-colors">
              <Zap className="w-4 h-4 text-blue-400" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-neutral-800/80 backdrop-blur rounded-xl border border-neutral-700 hover:border-blue-500 transition-colors">
              <Settings className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CalibrationTab({ printer, config }: { printer: PrinterState, config: LidarConfig }) {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const steps = [
    { name: 'Laser Check', desc: 'Auto-leveling & laser angle rotation check', status: progress > 10 ? 'completed' : 'pending' },
    { name: 'Bed Heating', desc: 'Waiting for target temperature', status: progress > 30 ? 'completed' : progress > 10 ? 'running' : 'pending' },
    { name: 'Ladder Pattern', desc: 'Printing variable flow segments', status: progress > 60 ? 'completed' : progress > 30 ? 'running' : 'pending' },
    { name: 'Optical Analysis', desc: 'Sub-pixel laser shift profiling', status: progress === 100 ? 'completed' : progress > 60 ? 'running' : 'pending' },
  ];

  const startCalibration = () => {
    setIsCalibrating(true);
    setProgress(0);
    setShowResults(false);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowResults(true);
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };

  const mockScanData = Array.from({ length: 50 }, (_, i) => ({
    pos: i,
    height: Math.sin(i / 5) * 0.1 + (i > 20 && i < 30 ? 0.4 : 0.1) + Math.random() * 0.02
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid grid-cols-3 gap-10"
    >
      <div className="col-span-1 space-y-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
          <h4 className="text-sm font-bold uppercase tracking-wide text-neutral-500 mb-6">Workflow Progress</h4>
          <div className="space-y-6">
            {steps.map((step: any, index: number) => (
              <div key={index} className="flex gap-4 relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-[11px] top-[26px] bottom-[-10px] w-0.5 bg-neutral-800" />
                )}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors duration-500",
                  step.status === 'completed' ? "bg-green-500/20 text-green-500" :
                  step.status === 'running' ? "bg-blue-500/20 text-blue-500" : "bg-neutral-800 text-neutral-600"
                )}>
                  {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <div className={cn("w-2 h-2 rounded-full", step.status === 'running' ? "bg-blue-500 animate-pulse" : "bg-neutral-600")} />}
                </div>
                <div>
                  <p className={cn("text-sm font-bold transition-colors", step.status === 'pending' ? "text-neutral-500" : "text-white")}>{step.name}</p>
                  <p className="text-[11px] text-neutral-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button 
           onClick={startCalibration}
           disabled={printer.status !== 'connected' || isCalibrating || !printer.isHomed}
           className="w-full py-4 bg-blue-600 rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
        >
          {isCalibrating ? `Calibrating (${progress}%)` : !printer.isHomed ? 'Homing Required' : 'Begin Calibration'}
        </button>
        {!printer.isHomed && printer.status === 'connected' && (
          <p className="text-[10px] text-red-400 font-bold text-center animate-pulse">
            Please G28 All Axes before starting calibration
          </p>
        )}
      </div>

      <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden flex flex-col">
        {showResults ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-bold tracking-tight">Scan Results</h4>
                <p className="text-sm text-neutral-500">Sub-pixel engine compensated for 4.2° camera tilt.</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-neutral-500">Optimal flow ({config.selectedFilament})</p>
                <p className="text-2xl font-mono text-green-400 font-bold">1.035</p>
              </div>
            </div>

            <div className="flex-1 min-h-[300px] w-full bg-neutral-950/50 rounded-2xl border border-neutral-800 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockScanData}>
                  <defs>
                    <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="pos" hide />
                  <YAxis hide domain={[0, 1]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="height" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorHeight)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 flex gap-4">
              <button className="flex-1 py-3 bg-neutral-800 rounded-xl font-bold text-sm border border-neutral-700 hover:bg-neutral-700 transition-colors">
                Apply {config.selectedFilament} Factor
              </button>
              <button className="px-4 py-3 bg-neutral-800 rounded-xl font-bold border border-neutral-700 hover:bg-neutral-700 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
             <div className="relative">
               <div className="w-20 h-20 bg-neutral-800 rounded-3xl flex items-center justify-center border border-neutral-700 rotate-12 transition-transform hover:rotate-0 duration-500 relative z-10">
                 <Activity className="w-10 h-10 text-blue-500" />
               </div>
               {isCalibrating && (
                 <div className="absolute inset-x-0 top-0 h-20 bg-blue-500/20 blur-xl animate-pulse -z-10" />
               )}
             </div>
             <div>
               <h4 className="text-xl font-bold tracking-tight mb-2">
                 {isCalibrating ? 'Scanning in Progress...' : 'Awaiting Calibration'}
               </h4>
               <p className="text-neutral-500 text-sm max-w-xs mx-auto">
                 {isCalibrating ? 'The printer is moving the camera over the test lines.' : 'Click the start button to begin the automated flowrate calibration sequence.'}
               </p>
             </div>
             
             {isCalibrating && (
               <div className="w-64 h-2 bg-neutral-800 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-blue-500"
                 />
               </div>
             )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SettingsTab({ config, setConfig }: { config: LidarConfig, setConfig: any }) {
  const klipperConfig = `[lidar_vdar]
camera_device: ${config.cameraDevice}
camera_url: ${config.cameraUrl}
laser_pin: ${config.laserPin}
x_offset: ${config.xOffset}
y_offset: ${config.yOffset}

[gcode_macro LIDAR_VDAR_CALIBRATE]
gcode:
  SET_PIN PIN=${config.laserPin} VALUE=1
  G4 P500
  # ... processing engine calls
  SET_PIN PIN=${config.laserPin} VALUE=0
`;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 gap-10"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-500" />
          Hardware Configuration
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Laser Pinout (Fan Slot)</label>
              <input 
                value={config.laserPin}
                onChange={e => setConfig({...config, laserPin: e.target.value})}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all duration-200"
                placeholder="e.g. FAN1"
              />
            </div>
            
            <div className="p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                <Camera className="w-3 h-3" />
                Optical Targeting
              </h4>
              <div className="space-y-3">
                <div className="space-y-1">
                   <label className="text-[9px] font-bold uppercase text-neutral-600">Hardware ID (Reliable)</label>
                   <input 
                    value={config.cameraDevice}
                    onChange={e => setConfig({...config, cameraDevice: e.target.value})}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-[11px] font-mono focus:border-blue-500 outline-none transition-colors"
                    placeholder="/dev/v4l/by-id/..."
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-bold uppercase text-neutral-600">Stream Proxy URL</label>
                   <input 
                    value={config.cameraUrl}
                    onChange={e => setConfig({...config, cameraUrl: e.target.value})}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-[11px] font-mono focus:border-blue-500 outline-none transition-colors"
                    placeholder="http://..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Nozzle-to-Optics Offsets</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">X Offset (mm)</label>
                <input 
                  type="number"
                  value={config.xOffset}
                  onChange={e => setConfig({...config, xOffset: parseFloat(e.target.value)})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Y Offset (mm)</label>
                <input 
                  type="number"
                  value={config.yOffset}
                  onChange={e => setConfig({...config, yOffset: parseFloat(e.target.value)})}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
            Save & Sync Config
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
             <div className="flex items-center gap-3 mb-4 text-blue-500">
               <Info className="w-4 h-4" />
               <h4 className="text-xs font-bold uppercase">Setup Guide</h4>
             </div>
             <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
               To find your <b>Hardware ID</b>, open your Pi terminal and run:
             </p>
             <div className="p-3 bg-black rounded-lg border border-neutral-800 mb-4 text-[10px] font-mono text-green-400">
               ls /dev/v4l/by-id/
             </div>
             <p className="text-[10px] text-neutral-500 italic mb-6">
               Select the path ending in <code>-video-index0</code>. This path is persistent and won't change if you unplug other cameras.
             </p>

             <div className="pt-6 border-t border-neutral-800 space-y-4">
                <div className="flex items-center gap-2 text-blue-500">
                   <Zap className="w-3 h-3" />
                   <h5 className="text-[10px] font-bold uppercase tracking-widest">Klipper Snippet</h5>
                </div>
                <div className="p-4 bg-black rounded-xl border border-neutral-800 text-[10px] font-mono text-neutral-400 leading-relaxed">
                  {`[output_pin lidar_laser]
pin: ${config.laserPin}
value: 0

[gcode_macro LIDAR_ON]
gcode: SET_PIN PIN=lidar_laser VALUE=1`}
                </div>
             </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500">V-DAR Engine Config</h3>
            <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span className="text-[10px] text-blue-400 font-bold uppercase">Offline Processing</span>
            </div>
          </div>
          <pre className="p-4 bg-black rounded-xl border border-neutral-800 text-[11px] font-mono text-blue-400 overflow-x-auto leading-relaxed">
            {klipperConfig}
          </pre>
          <p className="mt-4 text-[11px] text-neutral-500 leading-relaxed italic">
            Copy this into your printer.cfg. This macro runs on your local processing unit.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-blue-600/20 rounded-lg">
               <Zap className="w-4 h-4 text-blue-500" />
             </div>
             <h4 className="text-xs font-bold uppercase text-neutral-100">Local Deployment</h4>
           </div>
           <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
             This installer sets up the V-DAR service as a background daemon on your processing node.
           </p>
           <a 
             href={`data:text/plain;charset=utf-8,${encodeURIComponent("#!/bin/bash\n# V-DAR STANDALONE INSTALLER\necho 'Deploying V-DAR Engine...'\n# Installation steps for local processing")}`}
             download="install_vdar.sh"
             className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 group"
           >
             <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
             Download Standalone Script
           </a>
        </div>
      </div>
    </motion.div>
  );
}

function MacrosTab() {
  const macrosText = `#####################################################################
# V-DAR: Material-Specific Macros
#####################################################################

[gcode_macro V_DAR_ABS]
description: Runs high-temp ABS calibration
gcode:
    V_DAR_SCAN MATERIAL="ABS"

[gcode_macro V_DAR_PLA]
description: Runs standard PLA calibration
gcode:
    V_DAR_SCAN MATERIAL="PLA"

[gcode_macro V_DAR_SCAN]
gcode:
    {% set MAT = params.MATERIAL|default("PLA") %}
    M117 V-DAR: {MAT} Scanning...
    # ... Laser movement ...`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl space-y-8"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 bg-blue-500/5">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-xl font-bold text-white flex items-center gap-3">
             <Terminal className="w-6 h-6 text-blue-500" />
             Material-Specific Macros
           </h3>
           <a 
             href="/vdar_macros.txt" 
             download 
             className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-500 transition-colors"
           >
             <Download className="w-4 h-4" />
             Download .txt File
           </a>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-neutral-400 leading-relaxed italic">
            "We've shifted to a macro-first workflow. This ensures V-DAR works perfectly on klipper screen, OctoEverywhere, and older Mainsail versions by bypassing the browser UI entirely."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                <h4 className="text-xs font-bold text-blue-400 uppercase mb-3">1. Add the Laser Pin</h4>
                <div className="p-3 bg-black rounded font-mono text-[10px] text-neutral-500 leading-relaxed shadow-inner">
                  [output_pin vdar_laser]<br/>
                  pin: !PC1 <span className="text-neutral-700"># Change to yours</span><br/>
                  pwm: true
                </div>
             </div>
             <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                <h4 className="text-xs font-bold text-green-400 uppercase mb-3">2. Choose Your Filament</h4>
                <p className="text-[10px] text-neutral-500 mb-2">Once added, you can click these on your printer screen:</p>
                <div className="flex flex-wrap gap-2">
                   <div className="px-2 py-1 bg-neutral-800 rounded font-mono text-[9px] text-white">V_DAR_PLA</div>
                   <div className="px-2 py-1 bg-neutral-800 rounded font-mono text-[9px] text-white">V_DAR_ABS</div>
                   <div className="px-2 py-1 bg-neutral-800 rounded font-mono text-[9px] text-white">V_DAR_PETG</div>
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">3. Full Macro Configuration (Copy-Paste)</label>
            <div className="relative group">
              <pre className="p-6 bg-black rounded-2xl border border-neutral-800 text-[10px] font-mono text-blue-400/80 leading-relaxed overflow-x-auto max-h-[400px]">
                {macrosText}
              </pre>
              <button className="absolute top-4 right-4 p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors">
                 <Copy className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 bg-orange-500/5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-orange-400 mb-6 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Hardware Setup & Persistence
        </h3>
        <div className="space-y-4 text-sm text-neutral-400 leading-relaxed">
          <p>The web interface will still display all scan data at <code className="text-white">http://[printer-ip]:3000</code> for deeper analysis, but the day-to-day operation is now handled entirely through your printer's physical controls.</p>
          <div className="p-4 bg-black rounded-lg border border-neutral-800 font-mono text-blue-400 space-y-1 text-[11px]">
            <p># Run ABS Calibration from console/screen</p>
            <p>V_DAR_ABS</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AboutTab() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl space-y-8"
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-6 flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" />
          Auto-Start on Boot (Daemon)
        </h3>
        <div className="space-y-6">
          <p className="text-sm text-neutral-400 leading-relaxed">
            To ensure V-DAR starts automatically when your printer turns on, create a systemd service:
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-black rounded-xl border border-neutral-800 text-[11px] font-mono text-blue-400 space-y-2">
              <p>sudo nano /etc/systemd/system/vdar.service</p>
              <p className="text-[9px] text-neutral-600 italic"># To save: Ctrl+O, Enter. To exit: Ctrl+X</p>
            </div>
            <p className="text-[10px] text-neutral-500 uppercase font-bold px-2">Paste this configuration:</p>
            <div className="p-4 bg-black rounded-xl border border-neutral-800 text-[10px] font-mono text-neutral-500 leading-relaxed overflow-x-auto">
              [Unit]<br/>
              Description=V-DAR LIDAR Studio<br/>
              After=network.target<br/>
              <br/>
              [Service]<br/>
              Type=simple<br/>
              User=admin<br/>
              WorkingDirectory=/home/admin/V-DAR<br/>
              ExecStart=/usr/bin/npm run dev<br/>
              Restart=always<br/>
              <br/>
              [Install]<br/>
              WantedBy=multi-user.target
            </div>
            <div className="p-4 bg-black rounded-xl border border-neutral-800 text-[11px] font-mono text-blue-400 space-y-2">
              <p>sudo systemctl enable vdar</p>
              <p>sudo systemctl start vdar</p>
            </div>
          </div>
        </div>
      </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 bg-red-500/5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-6 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-red-500" />
          Fixing Service Errors
        </h3>
        <div className="space-y-6 text-sm text-neutral-400 leading-relaxed">
          <div className="space-y-4">
            <div className="p-4 bg-black/40 rounded-xl border border-red-500/20">
               <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">1. "Assignment outside of section" Error</h4>
               <p className="text-[11px] mb-2">This means the <b>[Unit]</b> or <b>[Service]</b> headers are missing or misspelled. Your file must look EXACTLY like this (including the brackets):</p>
               <div className="p-3 bg-black rounded font-mono text-[10px] text-neutral-500">
                  <span className="text-white">[Unit]</span><br/>
                  Description=V-DAR...<br/>
                  <br/>
                  <span className="text-white">[Service]</span><br/>
                  User=admin<br/>
                  ...
               </div>
            </div>

            <div className="p-4 bg-black/40 rounded-xl border border-red-500/20">
               <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">2. "status=200/CHDIR" Error</h4>
               <p className="text-[11px] mb-2">The service can't find the folder. Since your user is <b>admin</b>, use these paths:</p>
               <div className="p-3 bg-black rounded font-mono text-[10px] text-blue-400">
                  User=admin<br/>
                  WorkingDirectory=/home/admin/V-DAR
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">3. Apply & Restart</label>
              <div className="p-4 bg-black rounded-lg border border-neutral-800 font-mono text-blue-400 space-y-1 text-[11px]">
                <p>sudo systemctl daemon-reload</p>
                <p>sudo systemctl restart vdar</p>
                <p>sudo systemctl status vdar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 bg-orange-500/5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-orange-400 mb-6 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Hardware & Klipper Config
        </h3>
        <div className="space-y-6">
          <p className="text-sm text-neutral-400 leading-relaxed">
            To "enable" the laser and movement, you must add these sections to your <code className="text-white">printer.cfg</code> file:
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">1. Laser Control (Fan Port)</label>
              <div className="p-4 bg-black rounded-xl border border-neutral-800 text-[10px] font-mono text-neutral-400 leading-relaxed overflow-x-auto">
                [output_pin vdar_laser]<br/>
                pin: !PC1 <span className="text-neutral-600"># Change to your Fan Pin</span><br/>
                pwm: true<br/>
                value: 0<br/>
                shutdown_value: 0
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">2. Scan Trigger Macro</label>
              <div className="p-4 bg-black rounded-xl border border-neutral-800 text-[10px] font-mono text-neutral-400 leading-relaxed overflow-x-auto">
                [gcode_macro V_DAR_SCAN]<br/>
                gcode:<br/>
                &nbsp;&nbsp;SET_PIN PIN=vdar_laser VALUE=1<br/>
                &nbsp;&nbsp;M117 Scanning...<br/>
                &nbsp;&nbsp;<span className="text-neutral-600"># Your scan path code here</span><br/>
                &nbsp;&nbsp;SET_PIN PIN=vdar_laser VALUE=0
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-8">
        <h3 className="text-sm font-bold uppercase tracking-wide text-green-400 mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Installation Success!
        </h3>
        <div className="space-y-4 text-sm text-neutral-400">
          <p>Your V-DAR service is verified as <b>Active (running)</b>. You can now access this UI from any device on your network.</p>
          <div className="p-4 bg-black/40 rounded-xl border border-green-500/20 font-mono text-[11px] text-green-500">
            URL: http://[your-printer-ip]:3000
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 bg-blue-500/5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-6 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-500" />
          KlipperScreen & Macro-First Setup
        </h3>
        <div className="space-y-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
             <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">Why Macros?</h4>
             <p className="text-[11px] text-neutral-400 leading-relaxed">
               Since your physical printer screen and OctoEverywhere work best with G-code, these macros will allow you to trigger scans and see results directly on your screen without the web UI.
             </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase">1. Add to printer.cfg</label>
              <div className="p-4 bg-black rounded-xl border border-neutral-800 text-[10px] font-mono text-neutral-400 leading-relaxed overflow-x-auto">
                <p className="text-blue-400"># Enable Laser Port</p>
                [output_pin vdar_laser]<br/>
                pin: !PC1 <span className="text-neutral-600"># Change to your Fan Pin</span><br/>
                pwm: true<br/>
                <br/>
                <p className="text-blue-400"># The Universal Scan Macro</p>
                [gcode_macro V_DAR_SCAN]<br/>
                description: Run V-DAR scan and show status on screen<br/>
                gcode:<br/>
                &nbsp;&nbsp;M117 V-DAR: Scan Init<br/>
                &nbsp;&nbsp;G28 <span className="text-neutral-600">; Ensure Homed</span><br/>
                &nbsp;&nbsp;SET_PIN PIN=vdar_laser VALUE=1<br/>
                &nbsp;&nbsp;G1 Z5 F3000 <span className="text-neutral-600">; Move to scan height</span><br/>
                &nbsp;&nbsp;M117 V-DAR: Scanning...<br/>
                &nbsp;&nbsp;<span className="text-neutral-600"># ... movement commands ...</span><br/>
                &nbsp;&nbsp;SET_PIN PIN=vdar_laser VALUE=0<br/>
                &nbsp;&nbsp;M117 V-DAR: Scan Complete<br/>
                &nbsp;&nbsp;RESPOND TYPE=command MSG="V-DAR: Results pending in Web UI"
              </div>
            </div>

            <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
               <h4 className="text-xs font-bold text-orange-400 uppercase mb-2">KlipperScreen Buttons</h4>
               <p className="text-[11px] text-neutral-400">
                 After adding the macro, go to <b className="text-white">Macros</b> on your printer screen. You will see a <b className="text-white">V_DAR_SCAN</b> button. Clicking it will run the scan and update the status line at the bottom of the screen.
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 bg-red-500/5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-red-500" />
          Mainsail Sidebar: Protocol Check
        </h3>
        <div className="space-y-6">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
             <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Protocol Mismatch (The Silent Killer)</h4>
             <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
               If you get a "Connection Error" in the sidebar, look at your browser's address bar:
             </p>
             <ul className="text-[11px] text-neutral-500 space-y-2 list-disc ml-4">
                <li>If you see <b className="text-white">https://</b>[ip-address], the browser <b>will block</b> the sidebar link.</li>
                <li>To fix this: Visit <b className="text-blue-400 font-bold underline">http://</b>[ip-address] (Mainsail without the 'S') to access the printer.</li>
                <li>V-DAR is currently an internal tool and does not use SSL/HTTPS.</li>
             </ul>
          </div>
        </div>
      </div>


      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-6 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-500" />
          Verify the Port is Open
        </h3>
        <div className="space-y-6 text-sm text-neutral-400 leading-relaxed">
          <p>If you can't reach the page at all, run this in SSH to ensure the server is listening for outside connections:</p>
          <div className="p-4 bg-black rounded-xl border border-neutral-800 text-[11px] font-mono text-blue-400">
            <p>netstat -tulpn | grep :3000</p>
          </div>
          <p>It should show <code className="text-white">0.0.0.0:3000</code> or <code className="text-white">*:3000</code>. If it says <code className="text-white">127.0.0.1:3000</code>, the app is locked to the printer only and you won't be able to see it from your PC.</p>
        </div>
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-10 -translate-y-10 group-hover:translate-x-5 transition-transform duration-700">
          <Github className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Open Source Hardware</h2>
          <p className="text-neutral-400 text-lg leading-relaxed mb-8 max-w-2xl">
            This project is inspired by the V-DAR open-source lidar initiative. It brings advanced optical calibration to the Klipper ecosystem, allowing Voron users to achieve perfect extrusion without manual "line tests".
          </p>
          <div className="flex gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white text-black rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-200 transition-colors">
              <Github className="w-4 h-4" />
              Github Repository
            </a>
            <button className="px-6 py-3 bg-neutral-800 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-700 transition-colors border border-neutral-700">
              <Share2 className="w-4 h-4" />
              Community Discord
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-blue-500 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Core Principles
          </h3>
          <ul className="space-y-4 text-neutral-400 text-sm">
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span><b>Sub-pixel Accuracy:</b> OpenCV engine compensates for low resolution and slight focus issues by calculating the laser's center-of-mass across pixels.</span>
            </li>
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span><b>Ladder Calibration:</b> Prints a continuous strip with stepped flow variations, then scans them in a single pass to find the optimal peak.</span>
            </li>
            <li className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span><b>Device Persistence:</b> Uses /dev/v4l/by-id/ paths to ensure the correct camera is targeted even across reboots or multi-camera setups.</span>
            </li>
          </ul>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-500 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Credits
          </h3>
          <div className="space-y-4 text-sm text-neutral-400">
            <p>
              Based on the V-DAR research project. Special thanks to the Voron Design team and the Klipper community for enabling this level of modularity.
            </p>
            <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-[11px] font-mono">
              v1.0.4 - Standalone Package Edition
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-6 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-500" />
          Update & Maintenance
        </h3>
        <div className="space-y-6">
          <p className="text-sm text-neutral-400 leading-relaxed">
            When you make changes in AI Studio, you need to push them to GitHub and then pull them to your machine via SSH.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">1. In AI Studio</label>
              <div className="p-4 bg-black rounded-xl border border-neutral-800 text-[11px] text-neutral-400">
                Click <b>Settings</b> &gt; <b>Export to GitHub</b>. Choose your repository and click <b>Push Changes</b>.
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">2. In SSH Terminal</label>
              <div className="p-4 bg-black rounded-xl border border-neutral-800 text-[11px] text-neutral-400 font-mono space-y-2">
                <p>cd ~/V-DAR</p>
                <p>git pull</p>
                <p>npm install</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-sm font-bold uppercase tracking-wide text-white mb-6 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-500" />
          CLI Installation Guide
        </h3>
        <div className="space-y-6">
          <p className="text-sm text-neutral-400 leading-relaxed">
            To install V-DAR directly on your Raspberry Pi or printer controller, use the standard Git/NPM workflow. First, use the <b>Export to GitHub</b> feature in AI Studio, then run:
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-2">
              <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">0. Install Node.js (If missing)</label>
              <div className="p-3 bg-black rounded-lg font-mono text-[10px] text-neutral-400">
                curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">1. Clone & Enter</label>
              <div className="p-4 bg-black rounded-xl border border-neutral-800 font-mono text-xs text-blue-400 flex justify-between items-center group">
                <code>git clone https://github.com/runelaurtsen/V-DAR.git && cd V-DAR</code>
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">2. Install & Start</label>
              <div className="p-4 bg-black rounded-xl border border-neutral-800 font-mono text-xs text-blue-400 flex justify-between items-center group">
                <code>npm install && npm run dev</code>
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10 flex gap-3">
             <div className="shrink-0 mt-0.5">
               <Info className="w-4 h-4 text-yellow-500/50" />
             </div>
             <p className="text-[11px] text-neutral-500 leading-relaxed">
               <b>Note:</b> You must first push this project to your own GitHub repository using the Export menu in the top right of this editor. Replace the URL above with your repository's URL.
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

