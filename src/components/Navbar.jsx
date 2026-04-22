import React from 'react';
import { Infinity as InfinityIcon, Hourglass } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <InfinityIcon className="header-icon" aria-hidden="true" />
        <h1>FocusFlow</h1>
        <Hourglass className="sand-clock-icon" aria-hidden="true" />
      </div>
    </nav>
  );
};

export default Navbar;
