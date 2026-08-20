import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const backendBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function POST(request: NextRequest) {
  try {
    const response = await axios.post(
      `${backendBaseUrl}/api/google/calendar/booking/`,
      await request.json(),
      { headers: { "Content-Type": "application/json; charset=utf-8" } },
    );
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data || { detail: "The calendar service returned an error." }, { status: error.response.status });
    }

    return NextResponse.json({ detail: "The calendar service could not be reached." }, { status: 502 });
  }
}
