const http = require('http');
const fs = require('fs');
const csv = require('csv-parser');
const hostname = '127.0.0.1';
const port = 3010;
const express = require('express');
var bodyParser = require('body-parser');
const app = express();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var moment = require('moment'); // require

// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.post('/export', urlencodedParser,async (req,res)=>{
	var out = new Date();
	!fs.existsSync(`Output/${req.body.address}`) && fs.mkdirSync(`Output/${req.body.address}`, { recursive: true })
	const csvWriter = createCsvWriter({
	  path: `Output/${req.body.address}/${out.getTime()}.csv`,
	  header: [
	    {id: 'operation', title: 'operation'},
	    {id: 'amount', title: 'amount'},
	    {id: 'fee', title: 'fee'},
	    {id: 'date', title: 'date'},
	    {id: 'hash', title: 'hash'},
	  ]
	});

	const datatx = [];
	var txs_array = JSON.parse(req.body.json)
	for(var j=0;j<txs_array.txs.length;j++){
		var tx = {}
		if(txs_array.txs[j].from==req.body.address){
			tx.operation = 'Sell'
		}else{
			tx.operation = 'Buy'
		}
		tx.amount =(txs_array.txs[j].value/(10**txs_array.txs[j].tokenDecimal))
		tx.fee = txs_array.txs[j].gasUsed/(10**8)
		tx.date = moment.unix(txs_array.txs[j].timeStamp).format("MM/DD/YYYY-HH:mm")
		tx.hash = txs_array.txs[j].hash
		datatx.push(tx)
	}
	console.log(datatx)
	csvWriter
	  .writeRecords(datatx)
	  .then(()=> console.log('The CSV file was written successfully'));
})

app.get('/data/:address' , (req,res)=>{
	var all_files = []
	console.log(`Checking ${req.params.address}`)
	fs.readdir(`Output/${req.params.address}`, function (err, files) {
	    //handling error
	    if (err) {
	        return console.log('Unable to scan directory: ' + err);
	    } 
	    //listing all files using forEach
	    files.forEach(function (file) {

	        // Do whatever you want to do with the file
	        all_files.push(file); 
	    });
	    console.log(all_files)
	    res.setHeader('Access-Control-Allow-Origin', 'http://0.0.0.0:3000');
	    res.json({txs:all_files})
	});
})

app.get('/:address/:file', function(req, res){
	console.log('download')
  const file = `Output/${req.params.address}/${req.params.file}`;
  res.download(file); // Set disposition and send it.
});

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});