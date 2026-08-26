/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ParsedFile,
  ViewMode,
  SearchFilterState,
  ToastMessage,
  ThemeMode,
} from './types/json';
import { PRESET_FILES } from './utils/presets';
import {
  calculateStats,
  searchJson,
  formatByteSize,
  updatePathValue,
  deletePathKey,
  sortJsonData,
  SortMode,
  getPathValue,
} from './utils/jsonParser';
import { downloadFile, jsonToCsv } from './utils/export';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FileStats } from './components/FileStats';
import { NodeInspector } from './components/NodeInspector';
import { ToastContainer } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { ChangelogModal } from './components/ChangelogModal';
import { PasteModal } from './components/PasteModal';
import { TabBar } from './components/TabBar';

import { DiffModal } from './components/DiffModal';
import { SchemaModal } from './components/SchemaModal';
import { JsonPathModal } from './components/JsonPathModal';
import { ProfilerModal } from './components/ProfilerModal';
import { TransformModal } from './components/TransformModal';
import { FetchUrlModal } from './components/FetchUrlModal';

import { GraphView } from './features/GraphView';
import { TreeView } from './features/TreeView';
import { CodeView } from './features/CodeView';
import { TableView } from './features/TableView';

import { FileText, Plus, Trash2, Folder, FileJson, AlertCircle } from 'lucide-react';

