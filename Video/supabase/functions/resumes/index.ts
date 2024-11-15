import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Supabase } from "../utils/supabase.ts";
import { verifyToken } from "../utils/auth.ts";
import { STATUS } from "../type/type.ts";

Deno.serve(async (req) => {
  try {
    const method = req.method;
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response("Authorization header missing", { status: STATUS.UNAUTHORIZED });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = Supabase.getInstance(token);
    const payload = await verifyToken(token);

    if (!payload) {
      return new Response("Unauthorized", { status: STATUS.UNAUTHORIZED });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("token_identifier", payload.sub)
      .single();

    if (userError) {
      return new Response(userError.message, { status: STATUS.UNAUTHORIZED });
    }

    switch (method) {
      case "GET": {
        const { data: resume, error: resumeError } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", user.id);

        if (resumeError) {
          return new Response(resumeError.message, { status: STATUS.INTERNAL_SERVER_ERROR });
        }

        await Promise.all(
          resume.map(async (r: { fileName: any; signedUrlError: any; signedUrl: any; }) => {
            try {
              const { data, error } = await supabase.storage
                .from("storages")
                .createSignedUrl(r.fileName, 60);

              if (error) {
                console.error(`Error creating signed URL for ${r.fileName}:`, error.message);
                r.signedUrlError = error.message;
              } else {
                r.signedUrl = data?.signedUrl;
              }
            } catch (err) {
              console.error(`Unexpected error for ${r.fileName}:`, err);
            }
          })
        );

        return new Response(JSON.stringify(resume), {
          status: STATUS.OK,
          headers: { "Content-Type": "application/json" },
        });
      }

      case "POST": {
        try {
          const formData = await req.formData();
          const file = formData.get("file") as File | null;
          if (!file) {
            return new Response("File missing in request", { status: STATUS.BAD_REQUEST });
          }

          const fileName = file.name.split("\\").pop()!;
          const { data, error } = await supabase.storage
            .from("storages")
            .upload(fileName, file);

          if (error) {
            return new Response(JSON.stringify(error), {
              status: STATUS.BAD_REQUEST,
              headers: { "Content-Type": "application/json" },
            });
          }

          const { error: recordingError } = await supabase
            .from("resumes")
            .insert([{ userId: user.id, bucket: data.id, fileName }]);

          if (recordingError) {
            return new Response(recordingError.message, { status: STATUS.INTERNAL_SERVER_ERROR });
          }

          return new Response(null, { status: STATUS.CREATED });
        } catch (uploadError) {
          console.error("Error in file upload:", uploadError);
          return new Response("Error in file upload", { status: STATUS.INTERNAL_SERVER_ERROR });
        }
      }

      default:
        return new Response("Method not allowed", { status: STATUS.METHOD_NOT_ALLOWED });
    }
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "An unknown error occurred", {
      status: STATUS.INTERNAL_SERVER_ERROR,
    });
  }
});
