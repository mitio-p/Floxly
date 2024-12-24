function formatNumber(number, country) {
  const numberArray = number.split("");
  if (numberArray[0] === "0") {
    numberArray.shift();
    return country + numberArray.join("");
  } else {
    return country + number;
  }
}

module.exports = formatNumber;
