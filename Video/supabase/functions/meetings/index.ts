import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { verifyToken } from "../utils/auth.ts";
import { Application, Router } from "oak";
import { oakCors } from "cors";

const router = new Router();
router
  .options("/meetings", (ctx) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    ctx.response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    ctx.response.status = 200;
  })
  .get("/meetings", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const supabase = Supabase.getInstance(token);
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();
    if (userError) {
      ctx.response.status = 500;
      ctx.response.body = `Error fetching user: ${userError.message}`;
      return;
    }
    const query = ctx.request.url.searchParams;
    const nanoid = query.get("nanoid");

    if (nanoid) {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("nano_id", nanoid)
        .single();
      if (error) {
        ctx.response.status = 500;
        ctx.response.body = `Error fetching meeting: ${error.message}`;
        return;
      }
      ctx.response.body = JSON.stringify(data);
      return;
    }

    const { data, error } = await supabase
      .from("meetings")
      .select("*, participants!inner(user_id)")
      .eq("participants.user_id", userData.id);
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = `Error fetching meetings: ${error.message}`;
      return;
    }

    ctx.response.body = JSON.stringify(data);
  })
  .get("/meetings/:id", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const supabase = Supabase.getInstance(token);
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();
    if (userError) {
      ctx.response.status = 500;
      ctx.response.body = `Error fetching user: ${userError.message}`;
      return;
    }
    const id = ctx.params.id;
    const { data, error } = await supabase
      .from("meetings")
      .select("*, participants!inner(user_id)")
      .eq("participants.user_id", userData.id)
      .eq("participants.meeting_id", id)
      .single();
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = `Error fetching meeting: ${error.message}`;
      return;
    }
    ctx.response.body = JSON.stringify(data);
  })
  .get("/meetings/:id/participants", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const supabase = Supabase.getInstance(token);
    const id = ctx.params.id;
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("meeting_id", id);
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = `Error fetching participants: ${error.message}`;
      return;
    }
    ctx.response.body = JSON.stringify(data);
  })
  .get("/meetings/:id/notes", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const supabase = Supabase.getInstance(token);
    const id = ctx.params.id;
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("meeting_id", id);
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = `Error fetching notes: ${error.message}`;
      return;
    }
    ctx.response.body = JSON.stringify(data);
  })
  .post("/meetings", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const supabase = Supabase.getInstance(token);

    const body = await ctx.request.body.json();
    const { data, error } = await supabase
      .from("meetings")
      .insert(body)
      .select();
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = `Error creating meeting: ${error.message}`;
      return;
    }
    ctx.response.body = JSON.stringify(data);
  })
  .post("/meetings/:id/notes", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const supabase = Supabase.getInstance(token);
    const id = ctx.params.id;
    const body = await ctx.request.body.json();
    const { data, error } = await supabase
      .from("notes")
      .insert({ ...body, meeting_id: id })
      .select();
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = `Error creating note: ${error.message}`;
      return;
    }
    ctx.response.body = JSON.stringify(data);
  })
  .post("/meetings/:id/participants", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const supabase = Supabase.getInstance(token);
    const id = ctx.params.id;
    const body = await ctx.request.body.json();
    const { data, error } = await supabase
      .from("participants")
      .insert({ ...body, meeting_id: id })
      .select();
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = `Error creating participant: ${error.message}`;
      return;
    }
    ctx.response.body = JSON.stringify(data);
  })
  .put("/meetings/:id", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const supabase = Supabase.getInstance(token);
    const id = ctx.params.id;
    const body = await ctx.request.body.json();
    const { error } = await supabase
      .from("meetings")
      .update(body)
      .eq("nano_id", id);
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = `Error updating meeting: ${error.message}`;
      return;
    }
    ctx.response.body = "Meeting updated";
  })
  .delete("/meetings/:id", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const supabase = Supabase.getInstance(token);
    const id = ctx.params.id;
    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", id);
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = `Error deleting meeting: ${error.message}`;
      return;
    }
    ctx.response.body = "Meeting deleted";
  })

const app = new Application()
app.use(oakCors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type", "Accept"],

}))
app.use(router.routes())
app.use(router.allowedMethods())

await app.listen({ port: 8000 })




// Deno.serve(async (req) => {
//   try {
//     const method = req.method;

//     if (method === "OPTIONS") {
//       return new Response("ok", { headers: corsHeaders });
//     }

//     const authHeader = req.headers.get("Authorization");
//     if (!authHeader) {
//       return new Response("Authorization header missing", {
//         status: STATUS.UNAUTHORIZED,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     }

//     const token = authHeader.replace("Bearer ", "");
//     const payload = await verifyToken(token);

//     if (!payload) {
//       return new Response("Unauthorized", {
//         status: STATUS.UNAUTHORIZED,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     }

//     const { data: userData, error: userError } = await Supabase.getInstance(
//       token,
//     )
//       .from("users")
//       .select("id")
//       .eq("token_identifier", payload.sub)
//       .single();

