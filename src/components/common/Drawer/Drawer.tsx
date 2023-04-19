import type { PropsWithChildren, ReactNode } from "react";
import { css } from "twin.macro";

import { Portal } from "@/components/common/Portal";

import { DrawerContextProvider, useDrawerContext, useSetDrawerContext } from "./context";

export const Drawer = ({ children }: PropsWithChildren) => {
  return (
    <DrawerContextProvider>
      {/* NOTE: 공백 문자 제거 */}
      <section css={{ fontSize: 0 }}>{children}</section>
    </DrawerContextProvider>
  );
};

interface DrawerTriggerProps {
  children: ({ isOpen }: { isOpen: boolean }) => ReactNode;
}
const DrawerTrigger = ({ children }: DrawerTriggerProps) => {
  const isOpen = useDrawerContext();
  const setIsOpen = useSetDrawerContext();

  return <button onClick={() => setIsOpen(!isOpen)}>{children({ isOpen })}</button>;
};

interface DrawerContentProps {
  className?: string;
  children: ReactNode;
  direction: "left" | "right" | "top" | "bottom";
  top?: string | number;
}
const DrawerContent = ({
  children,
  className = "",
  direction = "right",
  top = "5.4rem",
}: DrawerContentProps) => {
  const isOpen = useDrawerContext();

  return (
    <Portal id="drawer-portal">
      <div
        className={className}
        css={css`
          position: fixed;
          pointer-events: ${isOpen ? "auto" : "none"};
          min-height: calc(100vh - ${top});
          inset: 0;
          z-index: 20;
          max-width: 48rem;
          overflow: hidden;
          margin-inline: auto;
          margin-top: ${top};
        `}
      >
        <section
          css={[
            css`
              visibility: hidden;
              transform: translateX(
                  ${direction === "right" ? "110%" : direction === "left" ? "-110%" : 0}
                )
                translateY(${direction === "top" ? "-110%" : direction === "bottom" ? "110%" : 0});
              will-change: transform;
              transition: transform 0.4s ease, visibility 0s ease 0.4s;
              overflow: auto;
              padding-inline: 2rem;
              height: 100%;
              background: white;
            `,
            isOpen &&
              css`
                visibility: visible;
                transform: translateX(0);
                transition: transform 0.4s ease;
              `,
          ]}
        >
          {children}
        </section>
      </div>
    </Portal>
  );
};

Drawer.Trigger = DrawerTrigger;
Drawer.Content = DrawerContent;
