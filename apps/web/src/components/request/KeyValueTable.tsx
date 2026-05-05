import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import type { KeyValuePair } from '../../types/request';

interface Props {
  data: KeyValuePair[];
  onChange: (data: KeyValuePair[]) => void;
  title: string;
}

export default function KeyValueTable({ data, onChange, title }: Props) {
  const addRow = () => {
    onChange([...data, { id: crypto.randomUUID(), key: '', value: '', enabled: true }]);
  };

  const updateRow = (id: string, updates: Partial<KeyValuePair>) => {
    onChange(data.map((row) => (row.id === id ? { ...row, ...updates } : row)));
  };

  const deleteRow = (id: string) => {
    onChange(data.filter((row) => row.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
        <button
          onClick={addRow}
          className="text-[10px] flex items-center gap-1 text-primary hover:bg-primary/10 px-2 py-0.5 rounded transition-colors"
        >
          <Plus size={12} />
          Add Row
        </button>
      </div>

      <div className="border rounded-md overflow-hidden bg-card/20">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-muted/30 border-b">
              <th className="w-10 py-2"></th>
              <th className="text-left py-2 px-3 border-r font-bold text-muted-foreground">Key</th>
              <th className="text-left py-2 px-3 border-r font-bold text-muted-foreground">Value</th>
              <th className="w-10 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted/30">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground italic">
                  No {title.toLowerCase()} added.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="group hover:bg-muted/20 transition-colors">
                  <td className="text-center">
                    <button
                      onClick={() => updateRow(row.id, { enabled: !row.enabled })}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {row.enabled ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} />}
                    </button>
                  </td>
                  <td className="border-r">
                    <input
                      type="text"
                      value={row.key}
                      onChange={(e) => updateRow(row.id, { key: e.target.value })}
                      placeholder="Key"
                      className="w-full bg-transparent px-3 py-2 outline-none focus:bg-primary/5"
                    />
                  </td>
                  <td className="border-r">
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) => updateRow(row.id, { value: e.target.value })}
                      placeholder="Value"
                      className="w-full bg-transparent px-3 py-2 outline-none focus:bg-primary/5"
                    />
                  </td>
                  <td className="text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
