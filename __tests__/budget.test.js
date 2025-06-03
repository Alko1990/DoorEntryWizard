// budget.test.js
const { calculateRemainingBudget } = require("../src/utils/EntryManager");

test("budget starts at 12", () => {
  const start = calculateRemainingBudget([{ Cost: 0 }]); // only the video module
  expect(start).toBe(12);
});
