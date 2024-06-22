import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => (
  <div className="landing">
    <div className="dark-overlay landing-inner text-light">
      <div className="container">
        <h1 className="x-large">Decentralized Asset Tracker</h1>
        <p className="lead">Create and manage your assets securely with blockchain technology</p>
        <div className="buttons">
          <Link to="/register" className="btn btn-primary">Sign Up</Link>
          <Link to="/login" className="btn btn-light">Login</Link>
        </div>
      </div>
    </div>
  </div>
);

export default Landing;
