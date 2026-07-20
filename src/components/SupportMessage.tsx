import { MaterialIcon } from "@/components/MaterialIcon";

export function SupportMessage() {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-primary-container/20 bg-primary-container/10 p-6">
      <div className="rounded-full bg-primary-container p-2 text-on-primary-container">
        <MaterialIcon name="volunteer_activism" />
      </div>
      <div>
        <h4 className="font-body text-label-md text-on-primary-container">Knowledge is Care</h4>
        <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
          By sharing PeoDesc insights, you help build a community grounded in evidence and empathy.
          Thank you for being a part of this journey.
        </p>
      </div>
    </div>
  );
}
