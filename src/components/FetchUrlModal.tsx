/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Globe, Plus, Trash2, ArrowRight, RefreshCw } from 'lucide-react';

interface FetchUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRemoteJson: (url: string, data: any, headers?: Record<string, string>) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FetchUrlModal: React.FC<FetchUrlModalProps> = ({
  isOpen,
  onClose,
  onLoadRemoteJson,
  onShowToast,
}) => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [requestBody, setRequestBody] = useState('');
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([
    { key: 'Accept', value: 'application/json' },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddHeader = () => {
    setHeaders((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', val: string) => {
    setHeaders((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: val } : h))
    );
  };

  const handleFetch = async () => {
    if (!url.trim()) {
      onShowToast('Please enter a valid URL', 'warning');
      return;
    }

    setLoading(true);
    try {
      const headerObj: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key.trim()) headerObj[h.key.trim()] = h.value.trim();
      });

      const options: RequestInit = {
        method,
        headers: headerObj,
      };

      if (method === 'POST' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      onLoadRemoteJson(url, json, headerObj);
      onClose();
      onShowToast(`Successfully fetched JSON from ${new URL(url).hostname}`, 'success');
    } catch (err: any) {
      onShowToast(`Fetch failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono select-none">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="h-12 border-b border-[#2A2A2E] bg-[#16161A] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white text-sm">Fetch Remote JSON API Endpoint</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#2A2A2E] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 bg-[#0A0A0B] space-y-4 flex-1 overflow-y-auto">
          {/* Method & URL Input */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 uppercase font-bold">API Endpoint URL</label>
            <div className="flex items-center gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'GET' | 'POST')}
                className="bg-[#1C1C1F] text-white border border-[#2A2A2E] p-2 rounded font-bold outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>

              <input
                type="text"
                placeholder="https://api.example.com/data.json"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-[#1C1C1F] text-white p-2 rounded border border-[#2A2A2E] outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Quick Preset URLs */}
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Sample Public Endpoints:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setUrl('https://jsonplaceholder.typicode.com/users')}
                className="px-2 py-1 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-gray-300 rounded text-[10px] border border-[#2A2A2E]"
              >
                JSONPlaceholder Users
              </button>
              <button
                onClick={() => setUrl('https://api.tvmaze.com/shows/2993?embed=episodes')}
                className="px-2 py-1 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-red-400 rounded text-[10px] border border-red-500/30"
              >
                Stranger Things TV API
              </button>
              <button
                onClick={() => setUrl('https://api.tvmaze.com/shows/43687?embed=cast')}
                className="px-2 py-1 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-pink-400 rounded text-[10px] border border-pink-500/30"
              >
                Squid Game TV API
              </button>
            </div>
          </div>

          {/* Custom Headers */}
          <div className="space-y-2 pt-2 border-t border-[#2A2A2E]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400 uppercase font-bold">HTTP Request Headers</label>
              <button
                onClick={handleAddHeader}
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-bold"
              >
                <Plus className="w-3 h-3" /> Add Header
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Header Key (e.g. Authorization)"
                    value={h.key}
                    onChange={(e) => handleHeaderChange(i, 'key', e.target.value)}
                    className="flex-1 bg-[#1C1C1F] text-gray-200 p-1.5 rounded border border-[#2A2A2E] text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. Bearer token)"
                    value={h.value}
                    onChange={(e) => handleHeaderChange(i, 'value', e.target.value)}
                    className="flex-1 bg-[#1C1C1F] text-gray-200 p-1.5 rounded border border-[#2A2A2E] text-xs outline-none"
                  />
                  <button
                    onClick={() => handleRemoveHeader(i)}
                    className="p-1 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* POST Body */}
          {method === 'POST' && (
            <div className="space-y-1 pt-2 border-t border-[#2A2A2E]">
              <label className="text-[10px] text-gray-400 uppercase font-bold">Request Payload (JSON)</label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="w-full h-20 bg-[#1C1C1F] text-gray-200 p-2 rounded border border-[#2A2A2E] text-xs outline-none focus:border-cyan-500"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-[#2A2A2E] bg-[#16161A] px-5 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Loads response into a new active tab</span>
          <button
            disabled={loading}
            onClick={handleFetch}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
            <span>{loading ? 'Fetching...' : 'Fetch JSON'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
