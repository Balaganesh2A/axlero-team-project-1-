import { cubeQuerySystemPrompt } from "./prompts.ts";
import { parseCubeQuery } from "./parser.ts";
import { validateCubeQuery } from "./validator.ts";

// Main orchestration module for Cube.dev query generation.
// This project does not connect to a live LLM service, so the module uses the
// prompt and parser pipeline in a deterministic way that mirrors the intended flow.
export async function generateCubeQuery(question: string) {
  const parsed = parseCubeQuery(question);
  const validated = validateCubeQuery(parsed);

  return validated;
}

export { cubeQuerySystemPrompt };
