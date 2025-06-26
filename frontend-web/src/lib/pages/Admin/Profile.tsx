import * as React from "react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "../JWTDecode/JWTDecode";
import Cookies from "js-cookie";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isPageLoaded, setIsPageLoaded] = useState(false); // Track page load state
  const [isExiting, setIsExiting] = useState(false); // Track if we are navigating back

  const navigate = useNavigate();

  const token = localStorage.getItem("jwtToken");
  const decodedToken = token ? decodeToken(token) : null;
  const adminName = decodedToken?.sub || "Admin";

  useEffect(() => {
    if (!decodedToken) {
      navigate("/login"); // Redirect to login if not authenticated
    }
    setIsPageLoaded(true); // Set to true once page has been loaded to trigger the fade-in
  }, [decodedToken, navigate]);

  const handleBackClick = () => {
    setIsExiting(true); // Trigger the fade-out animation
    setTimeout(() => {
      navigate(-1); // Navigate back after the animation finishes
    }, 500); // Wait for the animation to complete
  };

  return (
    <SidebarProvider>
      <div
        className={`flex w-screen h-screen bg-muted/30 overflow-hidden ${
          isPageLoaded && !isExiting ? "fade-in" : ""
        } ${isExiting ? "fade-out" : ""}`}
      >
        {/* Injecting keyframes animation inside a <style> tag */}
        <style>
          {`
            @keyframes fadeIn {
              0% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            }
            @keyframes fadeOut {
              0% {
                opacity: 1;
              }
              100% {
                opacity: 0;
              }
            }
            .fade-in {
              animation: fadeIn 0.5s forwards;
            }
            .fade-out {
              animation: fadeOut 0.4s backwards;
            }
          `}
        </style>

        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="font-semibold text-lg">
                My <span className="text-primary">Profile</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {/* Removed Profile Details Menu Item */}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
              <Button
  variant="outline"
  onClick={handleBackClick} // Trigger the fade-out animation and navigate back
  className="flex items-center gap-2 p-2 rounded-md border border-transparent hover:border-primary hover:bg-primary hover:text-white transition-all duration-200 absolute bottom-4 left-4 z-10"
>
  <ArrowLeft className="mr-2 h-5 w-5" />
  <span className="text-sm">Back</span>
</Button>

              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col bg-background p-6">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex flex-1 items-center gap-4">
              <h2 className="text-lg font-semibold">Profile</h2>
            </div>
          </header>

          <main className="flex-1 overflow-hidden p-6 relative">
            {/* Profile Tab with transition */}
            <div
              className={`absolute inset-0 overflow-auto transition-all transform bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 ${
                activeTab === "profile"
                  ? "profile-page-enter profile-page-enter-active"
                  : "profile-page-exit profile-page-exit-active"
              }`}
            >
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>{adminName?.[0] || "A"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xl font-semibold">{adminName}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold mb-2">Personal Information</div>
                    <Input placeholder="Full Name" value={adminName} className="mb-4" />
                    <Input placeholder="Email" value={decodedToken?.email || ""} className="mb-4" />
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
