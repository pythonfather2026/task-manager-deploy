'use client';

import { modelById, type ModelId } from '@/lib/mock-data';
import { ModelDot } from '@/components/ModelSelect';

interface ChatHeaderProps {
  title: string;
  modelId: ModelId;
  useSources: boolean;
  onToggleSources: () => void;
}

export function ChatHeader({
  title,
  modelId,
  useSources,
  onToggleSources,
}: ChatHeaderProps) {
  const model = modelById(modelId);

  return (
    <header className="flex items-center gap-4 border-b border-rule bg-bg px-6 py-4 lg:px-10">
      {/* Название чата + активная модель */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15.5px] font-bold tracking-tight">
          {title}
        </h1>
        <p className="mt-1 flex items-center gap-[7px] text-[12.5px] text-fg-dim">
          <ModelDot color={model.color} size={6} />
          <span className="truncate">{model.name} · с памятью</span>
        </p>
      </div>

      {/* Тумблер «Опираться на материалы» */}
      <div className="flex flex-none items-center gap-2">
        <span className="hidden text-[12.5px] font-medium text-fg-dim sm:block">
          Опираться на материалы
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={useSources}
          aria-label="Опираться на материалы"
          onClick={onToggleSources}
          className={`relative inline-flex h-[18px] w-8 flex-none items-center rounded-full transition-colors ${
            useSources ? 'bg-accent' : 'bg-fg-dim'
          }`}
        >
          <span
            className={`absolute h-3.5 w-3.5 rounded-full bg-on-accent shadow-xs transition-all ${
              useSources ? 'left-[16px]' : 'left-[2px]'
            }`}
          />
        </button>
      </div>
    </header>
  );
}
