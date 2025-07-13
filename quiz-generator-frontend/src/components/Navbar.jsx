import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="flex w-full items-center bg-white">
      <div className="container">
        <div className="relative -mx-4 flex items-center justify-between">
          <div className="w-60 max-w-full px-4">
            <Link to="/" className="block w-full py-5">
              <span className="text-2xl font-bold text-primary">Quiz Generator</span>
            </Link>
          </div>
          <div className="flex w-full items-center justify-between px-4">
            <div>
              <button
                onClick={() => setOpen(!open)}
                className={`${
                  open && "navbarTogglerActive"
                } absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden`}
              >
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color"></span>
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color"></span>
                <span className="relative my-[6px] block h-[2px] w-[30px] bg-body-color"></span>
              </button>
              <nav
                className={`absolute right-4 top-full w-full max-w-[250px] rounded-lg bg-white px-6 py-5 shadow lg:static lg:block lg:w-full lg:max-w-full lg:shadow-none ${
                  !open && "hidden"
                }`}
              >
                <ul className="block lg:flex">
                  <ListItem 
                    NavLink="/" 
                    isActive={location.pathname === '/'}
                  >
                    Question Banks
                  </ListItem>
                  <ListItem 
                    NavLink="/history" 
                    isActive={location.pathname === '/test'}
                  >
                    Previous Quizes
                  </ListItem>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

const ListItem = ({ children, NavLink, isActive }) => {
  return (
    <li>
      <Link
        to={NavLink}
        className={`flex py-2 text-base font-medium lg:ml-12 lg:inline-flex ${
          isActive 
            ? 'bg-gray-200 text-primary rounded-md px-4 font-semibold shadow-md' 
            : 'text-body-color hover:underline'
        }`}
      >
        {children}
      </Link>
    </li>
  );
};