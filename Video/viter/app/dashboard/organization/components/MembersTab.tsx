"use client";
import Copy from "@/components/icons/Copy";
import Plus from "@/components/icons/Plus";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import useAxiosInterceptor from "@/utils/http-interceptor";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";

interface Members {
  id: number;
  name: string;
  // Add other member properties here
}

export default function MembersTab() {
  const [members, setMembers] = useState<Members[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const { user, isLoading } = useUser();
  const apiClient = useAxiosInterceptor();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (!user) return;
        setIsFetching(true);
        const response = await apiClient.get(`/functions/v1/members`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        setMembers(response.data);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchMembers();
  }, [user]);

  const handleOnClick = async () => {
    setIsOpened(true);
    try {
      if (!user) return;
      setIsFetching(true);
      const response = await apiClient.get(`/functions/v1/invite`, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      setInviteLink(response.data);
      setIsOpened(true);
    } catch (error) {
      console.error("Error fetching invite link:", error);
    } finally {
      setIsFetching(false);
    }
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
                <TableCell colSpan={2}>
                  Total members: {members.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
      <Dialog open={isOpened} onOpenChange={setIsOpened}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Your Invitation Link</DialogTitle>
          {isFetching ? (
            <Spinner />
          ) : (
            <DialogDescription>
              <p>
                Share this link with your members to invite them to join your
                organization.
              </p>
              <div className="flex flex-col items-center gap-2 mt-4">
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="12345231"
                    value={inviteLink}
                  />
                  <Button
                    onClick={() => navigator.clipboard.writeText(inviteLink)}
                  >
                    <Copy /> Copy
                  </Button>
                </div>
              </div>
            </DialogDescription>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
