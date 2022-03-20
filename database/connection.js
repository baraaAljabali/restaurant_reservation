const Pool = require('pg').Pool;

/**
 * Connecting to PostgesSQL
 */
const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'restaurant_reservation',
  password: 'Bb!123456',
  port: 5432,
});

/** Configure databse on first run */
pool.query(`
  CREATE TABLE IF NOT EXISTS users
  (
      emp_num character(4) NOT NULL,
      emp_name character varying(50) NOT NULL,
      role character varying(8) NOT NULL,
      password character varying NOT NULL,
      CONSTRAINT emp_num PRIMARY KEY (emp_num),
      CONSTRAINT proper_emp_num CHECK (emp_num ~ '^[0-9]*$' AND length(emp_num) = 4),
      CONSTRAINT proper_emp_name CHECK (emp_name ~ '^[a-zA-Z]+( [a-zA-Z]+)$'),
      CONSTRAINT proper_password CHECK (length(password) >= 6),
      CONSTRAINT prpper_role CHECK (role = 'admin' OR role = 'employee')
  );
`).then (createUsersResult => {
    console.log({createUsersResult});
    pool.query(`
      INSERT INTO users(
      emp_num, emp_name, role, password)
      VALUES ('0001', 'admin user', 'admin',
        '$2a$10$n0LP7hFJgttgtsi/W.itJegLFHt1AFXF64l9mmw3VrHOmglHSBJQS')
      ON CONFLICT DO NOTHING;
    `)
    .then(insertUserResult => {
      console.log({insertUserResult})
    })
    .catch(err => {
      console.log(err)
    });
})
.catch(err => {
    console.log(err)
});

pool.query(`
  CREATE TABLE IF NOT EXISTS "tables"
  (
      table_number integer NOT NULL,
      seats integer NOT NULL,
      deleted boolean NOT NULL DEFAULT false,
      CONSTRAINT tables_pkey PRIMARY KEY (table_number),
      CONSTRAINT proper_seats CHECK (seats >= 1 AND seats <= 12)
  );
`).then (createTableResult => {
    console.log({createTableResult});
    pool.query(`
      INSERT INTO "tables"(
      table_number, seats, deleted)
      VALUES (1, 7, false)
      ON CONFLICT DO NOTHING;
    `)
    .then(insertTableResult => {
      console.log({insertTableResult})
    })
    .catch(err => {
      console.log(err)
    });
})
.catch(err => {
    console.log(err)
});

pool.query(`
  CREATE TABLE IF NOT EXISTS reservations
  (
      serial serial,
      customer_name character varying(50) NOT NULL,
      customer_mobile character varying(10) NOT NULL,
      "table" integer NOT NULL,
      date date NOT NULL,
      time_start time without time zone NOT NULL,
      time_end time without time zone NOT NULL,
      PRIMARY KEY (serial),
      CONSTRAINT "table" FOREIGN KEY ("table")
          REFERENCES "tables" (table_number) MATCH SIMPLE
          ON UPDATE NO ACTION
          ON DELETE NO ACTION
          NOT VALID,
      CONSTRAINT proper_customer_name CHECK (customer_name ~ '^[a-zA-Z]+( [a-zA-Z]+)$'),
      CONSTRAINT proper_customer_mobile CHECK (customer_mobile ~ '^05[0-9]*$' AND length(customer_mobile) = 10),
      CONSTRAINT proper_time_start CHECK (time_start >= '12:00 pm' AND time_start <= '11:59 pm'),
      CONSTRAINT proper_time_end CHECK (time_end >= '12:00 pm' AND time_end <= '11:59 pm' AND time_end > time_start)
  );
`).then (createReservationResult => {
    console.log({createReservationResult})
})
.catch(err => {
    console.log(err)
});

module.exports =  pool;