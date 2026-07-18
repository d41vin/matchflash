/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as fixture_phase from "../fixture_phase.js";
import type * as fixture_projection from "../fixture_projection.js";
import type * as fixture_timeline from "../fixture_timeline.js";
import type * as heat from "../heat.js";
import type * as http from "../http.js";
import type * as ingestion from "../ingestion.js";
import type * as odds from "../odds.js";
import type * as participation from "../participation.js";
import type * as participation_rules from "../participation_rules.js";
import type * as reconciliation from "../reconciliation.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  fixture_phase: typeof fixture_phase;
  fixture_projection: typeof fixture_projection;
  fixture_timeline: typeof fixture_timeline;
  heat: typeof heat;
  http: typeof http;
  ingestion: typeof ingestion;
  odds: typeof odds;
  participation: typeof participation;
  participation_rules: typeof participation_rules;
  reconciliation: typeof reconciliation;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
