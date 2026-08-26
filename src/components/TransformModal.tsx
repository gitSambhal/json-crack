/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  jsonToYaml,
  jsonToXml,
  jsonToToml,
  jsonToSqlInsert,
  convertKeyCases,
  anonymizeSensitiveData,
  CaseMode,
} from '../utils/transforms';
import { copyToClipboard, downloadFile } from '../utils/export';
import { X, RefreshCw, Copy, Check, Download, ShieldAlert, FileText, Database } from 'lucide-react';

interface TransformModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  filename: string;
  onUpdateActiveData?: (newData: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TransformModal: React.FC<TransformModalProps> = ({
  isOpen,
  onClose,
  data,
  filename,
  onUpdateActiveData,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'convert' | 'case' | 'anonymize'>('convert');
  const [targetFormat, setTargetFormat] = useState<'yaml' | 'xml' | 'toml' | 'sql'>('yaml');
  const [selectedCase, setSelectedCase] = useState<CaseMode>('camelCase');
  const [copied, setCopied] = useState(false);

  // Formatted conversion text
  const convertedText = useMemo(() => {
    if (!data) return '';
    try {
      if (targetFormat === 'yaml') return jsonToYaml(data);
      if (targetFormat === 'xml') return jsonToXml(data);
      if (targetFormat === 'toml') return jsonToToml(data);
      if (targetFormat === 'sql') return jsonToSqlInsert(data, filename.replace(/\.json$/i, ''));
    } catch (err: any) {
      return `Error converting to ${targetFormat.toUpperCase()}: ${err.message}`;
    }
    return '';
  }, [data, targetFormat, filename]);

  // Key Casing Converted Data
  const casedData = useMemo(() => {
    return convertKeyCases(data, selectedCase);
  }, [data, selectedCase]);

  // Anonymized Data
  const anonymizedData = useMemo(() => {
    return anonymizeSensitiveData(data);
  }, [data]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Copied transformed result to clipboard', 'success');
  };

  const handleApplyToTab = (newData: any) => {
    if (onUpdateActiveData) {
      onUpdateActiveData(newData);
      onClose();
      onShowToast('Applied transformed JSON to active tab', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono select-none">
      <div className="bg-[#111114] border border-[#2A2A2E] rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="h-12 border-b border-[#2A2A2E] bg-[#16161A] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white text-sm font-sans">Transform, Format & Anonymize Data</span>
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
            onClick={() => setActiveTab('convert')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'convert' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Multi-Format Converter (YAML/XML/TOML/SQL)
          </button>

          <button
            onClick={() => setActiveTab('case')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'case' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Key Case Transformer
          </button>

          <button
            onClick={() => setActiveTab('anonymize')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
              activeTab === 'anonymize' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Anonymize Sensitive Data
          </button>
        </div>

        {/* Sub-controls */}
        {activeTab === 'convert' && (
          <div className="h-10 bg-[#16161A] border-b border-[#2A2A2E] px-4 flex items-center gap-2 text-xs">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Target Output Format:</span>
            {(['yaml', 'xml', 'toml', 'sql'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setTargetFormat(fmt)}
                className={`px-2.5 py-1 rounded uppercase text-[11px] font-bold border transition-all ${
                  targetFormat === fmt
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-[#1C1C1F] text-gray-400 border-[#2A2A2E] hover:text-white'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'case' && (
          <div className="h-10 bg-[#16161A] border-b border-[#2A2A2E] px-4 flex items-center gap-2 text-xs">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Select Key Casing:</span>
            {(['camelCase', 'snake_case', 'kebab-case', 'PascalCase'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCase(c)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                  selectedCase === c
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-[#1C1C1F] text-gray-400 border-[#2A2A2E] hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-auto bg-[#0A0A0B]">
          {activeTab === 'convert' && (
            <pre className="text-amber-300 font-mono text-[11px] whitespace-pre-wrap select-text">
              {convertedText}
            </pre>
          )}

          {activeTab === 'case' && (
            <pre className="text-purple-300 font-mono text-[11px] whitespace-pre-wrap select-text">
              {JSON.stringify(casedData, null, 2)}
            </pre>
          )}

          {activeTab === 'anonymize' && (
            <div className="space-y-3">
              <div className="p-2.5 bg-amber-950/30 border border-amber-500/40 rounded text-amber-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  Automatically obfuscated keys containing <code>email</code>, <code>password</code>, <code>token</code>, <code>phone</code>, <code>name</code>, etc.
                </span>
              </div>
              <pre className="text-emerald-300 font-mono text-[11px] whitespace-pre-wrap select-text">
                {JSON.stringify(anonymizedData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="h-12 border-t border-[#2A2A2E] bg-[#16161A] px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeTab !== 'convert' && onUpdateActiveData && (
              <button
                onClick={() => handleApplyToTab(activeTab === 'case' ? casedData : anonymizedData)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                Apply to Current Tab
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleCopy(
                  activeTab === 'convert'
                    ? convertedText
                    : JSON.stringify(activeTab === 'case' ? casedData : anonymizedData, null, 2)
                )
              }
              className="px-3 py-1.5 bg-[#1C1C1F] hover:bg-[#2A2A2E] text-white rounded text-xs font-semibold flex items-center gap-1.5 border border-[#2A2A2E]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-300" />}
              <span>Copy Output</span>
            </button>

            {activeTab === 'convert' && (
              <button
                onClick={() => {
                  const ext = targetFormat === 'yaml' ? '.yaml' : targetFormat === 'xml' ? '.xml' : targetFormat === 'toml' ? '.toml' : '.sql';
                  downloadFile(convertedText, filename.replace(/\.json$/i, '') + ext, 'text/plain');
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download .{targetFormat}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
