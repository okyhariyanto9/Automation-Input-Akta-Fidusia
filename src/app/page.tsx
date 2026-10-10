"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Upload, Terminal, CheckCircle, AlertCircle, Loader2, FileText, ChevronRight, Settings, Info, Chrome } from 'lucide-react';
import Papa from 'papaparse';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Log {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
  row?: number;
}

interface AutomationState {
  isRunning: boolean;
  totalRows: number;
  currentRow: number;
  logs: Log[];
  progress: number;
  connectionMode: 'new' | 'attach';
  lastProcessedAkta?: string;
}

export default function Dashboard() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [startRow, setStartRow] = useState<string | number>(1);
  const [endRow, setEndRow] = useState<string | number>(1);
  const [isLaunching, setIsLaunching] = useState(false);

  const [state, setState] = useState<AutomationState>({
    isRunning: false,
    totalRows: 0,
    currentRow: 0,
    logs: [],
    progress: 0,
    connectionMode: 'attach',
    lastProcessedAkta: '',
  });

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('[SSE] Connecting to status stream...');
    const eventSource = new EventSource('/api/automation/status');

    eventSource.onopen = () => {
      console.log('[SSE] Connection opened');
    };

    eventSource.onmessage = (event) => {
      try {
        const newState = JSON.parse(event.data);
        console.log('[SSE] Received update:', newState.currentRow, newState.progress);
        setState(newState);
      } catch (err) {
        console.error('[SSE] Failed to parse message:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
    };

    return () => {
      console.log('[SSE] Closing connection');
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.logs]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        complete: (results) => {
          const data = results.data.filter((row: any) => row.length > 1);
          if (data.length === 0) {
            console.error("No data rows found in CSV");
            alert("File CSV kosong atau format tidak sesuai.");
          }
          setCsvData(data);
          setEndRow(data.length);
          setStartRow(1);
        },
        skipEmptyLines: true,
      });
    }
  };

  const handleStartRowChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setStartRow(clean);
  };

  const handleStartRowBlur = () => {
    const num = parseInt(String(startRow), 10);
    if (!startRow || isNaN(num) || num < 1) {
      setStartRow(1);
    } else if (num > csvData.length) {
      setStartRow(csvData.length);
    } else {
      setStartRow(num);
    }
  };

  const handleEndRowChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    setEndRow(clean);
  };

  const handleEndRowBlur = () => {
    const num = parseInt(String(endRow), 10);
    if (!endRow || isNaN(num) || num < 1) {
      setEndRow(csvData.length > 0 ? csvData.length : 1);
    } else if (num > csvData.length) {
      setEndRow(csvData.length);
    } else {
      setEndRow(num);
    }
  };

  const launchChrome = async () => {
    setIsLaunching(true);
    try {
      await fetch('/api/chrome/launch', { method: 'POST' });
    } catch (err) {
      console.error('Failed to launch:', err);
    } finally {
      setTimeout(() => setIsLaunching(false), 2000);
    }
  };

  const startAutomation = async () => {
    if (csvData.length === 0) return;
    try {
      const parsedStart = Math.max(1, parseInt(String(startRow), 10) || 1);
      const parsedEnd = Math.min(csvData.length, Math.max(1, parseInt(String(endRow), 10) || csvData.length));
      await fetch('/api/automation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: csvData,
          mode: 'attach',
          startRow: parsedStart,
          endRow: parsedEnd
        }),
      });
    } catch (err) {
      console.error('Failed to start:', err);
    }
  };

  const stopAutomation = async () => {
    try {
      await fetch('/api/automation/stop', { method: 'POST' });
    } catch (err) {
      console.error('Failed to stop:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#132440] text-slate-200 font-sans selection:bg-amber-500/50 selection:text-white">
      <header className="border-b border-slate-800 bg-white/5 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full shadow-lg overflow-hidden border border-amber-500/40 flex items-center justify-center bg-[#0e223e] ring-2 ring-amber-500/20">
              <img src="/logo.png" alt="Logo Notaris" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">
                Automation Akta Fidusia Notaris
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold",
              state.isRunning ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-400"
            )}>
              <span className={cn("w-2 h-2 rounded-full", state.isRunning ? "bg-emerald-400" : "bg-slate-500")}></span>
              {state.isRunning ? 'RUNNING' : 'IDLE'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Step 1: Launch Chrome */}
        <section className="bg-[#161b22] rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Chrome className="w-32 h-32" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D1855C] text-[10px] text-white">1</span>
                Buka Browser Khusus
              </h2>
            </div>
            <button
              onClick={launchChrome}
              disabled={isLaunching || state.isRunning}
              className={cn(
                "px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl whitespace-nowrap cursor-pointer",
                isLaunching ? "bg-slate-800 text-slate-500" : "bg-[#D1855C] text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isLaunching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5" />}
              BUKA CHROME DEBUGGING
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Step 2: Configuration */}
          <section className="bg-[#161b22] rounded-3xl border border-slate-800 p-8 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D1855C] text-[10px] text-white">2</span>
              Konfigurasi Data
            </h2>

            <div className="flex-1 space-y-6">
              <label className={cn(
                "relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer transition-all hover:bg-slate-800/30",
                csvData.length > 0 ? "border-[#D1855C]/50 bg-[#D1855C]/5" : "hover:border-slate-600"
              )}>
                <div className="flex flex-col items-center justify-center text-center px-4">
                  {csvData.length > 0 ? (
                    <>
                      <FileText className="w-10 h-10 text-[#D1855C] mb-3" />
                      <p className="text-sm font-bold text-slate-200 truncate max-w-[200px]">{fileName}</p>
                      <p className="text-xs text-slate-500 mt-1">{csvData.length} baris terdeteksi</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-700 mb-3" />
                      <p className="text-sm font-medium text-slate-400">Klik atau tarik file CSV ke sini</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={state.isRunning} />
              </label>

              {csvData.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-slate-300">Rentang Baris Data</span>
                    <span className="text-xs text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      Total: {csvData.length.toLocaleString('id-ID')} baris
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 whitespace-nowrap block">
                        Baris Awal
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={startRow}
                        onChange={(e) => handleStartRowChange(e.target.value)}
                        onBlur={handleStartRowBlur}
                        placeholder="1"
                        className="w-full bg-black/40 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all selection:bg-amber-500 selection:text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 whitespace-nowrap block">
                        Baris Akhir
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={endRow}
                        onChange={(e) => handleEndRowChange(e.target.value)}
                        onBlur={handleEndRowBlur}
                        placeholder={csvData.length.toString()}
                        className="w-full bg-black/40 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all selection:bg-amber-500 selection:text-white font-mono"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 pl-1">
                    Akan memproses <span className="text-amber-400 font-semibold">{Math.max(0, (parseInt(String(endRow)) || 0) - (parseInt(String(startRow)) || 1) + 1).toLocaleString('id-ID')}</span> baris
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/50 space-y-3">
              <button
                onClick={startAutomation}
                disabled={state.isRunning || csvData.length === 0}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95",
                  state.isRunning || csvData.length === 0
                    ? "bg-slate-800 text-slate-600 pointer-events-none"
                    : "bg-[#D1855C] text-white hover:opacity-90 shadow-[#D1855C]/20"
                )}
              >
                {state.isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                MULAI AUTOMATION
              </button>
              <button
                onClick={stopAutomation}
                disabled={!state.isRunning}
                className={cn(
                  "w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border ",
                  !state.isRunning ? "border-slate-800 text-slate-700 pointer-events-none" : "border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 active:scale-95"
                )}
              >
                <Square className="w-4 h-4 fill-current" /> BERHENTI
              </button>
            </div>
          </section>

          {/* Step 3: Execution Progress */}
          <section className="bg-[#161b22] rounded-3xl border border-slate-800 p-8 shadow-xl flex flex-col">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-8">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D1855C] text-[10px] text-white">3</span>
              Status & Log
            </h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-black/30 rounded-2xl p-4 border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Terproses</p>
                <p className="text-2xl font-black text-white">{state.currentRow} <span className="text-slate-600 text-sm font-bold">/ {state.totalRows}</span></p>
              </div>
              <div className="bg-black/30 rounded-2xl p-4 border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Progress</p>
                <p className="text-2xl font-black text-[#D1855C]">{state.progress}%</p>
              </div>
            </div>

            <div className="mb-8 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Baris Terakhir</p>
                  <p className="text-[10px] text-slate-400 font-mono">Row #{state.currentRow}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D1855C]/10 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-[#D1855C]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 leading-none mb-1">Tanggal Akta</p>
                    <p className="text-sm font-bold text-white">{state.lastProcessedAkta || '-'}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Timeline Progres</p>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D1855C] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(209,133,92,0.5)]" style={{ width: `${state.progress}%` }}></div>
                </div>
              </div>
            </div>

            {/* Integrated Log list */}
            <div className="flex-1 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[#D1855C]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Log Aktivitas</span>
                </div>
                <div className="text-[9px] text-slate-600 flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full", isLaunching || state.isRunning ? "bg-[#D1855C] animate-pulse" : "bg-slate-700")}></div>
                  Stream Active
                </div>
              </div>
              <div className="flex-1 max-h-[400px] bg-black/40 rounded-2xl border border-slate-800/50 overflow-y-auto p-4 font-mono text-[11px] space-y-2 scrollbar-thin shadow-inner">
                {state.logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 italic text-center p-8">
                    <Terminal className="w-8 h-8 mb-2 opacity-50" />
                    Menunggu proses dimulai...
                  </div>
                ) : (
                  state.logs.map((log, i) => (
                    <div key={i} className={cn(
                      "flex gap-3 animate-in slide-in-from-left-1 duration-200 border-l-2 pl-2",
                      log.type === 'error' ? "text-red-400 border-red-500/50" : log.type === 'success' ? "text-emerald-400 border-emerald-500/50" : "text-slate-400 border-slate-700/50"
                    )}>
                      <span className="text-slate-700 shrink-0 font-bold">{log.timestamp}</span>
                      <span className="break-all">{log.message}</span>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-8 text-center text-slate-600 text-[10px] font-medium tracking-[0.2em] uppercase">
        @okyhariyanto10@gmail.com
      </footer>
    </div>
  );
}
