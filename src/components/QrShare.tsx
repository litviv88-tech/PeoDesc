import { MaterialIcon } from "@/components/MaterialIcon";

export function QrShare() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-outline-variant/30 bg-white p-8 text-center">
      <div className="rounded-lg border-2 border-primary-container/30 bg-white p-4">
        <div className="relative flex h-32 w-32 items-center justify-center bg-white">
          <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-1 opacity-20">
            <div className="rounded-sm bg-primary" />
            <div className="rounded-sm bg-primary" />
            <div className="bg-transparent" />
            <div className="rounded-sm bg-primary" />
            <div className="rounded-sm bg-primary" />
            <div className="bg-transparent" />
            <div className="rounded-sm bg-primary" />
            <div className="rounded-sm bg-primary" />
            <div className="bg-transparent" />
            <div className="rounded-sm bg-primary" />
            <div className="rounded-sm bg-primary" />
            <div className="bg-transparent" />
            <div className="rounded-sm bg-primary" />
            <div className="rounded-sm bg-primary" />
            <div className="bg-transparent" />
            <div className="rounded-sm bg-primary" />
          </div>
          <div className="absolute flex items-center justify-center rounded-full border border-primary/20 bg-white p-1">
            <MaterialIcon name="spa" className="text-xl text-primary" />
          </div>
          <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-primary" />
          <div className="absolute right-0 bottom-0 h-4 w-4 border-r-2 border-b-2 border-primary" />
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="font-body text-label-md text-on-surface">Quick QR Share</h4>
        <p className="max-w-[160px] text-xs text-on-surface-variant">
          Scan with any phone camera to view this advice instantly.
        </p>
      </div>
      <button
        type="button"
        className="flex items-center gap-1 font-body text-label-md text-primary hover:underline"
      >
        <MaterialIcon name="download" className="text-sm" />
        <span>Save Image</span>
      </button>
    </div>
  );
}
