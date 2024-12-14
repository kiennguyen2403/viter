import React, { useEffect, useState } from "react";
import Popup from "./Popup";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableRow } from "./ui/table";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "./ui/button";
import Spinner from "./Spinner";

interface Problem {
  id: number;
  title: string;
  question: string;
  difficulty: string;
  type: string;
}

interface ProblemSuggestionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (isOpen: boolean) => void;
}

const ProblemSuggestionPopup: React.FC<ProblemSuggestionPopupProps> = ({
  isOpen,
  onClose,
  onOpenChange,
}) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [input, setInput] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const { user, isLoading } = useUser();

  const fetchProblems = async (query: string = "") => {
    setIsFetching(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/problems/`,
        {
          params: query ? { query } : undefined,
          headers: { Authorization: `Bearer ${user?.accessToken || ""}` },
        }
      );
      setProblems(response.data);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("files", file);

    setIsFetching(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/problems-vector`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user?.accessToken || ""}`,
          },
        }
      );
      setProblems([...response.data]);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSearch = () => {
    fetchProblems(input);
  };

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }

    if (isOpen) {
      fetchProblems();
    }
  }, [isOpen, onOpenChange]);

  const renderTable = (data: Problem[]) => (
    <Table className="w-full">
      <TableRow>
        <TableHead>Title</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Difficulty</TableHead>
        <TableHead>Type</TableHead>
      </TableRow>
      <TableBody>
        {data.length > 0 ? (
          data.map((problem) => (
            <TableRow key={problem.id}>
              <TableCell>{problem.title}</TableCell>
              <TableCell>{problem.question}</TableCell>
              <TableCell>{problem.difficulty}</TableCell>
              <TableCell>{problem.type}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center">
              No problems found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <Popup
      open={isOpen}
      onClose={onClose}
      title={<h2>Problems Pool</h2>}
      className="bottom-[5rem] right-4 left-auto w-[50%] h-[calc(100svh-6rem)] animate-slideInRight"
    >
      <div className="px-0 pb-3 pt-0 h-[calc(100%-66px)]">
        <div className="flex flex-col items-start justify-between mb-4 ml-3 p-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">Search</TabsTrigger>
              <TabsTrigger value="recommend">AI Recommend</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="flex flex-col w-full h-[700px] gap-2">
                <div className="pt-4 pb-4 flex gap-4">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Search..."
                  />
                  <Button onClick={handleSearch} disabled={isFetching}>
                    Search
                  </Button>
                </div>
                {isFetching ? <Spinner /> : renderTable(problems)}
              </div>
            </TabsContent>
            <TabsContent value="recommend">
              <div className="flex flex-col w-full h-[700px] gap-2">
                <div className="pt-4">
                  <Input
                    id="file"
                    type="file"
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleFileChange}
                  />
                  <p className="mt-4 text-xs text-gray-500">
                    Upload your resume and job description in PDF or TXT format.
                  </p>
                </div>
                {isFetching || isLoading ? <Spinner /> : renderTable(problems)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Popup>
  );
};

export default ProblemSuggestionPopup;
