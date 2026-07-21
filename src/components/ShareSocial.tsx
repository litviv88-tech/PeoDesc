import { MaterialIcon } from "@/components/MaterialIcon";

const socials = [
  { icon: "chat", label: "WhatsApp" },
  { icon: "send", label: "Telegram" },
  { icon: "public", label: "Facebook" },
  { icon: "forum", label: "Reddit" },
] as const;

export function ShareSocial() {
  return (
    <div className="rounded-xl border border-outline-variant/30 bg-white p-6">
      <label className="mb-4 block font-body text-label-md text-on-surface-variant">
        Поделиться в соцсетях
      </label>
      <div className="flex items-center justify-between gap-2">
        {socials.map((item) => (
          <button key={item.label} type="button" className="group flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container transition-transform group-hover:scale-110">
              <MaterialIcon name={item.icon} />
            </div>
            <span className="font-body text-[10px] text-label-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
