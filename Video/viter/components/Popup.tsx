import React, { forwardRef, ReactNode } from "react";
import { Button } from "./ui/button";
import clsx from "clsx";

import Close from "./icons/Close";

interface PopupProps {
  className?: string;
  children: ReactNode;
  height?: number;
  title?: ReactNode;
  onClose?: () => void;
  open?: boolean;
}

const Popup = forwardRef<HTMLDivElement | null, PopupProps>(function Popup(
  { className, children, height = 305, title, onClose, open = false },
  ref = null
) {
  const closePopup = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      ref={ref}
      className={clsx(
        open ? "block" : "hidden",
        `h-[${height}px]`,
        "z-10 bg-white fixed top-auto right-4 max-w-3xl w-[26%] rounded-lg shadow-[0_1px_2px_0_rgba(60,_64,_67,_.3),_0_2px_6px_2px_rgba(60,_64,_67,_.15)]",
        className
      )}
    >
      {title && (
        <div className="flex items-center text-meet-black pt-3 pl-6 pb-0 pr-3">
          <div className="text-md leading-6 grow my-[15px] tracking-normal">
            {title}
          </div>
          <Button variant={"ghost"} onClick={closePopup}>
            <Close />
          </Button>
        </div>
      )}
      {children}
    </div>
  );
});

export default Popup;
