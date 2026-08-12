import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Navegação" className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item, i) => {
        const ultimo = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-ink/30">/</span>}
            {item.href ? (
              <Link href={item.href} className="text-ink/50 hover:text-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={ultimo ? "font-medium text-ink" : "text-ink/50"}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
