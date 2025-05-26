const mysql = require('mysql2');

const dbConfig = {
    multipleStatements: true,
    host: 'localhost',
    user: 'root',
    password: 'AndriansyahMySQL123',
    database: 'bug_handling'
};

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

module.exports = db;

// const mysql = require('mysql2');

// const dbConfig = {
//     multipleStatements: true,
//     host: 'localhost',
//     user: 'root',
//     password: 'AndriansyahMySQL123',
//     database: 'zoo_db'
// };

// // Menggunakan pool koneksi untuk mengelola koneksi
// const pool = mysql.createPool(dbConfig);

// // Menggunakan pool.promise() jika Anda ingin menggunakan promise
// const promisePool = pool.promise();

// module.exports = promisePool;
