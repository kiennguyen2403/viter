import React, { useRef } from "react";

import ContentCopy from "./icons/ContentCopy";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ClipboardProps {
  value: string;
}

const Clipboard = ({ value }: ClipboardProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = () => {
    if (inputRef.current) {
      inputRef.current.select();
      navigator.clipboard.writeText(inputRef.current.value);
    }
  };

  return (
    <div className="relative">
      <Input
        type="text"
        ref={inputRef}
        onChange={(e) => e.preventDefault()}
        value={value}
      />
      <Button
        variant={"ghost"}
        onClick={copyToClipboard}
        className="absolute right-0 top-0 items-center justify-center duration-200"
      >
        <ContentCopy />
      </Button>
    </div>
  );
};

export default Clipboard;
