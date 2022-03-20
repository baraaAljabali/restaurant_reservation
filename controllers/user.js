/**
 * functions that manages all operations on User model
 * Called by the routes from front-end
 **/
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/connection');


exports.login = (req, res, next) => {
    pool.query(
        `SELECT *
        FROM users
        WHERE emp_num = '${req.body.empNum}'`
    )
    .then(async result => {
        if (result.rows.length > 0) {
            bcrypt.compare(req.body.password, result.rows[0].password,
                (err, equal) => {
                    if(err){
                        res.status(500).json({
                            error: 'Auth failed! Erorr in bcrypt',
                            err
                        });
                    }
                    else if (equal) {
                        req.redisClient.set(
                            result.rows[0].emp_num,
                            result.rows[0].role
                        );
                        const token = jwt.sign(
                            {empNum: result.rows[0].emp_num},
                            'secret',
                            { expiresIn: 60 * 60 });
                        res.status(200).json({ token });
                    } else {
                        res.status(401).json({ 
                            error: 'Auth failed! Wrong password'
                        });
                    }
                });
        } else {
            res.status(401).json({error: 'employess number does not exist!'});
        }
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            error: 'Auth failed! Erorr with database',
            err
        });
    });
}

exports.addUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (error, hashedPassword) => {
        if (error) { 
            res.status(500).json({
                error: 'Add user! Erorr in bcrypt',
                err
            });
        } else {
            pool.query(`
                INSERT INTO users (emp_num, emp_name, role, password)
                VALUES ('${req.body.empNum}', '${req.body.empName}', 
                    '${req.body.role.toLowerCase()}', '${hashedPassword}')
                `,
                (error, result) => {
                if (error) {
                    if (error.code === "23514"){
                        let message = "";
                        switch (error.constraint) {
                            case "proper_emp_num":
                                message = "wrong employee number ("
                                    + req.body.empNum + "), "
                                    + "employee number can only have"
                                    + " digits [0-9] and it must be 4 digits long";
                                break;
                            case "proper_emp_name":
                                message = "wrong employee name ("
                                    + req.body.empName + "), "
                                    + "employee name can only have"
                                    + " letters [a-z A-Z] "
                                    + "and it must have a single space between"
                                    + " first name and last name"
                                    + "example: (lara saeed)";
                                break;
                            case "proper_role":
                                message = "wrong employee role ("
                                    + req.body.role + "), "
                                    + "employee role can only be"
                                    + " 'admin' or 'employee'";
                                break;
                            default:
                                message = "Failing row constraint ("
                                    + error.constraint + "), has not been met"
                                break;
                        }
                        res.status(422).json({
                            error: message,
                            code: error.code
                        });
                    } else if (error.code === "22001"){
                        res.status(422).json({
                            error: "wrong employee number ("
                                + req.body.empNum + "), "
                                + "employee number must be 4 digits long",
                            code: error.code
                        });
                    } else {
                        console.log(error)
                        res.status(500).json({
                            error: error.detail,
                            code: error.code
                        });
                    }
                } else {
                     res.status(201).send(
                        `User: ${req.body.empNum}, added successfuly`
                    );
                }
              });
        }
    });
}
