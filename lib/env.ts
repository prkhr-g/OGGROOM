// Environment variables validation
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
};

// Validate required environment variables
if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}
