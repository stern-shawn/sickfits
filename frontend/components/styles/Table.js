import styled from 'styled-components';

const Table = styled.table`
  border-spacing: 0;
  width: 100%;
  border: 1px solid ${props => props.theme.offWhite};
  thead {
    font-size: 10px;
  }
  td,
  th {
    border-bottom: 1px solid ${({ theme }) => theme.offWhite};
    border-right: 1px solid ${({ theme }) => theme.offWhite};
    padding: 5px;
    position: relative;
    &:last-child {
      border-right: none;
      width: 150px;
      button {
        width: 100%;
      }
    }
    label {
      display: flex;
      padding: 1rem .5rem;
      justify-content: center;
    }
  }
  tr {
    &:hover {
      background: ${({ theme }) => theme.offWhite};
    }
  }
`;

export default Table;
