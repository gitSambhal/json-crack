/**
 * JSON Reader & Node Graph Visualizer
 * Developer: Suhail Akhtar (https://suhail.top)
 * License: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { extractTableData } from '../utils/dataProfiler';
import { downloadFile, jsonToCsv } from '../utils/export';
import { Search, ArrowUpDown, Download, Table as TableIcon, Layers, FileJson, EyeOff, SlidersHorizontal } from 'lucide-react';

interface TableViewProps {
  data: any;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onHideKey?: (key: string) => void;
  onOpenPropertyFilter?: () => void;
}

export const TableView: React.FC<TableViewProps> = ({ data, onShowToast, onHideKey, onOpenPropertyFilter }) => {
  const { columns, rows } = useMemo(() => extractTableData(data), [data]);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Filter rows
  const filteredRows = useMemo(() => {
    if (!searchFilter.trim()) return rows;
    const q = searchFilter.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(q)
      )
    );
  }, [rows, searchFilter]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      let res = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        res = valA - valB;
      } else {
        res = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      }
      return sortDirection === 'asc' ? res : -res;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  // Paginated rows
  const paginatedRows = useMemo(() => {
    const start = page * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page]);

  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const handleExportCsv = () => {
    try {
      const csvStr = jsonToCsv(sortedRows);
      downloadFile(csvStr, 'table_export.csv', 'text/csv');
      onShowToast('Table exported to CSV', 'success');
    } catch (err: any) {
      onShowToast(`Failed to export CSV: ${err.message}`, 'error');
    }
  };

  if (columns.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 font-mono">
        <TableIcon className="w-12 h-12 text-[#6B6B72] mb-3" />
        <h3 className="text-base font-bold text-white mb-1">No Tabular Data Detected</h3>
        <p className="text-xs text-gray-500 max-w-sm">
          Table view works best on JSON Arrays or objects containing lists of items. Switch to Graph or Tree view to inspect hierarchical objects.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0B] font-mono text-xs overflow-hidden select-none">
      {/* Table Toolbar */}
      <div className="h-10 border-b border-[#2A2A2E] bg-[#111114] px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6B6B72]" />
            <input
              type="text"
              placeholder="Search in table rows..."
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setPage(0);
              }}
              className="w-full bg-[#1C1C1F] text-gray-200 text-xs pl-8 pr-3 py-1 rounded border border-[#2A2A2E] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-400">
          <span>
            Showing <strong className="text-white">{sortedRows.length}</strong> rows ({columns.length} columns)
          </span>

          {onOpenPropertyFilter && (
            <button
              onClick={onOpenPropertyFilter}
              className="px-2.5 py-1 bg-[#1F1F24] hover:bg-[#2A2A2E] text-blue-300 border border-blue-500/20 font-semibold rounded text-[11px] flex items-center gap-1.5 transition-all"
              title="Show or hide columns / properties"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" /> Filter Columns
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded text-[11px] flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-[#16161A] border-b border-[#2A2A2E] text-gray-300 font-bold sticky top-0 z-10">
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-3 py-2 border-r border-[#2A2A2E] hover:bg-[#2A2A2E] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate max-w-[150px]">{col}</span>
                    <div className="flex items-center gap-1">
                      {onHideKey && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onHideKey(col);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[#6B6B72] hover:text-amber-400 p-0.5 rounded transition-all"
                          title={`Hide column "${col}"`}
                        >
                          <EyeOff className="w-3 h-3" />
                        </button>
                      )}
                      <ArrowUpDown className="w-3 h-3 text-[#6B6B72]" />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row, idx) => (
              <tr
                key={row._id ?? idx}
                className="border-b border-[#1C1C1F] hover:bg-[#16161A] transition-colors text-gray-300"
              >
                {columns.map((col) => {
                  const val = row[col];
                  const displayStr =
                    val === undefined
                      ? '-'
                      : typeof val === 'object' && val !== null
                      ? JSON.stringify(val)
                      : String(val);

                  return (
                    <td
                      key={col}
                      className="px-3 py-1.5 border-r border-[#1C1C1F] truncate max-w-xs text-[11px]"
                      title={displayStr}
                    >
                      {val === null ? (
                        <span className="text-red-400 italic">null</span>
                      ) : typeof val === 'boolean' ? (
                        <span className={val ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {String(val)}
                        </span>
                      ) : typeof val === 'number' ? (
                        <span className="text-purple-400">{val}</span>
                      ) : (
                        displayStr
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Pagination Bar */}
      {totalPages > 1 && (
        <div className="h-9 border-t border-[#2A2A2E] bg-[#111114] px-4 flex items-center justify-between text-gray-400 text-[11px]">
          <div>
            Page <strong className="text-white">{page + 1}</strong> of <strong className="text-white">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-2 py-0.5 bg-[#1C1C1F] border border-[#2A2A2E] rounded disabled:opacity-40 hover:bg-[#2A2A2E] text-white"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="px-2 py-0.5 bg-[#1C1C1F] border border-[#2A2A2E] rounded disabled:opacity-40 hover:bg-[#2A2A2E] text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
