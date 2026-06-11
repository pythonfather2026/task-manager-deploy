import type { ModelId } from '@/lib/mock-data';
import { AssistantAvatar } from '@/components/Message';

/** Пузырь «ассистент печатает…» — три пульсирующие точки. */
export function TypingIndicator({ modelId }: { modelId: ModelId }) {
  return (
    <div className="mb-8 flex justify-start gap-3.5" aria-label="Ассистент печатает">
      <AssistantAvatar modelId={modelId} />
      <div className="flex items-center gap-1.5 rounded-lg rounded-tl-xs border border-rule-2 bg-bg-2 px-[18px] py-[18px] shadow-xs">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
