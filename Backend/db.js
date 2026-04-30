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
<<<<<<< HEAD
        trustServerCertificate:true,
        encrypt:false, // For local development
        enableArithAbort: true
    },
    connectionTimeout: 120000, // 120 seconds
    requestTimeout: 120000, // 120 seconds
  
};


const dbconfigTwo ={
    server: process.env.DB_SERVER2,
    database: process.env.DB_DATABASE2,
    user: process.env.DB_USER2,
    password: process.env.DB_PASSWORD2,
    port: parseInt(process.env.DB_PORT2),
    options: {
        trustServerCertificate:true,
        encrypt:false, // For local development
        enableArithAbort: true
    },
    connectionTimeout: 120000, // 120 seconds
    requestTimeout: 120000, // 120 seconds
     
}



=======
        trustServerCertificate:false,
        encrypt:false, // For local development
        enableArithAbort: true
    },
    connectionTimeout: 30000, // 30 seconds
    requestTimeout: 30000 // 30 seconds
};

>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Connected to Database');
        return pool;
<<<<<<< HEAD
     })
    .catch(err => { 
        console.log('Database Connection Failed! Bad Config: ', err)
        process.exit(1); // Exit the application if DB connection fails
    });


const poolPromiseTwo = new sql.ConnectionPool(dbconfigTwo)
    .connect()
    .then(pool => {
        console.log('Connected to Database (Pool Two)');
        return pool;
     })
    .catch(err => { 
        console.log('Database Connection Failed for Pool Two! Bad Config: ', err)
        process.exit(1); // Exit the application if DB connection fails
    });

export { sql, poolPromise, poolPromiseTwo };
=======
    
     })


    .catch(err => { 
        console.log('Database Connection Failed! Bad Config: ', err)
        // Return null instead of throwing to allow server to start
        return null;
    });

export { sql, poolPromise };
>>>>>>> a66626c24a50781b35aa2c580b56b07ccba5d938
