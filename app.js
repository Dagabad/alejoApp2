var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = express();

//para que funcione body-parcer
app.use(bodyParser.urlencoded({ extended: true })); //support x-www-form-urlencoded

//para la conexcion
var conexion = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password  : '',
	database : 'alejobd'
});

//Conectando con mysql
conexion.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('connected as id conexión correcta  ' + conexion.threadId);
});

//usando ejs como view engine
app.set('view engine', 'ejs');

//usando y declaranco como estatica la carpeta public
app.use(express.static("public"));


//Get a index
app.get("/", function(req, res){
  res.render('pages/index');
});


//Post de validacion del formulario
app.post('/',function(req, res){
	//console.log(req.body);
	if (req.body.contrasena == "1234") {
	    res.redirect('categoria');
	}if(req.body.nombre == "admin" && req.body.contrasena == ""){
	  //res.redirect("adminT");//no esta implementado
	}else {
	  res.render("pages/index");
	}
});


//Get para mostrar categorias
app.get("/categoria", function(req, res){

	conexion.query('SELECT * FROM categoria', function (err, rows){
		if (err) {
			console.log("El error esta : %s ", err);
		}

		res.render('pages/categoria', {categoria : rows});		
	});
  
});

//Get que toma el odigo de categoria para buscar en plato
app.get("/plato/:id", function(req, res){

	var id = req.params.id;

	conexion.query('SELECT * FROM plato WHERE codigo_categoria = ?', id, function (err, rows){
		if (err) {
			console.log("El error esta : %s ", err);
		}

		res.render('pages/plato', {plato : rows});		
	});
});

//Get, toma el Codigo del plato para buscar en plato_ingrediente
app.get("/ingrediente/:id", function(req, res){

	var id = req.params.id;
	var fila;

	conexion.query('SELECT * FROM ingrediente i join plato_ingrediente p on i.referencia = p.referencia_ingrediente WHERE p.codigo_plato = ?', id, function (err, rows){
		if (err) {
			console.log("El error esta : %s ", err);
		}

		res.render('pages/ingrediente', {plato_ingrediente : rows});		
	});
});

///guardarUsuario/<%= usuario.id %>?_method=put
// consulta SELECT * FROM ingrediente i join plato_ingrediente p on i.referencia = p.referencia_ingrediente WHERE p.codigo_plato = 11

app.listen(5000);