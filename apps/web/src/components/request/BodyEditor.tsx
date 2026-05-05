import { useRequestStore } from '../../store/requestStore';
import { cn } from '../../utils/cn';

export default function BodyEditor() {
  const { body, setBody } = useRequestStore();

  const handleTypeChange = (type: 'none' | 'json' | 'raw') => {
    setBody({ ...body, type });
  };

  const handleRawChange = (value: string) => {
    setBody({ ...body, raw: value });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex gap-4 border-b border-border/50 pb-2">
        {['None', 'JSON', 'Raw'].map((type) => (
          <label key={type} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="bodyType"
              checked={body.type === type.toLowerCase()}
              onChange={() => handleTypeChange(type.toLowerCase() as any)}
              className="accent-primary h-3.5 w-3.5"
            />
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-all",
              body.type === type.toLowerCase() ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            )}>
              {type}
            </span>
          </label>
        ))}
      </div>

      <div className="flex-1 min-h-[300px] relative group">
        {body.type === 'none' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/5 border border-dashed rounded-[2rem] text-muted-foreground text-xs font-medium italic">
            This request does not have a body.
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
