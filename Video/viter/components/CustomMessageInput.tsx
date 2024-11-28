import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { useMessageInputContext } from "stream-chat-react";

const CustomMessageInput = () => {
  const { text, handleChange, handleSubmit } = useMessageInputContext();

  return (
    <div className="flex items-center p-2">
      <Input
        type="text"
        className="flex-1"
        placeholder="Type a message"
        value={text}
        onChange={
          handleChange as unknown as React.ChangeEventHandler<HTMLInputElement>
        }
      />
      <Button onClick={handleSubmit} className="ml-2">
        Send
      </Button>
    </div>
  );
};

export default CustomMessageInput;
