exports.employeeNumberValidator = (req, res, next) => {
    let message = "";
    if(!req.body.empNum){
        res.status(422).json({
            error: "must supply employee number"
        });
    } else if(req.body.empNum.length > 4){
        message = "wrong employee number ("
        + req.body.empNum + "), "
        + "employee number must be 4 digits long";
        
        res.status(422).json({
            error: message
        });
    } else if(!/^[0-9]*$/.test(req.body.empNum)) {
        message = "wrong employee number ("
        + req.body.empNum + "), "
        + "employee number can only have digits [0-9]";
        res.status(422).json({
            error: message
        });
    } else {
        next();
    }  
}

exports.employeeNameValidator = (req, res, next) => {
    if(!req.body.empName){
        res.status(422).json({
            error: "must supply employee name"
        });
    } else if(!/^[a-zA-Z]+( [a-zA-Z]+)$/.test(req.body.empName)) {
        const message = "wrong employee name ("
        + req.body.empName + "), "
        + "employee name can only have"
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

exports.employeeRoleValidator = (req, res, next) => {
    if(!req.body.role){
        res.status(422).json({
            error: "must supply employee role"
        });
    } else if(req.body.role.toLowerCase() !== "admin" && 
        req.body.role.toLowerCase() !== "employee" ) {
        const message = "wrong employee role ("
        + req.body.role + "), "
        + "employee role can only be"
        + " 'admin' or 'employee'";

        res.status(422).json({
            error: message
        });
    } else {
        next();
    }  
}

exports.employeePasswordValidator = (req, res, next) => {
    if(!req.body.password){
        res.status(422).json({
            error: "must supply password"
        });
    } else if(req.body.password.trim().length < 6) {
    const message = "passwords must be at least 6 characters long";

    res.status(422).json({
        error: message
    });
} else {
    next();
}
};