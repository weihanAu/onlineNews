import React, { Component, Fragment } from 'react';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    const graphql = {query:`
      query{
        getStatus
      }
    `};
    fetch('http://localhost:8080/graphql', {
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        "Content-Type":"application/json"
      },
      method:"POST",
      body:JSON.stringify(graphql)
    })
      .then(res => {
        // if (res.status !== 200) {
        //   throw new Error('Failed to fetch user status.');
        // }
        return res.json();
      })
      .then(resData => {
        this.setState({ status: resData.data.getStatus});
      })
      .catch(this.catchError);

    this.loadPosts();

  }
  
  loadPosts = direction => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }
    const graphql ={
      query:`
        query fetchPost($page:Int){
          getPosts(page:$page){
            posts {
              title,
              content,
              creator{name},
              createdAt,
              _id,
              imageUrl
            },
            totalPosts
          }
        }
      `,
      variables:{page:page}
    };
    fetch('http://localhost:8080/graphql', {
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        "Content-Type":"application/json"
      },
      method:"POST",
      body:JSON.stringify(graphql)
    })
      .then(res => {
        // if (res.status !== 200) {
        //   throw new Error('Failed to fetch posts.');
        // }
        return res.json();
      })
      .then(resData => {
        if(resData.errors){
          const err = new Error('fetch posts failed');
          throw err
        };
        console.log(resData);
        this.setState({
          posts: resData.data.getPosts.posts.map(post => {
            return {
              ...post,
              imagePath: post.imageUrl
            };
          }),
          totalPosts: resData.data.getPosts.totalPosts,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = event => {
    event.preventDefault();
    const graphql = {query:`
      mutation setStatus($status:String!){
        setStatus(status:$status)
      }  
    `,
    variables:{status:this.state.status}
  };
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphql)
    })
      .then(res => {
        // if (res.status !== 200 && res.status !== 201) {
        //   throw new Error("Can't update status!");
        // }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        alert('status updated sussessful');
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler =async postData => {
    this.setState({
      editLoading: true
    });
    const formData = new FormData();
    formData.append('image', postData.image);
    if(this.state.editPost){
      formData.append('oldPath',this.state.editPost.imageUrl);
    }
    //add new post 
    fetch('http://localhost:8080/image',{
      method:'PUT',
      headers:{
        Authorization: 'Bearer ' + this.props.token,
      },
      body:formData
    }).then(res=>res.json())
      .then(data=>{
        let graphqlData;
        //add
        if(!this.state.editPost){
          graphqlData = {query:`
          mutation addPost($title:String!,$content:String!,$filePath:String!){
            createPost(inputPost:{
              title:$title,
              content:$content,
              imageUrl:$filePath}){
              title
              _id
              content
              creator{
                name
              }
              createdAt
              imageUrl
              }
            }
          `,
          variables:{
            title:postData.title,
            content:postData.content,
            filePath:data.filePath
          }
          }
        };
        //edit
        if(this.state.editPost){
          console.log('edit post',this.state.editPost._id);
          graphqlData = {query:`
          mutation editPost($id:String!,$title:String!,$content:String!,$filePath:String!){
            editPost(id:$id,userInput:{
              title:$title,
              content:$content,
              imageUrl:$filePath
            }){
              title
              _id
              content
              creator{
                name
              }
              createdAt
              imageUrl
            }
          }   
        `,variables:{
          id:this.state.editPost._id,
          title:postData.title,
          content:postData.content,
          filePath:data.filePath
        }
      }
            
        };
        let url = 'http://localhost:8080/graphql';
        let method = 'POST';
        // if (this.state.editPost) {
        //   url = 'http://localhost:8080/feed/post/' + this.state.editPost._id;
        //   method = 'PUT';
        // }

        fetch(url, {
          method: method,
          body: JSON.stringify(graphqlData),
          headers: {
            Authorization: 'Bearer ' + this.props.token,
            "Content-type":"application/json"
          }
        })
          .then(res => {
            return res.json();
          })
          .then(resData => {
            console.log(resData);
            let post;
            //check it is edit or create post
            if(!this.state.editPost){
              post = {
                _id: resData.data.createPost._id,
                title:resData.data.createPost.title,
                content: resData.data.createPost.content,
                creator: resData.data.createPost.creator.name,
                createdAt: resData.data.createPost.createdAt,
                imageUrl:resData.data.createPost.imageUrl
              };
            }else{
              post = {
                _id: resData.data.editPost._id,
                title:resData.data.editPost.title,
                content: resData.data.editPost.content,
                creator: resData.data.editPost.creator.name,
                createdAt: resData.data.editPost.createdAt,
                imageUrl:resData.data.editPost.imageUrl
              };
            };
            this.setState(prevState => {
              const newPosts = [...prevState.posts];
              if(prevState.editPost){
                this.loadPosts();
              }else{
                //it will have 3 posts if not pop();
                newPosts.unshift(post);
                if(newPosts.length>2){
                  newPosts.pop();
                }
              };
              return {
                posts:newPosts,
                isEditing: false,
                editPost: null,
                editLoading: false
              };
            });
          });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = postId => {
    this.setState({ postsLoading: true });
      const graphql = {query:`
        mutation deletePost($id:String!){
          deletePost(id:$id)
        }
      `,variables:{
        id:postId
        }
      };
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        "Content-TYpe":"application/json"
      },
      body:JSON.stringify(graphql)
    })
      .then(res => {
        // if (res.status !== 200 && res.status !== 201) {
        //   throw new Error('Deleting a post failed!');
        // }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        this.loadPosts();
        // this.setState(prevState => {
        //   const updatedPosts = prevState.posts.filter(p => p._id !== postId);
        //   return { posts: updatedPosts, postsLoading: false };
        // });
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
