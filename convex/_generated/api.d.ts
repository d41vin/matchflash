/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as chat from "../chat.js";
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
import type * as predictions from "../predictions.js";
import type * as recaps from "../recaps.js";
import type * as reconciliation from "../reconciliation.js";
import type * as reliability from "../reliability.js";
import type * as rooms from "../rooms.js";
import type * as trophies from "../trophies.js";
import type * as trophy_eligibility from "../trophy_eligibility.js";
import type * as trophy_mainnet_preflight from "../trophy_mainnet_preflight.js";
import type * as trophy_mint from "../trophy_mint.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  chat: typeof chat;
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
  predictions: typeof predictions;
  recaps: typeof recaps;
  reconciliation: typeof reconciliation;
  reliability: typeof reliability;
  rooms: typeof rooms;
  trophies: typeof trophies;
  trophy_eligibility: typeof trophy_eligibility;
  trophy_mainnet_preflight: typeof trophy_mainnet_preflight;
  trophy_mint: typeof trophy_mint;
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
