import { useEffect, useRef } from "react";

interface TypewriterTextProps {
  content: string;
  speed?: number;
  /** Callback fired once the full text has been revealed. */
  onComplete?: () => void;
}

export function TypewriterText({ content, speed = 20, onComplete }: TypewriterTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (textRef.current) textRef.current.innerText = "";
    if (cursorRef.current) cursorRef.current.style.display = "inline-block";

    if (!content) {
      if (cursorRef.current) cursorRef.current.style.display = "none";
      return;
    }

    let currentIndex = 0;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const expectedIndex = Math.min(Math.floor(elapsedTime / speed), content.length);

      if (expectedIndex > currentIndex) {
        const newTextChunk = content.slice(currentIndex, expectedIndex);

        if (textRef.current) {
          textRef.current.innerText += newTextChunk;
        }

        currentIndex = expectedIndex;
      }

      if (currentIndex >= content.length) {
        clearInterval(interval);
        if (cursorRef.current) cursorRef.current.style.display = "none";
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [content, speed, onComplete]);

  return (
    <span>
      <span ref={textRef} />

      <span
        ref={cursorRef}
        className="ml-0.5 inline-block h-[1.1em] w-0.5 animate-pulse bg-current align-text-bottom"
      />
    </span>
  );
}
