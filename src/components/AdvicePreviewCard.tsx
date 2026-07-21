import Image from "next/image";
import { MaterialIcon } from "@/components/MaterialIcon";

const ADVICE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCKsshidpCmIelbbnwQkY9qM0HRdj6Y7VSi11ZZA17XusfvczNw3yT7CPLOK_DswD5PeC73iSeghiTfY9MR5LqMR993BJ-B_2xuzKGQIeRFV1ZQ0SBp9JLu6Dg3tTf08frZtAwERGC5DLRcXyoipvddl_yLKNMaLld6OW52FEeb19My9uVVU7h1RFH8xwjbTdoabWvEpVR2pbOX-5TBqxpWwKaWSGg0SbwJLsIiRHA-XH8NnB7M-RBaaBsSr-pW7W9GHsmzAuxiIhCv";

type AdvicePreviewCardProps = {
  title: string;
  category?: string;
  summary?: string;
};

export function AdvicePreviewCard({
  title,
  category = "Natural Remedy",
  summary = "Learn how to use gentle coconut oil, oat baths, and breathability to soothe your baby's skin naturally and effectively.",
}: AdvicePreviewCardProps) {
  return (
    <article className="coral-shadow overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest transition-all duration-300 hover:scale-[1.01]">
      <div className="relative h-48 w-full">
        <Image
          src={ADVICE_IMAGE}
          alt="Soft warm scene with baby care essentials in peach and cream tones"
          fill
          className="object-cover"
          sizes="(max-width: 576px) 100vw, 576px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute right-4 bottom-4 left-4">
          <span className="mb-2 inline-block rounded bg-secondary-container/90 px-2 py-1 text-xs font-bold tracking-wider text-on-secondary-container uppercase">
            {category}
          </span>
          <h3 className="font-headline text-headline-md text-white drop-shadow-sm">{title}</h3>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <p className="line-clamp-2 text-sm text-on-surface-variant">{summary}</p>
        <div className="flex items-center gap-2 font-body text-label-md text-primary">
          <MaterialIcon name="groups" className="text-sm" />
          <span>From the community</span>
        </div>
      </div>
    </article>
  );
}
