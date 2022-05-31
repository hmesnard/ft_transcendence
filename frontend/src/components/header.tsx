import { Avatar } from "@material-ui/core";
import styled from "styled-components"
// import AccessTimeIcon from "@material-ui/icons/AccessTime"c
// import SearchIcone from "@material-ui/icons/Search"
import HelpOutlineIcon from "@material-ui/icons/HelpOutline"

function Header()
{
	return (
	<HeaderContainer>
		<HeaderLeft>
			<HeaderAvatar/>
			{/* <AccessTimeIcon/> */}
		</HeaderLeft>
		
		<HeaderSearch>
			{/* <SearchIcone/> */}
				{/* <input placeholder="search" /> */}
		</HeaderSearch>

		<HeaderRigth>
			<HelpOutlineIcon/>
		</HeaderRigth>
	</HeaderContainer>
	)
}

export default Header


const HeaderRigth = styled.div`
	flex: 0.3;
	display: flex;
	align-items: flex-end;

	> .MuiSvgIcon-root {
		margin-left: auto;
		margin-right: 20px;
	};
`;

const HeaderSearch = styled.div`
	// flex: 0.4;
	// opacity: 1;
	// border-radius: 6px;
	// text-align: right;
	// background-color: rgb(0 190 190);
	// display: flex;
	// padding: 0 50px;
	// /* border: 100px gray solid */

	// > input {
	// 	background-color: transparent;
	// 	border: none;
	// 	text-align: center;
	// 	min-width:  0vw; 
	// 	outline: 0;
	// 	color : #ffffff;
	// };
`;

const HeaderContainer = styled.div`
	display:flex;
	position: fixed;
	width: 100%;
	align-items: center;
	justify-content: space-between;
	padding: 10px 0;
	background-color: var(--app-color);
	color: white;
`;

const HeaderLeft = styled.div`
	flex: 0.3;
	display: flex;
	align-items: center;
	margin-left: 20px;

	> .MuiSvgIcon-root{
		margin-right: auto;
		margin-left: 90%;
	}
`;

const HeaderAvatar = styled(Avatar)`
	cursor: pointer;

	:hover{
		opacity: 0.6;
	}
`;