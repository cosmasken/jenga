import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function SkeletonCard({ className = "", rows = 3 }: { className?: string; rows?: number }) {
  return (
    <Card className={`animate-pulse ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-4"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
