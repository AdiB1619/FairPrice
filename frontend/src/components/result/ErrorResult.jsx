import React from 'react';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorResult({ error, onRetry }) {
  return (
    <Card className="border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
      <CardContent className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
            Unable to Estimate Price
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 max-w-sm mx-auto leading-relaxed">
            {error || 'The model encountered an issue processing your request.'}
          </p>
        </div>

        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            icon={RotateCcw}
            className="border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/50"
          >
            Retry Estimation
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

