import { Lock, Sparkles } from "lucide-react";
import { memo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ChatFormModel } from "../../hooks/useChatForm";
import { MODEL_OPTIONS } from "../../lib/config";

type ModelSelectorProps = {
  disabled: boolean;
  selectedModel: ChatFormModel;
  onChange: (model: ChatFormModel) => void;
};

export const ModelSelector = memo(function ModelSelector({ disabled, selectedModel, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelectModel = (model: ChatFormModel) => {
    onChange(model);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={disabled} aria-label="Choose AI model">
              <Sparkles className="size-4" aria-hidden="true" />
              {selectedModel.name}
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Select AI model</p>
        </TooltipContent>
      </Tooltip>

      <DialogContent onCloseAutoFocus={(e) => e.preventDefault()} className="gap-3 p-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Select Model</DialogTitle>
          <DialogDescription>Pick a mock model for UI preview.</DialogDescription>
        </DialogHeader>

        <Command>
          <CommandInput placeholder="Search models..." aria-label="Search models" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>

            <CommandGroup heading="Text">
              {MODEL_OPTIONS.slice(0, 2).map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={() => handleSelectModel(model)}
                  className="justify-between"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0">
                      <p className="truncate">{model.name}</p>
                      <p className="text-muted-foreground truncate text-xs">{model.description}</p>
                    </div>
                    {model.isNew && <Badge variant="secondary">New</Badge>}
                  </div>
                  {model.locked && <Lock className="text-muted-foreground size-4" aria-hidden="true" />}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Image">
              {MODEL_OPTIONS.slice(2).map((model) => (
                <CommandItem key={model.value} value={model.value} onSelect={() => handleSelectModel(model)}>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm">{model.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{model.description}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
});
