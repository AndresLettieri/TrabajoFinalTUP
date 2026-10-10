export type SortDirection = "asc" | "desc";

export function sortItems<T>(
    items: T[],
    column: keyof T,
    direction: SortDirection
): T[] {
    return [...items].sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];

        if (valueA === valueB) return 0;
        if (valueA == null) return 1;
        if (valueB == null) return -1;

        let comparison: number;

        if (
            typeof valueA === "number" &&
            typeof valueB === "number"
        ) {
            comparison = valueA - valueB;
        } else if (
            typeof valueA === "boolean" &&
            typeof valueB === "boolean"
        ) {
            comparison = Number(valueA) - Number(valueB);
        } else {
            comparison = String(valueA).localeCompare(
                String(valueB),
                "es",
                {
                    numeric: true,
                    sensitivity: "base",
                }
            );
        }

        return direction === "asc"
            ? comparison
            : -comparison;
    });
}

