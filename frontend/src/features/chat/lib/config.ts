import {
  Clapperboard,
  FileText,
  FileUp,
  Image,
  ImageUp,
  LayoutTemplate,
  Palette,
  Presentation,
  SlidersHorizontal,
  Sparkles,
  Sticker,
} from "lucide-react";

const MODEL_OPTIONS = [
  {
    value: "google-gemini-3.1-pro",
    name: "Google Gemini 3.1 Pro",
    description: "Fast multi-step reasoning",
    icon: "Sparkles",
    isNew: true,
    locked: true,
  },
  {
    value: "anthropic-claude-opus-4.6",
    name: "Anthropic Claude Opus 4.6",
    description: "High quality long-form output",
    icon: "Sparkles",
  },
  {
    value: "google-nano-banana-2",
    name: "Google Nano Banana 2",
    description: "Lightweight image generation",
    icon: "Sparkles",
  },
  {
    value: "kling-3.0-image",
    name: "Kling 3.0 Image",
    description: "Cinematic visual style",
    icon: "Sparkles",
  },
];

const TOOL_OPTIONS = [
  { label: "Design", description: "Create visual layouts", icon: Palette },
  { label: "Document", description: "Draft structured text", icon: FileText },
  {
    label: "Presentation",
    description: "Build slide content",
    icon: Presentation,
  },
  { label: "Image", description: "Generate image prompts", icon: Image },
  { label: "Video", description: "Outline video concepts", icon: Clapperboard },
  {
    label: "Templates",
    description: "Start from ready formats",
    icon: LayoutTemplate,
  },
  {
    label: "AI Rewrite",
    description: "Improve tone and clarity",
    icon: Sparkles,
  },
  {
    label: "Style Controls",
    description: "Tune output style",
    icon: SlidersHorizontal,
  },
];

const UPLOAD_OPTIONS = [
  {
    label: "Upload files",
    description: "Attach docs and PDFs",
    icon: FileUp,
    accept: ".pdf,.doc,.docx,.txt,.rtf,.csv",
  },
  {
    label: "Upload photos",
    description: "Add images from device",
    icon: ImageUp,
    accept: "image/*",
  },
  {
    label: "Upload logo",
    description: "Use branding assets",
    icon: Sticker,
    accept: "image/*",
  },
];

export { MODEL_OPTIONS, TOOL_OPTIONS, UPLOAD_OPTIONS };
