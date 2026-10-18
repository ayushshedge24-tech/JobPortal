import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("jobportal_auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => {
    try {
      return localStorage.getItem("jobportal_access_token") || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("jobportal_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("jobportal_auth_user");
    }
  }, [user]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("jobportal_access_token", accessToken);
    } else {
      localStorage.removeItem("jobportal_access_token");
    }
  }, [accessToken]);

  // Background session verification on mount
  useEffect(() => {
    let isMounted = true;
    const verifySession = async () => {
      try {
        const storedToken = localStorage.getItem("jobportal_access_token");
        if (storedToken) {
          const profile = await api.getMe(storedToken);
          if (profile && isMounted) {
            setUser(profile);
            return;
          }
        }
        // If stored token failed or absent, attempt cookie-based refresh
        const refreshed = await api.refreshSession();
        if (refreshed?.accessToken && isMounted) {
          setAccessToken(refreshed.accessToken);
          if (refreshed.user) setUser(refreshed.user);
          return;
        }

        // If both token verification and refresh fail, purge stale session
        if (isMounted) {
          setUser(null);
          setAccessToken(null);
          localStorage.removeItem("jobportal_auth_user");
          localStorage.removeItem("jobportal_access_token");
          localStorage.removeItem("jobportal_candidate_profile_in");
          localStorage.removeItem("jobportal_local_resumes_in");
          localStorage.removeItem("jobportal_local_apps_in");
          localStorage.removeItem("jobportal_saved_jobs");
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setAccessToken(null);
        }
      }
    };
    verifySession();

    // Listen for auth expiration events dispatched by api client
    const handleAuthExpired = () => {
      if (isMounted) {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("jobportal_auth_user");
        localStorage.removeItem("jobportal_access_token");
        localStorage.removeItem("jobportal_candidate_profile_in");
        localStorage.removeItem("jobportal_local_resumes_in");
        localStorage.removeItem("jobportal_local_apps_in");
        localStorage.removeItem("jobportal_saved_jobs");
      }
    };
    window.addEventListener("jobportal_auth_expired", handleAuthExpired);

    return () => {
      isMounted = false;
      window.removeEventListener("jobportal_auth_expired", handleAuthExpired);
    };
  }, []);

  // Standard Login
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.loginUser({ email, password });
      const loggedUser = res.user;
      const token = res.accessToken;

      setUser(loggedUser);
      if (token) setAccessToken(token);

      return loggedUser;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register User
  const register = useCallback(async (name, email, password, role = "JOB_SEEKER") => {
    setLoading(true);
    try {
      const res = await api.registerUser({ name, email, password, role });
      const newUser = res.user;
      const token = res.accessToken;

      setUser(newUser);
      if (token) setAccessToken(token);

      return newUser;
    } finally {
      setLoading(false);
    }
  }, []);

  // Demo Logins with Real Backend JWT Authentication
  const loginAsDemo = useCallback(
    async (role = "jobseeker") => {
      let email = "candidate@jobportal.in";
      let password = "password123";
      let defaultName = "Rahul Sharma";
      let userRole = "JOB_SEEKER";

      if (role === "employer" || role === "RECRUITER") {
        email = "recruiter@jobportal.in";
        password = "password123";
        defaultName = "Priya Deshmukh";
        userRole = "RECRUITER";
      } else if (role === "admin" || role === "ADMIN") {
        email = "admin@jobportal.in";
        password = "password123";
        defaultName = "Ayush Shedge";
        userRole = "ADMIN";
      }

      setLoading(true);
      try {
        try {
          const loggedUser = await login(email, password);
          return loggedUser;
        } catch (err) {
          if (
            err.message &&
            (err.message.includes("Invalid email or password") ||
              err.message.includes("Invalid credentials") ||
              err.message.includes("does not exist"))
          ) {
            const registered = await register(defaultName, email, password, userRole);
            return registered;
          }
          throw err;
        }
      } finally {
        setLoading(false);
      }
    },
    [login, register]
  );

  // Logout
  const logout = useCallback(async () => {
    try {
      await api.logoutUser();
    } catch {
      // Ignore
    }
    setUser(null);
    setAccessToken(null);
    try {
      localStorage.removeItem("jobportal_auth_user");
      localStorage.removeItem("jobportal_access_token");
      localStorage.removeItem("jobportal_candidate_profile_in");
      localStorage.removeItem("jobportal_local_resumes_in");
      localStorage.removeItem("jobportal_local_apps_in");
      localStorage.removeItem("jobportal_saved_jobs");
    } catch {
      // Ignore
    }
  }, []);

  const isEmployer = user?.role === "RECRUITER" || user?.role === "employer";
  const isJobseeker = user?.role === "JOB_SEEKER" || user?.role === "jobseeker" || (Boolean(user) && !user?.role);
  const isAdmin = user?.role === "ADMIN" || user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        token: accessToken,
        loading,
        isAuthenticated: Boolean(user),
        isEmployer,
        isJobseeker,
        isAdmin,
        login,
        loginAsDemo,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
