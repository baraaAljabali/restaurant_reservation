const pool = require('../database/connection');
const moment = require("moment");

exports.getReservations = (req, res, next) => {
    let query = ``;
    const itemsPerPage = 100;
    const page = parseInt(req.params.page);

    if(req.path.includes("today")) {
        const today = moment() .format('L');
        query = `SELECT *, count(*) OVER() AS full_count
            FROM reservations
            WHERE date = '${today}' 
            ORDER  BY time_start ${req.params.timeOrder}
            LIMIT ${itemsPerPage} OFFSET (${page} - 1) * ${itemsPerPage}`;
    } else {
        query = `SELECT *, count(*) OVER() AS full_count
            FROM reservations
            `;

        if(req.path.includes("tables")) {
            let tables = req.params.tables.split(",");
            tables = tables.map((t) => { return parseInt(t); });
            query = query + `WHERE "table" IN (${tables[0]}`;
            for (let index = 1; index < tables.length; index++) {
                query = query + `,${tables[index]}`;
            }
            query = query + `)`;
        }

        if(req.path.includes("date")) {
            query = query + 
              `WHERE "date" BETWEEN '${req.query.from}' AND '${req.query.to}'`;
        }

        query = query + `
            ORDER  BY serial
            LIMIT ${itemsPerPage} OFFSET (${page} - 1) * ${itemsPerPage}`;
    }
    
    pool.query(query)
    .then(result => {
        if(result.rowCount > 0){
            const fullCount = parseInt(result.rows[0].full_count);
            const reservations = result.rows.map(
                (reserv) => { 
                    delete reserv.full_count;
                    return reserv;
                });
            const hasNextPage = (fullCount
                - (itemsPerPage * page)) > 0? true : false;
            res.status(200).json({ 
                reservations: reservations,
                nextPage: page + 1,
                hasNextPage: hasNextPage
            });
        } else {
            res.status(200).json({ 
                reservations: [],
                nextPage: 2,
                hasNextPage: false
            });
        }
        
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            message: 'Get reservations failed',
            error
        });
    });
}

exports.cancelReservation = (req, res, next) => {
    const today = moment() .format('L');
    const timeNow = moment().format('LT');
    pool.query(
        `DELETE FROM reservations
        WHERE serial = ${req.params.serial} 
        AND date = '${today}' AND time_start > '${timeNow}'`
    )
    .then(result => {
        result.rowCount > 0?
        res.status(200).json({message:   'Deleted!'})
        :
        res.status(403).json({ 
            message: 'nothing to delete (cannot delete past reservations)'
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            message: 'Delete failed',
            error
        });
    });
}

exports.timeSlots = async (req, res, next) => {
    const today = moment() .format('L');
    const timeNow = moment().format('LT');

    pool.query(`
    SELECT table_number
    FROM "tables"
    WHERE seats >= ${parseInt(req.params.seats)} AND deleted = false
    `)
    .then(tablesResult => {
        if(tablesResult.rowCount > 0){
            const slots = {};
            const tables = [];
            tablesResult.rows.forEach(row => {
                slots[row.table_number] = [];
                tables.push(row.table_number)
            });

            pool.query(
                `SELECT time_start, time_end, "table"
                FROM reservations
                WHERE "date"='${today}'
                    AND "table" IN ( ${tables} )
                    AND ( 
                            time_start > '${timeNow}' 
                            OR 
                            time_end > '${timeNow}'
                        )
                GROUP BY "table", time_start, time_end
                `
            )
            .then(reservationsResult => {
                const reservationsByTable = {};
                
                reservationsResult.rows.forEach(reservation => {
                    if(reservationsByTable[reservation.table]){
                        reservationsByTable[reservation.table]
                            .push(reservation);
                    } else {
                        reservationsByTable[reservation.table] = [reservation];
                    }
                });
                const restaurantOpenTime = moment("12:00 pm", "hh:mm a");
                const restaurantCloseTime = moment("11:59 pm", "hh:mm a");
        
                const keysOfReservationsByTable = Object.keys(slots);
                let thereIsTimeSlots = false;
                keysOfReservationsByTable.forEach(table => {
                    let slotStart =  moment(moment(), "hh:mm a");
                    let slotEnd =  moment(moment(), "hh:mm a");
        
                    if(slotStart.isBefore(restaurantOpenTime)){
                        slotStart = restaurantOpenTime;
                    }
        
                    if(!reservationsByTable[table]){
                        slots[table].push({
                            timeStart: slotStart.format("hh:mm a"), 
                            timeEnd: restaurantCloseTime.format("hh:mm a")
                        });
                        thereIsTimeSlots = true;
                    } else {
                        reservationsByTable[table].forEach(reservedSlot => {
                            if(slotStart
                                .isBefore(
                                    moment(reservedSlot.time_start,"hh:mm a")))
                            {
                                slotEnd = moment(
                                        reservedSlot.time_start,"hh:mm a"
                                    );
            
                                slots[table].push({
                                    timeStart: slotStart.format("hh:mm a"), 
                                    timeEnd: slotEnd.format("hh:mm a")
                                });
                                thereIsTimeSlots = true;
            
                                slotStart = moment(
                                        reservedSlot.time_end, "hh:mm a"
                                    );
                            } else if(slotStart
                                        .isSame(moment(
                                            reservedSlot.time_start,"hh:mm a"
                                        )))
                            {
                                slotStart =moment(
                                        reservedSlot.time_end, "hh:mm a"
                                    );
                                slotEnd = moment(
                                        reservedSlot.time_end, "hh:mm a"
                                    );
                            }
                        });
            
                        if(slotStart.isBefore(restaurantCloseTime)){
                            slots[table].push({
                                timeStart: slotStart.format("hh:mm a"),
                                timeEnd: restaurantCloseTime.format("hh:mm a")
                            });
                            thereIsTimeSlots = true;
                        }
                    } 
                });
        
                res.status(200).json(
                    thereIsTimeSlots?
                    { timeSlots: slots }
                    :
                    {message: "Sorry there is no available tables for today"}
                );
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({
                    error
                });
            });
        } else {
            res.status(200).json({
                message: "Sorry there is no available tables "
                    + "that matchs requested seats " + req.params.seats
            });
        }
        
    }).
    catch(error => {
        console.log(error);
        res.status(500).json({
            error
        });
    });
}

