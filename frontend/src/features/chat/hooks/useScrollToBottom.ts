import { useCallback, useEffect, useState } from "react";

export const useScrollToBottom = (threshold = 50) => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isNearBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight < threshold;
      setShowScrollButton(!isNearBottom);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return { scrollToBottom, showScrollButton };
};
