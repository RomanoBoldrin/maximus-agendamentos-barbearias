/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Redirect users from the root URL to the /home page
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
