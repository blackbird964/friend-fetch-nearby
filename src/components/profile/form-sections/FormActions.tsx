
import React from 'react';
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  loading: boolean;
  onCancel: () => void;
}

const FormActions: React.FC<FormActionsProps> = ({ loading, onCancel }) => {
  return (
    <div className="flex space-x-3">
      <Button type="submit" className="flex-1" disabled={loading}>
        {loading ? 'Saving...' : 'Save Profile'}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
        Cancel
      </Button>
    </div>
  );
};

export default FormActions;
