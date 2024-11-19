'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CallingState,
  hasScreenShare,
  isPinned,
  StreamTheme,
  useCall,
  useCallStateHooks,
  useConnectedUser,
} from "@stream-io/video-react-sdk";
import { Channel } from "stream-chat";
import { DefaultStreamChatGenerics, useChatContext } from "stream-chat-react";
import CallControlButton from "@/components/CallControlButton";
import CallInfoButton from "@/components/CallInfoButton";
import CallEndFilled from "@/components/icons/CallEndFilled";
import Chat from "@/components/icons/Chat";
import ChatFilled from "@/components/icons/ChatFilled";
import ChatPopup from "@/components/ChatPopup";
import GroupPopup from "@/components/GroupPopup";
import InfoPopup from "@/components/InfoPopup";
import WidgetPopup from "@/components/WidgetPopup";
import GridLayout from "@/components/GridLayout";
import SpeakerLayout from "@/components/SpeakerLayout";
import Group from "@/components/icons/Group";
import Info from "@/components/icons/Info";
import PresentToAll from "@/components/icons/PresentToAll";
import MeetingPopup from "@/components/MeetingPopup";
import ToggleAudioButton from "@/components/ToggleAudioButton";
import ToggleVideoButton from "@/components/ToggleVideoButton";
import useTime from "@/hooks/useTime";
import Widget from "@/components/icons/widget";

interface MeetingProps {
  params: {
    meetingId: string;
  };
}

const Meeting = ({ params }: MeetingProps) => {
  const { meetingId } = params;
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const call = useCall();
  const user = useConnectedUser();
  const { currentTime } = useTime();
  const { client: chatClient } = useChatContext();
  const { useCallCallingState, useParticipants, useScreenShareState } =
    useCallStateHooks();
  const participants = useParticipants();
  const { screenShare } = useScreenShareState();
  const callingState = useCallCallingState();

  const [chatChannel, setChatChannel] =
    useState<Channel<DefaultStreamChatGenerics>>();
  const [prevParticipantsCount, setPrevParticipantsCount] = useState(0);
  const isCreator = call?.state.createdBy?.id === user?.id;
  const isUnkownOrIdle =
    callingState === CallingState.UNKNOWN || callingState === CallingState.IDLE;

  // Use a single state variable for open popups
  const [openPopup, setOpenPopup] = useState<
    null | 'chat' | 'info' | 'group' | 'widget'
  >(null);

  // Participant in Spotlight
  const participantInSpotlight = participants.length > 0 ? participants[0] : null;

  // Effect for participant changes
  useEffect(() => {
    if (participants.length > prevParticipantsCount) {
      audioRef.current?.play();
    }
    setPrevParticipantsCount(participants.length);
  }, [participants.length, prevParticipantsCount]);

  // Effect for initializing chat channel
  useEffect(() => {
    const startup = async () => {
      if (isUnkownOrIdle) {
        router.push(`/${meetingId}`);
      } else if (chatClient && !chatChannel) {
        const channel = chatClient.channel("messaging", meetingId);
        setChatChannel(channel);
      }
    };
    startup();
    // Exclude chatChannel from dependencies to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, meetingId, isUnkownOrIdle, chatClient]);

  const isSpeakerLayout = useMemo(() => {
    if (participantInSpotlight) {
      return (
        hasScreenShare(participantInSpotlight) ||
        isPinned(participantInSpotlight)
      );
    }
    return false;
  }, [participantInSpotlight]);

  const leaveCall = async () => {
    await call?.leave();
    router.push(`/${meetingId}/meeting-end`);
  };

  const toggleScreenShare = async () => {
    try {
      await screenShare.toggle();
    } catch (error) {
      console.error(error);
    }
  };

  // Toggle function for popups
  const togglePopup = (popupName: 'chat' | 'info' | 'group' | 'widget') => {
    setOpenPopup((current) => (current === popupName ? null : popupName));
  };

  if (isUnkownOrIdle) return null;

  return (
    <StreamTheme className="root-theme">
      <div
        className={`relative w-full h-svh bg-meet-black overflow-hidden ${
          openPopup ? 'layout-adjusted' : ''
        }`}
      >
        {isSpeakerLayout && <SpeakerLayout />}
        {!isSpeakerLayout && <GridLayout />}
        <div className="absolute left-0 bottom-0 right-0 w-full h-20 bg-meet-black text-white text-center flex items-center justify-between">
          {/* Meeting ID */}
          <div className="hidden sm:flex grow shrink basis-1/4 items-center text-start justify-start ml-3 truncate max-w-full">
            <div className="flex items-center overflow-hidden mx-3 h-20 gap-3 select-none">
              <span className="font-medium">{currentTime}</span>
              <span>{"|"}</span>
              <span className="font-medium truncate">{meetingId}</span>
            </div>
          </div>
          {/* Meeting Controls */}
          <div className="relative flex grow shrink basis-1/4 items-center justify-center px-1.5 gap-3 ml-0">
            <ToggleAudioButton />
            <ToggleVideoButton />
            <CallControlButton
              onClick={toggleScreenShare}
              icon={<PresentToAll />}
              title={"Present now"}
            />
            <CallControlButton
              onClick={leaveCall}
              icon={<CallEndFilled />}
              title={"Leave call"}
              className="leave-call-button"
            />
          </div>
          {/* Meeting Info */}
          <div className="hidden sm:flex grow shrink basis-1/4 items-center justify-end mr-3">
            <CallInfoButton
              onClick={() => togglePopup('info')}
              icon={<Info />}
              title="Meeting details"
            />
            <CallInfoButton
              onClick={() => togglePopup('group')}
              icon={<Group />}
              title="People"
            />
            <CallInfoButton
              onClick={() => togglePopup('chat')}
              icon={
                openPopup === 'chat' ? (
                  <ChatFilled/>
                ) : (<Chat />)
              }
              title="Chat with everyone"
            />
            <CallInfoButton
              onClick={() => togglePopup('widget')}
              icon={<Widget />}
              title="Tools and widgets"
            />
          </div>
        </div>
        {/* Popups */}
        {openPopup === 'info' && (
          <InfoPopup
            isOpen={true}
            onClose={() => setOpenPopup(null)}
          />
        )}
        {openPopup === 'group' && (
          <GroupPopup
            isOpen={true}
            onClose={() => setOpenPopup(null)}
          />
        )}
        {openPopup === 'chat' && chatChannel && (
          <ChatPopup
            channel={chatChannel}
            isOpen={true}
            onClose={() => setOpenPopup(null)}
          />
        )}
        {openPopup === 'widget' && (
          <WidgetPopup
            isOpen={true}
            onClose={() => setOpenPopup(null)}
          />
        )}
        {isCreator && <MeetingPopup />}
        <audio
          ref={audioRef}
          src="https://www.gstatic.com/meet/sounds/join_call_6a6a67d6bcc7a4e373ed40fdeff3930a.ogg"
        />
      </div>
    </StreamTheme>
  );
};

export default Meeting;
