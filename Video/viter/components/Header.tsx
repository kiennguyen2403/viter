/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import clsx from "clsx";
import useTime from "../hooks/useTime";
import UserButton from "./UserButton";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Settings from "./icons/Settings";
import NotificationIcon from "./icons/Notification";
import { getSupabase } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Mail from "./icons/Mail";
import Link from "next/link";

interface HeaderProps {
  navItems?: boolean;
  isSidebarOpen?: boolean;
}

interface Notification {
  type: string;
  content: string;
}

const Header = ({ navItems = true, isSidebarOpen = false }: HeaderProps) => {
  const { isLoading, user } = useUser();
  const router = useRouter();
  const { currentDateTime } = useTime();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!user || isInitialized.current) return;

    const supabase = getSupabase(user.accessToken as string);

    const fetchUserDataAndNotifications = async () => {
      try {
        isInitialized.current = true;

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("token_identifier", user.sub)
          .single();

        if (userError || !userData) {
          console.error("Error fetching user data:", userError);
          return;
        }

        const userId = userData.id;

        // Fetch notifications
        const { data: notificationData, error: notificationError } =
          await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .limit(5);

        if (notificationError) {
          console.error("Error fetching notifications:", notificationError);
          return;
        }

        setNotifications(notificationData);

        // Real-time subscription handlers
        const handleParticipantEvent = (payload: any) => {
          processEvent(payload, userId, "participant");
        };

        const handleMeetingEvent = (payload: any) => {
          processEvent(payload, userId, "meeting");
        };

        // Subscribe to participant and meeting changes
        const participantsChannel = supabase.channel(
          "realtime:user_participants"
        );

        participantsChannel
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "participants",
              filter: `user_id=eq.${userId}`,
            },
            handleParticipantEvent
          )
          .subscribe();

        const meetingsChannel = supabase.channel("realtime:user_meetings");

        meetingsChannel
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "meeting",
              filter: `participants.user_id=eq.${userId}`,
            },
            handleMeetingEvent
          )
          .subscribe();

        // Cleanup subscriptions
        return () => {
          supabase.removeChannel(participantsChannel);
          supabase.removeChannel(meetingsChannel);
        };
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    const processEvent = (
      payload: any,
      userId: string,
      type: "participant" | "meeting"
    ) => {
      setHasNewNotifications(true);

      const eventType = payload.eventType;
      const content = generateNotificationMessage(type, eventType, payload.new);

      if (content) {
        setNotifications((prev) => {
          const updatedNotifications = [{ type, content }, ...prev].slice(0, 5);
          return updatedNotifications;
        });

        // Save notification to database
        supabase.from("notifications").insert({ userId, type, content });
      }
    };

    const generateNotificationMessage = (
      type: string,
      eventType: string,
      newData: any
    ): string => {
      switch (type) {
        case "participant":
          if (eventType === "INSERT") return "You have been added to a meeting";
          if (eventType === "UPDATE")
            return `Your participant status is now ${newData?.status}`;
          if (eventType === "DELETE")
            return "You have been removed from a meeting";
          break;
        case "meeting":
          if (eventType === "INSERT")
            return "A new meeting has been scheduled for you";
          if (eventType === "UPDATE")
            return `Meeting details updated: ${newData?.status}`;
          if (eventType === "DELETE") return "A meeting has been canceled";
          break;
      }
      return "";
    };

    fetchUserDataAndNotifications();
  }, [user]);

  return (
    <header className="w-full px-4 pt-4 flex items-center justify-between bg-white flex-wrap sm:flex-nowrap">
      <div className="w-full sm:w-auto flex items-center cursor-default mb-2 sm:mb-0">
        {!isSidebarOpen && (
          <>
            <Link href="/#" className="flex items-center w-50 mr-5">
              <div className="font-product-sans text-2xl leading-6 text-meet-gray select-none">
                <span className="font-medium">Viter</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/jobs")}
            >
              Jobs
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center cursor-default flex-wrap gap-4">
        {navItems && (
          <>
            <div className="hidden md:flex items-center font-medium text-gray-600 select-none mr-4">
              {currentDateTime}
            </div>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Settings />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                  onClick={() => setHasNewNotifications(false)}
                >
                  <NotificationIcon />
                  {hasNewNotifications && (
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                {notifications.map((item, index) => (
                  <DropdownMenuItem key={index}>
                    <Mail />
                    <span>{item.content}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        {!isSidebarOpen && (
          <div
            className={clsx(
              "relative h-9",
              !isLoading ? "animate-fade-in" : "opacity-0"
            )}
          >
            {user ? (
              <UserButton user={user} />
            ) : (
              <Button size="sm" onClick={() => router.push("/api/auth/login")}>
                Sign In
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
