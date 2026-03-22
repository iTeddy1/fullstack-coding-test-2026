import { cn } from "@/lib/utils";

export function MessageImageAttachment({ url, name, isUser }: { url: string; name: string; isUser: boolean }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-shadow hover:shadow-md",
        isUser
          ? "border-primary-foreground/20 hover:border-primary-foreground/40"
          : "border-border/60 hover:border-border",
      )}
    >
      <img src={url} alt={name} className="max-h-37.5 max-w-62.5 rounded-xl object-cover" loading="lazy" />
      {/* Hover overlay with filename */}
      <span
        className={cn(
          "absolute inset-x-0 bottom-0 truncate bg-linear-to-t px-2 py-1 text-[10px] font-medium opacity-0 transition-opacity group-hover:opacity-100",
          isUser ? "from-black/50 to-transparent text-white" : "from-black/40 to-transparent text-white",
        )}
      >
        {name}
      </span>
    </div>
  );
}
