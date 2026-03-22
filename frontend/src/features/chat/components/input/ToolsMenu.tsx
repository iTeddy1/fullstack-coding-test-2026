import { Check, SlidersHorizontal } from "lucide-react";
import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ChatFormTool } from "../../hooks/useChatForm";
import { TOOL_OPTIONS } from "../../lib/config";

type ToolsMenuProps = {
  disabled: boolean;
  selectedTool: ChatFormTool;
  onChange: (tool: ChatFormTool) => void;
};

export const ToolsMenu = memo(function ToolsMenu({ disabled, selectedTool, onChange }: ToolsMenuProps) {
  const [open, setOpen] = useState(false);

  const handleSelectTool = (toolLabel: string) => {
    const nextTool = TOOL_OPTIONS.find((tool) => tool.label === toolLabel) ?? null;
    onChange(nextTool);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={disabled} aria-label="Open tools menu">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              {selectedTool?.label ?? "Tools"}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent onCloseAutoFocus={(e) => e.preventDefault()} align="start" className="w-75 px-0 py-2">
        <ScrollArea className="mt-1 h-52 pr-1">
          <div className="flex flex-col">
            {TOOL_OPTIONS.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTool?.label === tool.label;

              return (
                <Button
                  key={tool.label}
                  variant={"ghost"}
                  type="button"
                  onClick={() => handleSelectTool(tool.label)}
                  className={cn(
                    "flex h-12 w-full cursor-pointer items-center justify-start gap-2 rounded-none border-none",
                    isSelected && "bg-accent/50 text-accent-foreground font-medium",
                  )}
                >
                  <Icon className="text-muted-foreground size-4" aria-hidden="true" />
                  <span className="flex min-w-0 flex-col text-left">
                    <span className="truncate text-sm">{tool.label}</span>
                    <span className="text-muted-foreground truncate text-xs">{tool.description}</span>
                  </span>
                  {isSelected ? <Check className="ml-auto h-4 w-4" aria-hidden="true" /> : null}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
});
