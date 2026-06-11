'use client';

import { useState } from 'react';
import { modelById, type ChatMessage, type ModelId } from '@/lib/mock-data';
import { BookIcon, ChevronDownIcon, CopyIcon } from '@/components/icons';

export function AssistantAvatar({ modelId }: { modelId: ModelId }) {
  const model = modelById(modelId);
  return (
    <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-[9px] border border-accent-line bg-accent-wash">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: model.color }}
      />
    </span>
  );
}

interface MessageProps {
  message: ChatMessage;
  modelId: ModelId;
  onCopy: (content: string) => void;
}

export function Message({ message, modelId, onCopy }: MessageProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false);

  if (message.role === 'user') {
    return (
      <div className="mb-7 flex justify-end">
        <div className="max-w-[74%] whitespace-pre-line rounded-lg rounded-br-xs bg-accent px-[18px] py-3 text-[15px] leading-[1.65] text-on-accent shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  const sources = message.sources ?? [];

  return (
    <div className="mb-8 flex justify-start gap-3.5">
      <AssistantAvatar modelId={modelId} />
      <div className="min-w-0 max-w-[88%]">
        <div className="whitespace-pre-line rounded-lg rounded-tl-xs border border-rule-2 bg-bg-2 px-[18px] py-3.5 text-[15.5px] leading-[1.7] text-fg shadow-xs">
          {message.content}

          {sources.length > 0 && (
            <div className="mt-3.5 border-t border-rule-2 pt-3">
              <button
                type="button"
                aria-expanded={sourcesOpen}
                onClick={() => setSourcesOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-accent-line bg-accent-wash px-3 py-1.5 text-[12.5px] font-semibold text-accent-deep transition-colors hover:bg-accent-line"
              >
                <BookIcon size={13} />
                Источники ({sources.length})
                <span
                  className={`transition-transform ${sourcesOpen ? 'rotate-180' : ''}`}
                >
                  <ChevronDownIcon size={13} />
                </span>
              </button>

              {sourcesOpen && (
                <ul className="mt-2.5 space-y-1.5">
                  {sources.map((source) => (
                    <li
                      key={source}
                      className="flex items-baseline gap-2 text-[13.5px] leading-snug text-fg-2"
                    >
                      <span className="h-1.5 w-1.5 flex-none translate-y-px rounded-full bg-accent" />
                      {source}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Действия под сообщением */}
        <div className="mt-1.5 flex items-center gap-1 pl-1">
          <button
            type="button"
            title="Скопировать"
            onClick={() => onCopy(message.content)}
            className="flex items-center gap-1.5 rounded-xs px-2 py-1 text-xs font-medium text-fg-dim transition-colors hover:bg-bg-3 hover:text-fg-2"
          >
            <CopyIcon size={13} />
            Скопировать
          </button>
        </div>
      </div>
    </div>
  );
}
