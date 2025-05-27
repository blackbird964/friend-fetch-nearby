
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";

// Import pages
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import MapPage from "@/pages/MapPage";
import ChatPage from "@/pages/ChatPage";
import Profile from "@/pages/ProfilePage";
import FriendsPage from "@/pages/FriendsPage";
import AdminPage from "@/pages/AdminPage";
import TestEmail from "@/pages/TestEmail";
import MainLayout from "@/pages/MainLayout";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/test-email" element={<TestEmail />} />
            
            <Route element={<MainLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:chatId" element={<ChatPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
