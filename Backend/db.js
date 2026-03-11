import sql from 'mssql';    
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),   
    options: {
        trustServerCertificate:false,
        encrypt:false, // For local development
        enableArithAbort: true
    },
    connectionTimeout: 30000, // 30 seconds
    requestTimeout: 30000 // 30 seconds
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Connected to Database');
        return pool;
    
     })


    .catch(err => { 
        console.log('Database Connection Failed! Bad Config: ', err)
        // Return null instead of throwing to allow server to start
        return null;
    });

export { sql, poolPromise };