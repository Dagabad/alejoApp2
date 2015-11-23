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

//Guarda (crea) el plato y la categoria con fallas
app.post('/guardarPlato',function(req, res){

	//console.log(req.body);

	
	var datosCategoria = {
		codigo: req.body.codigoCategoria,
		nombre: req.body.nombreCategoria
	};

	var datosPlato = {
		codigo: '',
		nombre: req.body.nombrePlato,
		codigo_categoria: req.body.codigoCategoria
	};

	//Par comprobar que si el check esta marcado es porque la categoria ya existe
	var check = req.body.check;


	if (check == "on") {
		console.log("Esta en on");

	 	var queryPlato = conexion.query('INSERT INTO plato set ?', datosPlato, function(err, rows){
	   		if(err){
	      		throw err;
	   		}else{
	   			//this.codigoRecuperado = rows.insertId;
	      		res.redirect('/administrador');
	   		}
	 	});


	}else{
		console.log("Esta en off");

		//Crea categoria
		var queryCategoria = conexion.query('INSERT INTO categoria set ?', datosCategoria, function(err, rows){
	   		if(err){
	      		throw err;
	   		}else{
	   			//this.codigoRecuperado = rows.insertId;
	      		//res.redirect('/guardarPlato');
	   		}
	 	});

		//Crea Producto
	 	var queryPlato = conexion.query('INSERT INTO plato set ?', datosPlato, function(err, rows){
	   		if(err){
	      		throw err;
	   		}else{
	   			//this.codigoRecuperado = rows.insertId;
	      		res.redirect('/administrador');
	   		}
	 	});
	};	

});

//Borrar plato
app.get("/borrarPlato/:id", function(req, res){

	var id = req.params.id; //codigo_plato

	
	var query = conexion.query("DELETE FROM plato WHERE codigo = ?",id,function (err, rows){
		if (err) {
			throw err;
		}else{
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
app.get("/guardarIngrediente", function(req, res){

	//var id = {codigo_plato : req.params.id},{codigo : id};
	res.render('pages/crearIngrediente');

});

//Crear ingrediente funciona 100% crea ingrediente y llena tabla plato_ingrediente
app.post('/guardarIngrediente',function(req, res){

	//console.log(req.body);

	//Funciona para crear ingrediente
	var datosIngrediente = {
		referencia : req.body.referenciaIngrediente,
		nombre: req.body.nombreIngrediente,
		cantidad: req.body.cantidadIngrediente
	};

	var codigo_plato = req.body.codigoPlato;

	var datosPlato = {
		numero : '',
		codigo_plato: req.body.codigoPlato,
		referencia_ingrediente: req.body.referenciaIngrediente
	};

	
	var queryIngrediente = conexion.query('INSERT INTO ingrediente set ?', datosIngrediente, function(err, rows){
   		if(err){
      		throw err;
   		}else{
   			//res.redirect('/plato_ingrediente/' + datosIngrediente.referencia + '/' + datosPlato.codigo_plato );
   		}
 	});

	
	var queryIngrediente = conexion.query('INSERT INTO plato_ingrediente set ?', datosPlato, function(err, rows){
   		if(err){
      		throw err;
   		}else{
   			res.redirect('/administradorIngredientes/' + codigo_plato);
   		}
 	});
});

//Eliminar ingrediente
//Borrar tupla funciona 100%
app.get("/borrarIngrediente/:id/:id2", function(req, res){

	var id = req.params.id; //codigo_plato

	var id2 = req.params.id2; //referencia_ingrediente

	
	var query = conexion.query("DELETE FROM ingrediente WHERE referencia = ?",id2,function (err, rows){
		if (err) {
			throw err;
		}else{
			res.redirect('/administradorIngredientes/' + id);
		}
	});

});

//Actualizar ingrediente vista formulario
app.get("/actualizarIngrediente/:id/:id2/:id3", function(req, res){

	//referencia id1

	//nombre id2

	//cantidad id3

	var datos = {
		referencia: req.params.id,
		nombre: req.params.id2, 
		cantidad: req.params.id3
	};

	res.render('pages/actualizarIngrediente',{ingrediente : datos});
});

//Post para actualizar
//Actualizar ingrediente vista formulario
app.post("/actualizarIngrediente", function(req, res){

	//referencia id1

	//nombre id2

	//cantidad id3

	var datos = {
		referencia: req.body.referenciaIngrediente,
		nombre: req.body.nombreIngrediente, 
		cantidad: req.body.cantidadIngrediente
	};

	var query = conexion.query('UPDATE ingrediente set ? WHERE referencia = ? ',[datos, datos.referencia], function (err, rows){
		if (err) {
			console.log("El error esta : %s ", err);
		}else{
			res.redirect('/');
		}
	
	});
});

//Mostrar vista de actualiarPlato
//Actualizar ingrediente vista formulario
app.get("/actualizarPlato/:id/:id2/:id3", function(req, res){

	//odigo id1

	//nombre id2

	//codigo_categoria id3

	var datos = {
		codigo: req.params.id,
		nombre: req.params.id2, 
		codigo_categoria: req.params.id3
	};

	res.render('pages/actualizarPlato',{plato : datos});
});

//Actualiza el plato
app.post("/actualizarPlato", function(req, res){

	//referencia id1

	//nombre id2

	//cantidad id3

	var datos = {
		codigo: req.body.codigoPlato,
		nombre: req.body.nombrePlato, 
		codigo_categoria: req.body.codigoCategoria
	};

	var query = conexion.query('UPDATE plato set ? WHERE codigo = ? ',[datos, datos.codigo], function (err, rows){
		if (err) {
			console.log("El error esta : %s ", err);
		}else{
			res.redirect('/administrador');
		}
	
	});
});


///guardarUsuario/<%= usuario.id %>?_method=put
// consulta SELECT * FROM ingrediente i join plato_ingrediente p on i.referencia = p.referencia_ingrediente WHERE p.codigo_plato = 11

app.listen(5000);