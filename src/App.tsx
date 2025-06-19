
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import ChatPage from "./pages/ChatPage";
import FriendsPage from "./pages/FriendsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import TestEmail from "./pages/TestEmail";
import MainLayout from "./pages/MainLayout";
import NotFound from "./pages/NotFound";
import UnsubscribePage from "./pages/UnsubscribePage";

const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/*" element={<MainLayout />}>
                <Route path="home" element={<Home />} />
                <Route path="map" element={<MapPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="friends" element={<FriendsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="test-email" element={<TestEmail />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
