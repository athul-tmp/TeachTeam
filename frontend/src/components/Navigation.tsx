import Link from "next/link";

import { useAuth } from "../context/AuthContext";

export default function Navigation() {
  const { user, logout } = useAuth();
  return (
    <nav className="navigation">
      {user ? (
        <div>
          <Link href="/">
              <button className="nav-link" onClick={logout}>Sign out</button>
            </Link>
            <Link href="/profile">
              <button className="nav-link">Profile</button>
            </Link>
        </div>
          ) : (
            <div>
              <Link href="/register">
                  <button className="nav-link">Sign Up</button>
              </Link>
              <Link href="/login">
                  <button className="nav-link">Sign In</button>
              </Link>
            </div>
          )}
    </nav>
  );
};