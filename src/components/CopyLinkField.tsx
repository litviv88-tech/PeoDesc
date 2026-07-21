"use client";

import { useState, useTransition } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";

type CopyLinkFieldProps = {
  url: string;
};

export function CopyLinkField({ url }: CopyLinkFieldProps) {
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  async function handleCopy() {
    let copiedOk = false;
    try {
      await navigator.clipboard.writeText(url);
      copiedOk = true;
    } catch {
      try {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        copiedOk = document.execCommand("copy");
        document.body.removeChild(input);
      } catch {
        copiedOk = false;
      }
    }

    if (!copiedOk) return;

    startTransition(() => setCopied(true));
    window.setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="space-y-4 rounded-xl border border-outline-variant/30 bg-white p-6">
      <label htmlFor="share-link" className="font-body text-label-md text-on-surface-variant">
        Direct Link
      </label>
      <div className="relative flex items-center">
        <input
          id="share-link"
          className="w-full rounded-lg border-none bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant focus:ring-2 focus:ring-primary-container focus:outline-none"
          readOnly
          type="text"
          value={url}
        />
        <button
          type="button"
          onClick={handleCopy}
          className={`absolute right-2 rounded-lg px-4 py-1.5 font-body text-label-md text-on-primary transition-colors active:scale-95 ${
            copied ? "bg-secondary" : "bg-primary hover:bg-primary/90"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {copied ? (
        <div className="flex items-center gap-2 font-body text-label-sm text-secondary">
          <MaterialIcon name="check_circle" className="text-sm" />
          <span>Link copied to clipboard</span>
        </div>
      ) : null}
    </div>
  );
}
