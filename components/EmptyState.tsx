'use client';

const EXAMPLE_PROMPTS = [
  'Разбери текст рассылки',
  'Составь контент-план на месяц',
  'Сравни два заголовка',
  'Идеи постов для запуска',
];

interface EmptyStateProps {
  /** Подставляет текст примера в композер. */
  onPickExample: (text: string) => void;
}

export function EmptyState({ onPickExample }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <span className="grid h-[60px] w-[60px] place-items-center rounded-[18px] border border-accent-line bg-accent-wash">
        <span className="h-[22px] w-[22px] rounded-full bg-accent" />
      </span>
      <h2 className="mt-5 text-[25px] font-bold tracking-[-0.02em]">
        Новый диалог
      </h2>
      <p className="mt-2.5 max-w-[380px] text-[15px] leading-relaxed text-fg-dim">
        Спросите о тексте рассылки, попросите контент-план или разбор статьи —
        ассистент помнит контекст диалога.
      </p>

      <div className="mt-6 flex max-w-[460px] flex-wrap justify-center gap-2">
        {EXAMPLE_PROMPTS.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onPickExample(text)}
            className="rounded-pill border border-rule bg-bg-2 px-3.5 py-2 text-[13.5px] font-medium text-fg-2 transition-colors hover:border-accent-line hover:bg-accent-wash hover:text-fg"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
