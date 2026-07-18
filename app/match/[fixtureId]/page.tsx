import { MatchRoomFixture } from "@/components/match-room/match-room-fixture"

export default async function MatchRoomPage({
  params,
}: {
  params: Promise<{ fixtureId: string }>
}) {
  const { fixtureId } = await params
  const numericFixtureId = Number(fixtureId)

  return Number.isSafeInteger(numericFixtureId) && numericFixtureId > 0 ? (
    <MatchRoomFixture fixtureId={numericFixtureId} />
  ) : null
}
