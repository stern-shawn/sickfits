import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

const AnimationStyles = styled.span`
  position: relative;
  .count {
    display: block;
    position: relative;
    transition: all 0.4s;
    backface-visibility: hidden;
  }
  /* Initial entry beginning, start out flipped out of view */
  .count-enter {
    transform: scale(3) rotateX(0.5turn);
  }
  /* Initial entry is done, unflip! */
  .count-enter-active {
    transform: rotateX(0);
  }
  /* Start exiting */
  .count-exit {
    /* Position so it's overlapping the entering component */
    top: 0;
    position: absolute;
    transform: rotateX(0);
  }
  /* Exit complete */
  .count-exit-active {
    transform: scale(3) rotateX(0.5turn);
  }
`;

const Dot = styled.div`
  background: ${({ theme }) => theme.red};
  color: white;
  border-radius: 50%;
  padding: 0.5rem;
  line-height: 2rem;
  min-width: 3rem;
  margin-left: 1rem;
  font-weight: 100;
  /* These settings help normalize digit widths! */
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
`;

const CartCount = ({ count }) => (
  <AnimationStyles>
    <TransitionGroup>
      <CSSTransition
        className="count"
        classNames="count"
        key={count}
        timeout={{ enter: 400, exit: 400 }}
        unmountOnExit
      >
        <Dot>{count}</Dot>
      </CSSTransition>
    </TransitionGroup>
  </AnimationStyles>
);

CartCount.propTypes = {
  count: PropTypes.number.isRequired,
};

export default CartCount;
