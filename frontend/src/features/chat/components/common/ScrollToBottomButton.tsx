import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { useScrollToBottom } from "../../hooks/useScrollToBottom";

export function ScrollToBottomButton() {
  const { scrollToBottom, showScrollButton } = useScrollToBottom();

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      aria-label="Scroll to bottom"
      onClick={() => scrollToBottom("smooth")}
      className={
        "hover:bg-secondary/90 rounded-full shadow-md transition-all duration-300" +
        (showScrollButton
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0")
      }
    >
      <ArrowDown className="size-4" />
    </Button>
  );
}
