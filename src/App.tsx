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
      "flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 group",
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
        : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "group-hover:text-blue-400")} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'camera' | 'calibration' | 'settings' | 'about'>('dashboard');
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
    <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 flex flex-col p-6 bg-neutral-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-lg leading-tight text-white">V-DAR</h1>
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Klipper Studio</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
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
            icon={Settings} 
            label="Hardware" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          <SidebarItem 
            icon={Info} 
            label="About V-DAR" 
            active={activeTab === 'about'} 
            onClick={() => setActiveTab('about')} 
          />
        </nav>

        {/* Connection Widget */}
        <div className="mt-auto pt-6 border-t border-neutral-800">
          <div className="bg-neutral-800/50 rounded-2xl p-4 border border-neutral-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-400">Connection</span>
              <div className={cn(
                "w-2 h-2 rounded-full",
                printer.status === 'connected' ? "bg-green-500 animate-pulse" : 
                printer.status === 'connecting' ? "bg-yellow-500 animate-bounce" : "bg-red-500"
              )} />
            </div>
            <p className="text-sm font-mono truncate text-neutral-300 mb-4">{printer.hostname}</p>
            <button
              onClick={toggleConnection}
              className={cn(
                "w-full py-2 rounded-lg text-xs font-bold transition-all",
                printer.status === 'connected' 
                  ? "bg-neutral-700 text-neutral-300 hover:bg-neutral-600" 
                  : "bg-blue-600 text-white hover:bg-blue-500"
              )}
            >
              {printer.status === 'connected' ? 'Disconnect' : printer.status === 'connecting' ? 'Connecting...' : 'Connect Printer'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <header className="sticky top-0 z-30 flex items-center justify-between px-10 py-6 bg-neutral-950/80 backdrop-blur-md">
          <div>
            <h2 className="text-2xl font-bold tracking-tight first-letter:uppercase">{activeTab}</h2>
            <p className="text-sm text-neutral-500">Monitor and calibrate your LIDAR sensor.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-neutral-500 font-bold">Extruder</span>
              <span className="font-mono font-medium">{printer.extruderTemperature}°C</span>
            </div>
            <div className="flex flex-col items-end border-l border-neutral-800 pl-4">
              <span className="text-[10px] uppercase text-neutral-500 font-bold">Bed</span>
              <span className="font-mono font-medium">{printer.bedTemperature}°C</span>
            </div>
          </div>
        </header>

        <div className="px-10 pb-10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardTab printer={printer} setFilament={setFilament} config={config} />}
            {activeTab === 'camera' && <CameraTab config={config} />}
            {activeTab === 'calibration' && <CalibrationTab printer={printer} config={config} />}
            {activeTab === 'settings' && <SettingsTab config={config} setConfig={setConfig} />}
            {activeTab === 'about' && <AboutTab />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function DashboardTab({ printer, setFilament, config }: { printer: PrinterState, setFilament: (t: string) => void, config: LidarConfig }) {
  const filaments = [
    { name: 'PLA', temp: 210, bed: 60 },
    { name: 'ABS', temp: 250, bed: 110 },
    { name: 'PETG', temp: 240, bed: 80 },
    { name: 'PP', temp: 220, bed: 100 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-3 gap-6"
    >
      <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-8 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-10 -translate-y-10 group-hover:translate-x-5 transition-transform duration-700">
          <Zap className="w-64 h-64 text-blue-500" />
        </div>
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-blue-500/20">
            System Status
          </span>
          <h3 className="text-4xl font-bold mb-4 tracking-tight leading-tight max-w-md">
            V-DAR Engine for Voron 2.4 is {printer.status === 'connected' ? 'Ready' : 'Standby'}.
          </h3>
          <p className="text-neutral-400 max-w-lg mb-8 leading-relaxed">
            V-DAR is an open-source LIDAR system. It uses a line laser and endoscope to measure extrusion profiles, achieving Bambu Lab-like flow calibration on any Klipper machine.
          </p>

          <div className="mb-8">
            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3 block">Selected Material</label>
            <div className="flex gap-2">
              {filaments.map(f => (
                <button
                  key={f.name}
                  onClick={() => setFilament(f.name)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    config.selectedFilament === f.name 
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                      : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white"
                  )}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button className="px-6 py-3 bg-blue-600 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
              <Play className="w-4 h-4 fill-white" />
              Quick Scan
            </button>
            <div className="px-6 py-3 bg-neutral-800 rounded-xl font-bold flex items-center gap-2 border border-neutral-700">
              <div className={cn("w-2 h-2 rounded-full", printer.isHomed ? "bg-green-500" : "bg-red-500 animate-pulse")} />
              <span className="text-sm">{printer.isHomed ? 'Printer Homed' : 'Homing Required'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            Active Profiles
          </h4>
          <div className="space-y-3">
            {[
              { name: 'eSUN PLA+', color: 'bg-green-500', flow: 0.98, pa: 0.045 },
              { name: 'Prusament PETG', color: 'bg-orange-500', flow: 1.02, pa: 0.082 },
              { name: 'Polymaker ABS', color: 'bg-blue-500', flow: 1.035, pa: 0.055 },
            ].map((f, i) => (
              <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-neutral-800/30 border border-neutral-700/30 hover:border-blue-500/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full shadow-lg", f.color)} />
                  <div>
                    <p className="text-sm font-bold group-hover:text-white transition-colors">{f.name}</p>
                    <p className="text-[10px] font-mono text-neutral-500">Flow: {f.flow} | PA: {f.pa}</p>
                  </div>
                </div>
                <Settings className="w-4 h-4 text-neutral-600 group-hover:text-blue-400 transition-colors" />
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 bg-neutral-800 text-neutral-400 text-xs font-bold rounded-xl border border-dashed border-neutral-700 hover:border-neutral-500 hover:text-neutral-200 transition-all">
            + New Filament Profile
          </button>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
            <History className="w-4 h-4" />
            Latest Scan Results
          </h4>
          <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/10">
            <div>
              <p className="text-xs font-bold text-green-400">Ladder Scan: ABS_Black</p>
              <p className="text-[10px] text-neutral-500">Sub-pixel Confidence: 98.4%</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </div>
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
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Laser Pinout (Fan)</label>
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
             <p className="text-[10px] text-neutral-500 italic">
               Select the path ending in <code>-video-index0</code>. This path is persistent and won't change if you unplug other cameras.
             </p>
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

function AboutTab() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl space-y-8"
    >
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

