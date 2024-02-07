import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";


const app = express()
const port = 3000;
env.config();

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
db.connect();

app.get('/', (req, res) => {
  res.status(200).json({Message: 'E-commerce'})
});
//GET all product
app.get('/products', async (req, res) => {
  try{
    const result = await db.query("SELECT * FROM  products");
    res.status(200).json(result.rows)
  }catch(error){
    res.status(500).send(error.message)
  }
})
//GET product by :id
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM products WHERE id=$1', [id]);
    if (result.rowCount === 0) {
      res.status(404).send(`Product not found with ID: ${id}`);
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create a new product
app.post('/products', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const result = await db.query(
    'INSERT INTO products (name, description, price) VALUES ($1, $2, $3)',
    [name, description, price]
    );
    res.status(201).json({ id: result.insertId });
  }catch(err){
    res.status(500).send(err.message);
  }
});

// Update a product
app.put('/products/:id', async (req, res) => {
  try{
    const { id } = req.params;
    const { name, description, price } = req.body;
    await db.query(
    'UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4',
    [name, description, price, id]);
    res.status(200).send(`Product modified with ID: ${id}`);
  }catch(err){
    res.status(500).send(err.message);
  }
});

//DELECT a product
app.delete('/products/:id', async (req,res)=>{
  try{
    const id = parseInt(req.params.id);
    await db.query(
      'DELETE FROM products WHERE id = $1',[id])
    res.status(200).send(`Product deleted with ID: ${id}`).send('Product created again');
  }catch(err){
    res.status(500).send(err.message)
  }

})

app.listen(port, () => {
  console.log(`Server is runing on port ${port}`)
})