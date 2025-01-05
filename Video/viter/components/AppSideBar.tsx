"use client";
import { Calendar, Home, Archive, Megaphone } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import UserButton from "./UserButton";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button"; // Assuming a custom button component
import { useRouter } from "next/navigation";
import Link from "next/link";
import Organization from "./icons/Organization";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Spinner from "./Spinner";

// Initial menu items.
const initialItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Organization", url: "/dashboard/organization", icon: Organization },
  { title: "Calendar", url: "/dashboard", icon: Calendar },
  { title: "Storage", url: "/dashboard/storage", icon: Archive },
  { title: "Result", url: "/dashboard/result", icon: Megaphone },
];

export function AppSidebar() {
  const { isLoading, user } = useUser();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState(initialItems);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchUserInformation = async () => {
      if (!user?.accessToken) return;

      try {
        setIsFetching(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/users/me`,
          {
            headers: { Authorization: `Bearer ${user.accessToken}` },
          }
        );

        if (!response.data.company_id) {
          setMenuItems((prevItems) =>
            prevItems.filter((item) => item.title !== "Organization")
          );
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserInformation();
  }, [user]);

  const renderedMenuItems = useMemo(
    () =>
      menuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <Link href={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )),
    [menuItems]
  );

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Link href="/#" className="flex items-center w-50 mr-5">
              <div className="font-product-sans text-2xl leading-6 text-meet-gray select-none">
                <span className="font-medium">Viter</span>
              </div>
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-3">
            {isLoading || isFetching ? (
              <div className="flex items-center justify-center h-full w-full align-middle">
                <Spinner />
              </div>
            ) : (
              <SidebarMenu>{renderedMenuItems}</SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? (
          <p>Loading...</p>
        ) : user ? (
          <div className="flex gap-3">
            <UserButton user={user} />
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <Button onClick={() => router.push("/api/auth/login")}>Login</Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
