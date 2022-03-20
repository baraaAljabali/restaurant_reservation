const moment = require("moment");

exports.pageValidator = (req, res, next) => {
    if(!/^([1-9][0-9]*)+$/.test(req.params.page)) {
        const message = "wrong page number ("
        + req.params.page + "), "
        + "page number can only have digites [0-9] "
        + "and it must be larger than 0 and it cannot start with 0";

        res.status(422).json({
            error: message
        });
    } else {
        next();
    } 
}

exports.customerNameValidator = (req, res, next) => {
    if(!req.body.customerName){
        res.status(422).json({
            error: "must supply customer name"
        });
    } else if(!/^[a-zA-Z]+( [a-zA-Z]+)$/.test(req.body.customerName)) {
        const message = "wrong customer name ("
        + req.body.customerName + "), "
        + "customer name can only have"
        + " letters [a-z A-Z] "
        + "and it must have a single space between"
        + " first name and last name"
        + "example: (lara saeed)";

        res.status(422).json({
            error: message
        });
    } else {
        next();
    }  
}

exports.mobileValidator = (req, res, next) => {
    if(!req.body.mobile){
        res.status(422).json({
            error: "must supply customer mobile number"
        });
    } else if(!/^05[0-9]*$/.test(req.body.mobile)) {
        const message = "wrong mobile number ("
        + req.body.mobile + "), "
        + "mobile number can only have"
        + " digites [0-9] "
        + "and it must start with (05) "
        + "and it must be 10 digits long"
        + "example: (0512345678)";

        res.status(422).json({
            error: message
        });
    } else if(req.body.mobile.length < 10) {
        const message = "wrong mobile number ("
        + req.body.mobile + "), "
        + "mobile number must be 10 digits long, "
        + "example: (0512345678)";

        res.status(422).json({
            error: message
        });
    } else {
        next();
    } 
}

exports.timeValidator = (req, res, next) => {
    let message = "";
    const timeFormat = /^(0[1-9]|1[012]):([0-5][0-9])( (am|pm))$/;
    if(!req.body.timeStart){
        message = "must supply reservation start time"
    } 

    if(!req.body.timeEnd){
        message = "must supply reservation end time"
    }

    if(message === ""){
        if(!timeFormat.test(req.body.timeStart)) {
            message = message + "invalid time start format, "
            + "proper format is (hh:mm am|pm). ";
        }
    
        if(!timeFormat.test(req.body.timeEnd)) {
            message = message + "invalid time end format, "
            + "proper format is (hh:mm am|pm). ";
        } 
    }

    const reservationTimeStart = moment(req.body.timeStart,"hh:mm a");
    const reservationTimeEnd = moment(req.body.timeEnd,"hh:mm a");

    if(message === ""){
        const timeNow = moment(moment(), "hh:mm a");;

        if(reservationTimeStart.isBefore(timeNow)){
            message = message + 
            "reservetion time start cannot be in the past. ";
        } 
        
        if(reservationTimeEnd.isBefore(timeNow)){
            message = message + 
            "reservetion time end cannot be in the past. ";
        } 
    }
    
    if(message === ""){
        const restaurantOpenTime = moment("12:00 pm", "hh:mm a");
        const restaurantCloseTime = moment("11:59 pm", "hh:mm a");
        

        if(reservationTimeStart.isBefore(restaurantOpenTime)){
            message = message + 
            "reservetion time start cannot be before open hour (12:00 pm). ";
        } 
        if(reservationTimeEnd.isAfter(restaurantCloseTime)){
            message = message + 
            "reservetion time end cannot be after close hour (11:59 pm). ";
        }
        if(reservationTimeEnd.isBefore(reservationTimeStart)){
            message = message + 
            "reservetion time end must be after reservetion time start "
            + req.body.timeEnd + " is before " + req.body.timeStart + "."
        } 

        if(message !== ""){
            res.status(422).json({
                error: message
            });
        } else {
            next();
        }
    } else {
        res.status(422).json({
            error: message
        });
    }
}

exports.tableValidator = (req, res, next) => {
    if(!req.body.table){
        res.status(422).json({
            error: "must supply table number"
        });
    } else if(!/^[1-9][012]*$/.test(req.body.table)){
        res.status(422).json({
            error: "table number must be a digit [0-9] "
            + "and it must be larger than 0 and it cannot start with 0"
        });
    }  else {
        next();
    }
}

exports.tablesFilterValidator = (req, res, next) => {
    if(!/^([0-9]+,)*[0-9]$/.test(req.params.tables)) {
        const message = "wrong tables filtering value. "
        + "please send tables numbers like this: 1,10,5";

        res.status(422).json({
            error: message
        });
    } else {
        next();
    }  
}

exports.dateFilterValidator = (req, res, next) => {
    const dateFormat =
        /^(0[1-9]|1[012])[\/](0[1-9]|[12][0-9]|3[01])[\/]((?:19|20)\d\d)$/;
    
    let message = "";
    console.log(req.param)
    if(!dateFormat.test(req.query.from)) {
        message = "wrong date format for (from), "
        + "proper date format is: mm/dd/yyyy e.g. 03/18/2022. ";
    } 
    if(!dateFormat.test(req.query.to)) {
        message = message +  "wrong date format for (to), "
        + "proper date format is: mm/dd/yyyy e.g. 03/18/2022";
    } 

    if(message !== ""){
        res.status(422).json({
            error: message
        });
    } else {
        next();
    }
}

exports.seatsValidator = (req, res, next) => {
    if(!/^[1-9][012]*$/.test(req.params.seats)){
        res.status(422).json({
            error: "table seats must be number between 1 and 12"
        });
    }  else {
        next();
    }
}