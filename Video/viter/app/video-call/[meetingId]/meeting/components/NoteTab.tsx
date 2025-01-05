"use client";

import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import { useState } from "react";

export default function NoteTab() {
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { user, isLoading } = useUser();
  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      if (!note || !user) return;
      await axios.post(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/note`,
        { note },
        {
          headers: { Authorization: `Bearer ${user?.accessToken || ""}` },
        }
      );
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center gap-4 p-4">
      {isLoading || isSubmitting ? (
        <div>
          <Spinner />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col gap-4">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter your note here..."
            className="w-full h-full"
          />
          <Button onClick={handleSave} disabled={isSubmitting}>
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
