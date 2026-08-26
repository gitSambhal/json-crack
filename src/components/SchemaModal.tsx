/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { jsonToTypeScript, jsonToJsonSchema, validateJsonWithSchema, ValidationError } from '../utils/jsonSchema';
import { copyToClipboard } from '../utils/export';
import { downloadFile } from '../utils/export';
import { X, FileCode, Check, Copy, Download, ShieldCheck, AlertTriangle } from 'lucide-react';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  filename: string;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({
  isOpen,
  onClose,
  data,
  filename,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'typescript' | 'jsonschema' | 'validator'>('typescript');
  const [copied, setCopied] = useState(false);
  const [customSchemaText, setCustomSchemaText] = useState('');

  const tsCode = useMemo(() => jsonToTypeScript(data), [data]);
  const schemaObj = useMemo(() => jsonToJsonSchema(data, filename.replace(/\.json$/i, '')), [data, filename]);
  const schemaStr = useMemo(() => JSON.stringify(schemaObj, null, 2), [schemaObj]);

  const validationErrors: ValidationError[] = useMemo(() => {
    if (activeTab !== 'validator' || !customSchemaText.trim()) return [];
    try {
      const sch = JSON.parse(customSchemaText);
      return validateJsonWithSchema(data, sch);
    } catch {
      return [{ path: '$', message: 'Invalid JSON Schema syntax' }];
    }
  }, [activeTab, customSchemaText, data]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Copied to clipboard', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono select-none">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="h-12 border-b border-[#2A2A2E] bg-[#16161A] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-sm">JSON Schema & TypeScript Generator</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#2A2A2E] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="h-10 bg-[#0A0A0B] border-b border-[#2A2A2E] px-4 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('typescript')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'typescript' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            TypeScript Interfaces
          </button>

          <button
            onClick={() => setActiveTab('jsonschema')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'jsonschema' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            JSON Schema (Draft-07)
          </button>

          <button
            onClick={() => {
              setActiveTab('validator');
              if (!customSchemaText) setCustomSchemaText(schemaStr);
            }}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'validator' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Schema Validator
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-auto bg-[#0A0A0B] relative">
          {activeTab === 'typescript' && (
            <pre className="text-emerald-400 font-mono text-[11px] whitespace-pre-wrap select-text">
              {tsCode}
            </pre>
          )}

          {activeTab === 'jsonschema' && (
            <pre className="text-blue-400 font-mono text-[11px] whitespace-pre-wrap select-text">
              {schemaStr}
            </pre>
          )}

          {activeTab === 'validator' && (
            <div className="flex flex-col h-full gap-4">
              <div className="flex-1 flex flex-col">
                <label className="text-gray-400 mb-1 text-[10px] uppercase font-bold">
                  JSON Schema Definition
                </label>
                <textarea
                  value={customSchemaText}
                  onChange={(e) => setCustomSchemaText(e.target.value)}
                  className="w-full flex-1 bg-[#1C1C1F] text-gray-200 border border-[#2A2A2E] p-2 rounded font-mono text-[11px] outline-none focus:border-emerald-500"
                />
              </div>

              <div className="h-32 bg-[#16161A] border border-[#2A2A2E] rounded p-3 overflow-y-auto">
                <div className="font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Validation Report:
                </div>
                {validationErrors.length === 0 ? (
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Payload perfectly conforms to the Schema!
                  </div>
                ) : (
                  <div className="space-y-1">
                    {validationErrors.map((err, i) => (
                      <div key={i} className="text-red-400 flex items-center gap-2 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold">{err.path}:</span>
                        <span>{err.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="h-12 border-t border-[#2A2A2E] bg-[#16161A] px-5 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {activeTab === 'typescript' ? 'Generated TS interfaces' : 'Standard JSON Schema'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(activeTab === 'typescript' ? tsCode : schemaStr)}
              className="px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-white rounded text-xs font-semibold flex items-center gap-1.5 border border-[#2A2A2E]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-300" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>

            <button
              onClick={() => {
                const isTs = activeTab === 'typescript';
                const content = isTs ? tsCode : schemaStr;
                const ext = isTs ? '.ts' : '.schema.json';
                downloadFile(content, filename.replace(/\.json$/i, '') + ext, 'text/plain');
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
