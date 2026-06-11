/** Простой тост-уведомление внизу экрана; null — скрыт. */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="toast-in fixed bottom-7 left-1/2 z-50 -translate-x-1/2 rounded-full bg-fg px-4 py-2 text-[13px] font-semibold text-bg-2 shadow-md"
    >
      {message}
    </div>
  );
}
