export const formatearNumero = (num) => {
  const THOUSANDS_SEPARATOR_REGEX = /\B(?=(\d{3})+(?!\d))/g;

  if (num === undefined || num === null) {
    return "0";
  }

  let normalizedNum;

  if (typeof num === "string") {
    const isNegative = num.trim().startsWith("-");
    const numericPart = num
      .replace(/[^0-9,]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    normalizedNum = Number(numericPart);
    if (isNegative) normalizedNum *= -1;
  } else {
    normalizedNum = num;
  }

  if (isNaN(normalizedNum)) {
    return "0";
  }

  const fixed = normalizedNum.toFixed(2);
  const [intPartRaw, decimalPart] = fixed.split(".");

  const isNegative = intPartRaw.startsWith("-");
  const intPart = isNegative ? intPartRaw.slice(1) : intPartRaw;

  const intFormatted = intPart.replace(THOUSANDS_SEPARATOR_REGEX, ".");
  return `${isNegative ? "-" : ""}${intFormatted}${
    decimalPart === "00" ? "" : "," + decimalPart
  }`;
};
