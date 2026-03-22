import { describe, expect, it } from "vitest";

import { chatInputSchema } from "./chat.schema";

describe("chatInputSchema", () => {
  it("rejects empty prompt", () => {
    const parsed = chatInputSchema.safeParse("");
    expect(parsed.success).toBe(false);
  });

  it("accepts valid prompt", () => {
    const parsed = chatInputSchema.safeParse("hello world");
    expect(parsed.success).toBe(true);
  });
});
