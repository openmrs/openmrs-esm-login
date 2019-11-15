export function createErrorHandler() {
  return function errorHandler(err) {
    console.log(`Received error ${err}`);
  };
}
