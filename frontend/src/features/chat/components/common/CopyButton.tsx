import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export function CopyButton({ text }: { text: string }) {
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Message copied to clipboard");

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy message");
    }
  }, [text]);

  return (
    <Button
      variant={"ghost"}
      size={"icon-sm"}
      type="button"
      onClick={handleCopy}
      disabled={isCopied}
      aria-label={isCopied ? "Copied" : "Copy message"}
      className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center rounded-lg p-1.5 transition-colors"
    >
      {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}
