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
	  res.redirect("administrador");
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

//--------------------------------------- CRUD -------------------------------

//Implementando administrador, mostrará la tabla de platos
//Get, toma el Codigo del plato para buscar en plato_ingrediente
app.get("/administrador", function(req, res){

	conexion.query('SELECT c.codigo as codigo_categoria, c.nombre as nombre_categoria, p.codigo, p.nombre FROM plato p join categoria c on p.codigo_categoria = c.codigo', function (err, rows){
		if (err) {
			console.log("El error esta : %s ", err);
		}

		res.render('pages/administrador', {plato : rows});
		//console.log(rows[0]);		
	});
});

//Mostrar formulario de guardar plato
app.get("/guardarPlato", function(req, res){
	res.render('pages/crearPlato');
});

//Guarda (crea) el plato y la categoria
app.post('/guardarPlato',function(req, res){

	//console.log(req.body);

	
	var datosCategoria = {
		codigo: req.body.codigoCategoria,
		nombre: req.body.nombreCategoria
	};

	var datosPlato = {
		nombre: req.body.nombrePlato,
		codigo_categoria: req.body.codigoCategoria
	};

	var codigoRecuperado;

	var queryCategoria = conexion.query('INSERT INTO categoria set ?', datosCategoria, function(err, rows){
   		if(err){
      		throw err;
   		}else{
   			//this.codigoRecuperado = rows.insertId;
      		//res.redirect('/guardarPlato');
   		}
 	});

 	var queryPlato = conexion.query('INSERT INTO plato set ?', datosPlato, function(err, rows){
   		if(err){
      		throw err;
   		}else{
   			//this.codigoRecuperado = rows.insertId;
      		res.redirect('/administrador');
   		}
 	});

});

//Ir al administrador de ingredientes, le llega el codigo del plato para mostrar los ingredientes
//Get que toma el odigo de categoria para buscar en plato
app.get("/administradorIngredientes/:id", function(req, res){

	var id = req.params.id;

	conexion.query('SELECT i.referencia, i.nombre, i.cantidad, p.codigo_plato FROM plato_ingrediente p join ingrediente i on p.referencia_ingrediente = i.referencia WHERE codigo_plato = ?', id, function (err, rows){
		if (err) {
			console.log("El error esta : %s ", err);
		}
		//console.log(rows[0]);
		res.render('pages/administradorIngredientes', {ingrediente : rows});		
	});
});

//Muestra vista formulario Guardar ingrediente
app.get("/guardarIngrediente/:id", function(req, res){

	var id = {codigo_plato : req.params.id};
	res.render('pages/crearIngrediente',{codigo : id});

});

//Crear ingrediente
app.post('/guardarIngrediente',function(req, res){

	//console.log(req.body);

	
	var datosIngrediente = {
		referencia : req.referenciaIngrediente,
		nombre: req.body.nombreIngrediente,
		cantidad: req.body.cantidadIngrediente
	};

	var datosPlatoIngrediente = {
		numero: '',
		codigo_plato: req.body.codigoPlato,
		referencia_ingrediente: req.body.referenciaIngrediente,
	};

	var queryIngrediente = conexion.query('INSERT INTO ingrediente set ?', datosIngrediente, function(err, rows){
   		if(err){
      		throw err;
   		}else{

   		}
 	});

 	var queryPlatoIngrediente = conexion.query('INSERT INTO plato_ingrediente set ?', datosPlatoIngrediente, function(err, rows){
   		if(err){
      		throw err;
      		res.redirect('/administradorIngredientes');
   		}else{
   			//this.codigoRecuperado = rows.insertId;
      		res.redirect('/administradorIngredientes');
   		}
 	});

});


///guardarUsuario/<%= usuario.id %>?_method=put
// consulta SELECT * FROM ingrediente i join plato_ingrediente p on i.referencia = p.referencia_ingrediente WHERE p.codigo_plato = 11

app.listen(5000);