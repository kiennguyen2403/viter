import { useEffect, useState } from "react";
import Popup from "./Popup";
import { CodeEditor } from "./CodeEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./ui/button";
import axios from "axios";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { useUser } from "@auth0/nextjs-auth0/client";

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

interface CodePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (isOpen: boolean) => void;
}

interface ExecuteResponse {
  output: string;
}

const CodePopup = ({ isOpen, onClose, onOpenChange }: CodePopupProps) => {
  const [language, setLanguage] = useState<string>("Typescript");
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>("");
  const [result, setResult] = useState(null);
  const [currentTestcase, setCurrentTestcase] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading } = useUser();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        // Simulate API call for fetching problem data
        const fetchedProblem: Problem = {
          title: "Problem 1",
          description:
            "Given a string, return the first non-repeating character",
          testcases: [
            { title: "Test Case 1", input: "leetcode", output: "l" },
            { title: "Test Case 2", input: "loveleetcode", output: "v" },
          ],
        };
        setProblem(fetchedProblem);
      } catch (err) {
        setError("Failed to fetch the problem. Please try again later.");
        console.error("Error fetching problem:", err);
      } finally {
        setLoading(false);
      }
    };

    if (onOpenChange) {
      onOpenChange(isOpen);
    }

    if (isOpen) {
      fetchProblem();
    }
  }, [isOpen, onOpenChange]);

  const handleCodeChange = (newCode: string) => setCode(newCode);

  const handleLanguageChange = (value: string) => setLanguage(value);

  const handleCodeRun = async () => {
    try {
      setLoading(true);
      const response = await axios.post<ExecuteResponse>(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/code-enqueue`,
        { message: JSON.stringify({ code, language: language.toLowerCase() }) },
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken || ""}`,
          },
        }
      );
      console.log("Response:", response.data);
    } catch (err) {
      setError("Error running code. Please check your input or try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Popup
      open={isOpen}
      onClose={onClose}
      title={<h2>{problem?.title || "Code"}</h2>}
      className="bottom-[5rem] right-4 left-auto w-[50%] h-[calc(100svh-6rem)] animate-slideInRight"
    >
      <div className="px-0 pb-3 pt-0 h-[calc(100%-66px)]">
        <div className="flex items-center justify-between mb-4 ml-3 p-4">
          <Select onValueChange={handleLanguageChange} value={language}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={language} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Typescript">TypeScript</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="C++">C++</SelectItem>
              <SelectItem value="Java">Java</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleCodeRun} disabled={loading}>
            {loading ? "Running..." : "Run"}
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center">
          <CodeEditor
            code={code}
            onChange={handleCodeChange}
            height="40vh"
            language={language.toLowerCase()}
          />
        </div>
        <Separator />
        <div className="mb-4 ml-3 p-4">
          <Tabs defaultValue="testcase" className="w-[400px]">
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
              Input:
              <div className="p-1 bg-neutral-900 text-white rounded-md shadow-lg border border-neutral-600">
                <pre className="overflow-x-auto font-mono text-sm whitespace-pre-wrap break-words bg-neutral-900 rounded-md">
                  {problem?.testcases[currentTestcase]?.input}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="testresult">
              <div className="p-4">
                <pre>{result}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {error && <div className="text-red-500">{error}</div>}
      </div>
    </Popup>
  );
};

export default CodePopup;
