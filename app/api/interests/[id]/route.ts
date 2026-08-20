import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const response = await axios.patch(`${backendBaseUrl}/api/interests/${id}/`, await request.json(), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }

    return NextResponse.json({ detail: "The CRM API could not be reached." }, { status: 502 });
  }
}
