import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    const graphql ={query:`
      query{
        getPost(id:"${postId}"){
          title
          creator{name}
          imageUrl
          createdAt
          content
        }
      }
    `}
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
        //   throw new Error('Failed to fetch status');
        // }
        return res.json();
      })
      .then(resData => {
        console.log('single post',resData);
        this.setState({
          title: resData.data.getPost.title,
          author: resData.data.getPost.creator.name,
          image: 'http://localhost:8080' + resData.data.getPost.imageUrl,
          date: new Date(resData.data.getPost.createdAt).toLocaleDateString('en-US'),
          content: resData.data.getPost.content
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
