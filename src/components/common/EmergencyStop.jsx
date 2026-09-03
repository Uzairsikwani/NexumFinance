import React, { useState } from 'react';
import { OctagonX, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EmergencyStop({ onStop, isActive = false, isLoading = false }) {
  const [confirmed, setConfirmed] = useState(false);

  const handleStop = () => {
    onStop();
    setConfirmed(false);
  };

  if (!isActive) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        <span>Automation is currently inactive</span>
      </div>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
          disabled={isLoading}
        >
          <OctagonX className="w-5 h-5 mr-2" />
          STOP ALL AUTOMATION
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">Stop All Automation?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p>
              This will immediately halt all automated trading activities. 
              Any pending orders will be cancelled.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <strong>Note:</strong> Existing positions will NOT be automatically closed. 
              You will need to manage them manually.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleStop}
            className="bg-red-600 hover:bg-red-700"
          >
            <OctagonX className="w-4 h-4 mr-2" />
            Confirm Stop
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
