import { useEffect, useRef, useState } from "react";

import { throttle } from "@/common/utils";

const SCROLL_DIRECTION = {
  up: "UP",
  down: "DOWN",
  init: "INIT",
} as const;
type DIRECTION = typeof SCROLL_DIRECTION[keyof typeof SCROLL_DIRECTION];

const OFFSET = 100;
const DELAY = 200;
export const useScrollDirection = () => {
  const prevScrollY = useRef(0);
  const [direction, setDirection] = useState<DIRECTION>(SCROLL_DIRECTION.init);
  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > prevScrollY.current + OFFSET) {
        // 위로 스크롤하는 중
        setDirection(SCROLL_DIRECTION.up);
      } else if (currentScrollY < prevScrollY.current - OFFSET) {
        // 아래로 스크롤하는 중
        setDirection(SCROLL_DIRECTION.down);
      }
      prevScrollY.current = currentScrollY;
    }, DELAY);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return direction;
};
