export default (data, type, parser) => {
  const parsedData = parser.parseFromString(data, type);
  const errorElement = parsedData.querySelector('parsererror');
  if (errorElement) {
    throw new Error('invalidRSS');
  } else {
    return parsedData;
  }
};
