import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { verifyToken } from "../utils/auth.ts";
import { Supabase } from "../utils/supabase.ts";
import { STATUS } from "../type/type.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
    try {
        const method = req.method;

        const authHeader = req.headers.get("Authorization")!;
        if (!authHeader) {
            return new Response("Authorization header missing", {
                status: STATUS.UNAUTHORIZED,
            });
        }

        const token = authHeader.replace("Bearer ", "");

        const payload = await verifyToken(token);

        if (method === "OPTIONS") {
            return new Response("ok", { headers: corsHeaders });
        }
        
        if (!payload) {
            return new Response("Unauthorized", {
                status: STATUS.UNAUTHORIZED,
            });
        }

        const supabase = Supabase.getInstance(token);

        const { error: userError } = await supabase.from("users")
            .select("id")
            .eq(
                "token_identifier",
                payload.sub,
            ).single();
        if (userError) {
            return new Response(userError.message, {
                status: STATUS.UNAUTHORIZED,
            });
        }

        switch (method) {
            case "POST": {
                const { code, language, problemId } = await req.json();
                if (!code || !language) {
                    return new Response("Code or language missing", {
                        status: STATUS.BAD_REQUEST,
                    });
                }
                const result = await fetch(Deno.env.get("CODE_EXECUTOR_URL")!, {
                    method: "POST",
                    body: JSON.stringify({ code, language }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const { data, error } = await supabase
                    .from("leetcode-questions")
                    .select("*")
                    .eq("id", problemId);

                if (error) {
                    return new Response(error.message, {
                        status: STATUS.INTERNAL_SERVER_ERROR,
                    });
                }

                const resultJson = await result.json();
                return new Response(
                    JSON.stringify({ result: resultJson == data }),
                    { status: STATUS.OK },
                );
            }
            default: {
                return new Response("Method not allowed", {
                    status: STATUS.METHOD_NOT_ALLOWED,
                });
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, {
                status: STATUS.INTERNAL_SERVER_ERROR,
            });
        } else {
            return new Response("An unknown error occurred", {
                status: STATUS.INTERNAL_SERVER_ERROR,
            });
        }
    }
});
