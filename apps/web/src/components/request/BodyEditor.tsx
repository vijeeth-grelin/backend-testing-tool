import { useRequestStore } from '@/store/requestStore';
import { cn } from '@/utils/cn';

export default function BodyEditor() {
  const { body, setBody } = useRequestStore();

  const handleTypeChange = (type: 'none' | 'json' | 'raw' | 'form-data') => {
    const updates: any = { type };
    if (type === 'form-data' && !body.formData) {
      updates.formData = [{ id: crypto.randomUUID(), key: '', value: '', enabled: true, type: 'text' }];
    }
    setBody({ ...body, ...updates });
  };

  const updateFormData = (index: number, updates: any) => {
    const newFormData = [...(body.formData || [])];
    newFormData[index] = { ...newFormData[index], ...updates };
    setBody({ ...body, formData: newFormData });
  };

  const addFormDataRow = () => {
    setBody({
      ...body,
      formData: [...(body.formData || []), { id: crypto.randomUUID(), key: '', value: '', enabled: true, type: 'text' }]
    });
  };

  const removeFormDataRow = (index: number) => {
    setBody({
      ...body,
      formData: (body.formData || []).filter((_, i) => i !== index)
    });
  };

  const handleRawChange = (value: string) => {
    setBody({ ...body, raw: value });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-4 border-b border-border/50 pb-2">
        {['None', 'JSON', 'Raw', 'Form-Data'].map((label) => {
          const type = label.toLowerCase() as any;
          return (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="bodyType"
                checked={body.type === type}
                onChange={() => handleTypeChange(type)}
                className="accent-primary h-3.5 w-3.5"
              />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-all",
                body.type === type ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
              )}>
                {label}
              </span>
            </label>
          );
        })}
      </div>

      <div className="flex-1 min-h-[300px] relative group overflow-hidden flex flex-col">
        {body.type === 'none' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/5 border border-dashed rounded-[2rem] text-muted-foreground text-xs font-medium italic">
            This request does not have a body.
          </div>
        ) : body.type === 'form-data' ? (
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="border rounded-2xl overflow-hidden bg-card/30">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-12 text-center">Use</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-24">Type</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Key</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Value</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {(body.formData || []).map((row, i) => (
                    <tr key={row.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-2 text-center">
                        <input 
                          type="checkbox" 
                          checked={row.enabled} 
                          onChange={(e) => updateFormData(i, { enabled: e.target.checked })} 
                          className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" 
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={row.type || 'text'}
                          onChange={(e) => updateFormData(i, { type: e.target.value as 'text' | 'file', value: '', file: null })}
                          className="bg-transparent text-[10px] font-bold uppercase outline-none w-full"
                        >
                          <option value="text">Text</option>
                          <option value="file">File</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input 
                          value={row.key} 
                          onChange={(e) => updateFormData(i, { key: e.target.value })} 
                          className="w-full bg-transparent px-2 py-1 text-xs outline-none font-medium" 
                          placeholder="Key" 
                        />
                      </td>
                      <td className="px-2 py-2">
                        {row.type === 'file' ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="file" 
                              onChange={(e) => updateFormData(i, { file: e.target.files?.[0] || null })}
                              className="text-[10px] text-muted-foreground file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            {row.file && <span className="text-[10px] font-bold text-primary truncate max-w-[100px]">{row.file.name}</span>}
                          </div>
                        ) : (
                          <input 
                            value={row.value} 
                            onChange={(e) => updateFormData(i, { value: e.target.value })} 
                            className="w-full bg-transparent px-2 py-1 text-xs outline-none" 
                            placeholder="Value" 
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => removeFormDataRow(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <span className="text-lg">&times;</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button 
              onClick={addFormDataRow} 
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1 ml-2"
            >
              + Add New Row
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <textarea
              value={body.raw}
              onChange={(e) => handleRawChange(e.target.value)}
              spellCheck={false}
              className={cn(
                "flex-1 w-full bg-card/50 border rounded-[2rem] p-6 text-xs font-mono outline-none resize-none transition-all",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary/50 shadow-inner",
                "placeholder:text-muted-foreground/30 custom-scrollbar"
              )}
              placeholder={body.type === 'json' ? '{ "key": "value" }' : 'Enter raw body content...'}
            />
            <div className="absolute right-6 bottom-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-card px-3 py-1 rounded-full border shadow-sm">
                {body.type.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
