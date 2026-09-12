import type { APIRoute } from "astro"
import { serverZenKey } from "../../../lib/zen-env"

export const prerender = false

// GET /api/zen/status -> { serverKey: boolean }
// Dice al frontend si el servidor tiene ZEN_API_KEY propia (modo personal:
// usar la app sin pegar key). No expone la key, solo su existencia.
export const GET: APIRoute = async ({ locals }) => {
  return Response.json({ serverKey: !!serverZenKey(locals) })
}
