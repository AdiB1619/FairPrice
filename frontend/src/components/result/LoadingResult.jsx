import React from 'react';
import Card, { CardContent, CardHeader } from '../ui/Card';
import Skeleton from '../ui/Skeleton';

export default function LoadingResult() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <Skeleton className="w-32 h-5" />
        <Skeleton className="w-20 h-4" />
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Estimated Price Skeleton */}
        <div className="space-y-2">
          <Skeleton className="w-24 h-3.5" />
          <Skeleton className="w-48 h-10 rounded-xl" />
          <Skeleton className="w-40 h-4" />
        </div>

        {/* RangeBar Skeleton */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-32 h-3" />
          </div>
          <Skeleton className="w-full h-3 rounded-full my-2" />
          <div className="flex justify-between">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
        </div>

        {/* Verdict Skeleton */}
        <Skeleton className="w-full h-20 rounded-xl" />

        {/* Actions Skeleton */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="flex-1 h-9 rounded-xl" />
          <Skeleton className="w-24 h-9 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

