const path = require('path');
const { v4: uuidv4 } = require('uuid');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const {graphqlHTTP} = require('express-graphql');
const auth = require('./middleware/auth');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const {clearImage} = require('./utility/clearImage');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4());
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
//image file multer
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
//regist images
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
//check Auth
app.use(auth);
//receive image /router
app.put('/image',(req,res,next)=>{
  console.log(req.file,req.body.oldPath);
  //didn't update image
  if(req.body.oldPath&&!req.file){
    return res.status(200).json({filePath:req.body.oldPath});
  };
  if(!req.file){
    return res.status(200).json({message:'No files uploaded'});
  };
  //ADD new POST
  if(!req.body.oldPath&&req.file){
    const imageUrl = req.file.path.replace("\\" ,"/");
    return res.status(201).json({message:'file restored',filePath:imageUrl});
  }
  //edit image
  if(req.body.oldPath&&req.file){
    const imageUrl = req.file.path.replace("\\" ,"/");
    clearImage(req.body.oldPath);
    return res.status(201).json({message:'file restored',filePath:'/'+imageUrl});
  }
});
//use graphql
app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    // custom err format
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || 'An error occurred.';
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    }
  })
);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://weihan:Wj920561@cluster0.4crkf.mongodb.net/myNodeRestApi?retryWrites=true&w=majority",{ 
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(result => {
    app.listen(8080); 
  })
  .catch(err => console.log(err));
