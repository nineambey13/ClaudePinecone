// Simple polyfill for process.env in the browser
window.process = window.process || {
  env: {
    NODE_ENV: 'development'
  }
};
