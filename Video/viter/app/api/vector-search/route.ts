import { decodeToken } from "@/utils/auth";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getSupabase } from "@/utils/supabase/client";
import { CharacterTextSplitter } from "langchain/text_splitter";
import pdf from 'pdf-parse';

export async function POST(req: Request): Promise<Response> {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response("Authorization header missing", {
                status: 401,
            });
        }
        const bearerToken = authHeader.replace("Bearer ", "");
        const payload = decodeToken(bearerToken);
        if (!payload) return new Response("Unauthorized", { status: 401 });
        const supabase = getSupabase(bearerToken);

        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) {
            return new Response("File not found in form data", { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const { text } = await pdf(buffer);

        return new Response(text, { status: 200 });


    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 });
        } else {
            return new Response("An unknown error occurred", { status: 500 });
        }
    }
}