///// set our current env to development
const env = process.env.NODE_ENV || 'development';
///// db access details
/////for app.js to connect to postgresQL
const config = require('./config.js')[env];
const http = require('http');

const hostname = '127.0.0.1';
const port = 7000;
const express = require('express');
//var exphbs = require('express-handlebars');
const path = require('path');
const app = express();
const multer = require('multer');
const pg = require('pg');
const ejs = require('ejs');

//const upload = multer({ storage: filestorage });
const fs = require('fs');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var uuid = require('uuid');
/// use JSON parser
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/public'));
//const upload = multer({ dest: '\image' });
//app.set('view engine', '.hbs');
const filestorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb('null', './image');
    },
    filename: (req, file, cb) => {
        cb(null, date.now() + path.extname(file.originalname));

    },
});
//// use NODE middleware body parser to handle form data
///// https://www.npmjs.com/package/body-parser
///// landing page handler



app.get('/', function(req, res) {
    let title = "NodeJS, ExpressJS, EJS and Postgres demo";
    res.render('index', { title: title });
});


app.get('/index', function(req, res) {
    let title = "This is home page";
    res.render('index', { title: { title } });
});

app.post('/', function(req, res) {
    res.set({ status: 200, 'Content-Type': 'text/html' });
    res.send('<html><head></head><body><h1>my home page !</h1></body></html>');
});

app.get('/', function onrequest(req, res) {
    res.writeHead(200, { 'content-type': 'text/html' });
    fs.readFile('index.html', null, function(error, data) {
        if (error) {
            res.writeHead(404);
            res.write('file is not found');
        } else {
            res.write(data)
        }
        res.end();
    });

});

