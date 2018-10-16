import React from 'react';
import Link from 'next/link';
import Router from 'next/router';
import NProgress from 'nprogress';
import styled from 'styled-components';
import Nav from './Nav';

// Hook into Router events and trigger the NProgress bar as needed to indicate route changes
Router.onRouteChangeStart = () => {
  NProgress.start();
}

Router.onRouteChangeComplete = () => {
  NProgress.done();
}

Router.onRouteChangeError = () => {
  NProgress.done();
}

const Logo = styled.h1`
  font-size: 4rem;
  margin-left: 2rem;
  position: relative;
  z-index: 2;
  transform: skew(-7deg);
  @media (max-width: 1300px) {
    margin: 0;
    text-align: center;
  }
  a {
    padding: 0.5rem 1rem;
    background: ${({ theme }) => theme.red};
    color: white;
    text-transform: uppercase;
    text-decoration: none;
  }
`;

const StyledHeader = styled.header`
  .bar {
    border-bottom: 10px solid ${({ theme }) => theme.black};
    display: grid;
    grid-template-columns: auto 1fr;
    justify-content: space-between;
    align-items: stretch;
    @media (max-width: 1300px) {
      grid-template-columns: 1fr;
      justify-content: center;
    }
  }
  .sub-bar {
    display: grid;
    grid-template-columns: 1fr auto;
    border-bottom: 1px solid ${({ theme }) => theme.lightGrey};
  }
`;

const Header = () => (
  <StyledHeader>
    <div className="bar">
      <Logo>
        <Link href="/">
          <a>Sick Fits</a>
        </Link>
      </Logo>
      <Nav />
      <div className="sub-bar">
        <p>Search</p>
      </div>
      <div>Cart</div>
    </div>
  </StyledHeader>
);

export default Header;
