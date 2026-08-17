import React from 'react';
import { AlertTriangle, RefreshCw, Database, WifiOff, Loader2 } from 'lucide-react';

interface QueryStateWrapperProps<T = any> {
  query?: {
    isLoading?: boolean;
    isError?: boolean;
    error?: any;
    data?: T;
    isFetching?: boolean;
    refetch?: () => void;
  };
  isLoading?: boolean;
  isError?: boolean;
  error?: any;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  onRetry?: () => void;
  isOffline?: boolean;
  children: React.ReactNode | ((data: T) => React.ReactNode);
  loadingSkeleton?: React.ReactNode;
}

export const QueryStateWrapper = <T extends any = any>({
  query,
  isLoading: propLoading,
  isError: propError,
  error: propErrorObj,
  isEmpty = false,
  emptyTitle = 'No Data Available',
  emptyMessage = 'There are currently no records returned by the backend API.',
  onRetry,
  isOffline = false,
  children,
  loadingSkeleton,
}: QueryStateWrapperProps<T>) => {
  const isLoading = query ? !!query.isLoading : !!propLoading;
  const isError = query ? !!query.isError : !!propError;
  const error = query ? query.error : propErrorObj;
  const data = query ? query.data : undefined;
  const retryFn = query ? () => query.refetch?.() : onRetry;

  // 1. Offline Banner State
  if (isOffline && !isLoading && !isError && isEmpty) {
    return (
      <div className="industrial-card p-10 text-center flex flex-col items-center justify-center space-y-4 my-6">
        <div className="p-3 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
          <WifiOff size={32} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Offline State</h3>
          <p className="text-xs text-slate-400 max-w-md mt-1">
            Real-time connection is currently unavailable. Waiting for live telemetry stream or backend reconnect.
          </p>
        </div>
        {retryFn && (
          <button
            onClick={retryFn}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition"
          >
            <RefreshCw size={14} /> Reconnect
          </button>
        )}
      </div>
    );
  }

  // 2. Loading Skeleton State
  if (isLoading) {
    if (loadingSkeleton) {
      return <>{loadingSkeleton}</>;
    }
    return (
      <div className="industrial-card p-12 text-center flex flex-col items-center justify-center space-y-3 my-6 animate-pulse">
        <Loader2 size={32} className="text-blue-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading live industrial telemetry...</p>
      </div>
    );
  }

  // 3. Error State with Retry
  if (isError) {
    const errorMsg =
      error?.response?.data?.error ||
      error?.message ||
      'Unable to connect to Maintix backend API service.';

    return (
      <div className="industrial-card p-8 text-center flex flex-col items-center justify-center space-y-4 my-6 border-red-900/60 bg-red-950/20">
        <div className="p-3 bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
          <AlertTriangle size={32} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Backend API Communication Error</h3>
          <p className="text-xs text-slate-300 max-w-lg mt-1 font-mono">{errorMsg}</p>
        </div>
        {retryFn && (
          <button
            onClick={retryFn}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-red-600/30"
          >
            <RefreshCw size={14} /> Retry API Request
          </button>
        )}
      </div>
    );
  }

  // 4. Empty State
  if (isEmpty || (query && data === undefined)) {
    return (
      <div className="industrial-card p-10 text-center flex flex-col items-center justify-center space-y-3 my-6 border-slate-800">
        <div className="p-3 bg-slate-800/80 text-slate-400 rounded-full border border-slate-700">
          <Database size={28} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{emptyTitle}</h3>
          <p className="text-xs text-slate-400 max-w-md mt-1">{emptyMessage}</p>
        </div>
        {retryFn && (
          <button
            onClick={retryFn}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition mt-2"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        )}
      </div>
    );
  }

  // 5. Success State
  if (typeof children === 'function') {
    return <>{(children as (d: any) => React.ReactNode)(data)}</>;
  }

  return <>{children}</>;
};