exports.createNewReservation = (req, res, next) => {
    const today = moment() .format('L');

    pool.query(`
        SELECT count(*)
        FROM reservations
        WHERE "date"='${today}' AND "table" = ${parseInt(req.body.table)}
        AND ( 
             (time_start BETWEEN '${req.body.timeStart}' AND '${req.body.timeEnd}')
             OR  (time_end BETWEEN '${req.body.timeStart}' AND '${req.body.timeEnd}')
            )
    `)
    .then(result => {
        if(result.rows[0].count !== '0'){
            res.status(409).json({ 
                error: `table ${req.body.table} `
                + `is not available at this time slot (`
                + `from: ${req.body.timeStart} to: ${req.body.timeEnd})`
            });
        } else {
            pool.query(`
            INSERT INTO reservations(
                customer_name,
                customer_mobile,
                "table",
                date,
                time_start,
                time_end
            )
            VALUES (
                '${req.body.customerName}',
                '${req.body.mobile}',
                ${parseInt(req.body.table)},
                '${today}', '${req.body.timeStart}',
                '${req.body.timeEnd}'
                );
            `)
            .then(() => {
                res.status(200).json({ 
                    message: `table ${req.body.table} `
                    + `is reserved at this time slot (`
                    + `from: ${req.body.timeStart} to: ${req.body.timeEnd}) `
                    + `for: ${req.body.customerName}`
                });
                
            })
            .catch(error => {
                if(error.code === "23503") {
                    res.status(422).json({
                        error: `table ${req.body.table} dose not exists!`,
                        code: error.code
                    });
                } else if (error.code === "23514"){
                    let message = "";
                    switch (error.constraint) {
                        case "proper_customer_name":
                            message = "wrong customer name ("
                                + req.body.customerName + "), "
                                + "customer name can only have"
                                + " letters [a-z A-Z] "
                                + "and it must have a single space between"
                                + " first name and last name"
                                + "example: (lara saeed)";
                            break;
                        case "proper_customer_mobile":
                            message =  "wrong mobile number ("
                                + req.body.mobile + "), "
                                + "mobile number can only have"
                                + " digites [0-9] "
                                + "and it must start with (05) "
                                + "and it must be 10 digits long"
                                + "example: (0512345678)";
                            break;
                        case "proper_time_start":
                            message = "Invalid start time ("
                                + req.body.timeStart + "), "
                                + "it must be between (12:00 pm - 11:59 pm) "
                                + "and formated like: (hh:mm am|pm)";
                            break;
                        case 'proper_time_end':
                            message = "Invalid end time ("
                                + req.body.timeEnd + "), "
                                + "it must be between (12:00 pm - 11:59 pm) "
                                + "and formated like: (hh:mm am|pm)";
                        default:
                            message = "Failing row constraint ("
                                + error.constraint + "), has not been met"
                            break;
                    }
                    res.status(422).json({
                        error: message,
                        code: error.code
                    });
                } else {
                    console.log(error);
                    res.status(500).json({
                        error: error.detail,
                        code: error.code
                    });
                }
                
            });
        }
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({error});
    });
}