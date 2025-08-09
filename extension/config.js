const config = {
  development: {
    appUrl: "http://localhost:3000",
    supabaseUrl: "https://aumaaqlrgwwtmbpbujdr.supabase.co", // Add your actual URL
    supabaseAnonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bWFhcWxyZ3d3dG1icGJ1amRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzQxNTcsImV4cCI6MjA2OTgxMDE1N30.NO8N9fv6yLCmueSKxGHFWVAjCsiK7pR1xpZ0KIjjSEA", // Add your actual key
  },
  production: {
    appUrl: "https://markit-cyan.vercel.app",
    supabaseUrl: "https://aumaaqlrgwwtmbpbujdr.supabase.co",
    supabaseAnonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1bWFhcWxyZ3d3dG1icGJ1amRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMzQxNTcsImV4cCI6MjA2OTgxMDE1N30.NO8N9fv6yLCmueSKxGHFWVAjCsiK7pR1xpZ0KIjjSEAy",
  },
};

export const currentConfig = config;
