const UUID_RE =
  /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;

export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInputError";
  }
}

export function extractUuid(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new InvalidInputError("Please paste a listing URL or UUID.");
  }
  const matches = trimmed.match(UUID_RE);
  if (!matches || matches.length === 0) {
    throw new InvalidInputError(
      "Couldn't find a listing UUID in that input. Paste a full shopgarage.com/listing/... URL."
    );
  }
  return matches[matches.length - 1].toLowerCase();
}
