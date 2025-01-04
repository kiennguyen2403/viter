"use client";
import { CodeEditor } from "@/components/CodeEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabase } from "@/utils/supabase/client";
import { useUser } from "@auth0/nextjs-auth0/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

interface ExecuteResponse {
  output: string;
}

interface Testcase {
  title: string;
  input: string;
  output: string;
}

interface Problem {
  title: string;
  description: string;
  testcases: Testcase[];
}
export default function CodeEditorTab({ meetingId }: { meetingId: string }) {
  const [language, setLanguage] = useState("Node");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const [currentTestcase, setCurrentTestcase] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("testcase");
  const channel = useRef<RealtimeChannel | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const fetchedProblem: Problem = {
          title: "Problem 1",
          description:
            "Given a string, return the first non-repeating character.",
          testcases: [
            { title: "Test Case 1", input: "leetcode", output: "l" },
            { title: "Test Case 2", input: "loveleetcode", output: "v" },
          ],
        };
        setProblem(fetchedProblem);
      } catch {
        handleError("Failed to fetch the problem. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const setupChannel = () => {
      if (!channel.current) {
        const supabase = getSupabase(user?.accessToken as string);
        channel.current = supabase.channel(meetingId, {
          config: { broadcast: { self: true } },
        });
        channel.current
          .on("broadcast", { event: "code_input" }, ({ payload }) =>
            setCode(payload.code)
          )
          .on("broadcast", { event: "language_change" }, ({ payload }) =>
            setLanguage(payload.language)
          )
          .subscribe();
      }
    };

    const cleanupChannel = () => {
      if (channel.current) {
        channel.current.unsubscribe();
        channel.current = null;
      }
    };

    fetchProblem();
    setupChannel();
    return cleanupChannel;
  }, [meetingId, user?.accessToken]);

  // Setup Supabase channel for real-time updates

  const handleError = (message: string) => {
    setError(message);
    console.error(message);
  };

  const handleCodeChange = async (newCode: string) => {
    setCode(newCode);
    if (channel.current) {
      try {
        await channel.current.send({
          type: "broadcast",
          event: "code_input",
          payload: { code: newCode },
        });
      } catch (err) {
        handleError("Error sending code: " + err);
      }
    }
  };

  const handleLanguageChange = async (value: string) => {
    setLanguage(value);
    if (channel.current) {
      try {
        await channel.current.send({
          type: "broadcast",
          event: "language_change",
          payload: { language: value },
        });
      } catch (err) {
        handleError("Error changing language: " + err);
      }
    }
  };

  const handleCodeRun = async () => {
    setLoading(true);
    try {
      const response = await axios.post<ExecuteResponse>(
        "http://localhost:8000/execute",
        { code, language: language.toLowerCase() },
        { headers: { Authorization: `Bearer ${user?.accessToken || ""}` } }
      );
      setResult(response.data);
      if (channel.current) {
        await channel.current.send({
          type: "broadcast",
          event: "code_output",
          payload: { output: response.data.output },
        });
      }
      setCurrentTab("testresult");
    } catch {
      handleError("Error running code. Please check your input or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col  justify-center w-full h-full">
      <div className="flex items-center justify-between mb-4 ml-3 p-4">
        <Select onValueChange={handleLanguageChange} value={language}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={language} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Node">Node</SelectItem>
            <SelectItem value="Python">Python</SelectItem>
            <SelectItem value="C++">C++</SelectItem>
            <SelectItem value="Java">Java</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleCodeRun} disabled={loading}>
          {loading ? "Running..." : "Run"}
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <CodeEditor
          code={code}
          onChange={handleCodeChange}
          height="40vh"
          language={language.toLowerCase()}
        />
      </div>
      <Separator />
      <div className="mb-4 ml-3 p-4">
        <Tabs
          value={currentTab}
          onValueChange={(value) => setCurrentTab(value)} // Add this handler
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="testcase">Test Cases</TabsTrigger>
            <TabsTrigger value="testresult">Test Result</TabsTrigger>
          </TabsList>
          <TabsContent value="testcase">
            <div className="pt-4 pb-4 flex gap-10">
              {problem?.testcases.map((item, index) => (
                <Badge
                  key={index}
                  onClick={() => setCurrentTestcase(index)}
                  className={`cursor-pointer ${
                    currentTestcase === index
                      ? "bg-primary text-white"
                      : "bg-secondary text-black"
                  }`}
                >
                  {item.title}
                </Badge>
              ))}
            </div>
            <div className="p-4 bg-neutral-900 text-white rounded-md shadow-lg border border-neutral-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-400">
                  Testcase Input
                </span>
                <Button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      problem?.testcases[currentTestcase]?.input || ""
                    )
                  }
                >
                  Copy
                </Button>
              </div>
              <pre className="overflow-x-auto font-mono text-sm whitespace-pre-wrap break-words bg-neutral-800 rounded-md p-3">
                {problem?.testcases[currentTestcase]?.input ||
                  "No input available."}
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="testresult">
            <div className="p-4 bg-neutral-900 text-white rounded-md shadow-lg border border-neutral-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-400">
                  Output
                </span>
              </div>
              <pre className="overflow-x-auto font-mono text-sm whitespace-pre-wrap break-words bg-neutral-900 rounded-md p-2">
                {result?.output || "No result yet."}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {error && <div className="text-red-500 pl-7">{error}</div>}
    </div>
  );
}
