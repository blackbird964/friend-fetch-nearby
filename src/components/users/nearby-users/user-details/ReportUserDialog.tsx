
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';

const REPORT_REASONS = [
  "Inappropriate behavior",
  "Harassment",
  "Spam messages",
  "Fake profile",
  "Offensive content",
  "Other"
];

interface ReportUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReportUser: (reason: string) => void;
}

const ReportUserDialog: React.FC<ReportUserDialogProps> = ({
  isOpen,
  onOpenChange,
  onReportUser
}) => {
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  
  const handleSubmit = () => {
    onReportUser(reportReason);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Report this user?</AlertDialogTitle>
          <AlertDialogDescription>
            This will send a report to our admins for review. 
            Please select a reason for reporting this user.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label htmlFor="drawer-report-reason" className="text-sm font-medium mb-2 block">
            Reason for report
          </Label>
          <Select 
            value={reportReason} 
            onValueChange={setReportReason}
          >
            <SelectTrigger id="drawer-report-reason" className="w-full">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((reason) => (
                <SelectItem key={reason} value={reason}>
                  {reason}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSubmit}
            className="bg-amber-600 text-white hover:bg-amber-700"
          >
            Submit Report
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReportUserDialog;
