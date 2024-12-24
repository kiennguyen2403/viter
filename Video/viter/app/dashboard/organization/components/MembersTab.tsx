"use client";
import Spinner from "@/components/Spinner";
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
import axios from "axios";
import { useEffect, useState } from "react";

interface Members {
  id: number;
  name: string;
  // Add other member properties here
}

export default function MembersTab() {
  const [members, setMembers] = useState<Members[]>([]);
  const { user, isLoading } = useUser();
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (!user) return;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/functions/v1/members`,
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        );
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    fetchMembers();
  }, [user]);

  return (
    <div className="w-full h-full flex-1 justify-center items-center">
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <Spinner />
        </div>
      ) : (
        <Table>
          <TableCaption>Members</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Member ID</TableHead>
              <TableHead>Member Name</TableHead>
              {/* Add other member properties here */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.id}</TableCell>
                <TableCell>{member.name}</TableCell>
                {/* Add other member properties here */}
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total members: {members.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </div>
  );
}
