import { cronJobs, makeFunctionReference } from "convex/server"

const crons = cronJobs()
const decayLiveHeat = makeFunctionReference<
  "mutation",
  Record<string, never>,
  null
>("heat:decayLiveHeat")

crons.interval("persist live Heat decay", { minutes: 1 }, decayLiveHeat)

export default crons
