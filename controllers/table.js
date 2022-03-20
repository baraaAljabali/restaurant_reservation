const pool = require('../database/connection');
const moment = require("moment");

exports.getAllTables = (req, res, next) => {
    pool.query(
        `SELECT *
        FROM tables`
    )
    .then(result => {
        res.status(200).json({ 
            tables: result.rows
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            message: 'Get tables failed',
            err
        });
    });
}

exports.addTable = (req, res, next) => {
    pool.query(
        `INSERT INTO tables (table_number, seats)
        VALUES ('${req.body.tableNumber}', '${req.body.seats}')`,
        (error, result) => {
        if (error) {
            if (error.code === "23514"){
                res.status(422).json({
                    error: "table seats must be between 1 and 12",
                    code: error.code
                });
            } else if(error.code === "23505") {
                pool.query(
                    `UPDATE tables
	                SET  seats = '${req.body.seats}', deleted = false
	                WHERE table_number = '${req.body.tableNumber}' AND deleted = true
                    `,
                    (err, result) => {
                        if (err) {
                            if (err.code === "23514"){
                                res.status(422).json({
                                    error: "table seats must be between 1 and 12",
                                    code: err.code
                                });
                            } else {
                                console.log(err)
                                res.status(500).json({
                                    error: err.detail,
                                    code: err.code
                                });
                            }
                        } else {
                            res.status(201).json(
                                result.rowCount > 0 ?
                                {
                                    message: `Table: ${req.body.tableNumber}, `
                                    + "added successfuly"
                                }
                                 :
                                 {
                                    error: error.detail,
                                    code: error.code
                                 }
                                );
                        }
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
            `Table: ${req.body.tableNumber}, added successfuly`
            );
        }
        });
}

exports.deleteTable = (req, res, next) => {
    const today = moment() .format('L');
    const timeNow = moment().format('LT');

    pool.query(`
        UPDATE tables
        SET deleted=true
        WHERE NOT EXISTS(
        SELECT "table"
        FROM reservations
        WHERE "table" = ${req.params.num} AND "date" = '${today}' 
        AND (time_start > '${timeNow}' OR time_end > '${timeNow}')
        )
        AND table_number = ${req.params.num}
        `)
    .then(result => {
        if (result.rowCount > 0){
            res.status(200).json({ 
                message: 'Deleted!'            
            });
        } else {
            res.status(200).json({ 
                message: 'Connot delete a table that is reserved'
                    + 'or dose not exists!'
            });
        }
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            message: 'Delete failed',
            error
        });
    });
}