import { MaterialIcon } from "@/components/MaterialIcon";

export function SupportMessage() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-primary-container/20 bg-primary-container/10 p-6">
      <div className="rounded-full bg-primary-container p-2 text-on-primary-container">
        <MaterialIcon name="volunteer_activism" />
      </div>
      <div>
        <h4 className="font-body text-label-md text-on-primary-container">Знание — это забота</h4>
        <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
          Делясь советами PeoDesc, вы помогаете строить сообщество, основанное на опыте и внимании к
          друг другу. Спасибо, что вы с нами.
        </p>
      </div>
    </div>
  );
}
