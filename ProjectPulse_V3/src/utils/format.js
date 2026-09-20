export function parseCurrency(str) {
  return Number((str || "").replace(/[^0-9]/g, "")) || 0;
}

export function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}
