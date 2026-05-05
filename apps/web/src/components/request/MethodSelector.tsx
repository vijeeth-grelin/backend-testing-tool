import { useResponseStore } from '../../store/responseStore';
import type { HttpMethod } from '../../types/request';
import { cn } from '../../utils/cn';

interface Props {
  value: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:     'text-green-600',
  POST:    'text-blue-600',
  PUT:     'text-amber-600',
  PATCH:   'text-purple-600',
  DELETE:  'text-red-600',
  HEAD:    'text-gray-600',
  OPTIONS: 'text-pink-600',
};

export default function MethodSelector({ value, onChange }: Props) {
  const isLoading = useResponseStore((state) => state.isLoading);
  return (
    <select
      value={value}
      disabled={isLoading}
      onChange={(e) => onChange(e.target.value as HttpMethod)}
      className={cn(
        "bg-muted/50 border rounded-md px-3 py-2 font-bold text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer min-w-[100px] text-center",
        METHOD_COLORS[value]
      )}
    >
      {METHODS.map((m) => (
        <option key={m} value={m} className="font-bold text-foreground">
          {m}
        </option>
      ))}
    </select>
  );
}
