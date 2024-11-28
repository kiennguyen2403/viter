import { useEffect, useState } from "react";

import Popup from "./Popup";
import EditNote from "./icons/EditNote";
import Robot from "./icons/Robot";
import Code from "./icons/Code";
import WhiteboardPopup from "./WhiteBoardPopup";
import { Card, CardDescription, CardTitle } from "./ui/card";
import CodePopup from "./CodePopup";

interface WidgetPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (isOpen: boolean) => void; // New prop to inform parent about open state
}

const WidgetPopup = ({ isOpen, onClose, onOpenChange }: WidgetPopupProps) => {
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false); // State for WhiteboardPopup
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // State for ChatbotPopup
  const [isCodeOpen, setIsCodeOpen] = useState(false); // State for CodePopup

  useEffect(() => {}, []);
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  const handleItemClick = (action: string) => {
    switch (action) {
      case "Whiteboard":
        setIsWhiteboardOpen(true); // Open WhiteboardPopup
        break;
      case "Chatbot":
        setIsChatbotOpen(true); // Open ChatbotPopup
        break;
      case "Code":
        setIsCodeOpen(true); // Open CodePopup
        break;
      default:
        console.log("No action defined.");
    }
  };

  const items = [
    {
      icon: <EditNote />,
      title: "Whiteboard",
      description: "Note everything down",
      action: "Whiteboard",
    },
    {
      icon: <Robot />,
      title: "Chatbot",
      description: "Ask chatbot questions",
      action: "Chatbot",
    },
    {
      icon: <Code />,
      title: "Code",
      description: "Code editor",
      action: "Code",
    },
  ];

  return (
    <>
      <Popup
        open={isOpen}
        onClose={onClose}
        title={<h2>Widget</h2>}
        className="bottom-[5rem] right-4 left-auto w-[26%] h-[calc(100svh-6rem)] animate-slideInRight"
      >
        <div className="px-4 pb-3 pt-0 h-[calc(100%-66px)]">
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index}>
                <Card
                  onClick={() => handleItemClick(item.action)}
                  className="flex items-center space-x-4 bg-white p-3 rounded-lg shadow-md w-full text-left transition-all duration-300 ease-in-out transform hover:scale-103 bg-white shadow-lg rounded-xl p-4 text-gray-700 shadow-blue-gray-900/5 hover:shadow-xl cursor-pointer"
                >
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </Popup>

      {/* Render WhiteboardPopup conditionally */}
      {isWhiteboardOpen && (
        <WhiteboardPopup
          isOpen={isWhiteboardOpen}
          onClose={() => setIsWhiteboardOpen(false)} // Close WhiteboardPopup
          onOpenChange={(state) => setIsWhiteboardOpen(state)} // Optionally notify parent about state changes
        />
      )}
      {/* {
        isChatbotOpen && (
          <ChatbotPopup
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
          />
        )
      } */}
      {isCodeOpen && (
        <CodePopup isOpen={isCodeOpen} onClose={() => setIsCodeOpen(false)} />
      )}
    </>
  );
};

export default WidgetPopup;
