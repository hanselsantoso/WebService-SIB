const express = require('express');
const { contohRouter } = require('./src/routers');
const app = express();

const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello, tokek!');
});


// contoh req.query
app.get("/api/v1/contoh", (req, res) => {
  let { nama, umur, jk } = req.query;
  console.log(nama, umur, jk);
  return res.json(req.query);
});
 
// // contoh req.params — the ? makes jk optional
app.get("/api/v1/contoh/:nama/umur/:umur/jk/:jk", (req, res) => {
  let { nama, umur, jk } = req.params;
  jk = jk || "Tidak Tahu";
  return res.json({ nama, umur, jk });
});

// // contoh req.params — the ? makes jk optional
// app.get("/api/v1/contoh/:nama/:umur/:jk", (req, res) => {
//   let { nama, umur, jk } = req.params;
//   jk = jk || "Tidak Tahu";
//   return res.json({ nama, umur, jk });
// });
 

// // contoh req.body
app.post("/api/v1/contoh", (req, res) => {
  let { nama, umur, jk } = req.body;
  return res.json(req.body);
});

app.use('/api/v1/contohsaya', contohRouter);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});