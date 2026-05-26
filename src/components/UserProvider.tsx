"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Team } from "@prisma/client";

type UserWithTeam = User & { team: Team | null };

interface UserContextType {
  currentUser: UserWithTeam | null;
  setCurrentUser: (user: UserWithTeam | null) => void;
  users: UserWithTeam[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children, initialUsers }: { children: ReactNode, initialUsers: UserWithTeam[] }) {
  const [currentUser, setCurrentUser] = useState<UserWithTeam | null>(null);
  const [users] = useState<UserWithTeam[]>(initialUsers);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("dtp_current_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      const user = initialUsers.find(u => u.id === parsed.id);
      if (user) setCurrentUser(user);
    }
  }, [initialUsers]);

  const handleSetUser = (user: UserWithTeam | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("dtp_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("dtp_current_user");
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser: handleSetUser, users }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
