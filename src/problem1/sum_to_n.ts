// Using recursion function to calculate sum
// Time Complexity: (O(n))
const sum_to_n_a = function (n: number): number {
  if (n === 1) return 1;
  return n + sum_to_n_a(n - 1);
};

// Loop and using reduce method of javascript
// Time Complexity: (O(n))
const sum_to_n_b = function (n: number): number {
  return Array.from({ length: n }, (_, i) => i + 1).reduce(
    (acc, val) => acc + val,
    0
  );
};

// Using formula to calculate sum
// Time Complexity: (O(1)) (best solution)
var sum_to_n_c = function (n) {
  return (n * (n + 1)) / 2;
};
