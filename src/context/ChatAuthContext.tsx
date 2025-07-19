import React, { useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import firebase from "firebase/compat/app";
import { fbAuth } from "../config";

interface ChatAuthContextType {
  user: firebase.User | null;
}

interface ChatAuthProviderProps {
  children: ReactNode;
}

const ChatAuthContext = React.createContext<ChatAuthContextType | undefined>(
  undefined
);

export const useChatAuth = () => useContext(ChatAuthContext);

export const ChatAuthProvider: React.FC<ChatAuthProviderProps> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<firebase.User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fbAuth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);

      if (user && location.pathname.startsWith("/chat")) {
        navigate("/chat/details");
      }
    });
  }, [user]);

  const value = { user };

  return (
    <ChatAuthContext.Provider value={value}>
      {!loading && children}
    </ChatAuthContext.Provider>
  );
};
