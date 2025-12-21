import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Optimize Docker runtime by emitting a standalone server
    output: "standalone",
};

export default nextConfig;
