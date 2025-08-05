module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aumaaqlrgwwtmbpbujdr.supabase.co", // Replace with your actual project ref
        pathname: "/storage/v1/object/public/bookmark-thumbnails/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      // Add other domains as needed
    ],
  },
};
