import React from 'react'
import classes from './Footer.module.css'
import { NavLink } from 'react-router-dom';

const Footer = ()=>{

  return (
    <footer className={classes.footer__section}>
      <div className={classes.content__section}>
        <h2>Explore the News</h2>
        <div className={classes.nav_container}>
        <NavLink className={classes.nav} to='/'>terms of use</NavLink>
        <NavLink className={classes.nav} to='/'>privacy policy</NavLink>
        <NavLink className={classes.nav} to='/'>contact us</NavLink>
        </div>
      </div>
    </footer>
    );
}

export default Footer;