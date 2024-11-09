import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { verifyToken } from "../utils/auth.ts";
import { Supabase } from "../utils/supabase.ts";
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

        const { data: userData, error: userError } = await supabase.from("users")
            .select("id")
            .eq(
                "token_identifier",
                payload.sub,
            ).single();
        if (userError) {
            return new Response(userError.message, { status: STATUS.UNAUTHORIZED });
        }

        switch (method) {
            case "POST": {
                const body = await req.json();
                const { error } = await supabase.rpc("append_queue", body)
                if (error) {
                    return new Response(error.message, { status: STATUS.INTERNAL_SERVER_ERROR });
                }


                return new Response("Success", { status: STATUS.OK });
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