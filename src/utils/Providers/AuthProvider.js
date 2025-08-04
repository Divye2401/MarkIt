// app/AuthProvider.jsx
"use client";
import { useAuthListener } from "./AuthHelpers";

export default function AuthProvider({ children }) {
  useAuthListener();
  return children;
}
