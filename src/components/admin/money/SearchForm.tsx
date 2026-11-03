import { Search } from "lucide-react";

export function SearchForm({
  action,
  value,
  placeholder,
  keep = {},
}: {
  action: string;
  value?: string;
  placeholder: string;
  keep?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} className="relative w-full sm:w-72">
      {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        name="q"
        defaultValue={value}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-[5px] border border-line bg-white pl-9 pr-3 text-sm text-ink-900 outline-none transition-[border-color] duration-200 focus:border-brand-500"
      />
    </form>
  );
}
