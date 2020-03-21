#!/usr/bin/env node

const http = require('http');
const [, , testUrl] = process.argv;

function queueNext(cb) {
  setTimeout(cb, 5000);
}

function performRequest(url, tries, max) {
  const currentAttempt = max - tries;
  if (tries <= 0) {
    console.log(
      `(${currentAttempt}) health_check status: FAILED (too many tries)`
    );
    process.exit(1);
  }

  const request = http.request(url, { timeout: 3000 }, res => {
    const isUp = res.statusCode === 200;
    if (isUp) {
      console.log(`(${currentAttempt}) health_check status: OK`);
      process.exit(0);
    } else {
      console.log(
        `(${currentAttempt}) health_check status: NOT OK (${res.statusCode})`
      );
      queueNext(() => performRequest(url, tries - 1, max));
    }
  });

  request.on('error', error => {
    console.log(
      `(${currentAttempt}) health_check status: ERROR (${error.message})`
    );

    queueNext(() => performRequest(url, tries - 1, max));
  });

  request.end();
}

console.log(`health_check for ${testUrl}`);
performRequest(testUrl, 5, 5);
