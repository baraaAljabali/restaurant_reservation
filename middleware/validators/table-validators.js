exports.tableNumbreValidator = (req, res, next) => {
    if(!req.body.tableNumber){
        res.status(422).json({
            error: "must supply table number"
        });
    } else if(typeof req.body.tableNumber != "number"){
        res.status(422).json({
            error: "table number must be an integer"
        });
    } else {
        next();
    }
}

exports.tableSeatsValidator = (req, res, next) => {
    if(!req.body.seats){
        res.status(422).json({
            error: "must supply table seats"
        });
    } else if(typeof req.body.seats != "number"){
        res.status(422).json({
            error: "table seats must be an integer"
        });
    } else if (req.body.seats < 1 || req.body.seats > 12){
        res.status(422).json({
            error: "table seats must be between 1 and 12"
        });
    }  else {
        next();
    }
}