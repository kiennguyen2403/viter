// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { verifyToken } from "../utils/auth.ts";
import { STATUS } from "../type/type.ts";

Deno.serve(async (req) => {
  try {
    const method = req.method;
    const authHeader = req.headers.get("Authorization")!;
    if (!authHeader) {
      return new Response("Authorization header missing", { status: STATUS.UNAUTHORIZED });
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);
    if (!payload) {
      return new Response("Unauthorized", { status: STATUS.UNAUTHORIZED });
    }

    switch (method) {
      case "GET": {
        const meetingId = req.url.split("/").pop();

        if (!meetingId) {
          return new Response("Meeting ID is required", { status: STATUS.BAD_REQUEST });
        }
        const { data: recording, error: recordingError } = await supabase
          .from("recordings")
          .select("*")
          .eq("meeting_id", meetingId)
          .single();

        if (recordingError) {
          return new Response(recordingError.message, { status: STATUS.INTERNAL_SERVER_ERROR });
        }
        const file = await supabase.storage
          .from("recordings")
          .createSignedUrl(recording.name, 60);
        if (file.error) {
          return new Response(file.error.message, { status: STATUS.INTERNAL_SERVER_ERROR });
        }
        return new Response(JSON.stringify(file.data), { status: STATUS.OK });
      }
      case "POST": {
        const formData = await req.formData();
        const { name } = formData.get("file") as File;
        const { meetingId } = formData.get("meetingId") as unknown as { meetingId: string };
        const { data, error } = await supabase.storage.from("storages").upload(
          name,
          name,
        );
        if (error) {
          return new Response(
            JSON.stringify(error),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        const { data: _, error: recordingError } = await supabase
          .from("recording")
          .insert([{ meetingId, bucketId: data.id, name }]);
        if (recordingError) {
          return new Response(recordingError.message, { status: STATUS.INTERNAL_SERVER_ERROR });
        }
        return new Response(null, { status: STATUS.CREATED });
      }
      default: {
        return new Response("Method not allowed", { status: STATUS.METHOD_NOT_ALLOWED });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: STATUS.INTERNAL_SERVER_ERROR });
    } else {
      return new Response("An unknown error occurred", { status: STATUS.INTERNAL_SERVER_ERROR });
    }
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/recordings' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
