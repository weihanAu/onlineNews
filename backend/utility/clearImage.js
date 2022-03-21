const fs = require('fs');
const path = require('path');

exports.clearImage = (filePath)=>{
  const imageUrl = path.join(__dirname,'../',filePath);
  fs.unlink(imageUrl,(err)=>{
    if(err){console.log(err);}else{
    console.log('delete done');}
  });
}