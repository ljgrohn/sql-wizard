export const ordersSchema = `CREATE TABLE orders (id INTEGER PRIMARY KEY, recipe_id INTEGER, destination TEXT, ordered_on TEXT, batches INTEGER, unit_price REAL, delivered_on TEXT);`;
export const ordersTableInfo = {
  orders: { columns: ['id', 'recipe_id', 'destination', 'ordered_on', 'batches', 'unit_price', 'delivered_on'], description: 'One potion order per row. recipe_id → recipes.id. batches is the requested count; unit_price is the price per batch. Dates are ISO YYYY-MM-DD text; NULL delivered_on means delivery is not recorded.' },
};
export function ordersFixture(variant = 0) {
  if (variant === 1) return { orders: [
    [11, 9, 'Sanctuary', '2026-09-01', 4, 2.5, '2026-09-03'],
    [12, 10, 'Beacon', '2026-09-02', 2, 5, null],
    [13, 9, 'Sanctuary', '2026-09-15', 3, 2.5, null],
    [14, 10, 'Archive', '2026-08-31', 0, 5, '2026-09-01'],
    [15, 9, 'Beacon', '2026-09-30', 6, 3, null],
    [16, 10, 'Archive', '2026-10-01', 2, 4, '2026-10-02'],
    [17, 9, 'Sanctuary', '2026-09-20', 1, 2.5, null],
  ] };
  if (variant === 2) return { orders: [
    [21, 6, 'Beacon', '2026-09-01', 0, 2.5, null],
    [22, 7, 'Archive', '2026-09-14', 5, 4, '2026-09-16'],
    [23, 6, 'Archive', '2026-09-14', 5, 2.5, null],
    [24, 7, 'Sanctuary', '2026-09-30', 1, 4, null],
    [25, 6, 'Beacon', '2026-10-01', 7, 2.5, '2026-10-02'],
    [26, 7, 'Beacon', '2026-08-31', 2, 4, null],
  ] };
  return { orders: [
    [1, 1, 'Beacon', '2026-09-01', 3, 2.5, '2026-09-03'],
    [2, 2, 'Sanctuary', '2026-09-04', 2, 4, null],
    [3, 1, 'Beacon', '2026-09-15', 4, 2.5, null],
    [4, 2, 'Archive', '2026-09-20', 0, 4, null],
    [5, 1, 'Sanctuary', '2026-09-30', 2, 2.5, '2026-10-01'],
    [6, 2, 'Beacon', '2026-10-01', 5, 4, null],
    [7, 1, 'Archive', '2026-08-31', 1, 2.5, '2026-09-01'],
  ] };
}
