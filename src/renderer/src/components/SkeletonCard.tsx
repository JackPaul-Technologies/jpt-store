import React from 'react'

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl overflow-hidden animate-pulse flex flex-col h-72">
      <div className="h-40 bg-slate-700/40 w-full" />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-slate-700/50 rounded w-1/4" />
          <div className="h-4 bg-slate-700/60 rounded w-3/4" />
          <div className="h-3 bg-slate-700/40 rounded w-full" />
        </div>
        <div className="h-3 bg-slate-700/40 rounded w-1/3 self-end" />
      </div>
    </div>
  )
}
