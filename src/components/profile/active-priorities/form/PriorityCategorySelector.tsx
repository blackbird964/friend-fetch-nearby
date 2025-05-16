
import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PRIORITY_CATEGORIES from '../PriorityCategories';

interface PriorityCategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PriorityCategorySelector: React.FC<PriorityCategorySelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <div>
      <Label htmlFor="category">Category</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger id="category">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_CATEGORIES.map((cat) => (
            <SelectItem key={cat.name} value={cat.name}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PriorityCategorySelector;
