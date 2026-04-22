'use client';
import { useState, KeyboardEvent } from 'react';
import { X, Plus, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagsInput({ tags = [], onChange, placeholder, className }: TagsInputProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5 min-h-[42px] p-1.5 rounded-lg border border-zinc-200 bg-white focus-within:ring-1 focus-within:ring-zinc-950 focus-within:border-zinc-950 transition-all shadow-sm">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs font-semibold rounded-md group hover:bg-zinc-100 transition-colors"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="p-0.5 rounded-md hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm px-2 text-zinc-900 placeholder:text-zinc-400"
        />
      </div>
      <p className="text-[10px] text-zinc-400 font-medium ml-1">Press Enter to add a tag</p>
    </div>
  );
}
