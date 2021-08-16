var http = require("http");
var express = require("express");
var app = express();
const bodyParser = require('body-parser');
var db = require("./db");
const { resolve } = require("path");
const { rejects } = require("assert");
const { getCipherInfo } = require("crypto");
const { Console } = require("console");
const port = 3000;

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

// Add headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});  

app.get("/", function(req, res) {
    res.json({
        'status': 'ok',
        'message': 'Server running on http://localhost:' + port + '/',
        'API version': 'v1.0'
    });
})

app.post("/users/login", function(req, res) {
    var uname = req.body.username;
    var pword = req.body.password;
    db.query("select id, profile_id, username, user_type, created_at, updated_at, flag from user_auth where username='" + uname + "' and password = '" + pword + "'",
    function(err, result) {
        if(err) throw err;
        res.json(result[0]);
    });
})

app.get("/users/:id", function(req, res) {
    db.query("select * from user_profiles where id = " + req.params.id, function(err, result) {
        if(err) throw err;
        res.json(result[0]);
    })
})

getVehicles = function(a) {
    return new Promise(function(resolve, reject) {
        let data = [];
        db.query("select * from vehicle_information", function(err, data) {
            if(err) { console.log(err, err.stack) }
            else {
                for(let i = 0; i < data.length; i ++) {
                    db.query("select * from vehicle_owner where identifier = " + data[i]['vehicle_owner_id'], function(err, result) {
                        if(err) { console.log(err, err.stack) }
                        else { 
                            data[i]['vehicle_owner'] = result;
                            resolve(data) 
                        }
                    })
                }        
            }
        });
    })
}

app.get("/vehicle_info/all", function(req, res) {
    getVehicles().then(function(l1) { 
        res.json(l1);
    });
}) 

app.get("/vehicle_info/:id", function(req, res) {
    db.query("select * from vehicle_information where identifier = " + req.params.id, function(err, data) {
        if(err) { console.log(err, err.stack) }
        else {
            res.json(data[0]);
        }
    })
}) 

app.get("/vehicle_info/status/:flag", function(req, res) {
    db.query("select * from vehicle_information where flag = " + req.params.flag + " and DATE(date_of_new_inspection) = CURDATE()", function(err, data) {
        if(err) { console.log(err, err.stack) }
        else { res.json(data) }
    })
}) 

app.post("/vehicle_info", function(req, res) {
    let v = req.body;
    console.log(v);
    db.query("INSERT INTO vehicle_information (inspection_id, purpose, historic_vehicle, equivalent_inertia, fuel_type, traction_type, model_year, engine_capacity, category, category_type, chassis, engine, mv_file_no, circulation_date, vehicle_color, first_registration_date, license_plate, manufacturer, brand, mileage, turbo, presence_of_catalytic_converter, maximum_total_weight, number_of_axes, vin) VALUES ('" + v.inspection_id + "', '" + v.purpose + "', '" + v.Historic_Vehicle + "', " + v.Equivalent_Inertia + ", '" + v.Fuel_Type + "', '" + v.Traction_Type + "', '" + v.Model_Year + "', " + v.Engine_Capacity + ", '" + v.Category + "', '" + v.Category_Type + "', '" + v.Chassis + "', '" + v.Engine + "', '" + v.MV_File_No + "', '" + v.Circulation_Date + "', '" + v.Color + "', '" + v.Date_First_Registration + "', '" + v.License_Plate + "', '" + v.Manufacturer + "', '" + v.Brand + "', " + v.Mileage + ", '" + v.Turbo + "', '" + v.Presence_Of_Catalytic_Converter + "', " + v.Maximum_Total_Weight + ", " + v.Number_Of_Axes + ", '" + v.VIN + "');", 
    function(err, data) {
        let response = {
            result: "okay"
        };
        if(err) { 
            response.result = "failed";
            res.json(response); 
        }
        else { 
            res.json(response); 
        }
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});