//     if (userError) {
//       return new Response(`Error fetching user: ${userError.message}`, {
//         status: STATUS.INTERNAL_SERVER_ERROR,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     }

//     const supabase = Supabase.getInstance(token);

//     const query = new URL(req.url).searchParams;
//     const nanoid = query.get("nanoid");
//     const id = query.get("id");

//     switch (method) {
//       case "GET": {
//         if (nanoid) {
//           const { data, error } = await supabase
//             .from("meetings")
//             .select("*")
//             .eq("nano_id", nanoid)
//             .single();

//           if (error) {
//             return new Response(`Error fetching meeting: ${error.message}`, {
//               status: STATUS.INTERNAL_SERVER_ERROR,
//               headers: { ...corsHeaders, "Content-Type": "application/json" },
//             });
//           }

//           return new Response(JSON.stringify(data), {
//             status: STATUS.OK,
//             headers: { ...corsHeaders, "Content-Type": "application/json" },
//           });
//         }
//         if (id) {
//           const { data, error } = await supabase
//             .from("meetings")
//             .select("*, participants!inner(user_id)")
//             .eq("participants.user_id", userData.id)
//             .eq("participants.meeting_id", id)
//             .single();

//           if (error) {
//             return new Response(`Error fetching meeting: ${error.message}`, {
//               status: STATUS.INTERNAL_SERVER_ERROR,
//               headers: { ...corsHeaders, "Content-Type": "application/json" },
//             });
//           }

//           return new Response(JSON.stringify(data), {
//             status: STATUS.OK,
//             headers: { ...corsHeaders, "Content-Type": "application/json" },
//           });
//         }

//         const { data, error } = await supabase
//           .from("meetings")
//           .select("*, participants!inner(user_id)")
//           .eq("participants.user_id", userData.id);

//         if (error) {
//           return new Response(`Error fetching meetings: ${error.message}`, {
//             status: STATUS.INTERNAL_SERVER_ERROR,
//             headers: { ...corsHeaders, "Content-Type": "application/json" },
//           });
//         }

//         return new Response(JSON.stringify(data), {
//           status: STATUS.OK,
//           headers: { ...corsHeaders, "Content-Type": "application/json" },
//         });
//       }
//       case "POST": {
//         const body = await req.json();
//         const { data, error } = await supabase
//           .from("meetings")
//           .insert(body)
//           .select();

//         if (error) {
//           return new Response(
//             `Error creating meeting: ${error.message}`,
//             {
//               status: STATUS.INTERNAL_SERVER_ERROR,
//               headers: { ...corsHeaders, "Content-Type": "application/json" },
//             },
//           );
//         }
//         return new Response(JSON.stringify(data), {
//           status: STATUS.OK,
//           headers: { ...corsHeaders, "Content-Type": "application/json" },
//         });
//       }
//       case "PUT": {
//         if (!id) {
//           return new Response("Meeting ID required", {
//             status: STATUS.BAD_REQUEST,
//             headers: { ...corsHeaders, "Content-Type": "application/json" },
//           });
//         }

//         const body = await req.json();
//         const { error } = await supabase
//           .from("meetings")
//           .update(body)
//           .eq("nano_id", id);

//         if (error) {
//           return new Response(`Error updating meeting: ${error.message}`, {
//             status: STATUS.INTERNAL_SERVER_ERROR,
//             headers: { ...corsHeaders, "Content-Type": "application/json" },
//           });
//         }

//         return new Response("Meeting updated", {
//           status: STATUS.OK,
//           headers: { ...corsHeaders, "Content-Type": "application/json" },
//         });
//       }
//       case "DELETE": {
//         if (!id) {
//           return new Response("Meeting ID required", {
//             status: STATUS.BAD_REQUEST,
//             headers: { ...corsHeaders, "Content-Type": "application/json" },
//           });
//         }

//         const { error } = await supabase
//           .from("meetings")
//           .delete()
//           .eq("id", id);

//         if (error) {
//           return new Response(`Error deleting meeting: ${error.message}`, {
//             status: STATUS.INTERNAL_SERVER_ERROR,
//             headers: { ...corsHeaders, "Content-Type": "application/json" },
//           });
//         }

//         return new Response("Meeting deleted", {
//           status: STATUS.OK,
//           headers: { ...corsHeaders, "Content-Type": "application/json" }
//         });
//       }
//       default:
//         return new Response("Method not allowed", {
//           status: STATUS.METHOD_NOT_ALLOWED,
//           headers: { ...corsHeaders, "Content-Type": "application/json" },
//         });
//     }
//   } catch (error) {
//     console.error(error);
//     if (error instanceof Error) {
//       return new Response(error.message, {
//         status: STATUS.INTERNAL_SERVER_ERROR,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     } else {
//       return new Response("An unknown error occurred", {
//         status: STATUS.INTERNAL_SERVER_ERROR,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       });
//     }
//   }
// });

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/meetings' \
    --header 'Authorization: Bearer <your_token_here>' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
