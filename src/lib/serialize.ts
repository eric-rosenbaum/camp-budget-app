/**
 * Recursively converts Prisma Decimal objects and Date objects into
 * plain JSON-safe values so they can be passed from Server Components
 * to Client Components.
 */
export function serialize<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => {
      if (typeof value === "bigint") return Number(value);
      return value;
    })
  ) as T;
}
