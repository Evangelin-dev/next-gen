import DirectScheduler from "../../components/DirectScheduler";

export const metadata = {
  title: "Schedule Your Call | Next Genre Vision ",
  description: "Schedule your export growth call with Next Genre Vision.",
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ interest_id?: string }>;
}) {
  const { interest_id: initialInterestId } = await searchParams;
  return <DirectScheduler initialInterestId={initialInterestId} />;
}
