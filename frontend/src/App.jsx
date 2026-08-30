import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import GetConversations from "./pages/conversations";
import NewChat from "./pages/newChat";
import Feed from "./pages/feed";
import Profile from "./pages/profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/conversations" element={<GetConversations />} />
      <Route path="/conversations/:conversationId" element={<GetConversations />} />
      <Route path="/newChat" element={<NewChat />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/users/:userId" element={<Profile />} />
    </Routes>
  );
}

export default App;