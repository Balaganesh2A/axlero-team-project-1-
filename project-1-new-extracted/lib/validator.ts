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
  const filtersToValidate = result.query.filters ?? [];

  const hasUnknownMeasure = measuresToValidate.some(
    (measure) => !allowedMeasures.has(measure as (typeof measures)[number])
  );

  const hasUnknownDimension = dimensionsToValidate.some(
    (dimension) => !allowedDimensions.has(dimension as (typeof dimensions)[number])
  );

  const hasUnknownFilter = filtersToValidate.some(
    (filter) =>
      !allowedDimensions.has(filter.member as (typeof dimensions)[number])
  );

  if (
    hasUnknownMeasure ||
    hasUnknownDimension ||
    hasUnknownFilter
  ) {
    return { error: "Unknown measure or dimension" };
  }

  return result;
}
