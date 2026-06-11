'use client';

import { useEffect, useRef, useState } from 'react';
import { MODELS, modelById, type ModelId } from '@/lib/mock-data';
import { CheckIcon, ChevronDownIcon } from '@/components/icons';

/** Цветная точка модели с мягким ореолом в цвет — как в карточке и дропдауне. */
export function ModelDot({ color, size = 10 }: { color: string; size?: number }) {
  return (
    <span
      className="flex-none rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 0 3px ${color}2e`,
      }}
    />
  );
}

interface ModelSelectProps {
  modelId: ModelId;
  onChange: (id: ModelId) => void;
}

/** Карточка выбора модели внизу сайдбара: точка, имя, подпись, дропдаун вверх. */
export function ModelSelect({ modelId, onChange }: ModelSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const model = modelById(modelId);

  // Закрываем дропдаун по клику вне компонента и по Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function select(id: ModelId) {
    onChange(id);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      {open && (
        <ul
          role="listbox"
          aria-label="Выбор модели"
          className="absolute bottom-full left-0 right-0 z-20 mb-2 rounded-md border border-rule bg-bg-2 p-1.5 shadow-lg"
        >
          <li className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-fg-dim">
            Нейросеть
          </li>
          {MODELS.map((m) => {
            const selected = m.id === modelId;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => select(m.id)}
                  className={`flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left transition-colors ${
                    selected ? 'bg-accent-wash' : 'hover:bg-bg-3'
                  }`}
                >
                  <ModelDot color={m.color} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-fg">
                      {m.name}
                    </span>
                    <span className="block text-[11.5px] text-fg-dim">
                      {m.vendor}
                    </span>
                  </span>
                  {selected && (
                    <span className="text-accent">
                      <CheckIcon size={15} />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-md border border-rule bg-bg-2 px-3 py-2.5 text-left transition-colors hover:border-accent-line"
      >
        <ModelDot color={model.color} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold text-fg">
            {model.name}
          </span>
          <span className="block text-[11px] text-fg-dim">
            Активная нейросеть
          </span>
        </span>
        <span
          className={`flex-none text-fg-dim transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <ChevronDownIcon size={16} />
        </span>
      </button>
    </div>
  );
}
