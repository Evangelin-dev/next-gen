import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const timezone = request.nextUrl.searchParams.get("timezone") || "Asia/Kolkata";

  if (!date) {
    return NextResponse.json({ detail: "A date is required." }, { status: 400 });
  }

  try {
    const response = await axios.get(`${backendBaseUrl}/api/google/calendar/availability/`, {
      params: { date, timezone },
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data || { detail: "The calendar service returned an error." }, { status: error.response.status });
    }

    return NextResponse.json({ detail: "The calendar service could not be reached." }, { status: 502 });
  }
}
