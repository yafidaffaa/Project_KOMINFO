// routes-list.js
const listEndpoints = require('express-list-endpoints');
const app = require('./src/app');

const endpoints = listEndpoints(app);

// Format tampilan tabel
console.log('📌 Daftar Seluruh Endpoint API:\n');
console.table(endpoints.map(e => ({
  Path: e.path,
  Methods: e.methods.join(', '),
  Middlewares: (e.middlewares.length ? e.middlewares.join(', ') : '-')
})));
