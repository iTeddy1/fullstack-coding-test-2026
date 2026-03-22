import { Download, FileText } from "lucide-react";

export function MessageFileAttachment({ url, name, isUser }: { url: string; name: string; isUser: boolean }) {
  if (isUser)
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/15 hover:border-primary-foreground/30 flex w-full max-w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all hover:shadow-sm sm:w-auto sm:max-w-[24rem]"
      >
        <div className="bg-primary-foreground/15 flex size-8 shrink-0 items-center justify-center rounded-lg">
          <FileText className="text-primary-foreground/80 size-4" aria-hidden="true" />
        </div>
        <span className="text-primary-foreground min-w-0 flex-1 truncate text-xs font-medium">{name}</span>
        <Download className="text-primary-foreground/60 size-3.5 shrink-0" aria-hidden="true" />
      </a>
    );

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="border-border/60 bg-muted/50 hover:bg-muted/80 hover:border-border flex w-full max-w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all hover:shadow-sm sm:w-auto sm:max-w-[24rem]"
    >
      <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg">
        <FileText className="text-muted-foreground size-4" aria-hidden="true" />
      </div>
      <span className="text-foreground min-w-0 flex-1 truncate text-xs font-medium">{name}</span>
      <Download className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
    </a>
  );
}
