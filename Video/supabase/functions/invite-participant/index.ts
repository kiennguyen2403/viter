import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { verifyToken } from "../utils/auth.ts";
import { Supabase } from "../utils/supabase.ts";

const STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
};

Deno.serve(async (req) => {
  try {
    const method = req.method;
    switch (method) {
      case "POST": {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response("Authorization header missing", {
            status: STATUS.UNAUTHORIZED,
          });
        }

        const bearerToken = authHeader.replace("Bearer ", "");
        const payload = await verifyToken(bearerToken);
        if (!payload) {
          return new Response("Unauthorized", { status: STATUS.UNAUTHORIZED });
        }

        const supabase = Supabase.getInstance(bearerToken);
        const { meetingId } = await req.json();

        // Validate meetingId
        if (!meetingId) {
          return new Response("meeting id is required", {
            status: STATUS.BAD_REQUEST,
          });
        }

        try {
          const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("token_identifier", payload.sub)
            .single();
          if (userError) {
            return new Response(`Error fetching user: ${userError.message}`, {
              status: STATUS.INTERNAL_SERVER_ERROR,
            });
          }

          await supabase.from("participants").insert({
            meeting_id: meetingId,
            user_id: user.id,
          });

          return new Response(JSON.stringify({ message: "Updating success" }), {
            status: STATUS.CREATED,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          if (error instanceof Error) {
            return new Response(error.message, { status: 500 });
          } else {
            return new Response("An unknown error occurred", { status: 500 });
          }
        }
      }
      default: {
        return new Response("Method not allowed", {
          status: STATUS.METHOD_NOT_ALLOWED,
        });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    } else {
      return new Response("An unknown error occurred", { status: 500 });
    }
  }
});
