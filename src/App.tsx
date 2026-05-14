/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Zap, 
  Terminal, 
  LayoutDashboard,
  Download,
  Info,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [printer] = useState({
    ip: '192.168.1.50',
  });

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-neutral-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white uppercase">V-DAR Studio</h1>
              <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest">Macro-First Hub</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/5 rounded-full text-[10px] font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-neutral-400">{printer.ip}</span>
            </div>
            <a 
              href="/vdar_macros.txt" 
              download 
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/10"
            >
              <Download className="w-4 h-4" />
              Download Macros
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content: Setup Guide */}
          <div className="lg:col-span-2 space-y-12">
            
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-white">
                <Terminal className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold tracking-tight">Klipper Integration</h2>
              </div>
              <p className="text-neutral-400 leading-relaxed text-sm">
                The V-DAR web interface is now a <b>headless documentation hub</b>. Your daily workflow happens entirely through G-code macros on your printer's screen.
              </p>

              <div className="space-y-4">
                <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 hover:border-neutral-700 transition-colors group">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">1. Smart Persistence</h4>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">Required</span>
                  </div>
                  <p className="text-[12px] text-neutral-500">Enable variable storage to preserve calibration across reboots.</p>
                  <pre className="p-4 bg-black rounded-xl text-[11px] font-mono text-neutral-400 border border-white/5 group-hover:border-blue-500/20 transition-colors">
                    [save_variables]<br/>
                    filename: ~/printer_data/config/variables.cfg
                  </pre>
                </div>

                <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 hover:border-neutral-700 transition-colors group">
                  <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest">2. Laser Definition</h4>
                  <p className="text-[12px] text-neutral-500">Explicitly mapped to your SKR Pico 2 (mcu2) Fan 2 port.</p>
                  <pre className="p-4 bg-black rounded-xl text-[11px] font-mono text-neutral-400 border border-white/5 group-hover:border-green-500/20 transition-colors">
                    [output_pin vdar_laser]<br/>
                    pin: mcu2:gpio18<br/>
                    pwm: true
                  </pre>
                </div>

                <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 hover:border-neutral-700 transition-colors group">
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest">3. Auto-Loading Logic</h4>
                  <p className="text-[12px] text-neutral-500">Add this to your <code className="text-white">PRINT_START</code> macro to fetch the last scan.</p>
                  <pre className="p-4 bg-black rounded-xl text-[11px] font-mono text-blue-400 border border-white/5 group-hover:border-orange-500/20 transition-colors overflow-x-auto leading-relaxed italic">
                    &#123;% set vdar_o = printer.save_variables.variables.vdar_last_offset|default(0.0) %&#125;<br/>
                    SET_GCODE_OFFSET Z_ADJUST=&#123;vdar_o&#125; MOVE=1
                  </pre>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-white">
                <LayoutDashboard className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold tracking-tight">KlipperScreen Controls</h2>
              </div>
              <p className="text-neutral-400 leading-relaxed text-sm">
                These buttons will appear in your printer's <b>Macros</b> menu for one-click material calibration.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['PLA', 'ABS', 'PETG'].map((mat) => (
                  <div key={mat} className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col items-center gap-3 group hover:border-white/20 transition-all hover:-translate-y-1">
                    <Zap className={cn("w-5 h-5", mat === 'PLA' ? 'text-green-400' : mat === 'ABS' ? 'text-red-400' : 'text-blue-400')} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-100 italic">V_DAR_{mat}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Area: Installation & Info */}
          <div className="space-y-8">
            <div className="bg-blue-600/5 border border-blue-600/20 rounded-3xl p-8 space-y-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Daemon Setup</h3>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Run the V-DAR documentation portal as a background service on your Raspberry Pi.
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-black rounded-xl border border-white/5 font-mono text-[10px] text-blue-400 truncate">
                  sudo nano /etc/systemd/system/vdar.service
                </div>
                <div className="p-4 bg-black rounded-xl border border-white/5 font-mono text-[9px] text-neutral-600 leading-relaxed overflow-x-auto select-all">
                  [Unit]<br/>
                  Description=V-DAR Portal<br/>
                  After=network.target<br/>
                  <br/>
                  [Service]<br/>
                  Type=simple<br/>
                  User=admin<br/>
                  WorkingDirectory=/home/admin/V-DAR<br/>
                  ExecStart=/usr/bin/npm run dev<br/>
                  Restart=always
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="p-3 bg-black rounded-xl border border-white/5 font-mono text-[10px] text-green-500">
                    sudo systemctl enable vdar
                  </div>
                  <div className="p-3 bg-black rounded-xl border border-white/5 font-mono text-[10px] text-green-500">
                    sudo systemctl start vdar
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6">
               <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-green-500" />
                 Safety & Logic
               </h3>
               <ul className="space-y-4">
                 <li className="flex gap-3">
                   <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                   <p className="text-[11px] text-neutral-500 leading-relaxed"><b>Non-Destructive:</b> Uses <code className="text-white">Z_ADJUST</code> which added on top of your bed mesh. It never overwrites your primary Z-offset.</p>
                 </li>
                 <li className="flex gap-3">
                   <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                   <p className="text-[11px] text-neutral-500 leading-relaxed"><b>Hardware Verified:</b> Optimized for Voron 2.4 dual-MCU pico configurations.</p>
                 </li>
               </ul>
            </div>

            <div className="p-8 bg-neutral-900/40 border border-neutral-800 rounded-3xl relative overflow-hidden group">
               <Info className="w-12 h-12 absolute -bottom-2 -right-2 opacity-5 text-white transform -rotate-12 group-hover:rotate-0 transition-transform" />
               <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Status</h3>
               <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                 <div className="w-2 h-2 rounded-full bg-green-500" />
                 Standalone Mode Active
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-white/5 text-center">
        <p className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-bold">V-DAR Studio — Engineered for Voron</p>
      </footer>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
