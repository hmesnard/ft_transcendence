import styled from '../../theme';

const StyledMessageSender = styled("section")`
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  align-items: right;
  
  input {
    color: ${props => props.theme.primaryDarkColor};
    width: 80%;
    line-height: 46px;
    font-size: 1.3em;
    box-sizing: border-box;
    padding: 29px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, .6);
  }
`;

export default StyledMessageSender;