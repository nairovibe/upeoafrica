import { techByName } from "@/lib/stack";

export function StackMarks({ names, limit = 8 }: { names: string[]; limit?: number }) {
  if (!names.length) return null;
  const shown = names.slice(0, limit);
  const more = names.length - shown.length;
  return (
    <ul className="flex flex-wrap items-center gap-1.5">
      {shown.map((name) => {
        const item = techByName(name);
        return (
          <li
            key={name}
            title={name}
            className="inline-flex items-center gap-1.5 rounded-[5px] bg-surface-2 px-2 py-1 text-xs text-ink-900"
          >
            {item ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/logos/${item.slug}.svg`} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
            ) : null}
            <span>{name}</span>
          </li>
        );
      })}
      {more > 0 ? <li className="px-1 text-xs text-muted">+{more}</li> : null}
    </ul>
  );
}
