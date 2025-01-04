"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@auth0/nextjs-auth0/client";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import Plus from "@/components/icons/Plus";
import { useRouter } from "next/navigation";
import useAxiosInterceptor from "@/utils/http-interceptor";

interface Job {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function JobsTab() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useUser();
  const apiClient = useAxiosInterceptor();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        if (!user) return;
        setIsFetching(true);
        const response = await apiClient.get(
          `/functions/v1/jobs`,
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        );
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchJobs();
  }, [apiClient, user]);

  const handleOnClick = () => {
    router.push("/dashboard/organization/jobs/new");
  };

  return (
    <div className="w-full h-full flex-1 justify-center items-center">
      {isLoading || isFetching ? (
        <div className="flex items-center justify-center w-full h-full">
          <Spinner />
        </div>
      ) : (
        <div>
          <Button className="mb-4" onClick={handleOnClick}>
            <Plus />
            Add
          </Button>
          <Table>
            <TableCaption>Jobs Management</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Job Name</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.id}</TableCell>
                  <TableCell>{job.name}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.status}</TableCell>
                  <TableCell>{job.createdAt}</TableCell>
                  <TableCell>{job.updatedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>Total: {jobs.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </div>
  );
}
