import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ManualAddInputProps {
  onAdd: (name: string) => void;
}

export const ManualAddInput = ({ onAdd }: ManualAddInputProps) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add ingredient manually..."
        className="h-12 text-base rounded-full"
      />
      <Button
        onClick={handleAdd}
        disabled={!input.trim()}
        size="icon"
        className="h-12 w-12 rounded-full flex-shrink-0"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
};
