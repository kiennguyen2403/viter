// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { verifyToken } from "../utils/auth.ts";
import { Application, Router } from "oak";
import { oakCors } from "cors";

const router = new Router();
router
  .options("/users", (ctx) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    ctx.response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    ctx.response.status = 200;
  })
  .get("/users", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization")!;
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq(
        "token_identifier",
        payload.sub,
      ).single();

    if (userError || userData.role !== "ADMIN") {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) {
      ctx.response.status = 401;
      ctx.response.body = error.message;
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = data;
    return;
  })
  .get("/users/:id", async (ctx) => {
    const id = ctx.params.id;
    const authHeader = ctx.request.headers.get("Authorization")!;
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq(
        "token_identifier",
        payload.sub,
      ).single();

    if (userError) {
      ctx.response.status = 401;
      ctx.response.body = userError.message;
      return;
    }
    switch (id) {
      case "me": {
        ctx.response.status = 200;
        ctx.response.body = JSON.stringify(userData);
        break;
      }
      default: {
        if (userData.role !== "ADMIN") {
          ctx.response.status = 401;
          ctx.response.body = "Unauthorized";
          return;
        }
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", id);

        if (error) {
          ctx.response.status = 500;
          ctx.response.body = error.message;
          return;
        }

        ctx.response.status = 200;
        ctx.response.body = data;
        break;
      }
    }
  })
  .get("/users/:id/applications", async (ctx) => {
    const id = ctx.params.id;
    const authHeader = ctx.request.headers.get("Authorization")!;
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq(
        "token_identifier",
        payload.sub,
      ).single();

    if (userError || userData.id !== id) {
      ctx.response.status = 401;
      ctx.response.body = userError.message;
      return;
    }
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", id);

    if (error) {
      ctx.response.status = 500;
      ctx.response.body = error.message;
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = data;
  })
  .get("users/:id/participants", async (ctx) => {
    const id = ctx.params.id;
    const authHeader = ctx.request.headers.get("Authorization")!;
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq(
        "token_identifier",
        payload.sub,
      ).single();

    if (userError || userData.id !== id) {
      ctx.response.status = 401;
      ctx.response.body = userError.message;
      return;
    }
    const { data, error } = await supabase
      .from("participants")
      .select("*")
      .eq("user_id", id);

    if (error) {
      ctx.response.status = 500;
      ctx.response.body = error.message;
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = data;
  })
  .post("/users", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization")!;
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq(
        "token_identifier",
        payload.sub,
      ).single();

    if (userData) {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify(userData);
      return;
    }
    const body = await ctx.request.body.json();
    const { data, error } = await supabase.from("users")
      .upsert({
        ...body.value,
        token_identifier: payload.sub,
      })
      .eq(
        "token_identifier",
        payload.sub,
      );
    if (error) {
      console.error(error);
      ctx.response.status = 500;
      ctx.response.body = error.message;
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify(data);
  })
  .put("/users", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization")!;
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq(
        "token_identifier",
        payload.sub,
      ).single();

    if (userData) {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify(userData);
      return;
    }
    const body = await ctx.request.body.json();
    const { data, error } = await supabase
      .from("users")
      .upsert(body.value)
      .eq(
        "id",
        userData.id,
      );
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = error.message;
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify(data);
  })
  .put("/users/:id", async (ctx) => {
    const id = ctx.params.id;
    const authHeader = ctx.request.headers.get("Authorization")!;
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq(
        "token_identifier",
        payload.sub,
      ).single();

    if (userError) {
      ctx.response.status = 401;
      ctx.response.body = userError.message;
      return;
    }
    if (userData.role !== "ADMIN") {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const body = await ctx.request.body.json();
    const { data, error } = await supabase
      .from("users")
      .upsert(body.value)
      .eq(
        "id",
        id,
      );
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = error.message;
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify(data);
  })
  .delete("/users", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization")!;
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq(
        "token_identifier",
        payload.sub,
      ).single();

    if (userData) {
      ctx.response.status = 200;
      ctx.response.body = JSON.stringify(userData);
      return;
    }
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq(
        "id",
        userData.id,
      );
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = error.message;
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify(data);
  }).
  delete("/users/:id", async (ctx) => {
    const id = ctx.params.id;
    const authHeader = ctx.request.headers.get("Authorization")!;
    if (!authHeader) {
      ctx.response.status = 401;
      ctx.response.body = "Authorization header missing";
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq(
        "token_identifier",
        payload.sub,
      ).single();

    if (userError) {
      ctx.response.status = 401;
      ctx.response.body = userError.message;
      return;
    }
    if (userData.role !== "ADMIN") {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return;
    }
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq(
        "id",
        id,
      );
    if (error) {
      ctx.response.status = 500;
      ctx.response.body = error.message;
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify(data);
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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/users' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
