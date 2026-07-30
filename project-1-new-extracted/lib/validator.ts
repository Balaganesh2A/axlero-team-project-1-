import { dimensions, measures } from "./schema.ts";
import type { CubeQueryResult } from "./parser.ts";

// Validate a generated Cube.dev query and reject unknown fields.
export function validateCubeQuery(result: CubeQueryResult): CubeQueryResult {
  if (!result.query) {
    return { error: "Unknown measure or dimension" };
  }

  const allowedMeasures = new Set(measures);
  const allowedDimensions = new Set(dimensions);

  const measuresToValidate = result.query.measures ?? [];
  const dimensionsToValidate = result.query.dimensions ?? [];

  const hasUnknownMeasure = measuresToValidate.some((measure) => !allowedMeasures.has(measure));
  const hasUnknownDimension = dimensionsToValidate.some((dimension) => !allowedDimensions.has(dimension));

  if (hasUnknownMeasure || hasUnknownDimension) {
    return { error: "Unknown measure or dimension" };
  }

  return result;
}
