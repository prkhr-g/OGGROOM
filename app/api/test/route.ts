import { getAllData } from "@/lib/profile-actions";

export async function GET() {
  const { shops, services, barbers, error } = await getAllData();

  if (error) {
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ shops, services, barbers }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}