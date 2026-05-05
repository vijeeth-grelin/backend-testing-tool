import { useState } from 'react';
import { useUIStore } from '../store/uiStore';

export function usePrompt() {
  const { openModal, closeModal } = useUIStore();

  const prompt = ({
    title,
    label,
    placeholder,
    defaultValue = '',
    onConfirm,
  }: {
    title: string;
    label: string;
    placeholder?: string;
    defaultValue?: string;
    onConfirm: (value: string) => void;
  }) => {
    const PromptContent = () => {
      const [value, setValue] = useState(defaultValue);
      
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{label}</label>
            <input
              autoFocus
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-muted/50 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value.trim()) {
                  onConfirm(value.trim());
                  closeModal();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!value.trim()}
              onClick={() => {
                onConfirm(value.trim());
                closeModal();
              }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-primary/20"
            >
              Confirm
            </button>
          </div>
        </div>
      );
    };

    openModal({
      title,
      content: <PromptContent />,
    });
  };

  return prompt;
}