export default function App() {
  // Working files state
  const [files, setFiles] = useState<ParsedFile[]>(PRESET_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('preset-production');

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [theme, setTheme] = useState<ThemeMode>('geometric-dark');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Modals state
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isJsonPathModalOpen, setIsJsonPathModalOpen] = useState(false);
  const [isProfilerModalOpen, setIsProfilerModalOpen] = useState(false);
  const [isTransformModalOpen, setIsTransformModalOpen] = useState(false);
  const [isFetchUrlModalOpen, setIsFetchUrlModalOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Update active file data
  const handleUpdateActiveData = (newData: any) => {
    try {
      const formattedContent = JSON.stringify(newData, null, 2);
      const byteSize = new Blob([formattedContent]).size;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? {
                ...f,
                data: newData,
                content: formattedContent,
                byteSize,
                sizeFormatted: formatByteSize(byteSize),
                isValid: true,
                error: null,
              }
            : f
        )
      );
    } catch (err: any) {
      showToast(`Failed to update active JSON: ${err.message}`, 'error');
    }
  };

  // Remote JSON fetch handler
  const handleLoadRemoteJson = (url: string, remoteData: any) => {
    const urlObj = new URL(url);
    const fileName = urlObj.pathname.split('/').pop() || 'remote.json';
    const cleanName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    const formattedContent = JSON.stringify(remoteData, null, 2);
    const byteSize = new Blob([formattedContent]).size;

    const newId = `remote-${Date.now()}`;
    const newFile: ParsedFile = {
      id: newId,
      name: cleanName,
      content: formattedContent,
      data: remoteData,
      isValid: true,
      error: null,
      byteSize,
      sizeFormatted: formatByteSize(byteSize),
      isPreset: false,
      lastModified: Date.now(),
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newId);
    setSelectedPath(null);
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Search filter
  const [searchFilter, setSearchFilter] = useState<SearchFilterState>({
    query: '',
    caseSensitive: false,
    useRegex: false,
    typeFilter: 'all',
    searchTarget: 'all',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Focus mode keyboard shortcut (Esc to exit, Ctrl/Cmd + Shift + F to toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
        showToast('Exited full-screen focus mode', 'info');
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        setIsFocusMode((prev) => {
          const next = !prev;
          showToast(next ? 'Entered full-screen focus mode' : 'Exited full-screen focus mode', 'info');
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  const activeFile = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || files[0];
  }, [files, activeFileId]);

  // Calculate stats for current active file data
  const stats = useMemo(() => {
    if (!activeFile || !activeFile.isValid || !activeFile.data) return null;
    return calculateStats(activeFile.data, activeFile.byteSize);
  }, [activeFile]);

  // Run search engine
  const searchResults = useMemo(() => {
    if (!activeFile || !activeFile.isValid || !activeFile.data) return [];
    return searchJson(activeFile.data, searchFilter);
  }, [activeFile, searchFilter]);

  // Handle file import upload (supports single or multiple files)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const fileList = Array.from(uploadedFiles) as File[];
    const newParsedFiles: ParsedFile[] = [];
    let processedCount = 0;

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        try {
          const data = JSON.parse(content);
          const newFile: ParsedFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            byteSize: file.size,
            sizeFormatted: formatByteSize(file.size),
            content,
            data,
            isValid: true,
            error: null,
            lastModified: file.lastModified,
            isPreset: false,
          };
          newParsedFiles.push(newFile);
        } catch (err: any) {
          const invalidFile: ParsedFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            byteSize: file.size,
            sizeFormatted: formatByteSize(file.size),
            content,
            data: null,
            isValid: false,
            error: err.message,
            lastModified: file.lastModified,
            isPreset: false,
          };
          newParsedFiles.push(invalidFile);
        }

        processedCount++;
        if (processedCount === fileList.length) {
          setFiles((prev) => [...newParsedFiles, ...prev]);
          if (newParsedFiles.length > 0) {
            setActiveFileId(newParsedFiles[0].id);
            setSelectedPath(null);
          }
          showToast(
            `Imported ${newParsedFiles.length} file${newParsedFiles.length > 1 ? 's' : ''} into new tabs`,
            'success'
          );
        }
      };
      reader.readAsText(file);
    });

    e.target.value = '';
  };

  // Open a new blank tab
  const handleNewTab = () => {
    const untitledNum = files.filter((f) => f.name.toLowerCase().startsWith('untitled')).length + 1;
    const newName = `Untitled-${untitledNum}.json`;
    const defaultData = {
      title: `Untitled Payload ${untitledNum}`,
      created: new Date().toISOString(),
      items: [],
      metadata: {
        status: 'active',
        version: 1,
      },
    };
    const content = JSON.stringify(defaultData, null, 2);
    const byteSize = new Blob([content]).size;

    const newFile: ParsedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newName,
      byteSize,
      sizeFormatted: formatByteSize(byteSize),
      content,
      data: defaultData,
      isValid: true,
      error: null,
      lastModified: Date.now(),
      isPreset: false,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setSelectedPath(null);
    showToast(`Opened new tab: ${newName}`, 'info');
  };

  // Close tab
  const handleCloseTab = (id: string) => {
    if (files.length <= 1) {
      showToast('At least one tab must remain open', 'warning');
      return;
    }

    const fileIndex = files.findIndex((f) => f.id === id);
    const updatedFiles = files.filter((f) => f.id !== id);

    if (activeFileId === id) {
      const nextIndex = Math.max(0, fileIndex - 1);
      setActiveFileId(updatedFiles[nextIndex].id);
      setSelectedPath(null);
    }

    setFiles(updatedFiles);
  };

  // Close other tabs
  const handleCloseOtherTabs = (id: string) => {
    const targetFile = files.find((f) => f.id === id);
    if (targetFile) {
      setFiles([targetFile]);
      setActiveFileId(targetFile.id);
      setSelectedPath(null);
      showToast('Closed all other tabs', 'info');
    }
  };

  // Duplicate tab
  const handleDuplicateTab = (id: string) => {
    const target = files.find((f) => f.id === id);
    if (!target) return;

    const nameParts = target.name.split('.');
    const ext = nameParts.length > 1 ? nameParts.pop() : 'json';
    const baseName = nameParts.join('.');
    const dupName = `${baseName}_copy.${ext}`;

    const newFile: ParsedFile = {
      ...target,
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: dupName,
      isPreset: false,
      lastModified: Date.now(),
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setSelectedPath(null);
    showToast(`Duplicated tab as ${dupName}`, 'success');
  };

  // Rename tab
  const handleRenameTab = (id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName } : f))
    );
    showToast(`Renamed tab to ${newName}`, 'info');
  };

  // Handle load pasted raw JSON
  const handleLoadPastedJson = (name: string, content: string) => {
    try {
      const data = JSON.parse(content);
      const byteSize = new Blob([content]).size;
      const newFile: ParsedFile = {
        id: `file-${Date.now()}`,
        name,
        byteSize,
        sizeFormatted: formatByteSize(byteSize),
        content,
        data,
        isValid: true,
        error: null,
        lastModified: Date.now(),
        isPreset: false,
      };

      setFiles((prev) => [newFile, ...prev]);
      setActiveFileId(newFile.id);
      setSelectedPath(null);
      showToast(`Loaded ${name} successfully`, 'success');
    } catch (err: any) {
      showToast(`Invalid JSON: ${err.message}`, 'error');
    }
  };

  // Delete working file
  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeFileId === id) {
      const remaining = files.filter((f) => f.id !== id);
      if (remaining.length > 0) setActiveFileId(remaining[0].id);
    }
    setConfirmDeleteId(null);
    showToast('File removed', 'info');
  };

  // Update node value from NodeInspector or CodeView
  const handleUpdateNodeValue = (path: string, newValue: any) => {
    if (!activeFile) return;
    const updatedData = updatePathValue(activeFile.data, path, newValue);
    const updatedContent = JSON.stringify(updatedData, null, 2);
    const byteSize = new Blob([updatedContent]).size;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId
          ? {
              ...f,
              data: updatedData,
              content: updatedContent,
              byteSize,
              sizeFormatted: formatByteSize(byteSize),
            }
          : f
      )
    );
  };

  // Delete key from NodeInspector
  const handleDeleteNodeKey = (path: string) => {
    if (!activeFile) return;
    const updatedData = deletePathKey(activeFile.data, path);
    const updatedContent = JSON.stringify(updatedData, null, 2);
    const byteSize = new Blob([updatedContent]).size;

    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFileId
          ? {
              ...f,
              data: updatedData,
              content: updatedContent,
              byteSize,
              sizeFormatted: formatByteSize(byteSize),
            }
          : f
      )
    );
    setSelectedPath(null);
    showToast('Node key deleted', 'success');
  };

  // Sort entire JSON
  const handleSortJson = (mode: SortMode) => {
    if (!activeFile) return;
    try {
      const sortedData = sortJsonData(activeFile.data, mode);
      const updatedContent = JSON.stringify(sortedData, null, 2);
      const byteSize = new Blob([updatedContent]).size;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? {
                ...f,
                data: sortedData,
                content: updatedContent,
                byteSize,
                sizeFormatted: formatByteSize(byteSize),
              }
            : f
        )
      );

      const modeLabels: Record<SortMode, string> = {
        asc: 'Sorted keys alphabetically (A-Z)',
        desc: 'Sorted keys reverse (Z-A)',
        'key-length-asc': 'Sorted keys by length (Short to Long)',
        'key-length-desc': 'Sorted keys by length (Long to Short)',
        type: 'Grouped by type (Primitives → Arrays → Objects)',
        reverse: 'Reversed keys & arrays',
      };
      showToast(modeLabels[mode] || 'JSON sorted successfully', 'success');
    } catch (err: any) {
      showToast(`Failed to sort JSON: ${err.message}`, 'error');
    }
  };

  // Sort sub-tree JSON
  const handleSortSubTree = (path: string, mode: SortMode) => {
    if (!activeFile) return;
    try {
      const targetVal = getPathValue(activeFile.data, path);
      if (targetVal === undefined) return;
      const sortedVal = sortJsonData(targetVal, mode);
      handleUpdateNodeValue(path, sortedVal);
      let cleanP = path;
      if (cleanP.startsWith('root.')) cleanP = '$.' + cleanP.slice(5);
      showToast(`Sorted sub-tree "${cleanP}" (${mode.toUpperCase()})`, 'success');
    } catch (err: any) {
      showToast(`Failed to sort sub-tree: ${err.message}`, 'error');
    }
  };

  // Content change in code view
  const handleCodeContentChange = (newContent: string) => {
    try {
      const parsedData = JSON.parse(newContent);
      const byteSize = new Blob([newContent]).size;
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? {
                ...f,
                content: newContent,
                data: parsedData,
                isValid: true,
                error: null,
                byteSize,
                sizeFormatted: formatByteSize(byteSize),
              }
            : f
        )
      );
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? { ...f, content: newContent, isValid: false, error: err.message }
            : f
        )
      );
    }
  };

  // Handle export
  const handleExport = (type: 'json' | 'minified' | 'csv') => {
    if (!activeFile) return;

    if (type === 'json') {
      downloadFile(
        activeFile.name,
        JSON.stringify(activeFile.data, null, 2),
        'application/json'
      );
      showToast('Exported formatted JSON', 'success');
    } else if (type === 'minified') {
      const baseName = activeFile.name.replace('.json', '');
      downloadFile(
        `${baseName}.min.json`,
        JSON.stringify(activeFile.data),
        'application/json'
      );
      showToast('Exported minified JSON', 'success');
    } else if (type === 'csv') {
      const csv = jsonToCsv(activeFile.data);
      if (!csv) {
        showToast('Active JSON has no exportable array rows for CSV', 'warning');
        return;
      }
      const baseName = activeFile.name.replace('.json', '');
      downloadFile(`${baseName}.csv`, csv, 'text/csv');
      showToast('Exported CSV file', 'success');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0A0A0B] text-[#E0E0E0] font-mono flex flex-col overflow-hidden select-none">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt,.geojson,.jsonl"
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      {/* Header */}
      <Header
        searchFilter={searchFilter}
        onSearchChange={(partial) => setSearchFilter((prev) => ({ ...prev, ...partial }))}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onImportClick={() => fileInputRef.current?.click()}
        onExportClick={handleExport}
        onOpenPasteModal={() => setIsPasteModalOpen(true)}
        onOpenChangelog={() => setIsChangelogOpen(true)}
        onSortJson={handleSortJson}
        matchCount={searchResults.length}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'geometric-dark' ? 'clean-light' : 'geometric-dark')}
        onOpenDiffModal={() => setIsDiffModalOpen(true)}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onOpenJsonPathModal={() => setIsJsonPathModalOpen(true)}
        onOpenProfilerModal={() => setIsProfilerModalOpen(true)}
        onOpenTransformModal={() => setIsTransformModalOpen(true)}
        onOpenFetchUrlModal={() => setIsFetchUrlModalOpen(true)}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
      />

      {/* Main Body */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {!isFocusMode && (
          <aside className="w-64 border-r border-[#2A2A2E] bg-[#111114] flex flex-col shrink-0 select-none">
            <div className="p-4 text-[10px] uppercase tracking-[0.2em] text-[#6B6B72] font-bold flex items-center justify-between">
              <span>Working Files</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="Add File"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 px-2">
              {files.map((file) => {
                const isActive = file.id === activeFileId;
                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      setActiveFileId(file.id);
                      setSelectedPath(null);
                    }}
                    className={`px-3 py-2 rounded flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#1C1C1F] border-l-2 border-blue-500 text-white'
                        : 'hover:bg-[#1C1C1F]/60 text-gray-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileJson className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-[#6B6B72]'}`} />
                      <span className="text-xs font-medium truncate">{file.name}</span>
                    </div>

                    {!file.isPreset && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(file.id);
                        }}
                        className="text-[#6B6B72] hover:text-red-400 p-1 rounded transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Node Inspector component */}
            <NodeInspector
              selectedPath={selectedPath}
              data={activeFile?.data}
              onUpdateValue={handleUpdateNodeValue}
              onDeleteKey={handleDeleteNodeKey}
              onShowToast={showToast}
              onSortSubTree={handleSortSubTree}
            />

            {/* File Metadata Stats */}
            <FileStats stats={stats} selectedPath={selectedPath || undefined} />
          </aside>
        )}

        {/* Content View Section */}
        <section className="flex-1 bg-[#0A0A0B] flex flex-col relative overflow-hidden">
          {/* Multi-File Tab Bar */}
          <TabBar
            files={files}
            activeFileId={activeFileId}
            onSelectTab={(id) => {
              setActiveFileId(id);
              setSelectedPath(null);
            }}
            onCloseTab={handleCloseTab}
            onCloseOtherTabs={handleCloseOtherTabs}
            onNewTab={handleNewTab}
            onDuplicateTab={handleDuplicateTab}
            onRenameTab={handleRenameTab}
            onImportClick={() => fileInputRef.current?.click()}
            onOpenPasteModal={() => setIsPasteModalOpen(true)}
          />

          {!activeFile.isValid ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
              <h3 className="text-white text-base font-bold uppercase mb-1">Invalid JSON Payload</h3>
              <p className="text-red-300 text-xs max-w-md bg-red-950/40 border border-red-500/40 p-3 rounded font-mono mb-4">
                {activeFile.error}
              </p>
              <button
                onClick={() => setViewMode('code')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded uppercase tracking-wider"
              >
                Fix in Code Editor
              </button>
            </div>
          ) : viewMode === 'graph' ? (
            <GraphView
              data={activeFile.data}
              selectedPath={selectedPath}
              onSelectPath={setSelectedPath}
              searchResults={searchResults}
              activeSearchQuery={searchFilter.query}
              onShowToast={showToast}
              onSortSubTree={handleSortSubTree}
            />
          ) : viewMode === 'tree' ? (
            <TreeView
              data={activeFile.data}
              selectedPath={selectedPath}
              onSelectPath={setSelectedPath}
              searchResults={searchResults}
              activeSearchQuery={searchFilter.query}
              onShowToast={showToast}
              onSortSubTree={handleSortSubTree}
            />
          ) : viewMode === 'code' ? (
            <CodeView
              content={activeFile.content}
              onContentChange={handleCodeContentChange}
              onShowToast={showToast}
            />
          ) : (
            <TableView data={activeFile.data} onShowToast={showToast} />
          )}

          {/* Floating Focus Mode indicator */}
          {isFocusMode && (
            <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2 bg-[#111114]/90 backdrop-blur border border-amber-500/40 text-amber-300 text-[11px] font-mono px-3 py-1.5 rounded-full shadow-xl pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Focus Mode Active</span>
              <button
                onClick={() => setIsFocusMode(false)}
                className="ml-1 px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 rounded text-[10px] font-bold uppercase transition-colors"
                title="Exit Focus Mode (Esc)"
              >
                Exit (Esc)
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      {!isFocusMode && (
        <Footer
          selectedPath={selectedPath}
          activeFileName={activeFile.name}
          totalNodes={stats?.totalNodes}
          onOpenChangelog={() => setIsChangelogOpen(true)}
        />
      )}

      {/* Modals & Toasts */}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />

      <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />

      <PasteModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onLoadJson={handleLoadPastedJson}
      />

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        title="Remove Working File"
        message="Are you sure you want to remove this file from your active session?"
        confirmLabel="Remove"
        onConfirm={() => confirmDeleteId && handleDeleteFile(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <DiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        files={files}
        activeFileId={activeFileId}
      />

      <SchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        data={activeFile.data}
        filename={activeFile.name}
        onShowToast={showToast}
      />

      <JsonPathModal
        isOpen={isJsonPathModalOpen}
        onClose={() => setIsJsonPathModalOpen(false)}
        data={activeFile.data}
        onOpenNewTabWithData={(title, queryData) => {
          const formattedContent = JSON.stringify(queryData, null, 2);
          const byteSize = new Blob([formattedContent]).size;
          const newId = `query-${Date.now()}`;
          const newFile: ParsedFile = {
            id: newId,
            name: title,
            content: formattedContent,
            data: queryData,
            isValid: true,
            error: null,
            byteSize,
            sizeFormatted: formatByteSize(byteSize),
            isPreset: false,
            lastModified: Date.now(),
          };
          setFiles((prev) => [...prev, newFile]);
          setActiveFileId(newId);
          setSelectedPath(null);
        }}
        onShowToast={showToast}
      />

      <ProfilerModal
        isOpen={isProfilerModalOpen}
        onClose={() => setIsProfilerModalOpen(false)}
        data={activeFile.data}
        filename={activeFile.name}
      />

      <TransformModal
        isOpen={isTransformModalOpen}
        onClose={() => setIsTransformModalOpen(false)}
        data={activeFile.data}
        filename={activeFile.name}
        onUpdateActiveData={handleUpdateActiveData}
        onShowToast={showToast}
      />

      <FetchUrlModal
        isOpen={isFetchUrlModalOpen}
        onClose={() => setIsFetchUrlModalOpen(false)}
        onLoadRemoteJson={handleLoadRemoteJson}
        onShowToast={showToast}
      />
    </div>
  );
}
