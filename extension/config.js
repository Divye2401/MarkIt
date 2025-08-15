const config = {
  development: {
    appUrl: "http://localhost:3000",
    supabaseUrl: "", // Add your actual URL
    supabaseAnonKey:""// Add your actual Key
  production: {
    appUrl: "https://markit-cyan.vercel.app",
    supabaseUrl: "",
    supabaseAnonKey:
      "",
  },
};

export const currentConfig = config;
