export type NoticeState = { type: "success" | "error"; text: string } | null;

export function Notice({ notice }: { notice: NoticeState }) {
  if (!notice) return null;

  const style =
    notice.type === "success"
      ? "bg-green-50 text-green-800 border-green-200"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <p role="status" className={`rounded-lg border px-3 py-2 text-sm ${style}`}>
      {notice.text}
    </p>
  );
}