app.get('/users', async(req, res) => {

    let results;
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    const q = ` SELECT hotelbooking.room.r_no, hotelbooking.room.r_class, hotelbooking.room.r_status, hotelbooking.room.r_notes , hotelbooking.rates.price
    FROM hotelbooking.room INNER JOIN hotelbooking.rates ON hotelbooking.room.r_class=hotelbooking.rates.r_class `;
    await client.query(q).then(results => {
        client.release();

        data = results.rows;
        data.user_id = '12146';
        data.email = 'Daphne.Mann@yahoo.com';
        count = data.length;
        res.render('users', { record: data });

    }).catch(err => {
        console.log(err.stack)
        errors = err.stack.split(" at ");
        res.json({ record: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
    })

});
app.get('/users/:email', async(req, res) => {
    const email = req.params.email;
    //console.log(routeParams);
    let results;
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    const q = `SELECT c_no, c_name, c_email, c_address, c_cardtype, c_cardexp, c_cardno	FROM hotelbooking.customer where c_email='${email}'; 
    SELECT hotelbooking.room.r_no, hotelbooking.room.r_class, hotelbooking.room.r_status, hotelbooking.room.r_notes , hotelbooking.rates.price
    FROM hotelbooking.room INNER JOIN hotelbooking.rates ON hotelbooking.room.r_class=hotelbooking.rates.r_class`;
    await client.query(q).then(results => {
            client.release();
            for_id = results[0].rows[0].c_no;
            //for_id1 = for_id.c_no;
            //console.log(for_id);
            data = results[1].rows;
            data.user_id = for_id;
            data.email = email;
            //console.log(data);
            count = data.length;
            res.render('users', { record: data });

        }).catch(err => {
            console.log(err.stack)
            errors = err.stack.split(" at ");
            res.render('users', { record: 'not' });
        })
        //res.render('users', { data: ['Room  Available', '12146', 'Daphne.Mann@yahoo.com'] });
});
app.get('/booking/:b_data', async(req, res) => {
    let results;
    const pool = new pg.Pool(config);
    const client = await pool.connect();

    var b_data = req.params.b_data;

    var bk = b_data.split(",");
    //console.log(bk);
    q = `SELECT  c_name, c_cardtype, c_cardexp, c_cardno FROM hotelbooking.customer where c_no='${bk[1]}'`;

    await client.query(q).then(results => {
        client.release();

        b_data1 = req.params.b_data + ',' + results.rows[0].c_name + ',' + results.rows[0].c_cardno;
        var bk1 = b_data1.split(",");
        console.log(bk1);

        res.render('booking', { record: bk1 });
    }).catch(err => {

        res.render('booking', { record: 'Sorry something went wrong! Your Registration has not been successful ' + err[0] });
    });

});
app.post('/register', async(req, res) => {
    const max = 22222;
    const min = 10000;
    const c_num = Math.floor(Math.random() * (max - min) + min);
    let results;
    const pool = new pg.Pool(config);
    const client = await pool.connect();

    const c_name = req.body.c_name;
    const c_email = req.body.c_email;
    const c_address = req.body.c_address;
    const c_cardtype = req.body.c_cardtype;
    const c_card_no = req.body.c_card_no;
    const ex_card_date = req.body.ex_card_date;
    c_ex_date = ex_card_date.split("-");
    tw = +c_ex_date[0].toString().substr(-2);
    c_ex_dat = c_ex_date[1] + '/' + tw;
    //console.log(tw);
    const q = `INSERT INTO hotelbooking.customer(c_no, c_name, c_email, c_address, c_cardtype, c_cardexp, c_cardno)
        VALUES ('${c_num}', '${c_name}', '${c_email}', '${c_address}', '${c_cardtype}', '${c_ex_dat}', '${c_card_no}')`;
    console.log(q);
    await client.query(q).then(results => {
        client.release();

        var record1 = {
            'msg': 'Customer Successfully Register ::' + c_email
        };

        res.render('register', { record: record1 });
    }).catch(err => {

        res.render('register', { record: 'Sorry something went wrong! Your Registration has not been successful ' + err[0] });
    });
    //  res.render('register', { record: 'register' });
});
app.post('/booking_room', async(req, res) => {

    const max = 99999;
    const min = 10000;
    const g_num = Math.floor(Math.random() * (max - min) + min);
    let results;
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    const c_id = req.body.c_id;
    const u_email = req.body.u_email;
    const room_id = req.body.room_id;
    const r_class = req.body.r_class;
    const r_price = req.body.r_price;
    const b_date_f = req.body.b_date_f;
    const b_date_t = req.body.b_date_t;
    const final_d = 'from' + '(' + b_date_f + ')' + 'to' + '(' + b_date_t + ')'
    let d_t = new Date();
    q = `INSERT INTO hotelbooking.booking( b_ref,c_no, b_cost, b_outstanding, b_notes) 
    VALUES ('${g_num}','${c_id}', '${r_price}', '${r_price}', '${final_d}');UPDATE hotelbooking.room	SET   r_status='O'	WHERE r_no='${room_id}'`;
    // q1 = `UPDATE hotelbooking.room	SET   r_status='O'	WHERE r_no='${room_id}';`;
    //console.log(q);
    await client.query(q).then(results => {
        client.release();

        var record1 = { 'msg': 'Booking Room successful. Your Reference Number are ' + g_num, 'email': u_email };

        res.render('booking', { record: record1 });
    }).catch(err => {

        res.render('booking', { record: 'Sorry something went wrong! Your booking has not been successful ' + err[0] });
    });

});
app.get('/register', function(req, res) {

    res.render('register', { record: 'welcome' });

});
app.post('/register1/gg', async(req, res) => {
    let results;
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    const mypic = req.body.mypic;
    const fname = req.body.fname;
    const lname = req.body.lname;
    const country = req.body.country;
    const email = req.body.r_email;
    const dob = req.body.dob;
    const gender = req.body.gender;
    const post_code = req.body.p_code;
    const nationality = req.body.nationality;

    response = {
        mypic: mypic,
        fname: fname,
        lname: lname,
        country: country,
        email: email,
        dob: dob,
        gender: gender,
        post_code: post_code,
        nationality: nationality
    }

    console.log(response);
    //res.json(response);

    const q = `insert into public.record (fname, lname, country, email, dob, gender, post_code, nationality)	values ('${fname}', '${lname}', '${country}', '${email}','${dob}','${gender}', '${post_code}','${nationality}');select * from public.record`;
    await client.query(q).then(results => {
        client.release();
        data = results[1].rows;
        //console.log(data);
        count = data.length;
        res.json({ data, rows: count });
    }).catch(err => {
        console.log(err.stack)
        errors = err.stack.split(" at ");
        res.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
    })

    console.log('end of POST');
});




app.listen(port, hostname, (onrequest) => {
    console.log(`Server running at http://${hostname}:${port}/`);

});