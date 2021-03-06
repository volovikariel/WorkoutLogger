const {Client} = require('pg');
const exec = require('child_process').exec;
// Use getos from npm for returning linux distros as well (apt-get vs pacman)

exec(`
     systemctl status postgresql
     if [ "$?" -gt "0" ]; then 
        sudo apt-get update
        sudo apt-get install postgresql postgresql-contrib
     else  
        echo 'CREATE DATABASE TestingDatabase;' | PGPASSWORD=1 psql -U postgres
     fi
    `
    , (err, stdout, stderr) => {
    console.log('stdout:' + stdout);
    console.error('stderr:',stderr);
    if(err != null) {
        console.error('execution error: ', error); 
    }
})

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'testingdatabase', 
    password: '1',
    port: 5432 
});

client.connect();

let showRes = false;

const query = (query, callback, listOfValues = []) => {
    if(listOfValues.length == 0) {
        client.query(query, (err, res) => {
            if(err) {
                console.error(`Query (${query}) Error`, err.stack);
            } 
            if(showRes) {
                console.log(res);
            }
            callback(res);
        });
    }
    else {
        client.query(query, listOfValues, (err, res) => {
            if(err) {
                console.error(`Query (${query}) Error`, err.stack);
            } 
            if(showRes) {
                console.log(res);
            }
            callback(res);
        });

    }
};

exports.query = query;

// Default Tables

query(`CREATE table IF NOT EXISTS Person
    (
		Person_ID SERIAL PRIMARY KEY,
		First_Name varchar(20) NOT NULL,
		Last_Name varchar(20) NOT NULL
    );`, (res) => {});

query(`CREATE table IF NOT EXISTS Exercise_Types 
    (
		Exercise_Type_ID SERIAL PRIMARY KEY,
		Exercise_Type_Name varchar(20) UNIQUE NOT NULL
    );`, (res) => {});

query(`CREATE table IF NOT EXISTS Exercise 
    (
		Exercise_ID SERIAL PRIMARY KEY,
		Exercise_Type_ID smallint REFERENCES Exercise_Types(Exercise_Type_ID),
		Exercise_Name varchar(40) UNIQUE NOT NULL
    );`, (res) => {});

query(`CREATE table IF NOT EXISTS Exercise_Routine 
    (
		Routine_ID SERIAL PRIMARY KEY,
		Exercise_IDs smallint[]
    );`, (res) => {});
//
query(`CREATE table IF NOT EXISTS Workout_History 
	(
		Person_ID smallint REFERENCES Person(Person_ID),
		Routine_ID smallint REFERENCES Exercise_Routine(Routine_ID),
		Exercise_ID smallint REFERENCES Exercise(Exercise_ID),
		Start_Time timestamp,
		Workout_Duration smallint,
		Average_Rest smallint,
		Reps_Per_Set smallint[]
		
	);`, (res) => {});


// Initial Values if tables are empty
query(`
INSERT INTO Person (first_name, last_name) SELECT
		'First Test', 'Last Test' WHERE NOT EXISTS (SELECT * FROM Person); 
`, (res) => {});

query(`
INSERT INTO Exercise_Types (Exercise_Type_Name) SELECT
		'Test' WHERE NOT EXISTS (SELECT ALL * FROM Exercise_Types);
`, (res) => {});

query(`
INSERT INTO Exercise (Exercise_Type_ID, Exercise_Name) SELECT
		1, 'Push Ups' WHERE NOT EXISTS (SELECT ALL * FROM Exercise); 
`, (res) => {});

query(`
INSERT INTO Exercise_Routine (Exercise_IDs) SELECT
		'{1,2}' WHERE NOT EXISTS (SELECT ALL * FROM Exercise_Routine); 
`, (res) => {});

query(`
INSERT INTO Workout_History (Person_ID, Routine_ID, Exercise_ID,
                             Start_Time, Workout_Duration, Average_Rest, Reps_Per_Set) SELECT
	
		1, 1, 1, now(), 1, 1, '{3,2,4}' WHERE NOT EXISTS (SELECT ALL * FROM Workout_History); 
`, (res) => {});

