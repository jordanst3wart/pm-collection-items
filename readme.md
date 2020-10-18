// Save common tests in a global variable
postman.setGlobalVariable("commonTests", () => {
  // The Content-Type must be JSON
  tests["Content-Type header is set"] = postman.getResponseHeader("Content-Type") === "application/json";
  // The response time must be less than 500 milliseconds
  tests["Response time is acceptable"] = responseTime < 500;
  // The response body must include an "id" property
  var data = JSON.parse(responseBody);
  tests["Response has an ID"] = data.id !== undefined;
});

// First, run the common tests
eval(globals.commonTests)();

//^ should be able to do something like
eval(gobals.commonFunction)(newInput1,newInput2);
