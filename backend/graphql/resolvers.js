const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const {clearImage} = require('../utility/clearImage');

const User = require('../models/user');
const Post = require('../models/post');

module.exports = {
  createUser: async function({ userInput }, req) {
    //   const email = args.userInput.email;
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: 'please enter a valid email.' });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: 'Password too short!' });
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error('Email exists already!');
      throw error;
    }
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  login: async ({email,password})=>{
      const userEmail = email;
      const userPassword = password;
      const user = await User.findOne({email:userEmail});
      if(!user){
        const err = new Error('user not found!');
        err.code = 404;
        throw err;
      }
      const isEqual = await bcrypt.compare(password,user.password);
      if(!isEqual){
        const err = new Error('wrong password');
        err.code=401;
        throw err;
      }
      const token = jwt.sign({
        userId:user._id.toString(),
        email:user.email
      },'veryveryverysecret',{expiresIn:'1h'})

      return {token:token,userId:user._id.toString()}
  },
  createPost: async({inputPost},req)=>{
    const title = inputPost.title;
    const content = inputPost.content;
    const imageUrl='/'+inputPost.imageUrl;
    if(!req.isAuth){
      const err = new Error('you are not loged in');
      err.code = 401;
      throw err;
    }
    const userId = req.userId;
    const user =await User.findById(userId);
    //error handler
    const errors = [];
    if(
      validator.isEmpty(title)||
      !validator.isLength(title,{min:5})
      ){
        errors.push({message:'invalid title'});
      };
    if(
      validator.isEmpty(content)||
      !validator.isLength(content,{min:5})
      ){
        errors.push({message:'invalid content'});
      };
    if(
      validator.isEmpty(imageUrl)
      ){
        errors.push({message:'image missing'});
      };
    if(errors.length>0){
      const err = new Error('invalid input');
      err.code=422;
      err.data=errors;
      throw err;
    };
    const post = new Post({
      title:title,
      content:content,
      imageUrl:imageUrl,
      creator:user
    });
    const createdPost =await post.save();
    user.posts.push(createdPost._id);
    await user.save();
    return {...createdPost._doc,
      _id:createdPost._id.toString(),
      createdAt:createdPost.createdAt.toISOString(),
      updatedAt:createdPost.updatedAt.toISOString(),
    }
  },
  getPosts:async({page},req)=>{
    if(!req.isAuth){
      const err = new Error('you are not loged in');
      err.code = 401;
      throw err;
    };
    if(!page){
      page = 1;
    }
    const postsPerPage =2;
    const totalPosts = await Post.find()
                            .countDocuments();
    const posts = await Post.find()
                            .skip(postsPerPage*(page-1))
                            .limit(2)
                            .sort({createdAt:-1})
                            .populate('creator');
    return {
      posts:posts.map(p=>{
       return {...p._doc,
              _id:p._id.toString(),
              createdAt:p.createdAt.toISOString(),
              updatedAt:p.updatedAt.toISOString()  
            }
      }),
      totalPosts:totalPosts
    };
  },
  getPost:async({id},req)=>{
    if(!req.isAuth){
      const err = new Error('you are not loged in');
      err.code = 401;
      throw err;
    }
    const post = await Post.findById(id).populate('creator');
    if(!post){
      const err = new Error('no post found');
      err.code = 404;
      throw err;
    }
    return {
      ...post._doc,
      _id:post._id.toString(),
      createdAt:post.createdAt.toISOString(),
      updatedAt:post.updatedAt.toISOString()
    };
  },
  editPost:async({id,userInput},req)=>{
    
    const post =await Post.findById(id).populate('creator');
    if(!post){
      const err = new Error('post not found');
      throw err;
    };
    if(post.creator._id.toString()!==req.userId.toString()){
      const err = new Error('not authrized');
      err.code = 401;
      throw err;
    };
    const title = userInput.title;
    const content = userInput.content;
    const imageUrl =userInput.imageUrl;
    post.title=title;
    post.content=content;
    post.imageUrl=imageUrl;
    const editedPost = await post.save();
    return {
      //!!! remember  ._doc !!
      ...editedPost._doc,
      _id:editedPost._id.toString(),
      createdAt:editedPost.createdAt.toISOString(),
      updatedAt:editedPost.updatedAt.toISOString()
    }
  },
  deletePost:async({id},req)=>{
    if(!req.isAuth){
      const err = new Error('you are not loged in');
      err.code = 401;
      throw err;
    }
    const selectedPost = await Post.findById(id).populate('creator');
    if(!selectedPost){
      const err = new Error('can not find post');
      err.code = 404;
      throw err;
    };
    if(selectedPost.creator._id.toString()!==req.userId.toString()){
      const err = new Error('not authorized');
      err.code = 401;
      throw err;
    };
    clearImage(selectedPost.imageUrl);
    await Post.findByIdAndRemove(id);
    const user = await User.findById(req.userId);
    //delete post in user's posts
    user.posts.pull(id);
    await user.save();
    return true
  },
  getStatus:async(argus,req)=>{
    if(!req.isAuth){
      const err = new Error('you are not loged in');
      err.code = 401;
      throw err;
    };
    const user = await User.findById(req.userId);
    return user.status;
  },
  setStatus:async({status},req)=>{
    if(!req.isAuth){
      const err = new Error('you are not loged in');
      err.code = 401;
      throw err;
    };
    const user = await User.findById(req.userId);
    user.status = status;
    await user.save();
    return user.status;
  }
};
