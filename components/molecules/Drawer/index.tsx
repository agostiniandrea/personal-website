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
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "all" : "none")};
  transition: opacity 0.3s ease;
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
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
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
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 280px;
  background: ${({ theme }) => theme.colors.background};
  z-index: 300;
  display: flex;
  flex-direction: column;
  transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "100%")});
  transition: transform 0.3s ease;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.8);
`;

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ isOpen, id, "aria-label": ariaLabel, children }, ref) => {
    return (
      <StyledDrawer
        ref={ref}
        $isOpen={isOpen}
        id={id}
        aria-label={ariaLabel}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </StyledDrawer>
    );
  },
);

Drawer.displayName = "Drawer";
