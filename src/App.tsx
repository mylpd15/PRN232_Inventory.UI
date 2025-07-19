import { GoogleOAuthProvider } from "@react-oauth/google";
import Route from "./routes";
import { ChatAuthProvider } from "./context";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ChatAuthProvider>
        <Route />
        <Toaster position="bottom-right" />
      </ChatAuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
