import { memo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UPLOAD_OPTIONS } from "@/features/chat/lib/config";
import { Plus } from "lucide-react";

type UploadMenuProps = {
  isSubmitting: boolean;
  onTriggerSelect: (accept?: string) => void;
};

export const UploadMenu = memo(function UploadMenu({ isSubmitting, onTriggerSelect }: UploadMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button type="button" size="icon" variant="outline" disabled={isSubmitting} aria-label="Open upload menu">
              <Plus aria-hidden="true" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload files and more features</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent onCloseAutoFocus={(e) => e.preventDefault()} align="start" className="w-72 px-0 py-2">
        {UPLOAD_OPTIONS.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.label}
              variant={"ghost"}
              type="button"
              onClick={() => {
                if (item.accept) {
                  onTriggerSelect(item.accept);
                }
                setOpen(false);
              }}
              className="flex h-12 w-full cursor-pointer items-center justify-start gap-2 rounded-none"
            >
              <Icon className="text-muted-foreground size-4" aria-hidden="true" />
              <span className="flex min-w-0 flex-col text-left">
                <span className="truncate text-sm">{item.label}</span>
                <span className="text-muted-foreground truncate text-xs">{item.description}</span>
              </span>
            </Button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
});
