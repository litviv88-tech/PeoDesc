import { MaterialIcon } from "@/components/MaterialIcon";

const items = [
  { icon: "groups", label: "Сообщество", href: "#" },
  { icon: "filter_list", label: "Фильтр", href: "#" },
  { icon: "volunteer_activism", label: "Благодарность", href: "#" },
  { icon: "contact_support", label: "Поддержка", href: "#" },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around bg-surface-container-lowest px-2 py-3 shadow-[0_-1px_3px_0_rgba(244,162,134,0.1)]">
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="flex flex-col items-center justify-center px-4 py-1.5 text-on-surface-variant transition-all duration-200 hover:bg-secondary-container/30 active:scale-90"
        >
          <MaterialIcon name={item.icon} />
          <span className="mt-1 font-body text-label-sm">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
