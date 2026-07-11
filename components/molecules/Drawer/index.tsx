import React from "react";
import styled from "styled-components";

// --- Overlay ---

interface OverlayProps {
  isOpen: boolean;
  onClick?: () => void;
}

interface StyledOverlayProps {
  $isOpen: boolean;
}

const StyledOverlay = styled.div<StyledOverlayProps>`
  background: rgba(0, 0, 0, 0.5);
  inset: 0;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "all" : "none")};
  position: fixed;
  transition: opacity 0.3s ease;
  z-index: 200;
`;

export const Overlay: React.FC<OverlayProps> = ({ isOpen, onClick }) => {
  return <StyledOverlay $isOpen={isOpen} onClick={onClick} />;
};

// --- DrawerTopBar ---

interface DrawerTopBarProps {
  children: React.ReactNode;
  className?: string;
}

export const DrawerTopBar: React.FC<DrawerTopBarProps> = ({
  children,
  className,
}) => {
  return (
    <StyledDrawerTopBar className={className}>{children}</StyledDrawerTopBar>
  );
};

const StyledDrawerTopBar = styled.div`
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.xl};
`;

// --- Drawer ---

interface DrawerProps {
  isOpen: boolean;
  id?: string;
  "aria-label"?: string;
  children: React.ReactNode;
}

interface StyledDrawerProps {
  $isOpen: boolean;
}

const StyledDrawer = styled.div<StyledDrawerProps>`
  background: ${({ theme }) => theme.colors.background};
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: fixed;
  right: 0;
  top: 0;
  transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "100%")});
  transition: transform 0.3s ease;
  width: 280px;
  z-index: 300;
`;

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ isOpen, id, "aria-label": ariaLabel, children }, ref) => {
    return (
      <StyledDrawer
        ref={ref}
        $isOpen={isOpen}
        id={id}
        aria-label={isOpen ? ariaLabel : undefined}
        aria-hidden={isOpen ? undefined : true}
        inert={isOpen ? undefined : true}
        role={isOpen ? "dialog" : undefined}
        aria-modal={isOpen ? "true" : undefined}
      >
        {children}
      </StyledDrawer>
    );
  },
);

Drawer.displayName = "Drawer";
