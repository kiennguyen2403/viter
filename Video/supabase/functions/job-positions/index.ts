// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { verifyToken } from "../utils/auth.ts";
import { Supabase } from "../utils/supabase.ts";
import { Application, Router } from "oak";
import { oakCors } from "cors";



const router = new Router();
router
  .options("/job-positions", (ctx) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    ctx.response.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    ctx.response.status = 200;
  })
  .get("/job-positions", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.body = "Authorization header missing";
      ctx.response.status = 401;
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    const supabase = Supabase.getInstance(token);
    const { error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();

    if (userError) {
      ctx.response.body = `Error fetching user: ${userError.message}`;
      ctx.response.status = 500;
      return;
    }

    const query = ctx.request.url.searchParams;
    const title = query.get("title");
    const description = query.get("description");

    if (title || description) {
      const { data, error } = await supabase
        .from("job_positions")
        .select("*")
        .eq("title", title)
        .eq("description", description)
        .limit(20);

      if (error) {
        ctx.response.body = `Error fetching job positions: ${error.message}`;
        ctx.response.status = 500;
        return;
      }

      ctx.response.body = data;
      ctx.response.status = 200;
      return;
    }

    const { data, error } = await supabase
      .from("job_positions")
      .select("*")
      .limit(20);

    if (error) {
      ctx.response.body = `Error fetching job positions: ${error.message}`;
      ctx.response.status = 500;
      return;
    }

    ctx.response.body = data;
    ctx.response.status = 200;
  })
  .get("/job-positions/:id", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.body = "Authorization header missing";
      ctx.response.status = 401;
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    const supabase = Supabase.getInstance(token);
    const { error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();

    if (userError) {
      ctx.response.body = `Error fetching user: ${userError.message}`;
      ctx.response.status = 500;
      return;
    }

    const id = ctx.params.id;
    const { data, error } = await supabase
      .from("job_positions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      ctx.response.body = `Error fetching job position: ${error.message}`;
      ctx.response.status = 500;
      return;
    }

    ctx.response.body = data;
    ctx.response.status = 200;
  })
  .get("/job-positions/:id/applications", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.body = "Authorization header missing";
      ctx.response.status = 401;
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    const supabase = Supabase.getInstance(token);
    const { error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();

    if (userError) {
      ctx.response.body = `Error fetching user: ${userError.message}`;
      ctx.response.status = 500;
      return;
    }

    const id = ctx.params.id;
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("job_position_id", id);

    if (error) {
      ctx.response.body = `Error fetching applications: ${error.message}`;
      ctx.response.status = 500;
      return;
    }

    ctx.response.body = data;
    ctx.response.status = 200;
  })
  .get("/job-positions/:id/interview-rounds", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.body = "Authorization header missing";
      ctx.response.status = 401;
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    const supabase = Supabase.getInstance(token);
    const { error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();

    if (userError) {
      ctx.response.body = `Error fetching user: ${userError.message}`;
      ctx.response.status = 500;
      return;
    }

    const id = ctx.params.id;
    const { data, error } = await supabase
      .from("interview_rounds")
      .select("*")
      .eq("job_position_id", id);

    if (error) {
      ctx.response.body = `Error fetching interview rounds: ${error.message}`;
      ctx.response.status = 500;
      return;
    }

    ctx.response.body = data;
    ctx.response.status = 200;
  })
  .post("/job-positions", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.body = "Authorization header missing";
      ctx.response.status = 401;
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    const supabase = Supabase.getInstance(token);
    const { error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();

    if (userError) {
      ctx.response.body = `Error fetching user: ${userError.message}`;
      ctx.response.status = 500;
      return;
    }

    const { title, description } = await ctx.request.body.json();

    const { data, error } = await supabase
      .from("job_positions")
      .insert([{ title, description }]);

    if (error) {
      ctx.response.body = `Error creating job position: ${error.message}`;
      ctx.response.status = 500;
      return;
    }

    ctx.response.body = data;
    ctx.response.status = 201;
  })
  .post("/job-positions/:id/applications", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.body = "Authorization header missing";
      ctx.response.status = 401;
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    const supabase = Supabase.getInstance(token);
    const { error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();

    if (userError) {
      ctx.response.body = `Error fetching user: ${userError.message}`;
      ctx.response.status = 500;
      return;
    }

    const id = ctx.params.id;
    const { name, email, resume_url } = await ctx.request.body.json();

    const { data, error } = await supabase
      .from("applications")
      .insert([{ name, email, resume_url, job_position_id: id }]);

    if (error) {
      ctx.response.body = `Error creating application: ${error.message}`;
      ctx.response.status = 500;
      return;
    }

    ctx.response.body = data;
    ctx.response.status = 201;
  })
  .put("/job-positions/:id", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.body = "Authorization header missing";
      ctx.response.status = 401;
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    const supabase = Supabase.getInstance(token);
    const { error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();

    if (userError) {
      ctx.response.body = `Error fetching user: ${userError.message}`;
      ctx.response.status = 500;
      return;
    }

    const id = ctx.params.id;
    const { title, description } = await ctx.request.body.json();

    const { data, error } = await supabase
      .from("job_positions")
      .update({ title, description })
      .eq("id", id);

    if (error) {
      ctx.response.body = `Error updating job position: ${error.message}`;
      ctx.response.status = 500;
      return;
    }

    ctx.response.body = data;
    ctx.response.status = 200;
  })
  .delete("/job-positions/:id", async (ctx) => {
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader) {
      ctx.response.body = "Authorization header missing";
      ctx.response.status = 401;
      return;
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = await verifyToken(token);
    const supabase = Supabase.getInstance(token);
    const { error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("token_identifier", payload.sub)
      .single();

    if (userError) {
      ctx.response.body = `Error fetching user: ${userError.message}`;
      ctx.response.status = 500;
      return;
    }

    const id = ctx.params.id;
    const { data, error } = await supabase
      .from("job_positions")
      .delete()
      .eq("id", id);

    if (error) {
      ctx.response.body = `Error deleting job position: ${error.message}`;
      ctx.response.status = 500;
      return;
    }

    ctx.response.body = data;
    ctx.response.status = 200;
  });

const app = new Application()
app.use(oakCors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type", "Accept"],

}))
app.use(router.routes())
app.use(router.allowedMethods())

await app.listen({ port: 8000 })