import React, { useState } from 'react';
import { BackendConfig } from '../types/carpark';
import { X, Code2, Copy, Check, Server, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface BackendIntegrationModalProps {
  config: BackendConfig;
  onSaveConfig: (config: BackendConfig) => void;
  onClose: () => void;
  onTriggerTestFetch: (url: string) => Promise<{ success: boolean; message: string; count?: number }>;
}

export const BackendIntegrationModal: React.FC<BackendIntegrationModalProps> = ({
  config,
  onSaveConfig,
  onClose,
  onTriggerTestFetch,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'expressSnippet'>('config');
  const [mode, setMode] = useState<'mock' | 'custom'>(config.mode);
  const [endpointUrl, setEndpointUrl] = useState<string>(config.customEndpointUrl);
  const [pollIntervalSec, setPollIntervalSec] = useState<number>(config.pollIntervalSec);
  const [isSimulatingLiveDrift, setIsSimulatingLiveDrift] = useState<boolean>(config.isSimulatingLiveDrift);
  const [copied, setCopied] = useState<string | null>(null);

  const [testStatus, setTestStatus] = useState<{ loading: boolean; result?: { success: boolean; message: string } }>({
    loading: false,
  });

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    const res = await onTriggerTestFetch(endpointUrl);
    setTestStatus({ loading: false, result: res });
  };

  const handleSave = () => {
    onSaveConfig({
      mode,
      customEndpointUrl: endpointUrl,
      pollIntervalSec,
      isSimulatingLiveDrift,
    });
    onClose();
  };

  const sampleJsonSchema = `{
  "carparks": [
    {
      "id": "MBS-01",
      "name": "Marina Bay Sands Car Park",
      "address": "10 Bayfront Avenue, Singapore 018956",
      "town": "Marina Bay",
      "region": "Central",
      "agency": "Commercial",
      "carparkType": "Basement",
      "coordinates": { "lat": 1.2834, "lng": 103.8607 },
      "lots": {
        "car": { "total": 1200, "available": 418 },
        "motorcycle": { "total": 150, "available": 72 },
        "heavyVehicle": { "total": 0, "available": 0 }
      },
      "parkingSystem": "Electronic Parking System (EPS)",
      "shortTermParking": "WHOLE DAY",
      "freeParking": "None",
      "nightParking": true,
      "gantryHeight": 2.0,
      "hasEVCharging": true,
      "evChargersCount": 16,
      "rates": {
        "weekdayDay": "$8.00 1st hr, $1.50/next 30m",
        "weekdayNight": "$8.00 flat after 7pm",
        "weekendDay": "$12.00 1st hr",
        "weekendNight": "$12.00 flat",
        "ratePerHalfHour": 2.50,
        "centralAreaMultiplier": 2.0,
        "gracePeriodMinutes": 10
      },
      "lastUpdated": "2026-11-09T19:30:00.000Z",
      "trend": "stable"
    }
  ]
}`;

  const expressSnippet = `// server.ts (Express Backend Route for Singapore Carpark API)
import express from 'express';

const app = express();
app.use(express.json());

// Proxy route fetching official Singapore DataMall / Data.gov.sg carpark feed
app.get('/api/carparks', async (req, res) => {
  try {
    // 1. Fetch live car park availability from Data.gov.sg
    const response = await fetch(
      'https://api.data.gov.sg/v1/transport/carpark-availability',
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await response.json();
    
    // 2. Map raw carpark items to the frontend contract schema
    // raw data format: data.items[0].carpark_data[]
    res.json({
      timestamp: data.items?.[0]?.timestamp || new Date().toISOString(),
      rawItemsCount: data.items?.[0]?.carpark_data?.length || 0,
      // Pass normalized carpark array here
      carparks: [] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Singapore carparks', details: String(error) });
  }
});`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Backend Integration Bridge</h3>
              <p className="text-xs text-slate-500">
                Connect your real backend API or continue using the built-in live mock simulation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Data Source Settings
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            JSON Payload Contract
          </button>
          <button
            onClick={() => setActiveTab('expressSnippet')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'expressSnippet'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Express Route Template
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Mode Selection */}
              <div>
                <label className="block font-semibold text-slate-800 mb-2">Data Source Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setMode('mock')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mode === 'mock'
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 text-xs mb-1">
                      Real-time Mock Simulation
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Pre-populated with 34 authentic Singapore carparks. Simulates realistic lot drifts, occupancy spikes, and SGT trends.
                    </p>
                  </div>

                  <div
                    onClick={() => setMode('custom')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      mode === 'custom'
                        ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 text-xs mb-1">
                      Custom Backend Endpoint
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Connect to your own Express/FastAPI/NestJS server route or LTA DataMall proxy when ready.
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Endpoint URL */}
              {mode === 'custom' && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Endpoint URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={endpointUrl}
                        onChange={(e) => setEndpointUrl(e.target.value)}
                        placeholder="e.g. /api/carparks or https://api.mybackend.sg/carparks"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-hidden focus:border-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testStatus.loading}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shrink-0"
                      >
                        <RefreshCw className={`w-3 h-3 ${testStatus.loading ? 'animate-spin' : ''}`} />
                        <span>Test Connection</span>
                      </button>
                    </div>
                  </div>

                  {testStatus.result && (
                    <div
                      className={`p-2.5 rounded-lg text-[11px] flex items-center gap-2 ${
                        testStatus.result.success
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{testStatus.result.message}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Simulation drift settings */}
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Simulation & Polling Controls
                </label>
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSimulatingLiveDrift}
                      onChange={(e) => setIsSimulatingLiveDrift(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                    />
                    <span className="font-medium text-slate-700">
                      Simulate real-time vehicle entry / exit drift
                    </span>
                  </label>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Background refresh cadence:</span>
                    <select
                      value={pollIntervalSec}
                      onChange={(e) => setPollIntervalSec(parseInt(e.target.value))}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono"
                    >
                      <option value="10">Every 10 seconds</option>
                      <option value="20">Every 20 seconds (Default)</option>
                      <option value="30">Every 30 seconds</option>
                      <option value="60">Every 60 seconds</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Expected JSON Return Structure:</span>
                <button
                  onClick={() => handleCopy(sampleJsonSchema, 'schema')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1"
                >
                  {copied === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'schema' ? 'Copied!' : 'Copy Schema'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-72">
                {sampleJsonSchema}
              </pre>
            </div>
          )}

          {activeTab === 'expressSnippet' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Ready-to-use Express route:</span>
                <button
                  onClick={() => handleCopy(expressSnippet, 'express')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1"
                >
                  {copied === 'express' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'express' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto max-h-72">
                {expressSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Settings persist in your browser localStorage</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
