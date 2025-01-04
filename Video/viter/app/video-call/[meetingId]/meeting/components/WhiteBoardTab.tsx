import Spinner from "@/components/Spinner";
import { useEffect, useRef, useState } from "react";

export default function WhiteBoardTab() {
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const hasCreatedPaperRef = useRef(false);
  const hasRequestedAccessRef = useRef(false);

  useEffect(() => {
    const createPaper = async () => {
      try {
        setIsFetching(true);
        hasCreatedPaperRef.current = true; // Set the ref to prevent further calls
        const response = await fetch("https://api.pixelpaper.io/api/paper", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_WHITE_BOARD_API}`,
          },
          body: JSON.stringify({ name: "My First PixelPaper" }),
        });

        if (response.ok) {
          const data = await response.json();
          setIdentifier(data.identifier);
          if (!hasRequestedAccessRef.current) {
            await requestAccessToken(data.identifier);
          }
        } else {
          console.error("Failed to create paper:", response.statusText);
        }
      } catch (error) {
        console.error("Error creating paper:", error);
      } finally {
        hasCreatedPaperRef.current = true;
        setIsFetching(false);
      }
    };

    if (!hasCreatedPaperRef.current) {
      createPaper();
    }
  }, []);

  const requestAccessToken = async (identifier: string) => {
    try {
      console.log("Requesting access token...", identifier);
      const response = await fetch(
        `https://api.pixelpaper.io/api/access-token/${identifier}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_WHITE_BOARD_API}`,
          },
          body: JSON.stringify({ name: "James Smith" }),
        }
      );

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          // Read the response as JSON if the content type is JSON
          const data = await response.json();
          console.log("Access token data:", data);
          if (data.token) {
            setAccessToken(data.token);
          } else {
            console.error("Unexpected JSON response format:", data);
          }
        } else {
          // Read the response as plain text if it's not JSON
          const token = await response.text();
          console.log("Access token (plain text):", token);
          setAccessToken(token);
        }
      } else {
        console.error("Failed to request access token:", response.statusText);
      }
    } catch (error) {
      console.error("Error requesting access token:", error);
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      {!isFetching ? (
        <iframe
          src={`https://app.pixelpaper.io/room/${identifier}?token=${accessToken}`}
          className="h-full w-full"
          allow="clipboard-read; clipboard-write"
        ></iframe>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
}
