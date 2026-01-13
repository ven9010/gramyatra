export const formatINR = (amount) => {
  if (!amount && amount !== 0) return "₹0";
  return "₹" + Number(amount).toLocaleString("en-IN");
};
