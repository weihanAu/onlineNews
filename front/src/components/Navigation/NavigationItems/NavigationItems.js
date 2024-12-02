import React from 'react';
import { NavLink } from 'react-router-dom';
import Logout from '../../auth0Logout/Logout'
import './NavigationItems.css';

const navItems = [
  // { id: 'feed', text: 'Feed', link: '/', auth: true },
  // { id: 'signup', text: 'Signup', link: '/signup', auth: false }
];

const navigationItems = props => [
  ...navItems.filter(item => item.auth === props.isAuth).map(item => (
    <li
      key={item.id}
      className={['navigation-item', props.mobile ? 'mobile' : ''].join(' ')}
    >
      <NavLink to={item.link} exact onClick={props.onChoose}>
        {item.text}
      </NavLink>
    </li>
  )),
  props.isAuth && (
    <Logout />
  )
];

export default navigationItems;
