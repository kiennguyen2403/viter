import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { STATUS } from "../type/type.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { multiParser } from "multiparser";
import { Database, Tables, Enums } from "../type/database.types.ts";

Deno.serve(async (req) => {
  try {
    const method = req.method;

    if (method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse("Authorization header missing", STATUS.UNAUTHORIZED);
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);

    const id = req.url.split("/").pop();
    if (method === "GET") return await handleGetRequest(id, supabase);
    if (method === "POST") return await handlePostRequest(req, supabase);
    if (method === "DELETE") return await handleDeleteRequest(id, supabase);

    return jsonResponse("Method not allowed", STATUS.METHOD_NOT_ALLOWED);
  } catch (error) {
    console.error(error);
    return jsonResponse(
      error instanceof Error ? error.message : "An unknown error occurred",
      STATUS.INTERNAL_SERVER_ERROR
    );
  }
});

// Utility to return JSON response
function jsonResponse(
  message: string | object,
  status: number = STATUS.OK,
  headers = corsHeaders
) {
  return new Response(
    typeof message === "string" ? JSON.stringify({ message }) : JSON.stringify(message),
    {
      status,
      headers: { ...headers, "Content-Type": "application/json" },
    }
  );
}

// GET Request Handler
async function handleGetRequest(id: string | undefined, supabase: any) {
  if (!id) {
    return jsonResponse("Application ID missing", STATUS.BAD_REQUEST);
  }

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return jsonResponse(
      `Error fetching application: ${error.message}`,
      STATUS.INTERNAL_SERVER_ERROR
    );
  }

  return jsonResponse(data, STATUS.OK);
}

// POST Request Handler
async function handlePostRequest(req: Request, supabase: any) {
  const formData = await multiParser(req);

  if (!formData) {
    return jsonResponse("No files or form data found", STATUS.BAD_REQUEST);
  }

  const { files, fields } = formData;
  const jobPositionId = fields.jobPositionId;
  if (!jobPositionId) {
    return jsonResponse("Missing job position ID", STATUS.BAD_REQUEST);
  }

  const fileUploadResults = Array.isArray(files)
    ? await uploadMultipleFiles(files, supabase)
    : [await uploadSingleFile(files, supabase)];

  const hasErrors = fileUploadResults.some((result) => result.error);

  if (hasErrors) {
    const errors = fileUploadResults
      .filter((result) => result.error)
      .map((result) => (result.error as Error).message);
    return jsonResponse({ message: "File upload failed", errors }, STATUS.INTERNAL_SERVER_ERROR);
  }

  const applications = fileUploadResults.map((result) => ({
    name: result.data.filename,
    url: result.data.Key,
    job_position_id: jobPositionId,
    status: "SUBMIT",
  }));

  const { error } = await supabase.from("applications").insert(applications);
  if (error) {
    return jsonResponse(
      `Error saving application: ${error.message}`,
      STATUS.INTERNAL_SERVER_ERROR
    );
  }

  return jsonResponse("Application submitted successfully", STATUS.CREATED);
}

// DELETE Request Handler
async function handleDeleteRequest(id: string | undefined, supabase: any) {
  if (!id) {
    return jsonResponse("Application ID missing", STATUS.BAD_REQUEST);
  }

  const { error } = await supabase.from("applications").delete().eq("id", id);

  if (error) {
    return jsonResponse(
      `Error deleting application: ${error.message}`,
      STATUS.INTERNAL_SERVER_ERROR
    );
  }

  return jsonResponse("Application deleted successfully", STATUS.OK);
}

// Upload Single File
async function uploadSingleFile(file: any, supabase: any) {
  try {
    const { data, error } = await supabase.storage
      .from("resumes")
      .upload(file.filename, file.content);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error uploading file: ${error.message}`);
    } else {
      console.error("Unknown error occurred during file upload");
    }
    return { data: null, error };
  }
}

// Upload Multiple Files
async function uploadMultipleFiles(files: any[], supabase: any) {
  return Promise.all(files.map((file) => uploadSingleFile(file, supabase)));
}
