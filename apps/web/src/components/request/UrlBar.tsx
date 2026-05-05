import { useResponseStore } from "../../store/responseStore";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function UrlBar({ value, onChange }: Props) {
   const isLoading = useResponseStore((state) => state.isLoading);
  return (
    <div className="flex-1 relative group">
      <input
        type="text"
        value={value}
        disabled={isLoading}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter request URL or paste text"
        className="w-full bg-muted/30 border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all group-hover:bg-muted/50 disabled:cursor-not-allowed"
      />
      {value.includes('{{') && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-mono">
            vars
          </span>
        </div>
      )}
    </div>
  );
}
