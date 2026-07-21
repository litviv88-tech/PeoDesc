import { prisma } from "@/lib/prisma";
import { TopAppBar } from "@/components/TopAppBar";
import { BottomNav } from "@/components/BottomNav";
import { AdvicePreviewCard } from "@/components/AdvicePreviewCard";
import { CopyLinkField } from "@/components/CopyLinkField";
import { ShareSocial } from "@/components/ShareSocial";
import { QrShare } from "@/components/QrShare";
import { SupportMessage } from "@/components/SupportMessage";

export const dynamic = "force-dynamic";

const FALLBACK_ADVICE = {
  id: "r1029",
  title: "Natural remedies for mild diaper rash",
  category: "Natural Remedy",
  summary:
    "Learn how to use gentle coconut oil, oat baths, and breathability to soothe your baby's skin naturally and effectively.",
};

async function loadFeaturedAdvice() {
  try {
    const note = await prisma.note.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (!note) return { ok: true as const, advice: FALLBACK_ADVICE, fromDb: false };
    return {
      ok: true as const,
      advice: {
        id: note.id,
        title: note.title,
        category: "Parent Tip",
        summary:
          "A practical recommendation from the PeoDesc community — share it with someone who needs gentle, evidence-minded support today.",
      },
      fromDb: true,
    };
  } catch (error) {
    console.error("Failed to load advice:", error);
    return { ok: false as const, advice: FALLBACK_ADVICE, fromDb: false };
  }
}

export default async function Home() {
  const { advice, ok } = await loadFeaturedAdvice();
  const appOrigin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const shareUrl = `${appOrigin}/?advice=${advice.id}`;

  return (
    <div className="flex min-h-full flex-col pb-24">
      <TopAppBar />

      <main className="page-enter mx-auto min-h-[calc(100vh-140px)] w-full max-w-container-max px-gutter py-lg">
        <div className="mx-auto w-full max-w-xl space-y-lg">
          <div className="space-y-2 text-center">
            <h2 className="font-headline text-headline-lg-mobile text-primary md:text-headline-lg">
              Share Wisdom
            </h2>
            <p className="font-body text-body-md text-on-surface-variant">
              Empower others by sharing this nurturing advice.
            </p>
          </div>

          {!ok ? (
            <div
              className="rounded-xl border border-primary-container/30 bg-primary-container/10 px-4 py-3 text-sm text-on-primary-container"
              role="status"
            >
              Showing sample advice — database is temporarily unavailable.
            </div>
          ) : null}

          <AdvicePreviewCard
            title={advice.title}
            category={advice.category}
            summary={advice.summary}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <CopyLinkField url={shareUrl} />
              <ShareSocial />
            </div>
            <QrShare />
          </div>

          <SupportMessage />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
