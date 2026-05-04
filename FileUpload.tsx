'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { parseFile } from '@/lib/parser';
import type { Operation } from '@/lib/types';

type Props = {
  onLoaded: (ops: Operation[], filename: string) => void;
};

export function FileUpload({ onLoaded }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setError(null);
    setLoading(true);
    try {
      const ops = await parseFile(file);
      if (ops.length === 0) {
        setError('Aucune ligne valide trouvée');
        setLoading(false);
        return;
      }
      setFilename(file.name);
      onLoaded(ops, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => inputRef.current?.click()}
      className={clsx(
        'card p-5 cursor-pointer transition-all duration-200 select-none',
        dragOver && 'border-ink-400 bg-ink-50/50',
        !dragOver && 'hover:border-ink-200',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex items-center gap-4">
        <div className={clsx(
          'w-11 h-11 rounded-xl flex items-center justify-center transition-colors shrink-0',
          loading ? 'bg-ink-100' : filename ? 'bg-ledger-green/10' : 'bg-ink-100',
        )}>
          {loading ? (
            <div className="w-5 h-5 border-2 border-ink-300 border-t-ink-700 rounded-full animate-spin" />
          ) : filename ? (
            <CheckCircle2 className="w-5 h-5 text-ledger-green" strokeWidth={2} />
          ) : (
            <Upload className="w-5 h-5 text-ink-600" strokeWidth={2} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {filename ? (
              <motion.div
                key="loaded"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-ink-500" />
                  <span className="text-sm font-medium text-ink-900 truncate">{filename}</span>
                </div>
                <div className="text-xs text-ink-500 mt-0.5">
                  Cliquer ou glisser pour remplacer
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-sm font-medium text-ink-900">
                  Glisser un export CSV ou XLSX
                </div>
                <div className="text-xs text-ink-500 mt-0.5">
                  Données traitées localement, jamais envoyées
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filename && !loading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFilename(null);
              setError(null);
            }}
            className="text-ink-400 hover:text-ink-700 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 text-xs text-ledger-red bg-ledger-red/5 px-3 py-2 rounded-lg"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
