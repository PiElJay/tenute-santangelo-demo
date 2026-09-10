import type { NextConfig } from "next";
const config:NextConfig={trailingSlash:true,images:{unoptimized:true},...(process.env.STATIC_EXPORT === "1" ? {output:"export" as const}:{}),...(process.env.NEXT_PUBLIC_BASE_PATH ? {basePath:process.env.NEXT_PUBLIC_BASE_PATH}: {})};
export default config;
