import styled from '../../theme/index';

const StyledMessage = styled("div")<{ type: string }>`
  float: 'right';
  background-color: #3d3c3c;
  border-radius: '7px 0 0 7px;
  font-size: .9em;
  width: auto;
  max-width: 250px;
  padding: 7px;
  margin: '4px 0';
  display: block;
  clear: both;
`;

export default StyledMessage;