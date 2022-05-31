import styled from "styled-components"
import React from "react";
import FiberManueRecordIcon from "@material-ui/icons/FiberManualRecord" 
import CreateIcon from "@material-ui/icons/Create"
import SideBarOption from "../SideBarOption";
import PeopleAltIcon from "@material-ui/icons/PeopleAlt"
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AddIcon from "@material-ui/icons/Add";



function SideBar(){
	return (	
		<SideBarContainer>
			<SideBarHeader> 
				<SideBarInfo>
					<h2>transcendence</h2>
					<h3>
						<FiberManueRecordIcon/>
						login heres
					</h3>
				</SideBarInfo>
				<CreateIcon />
			</SideBarHeader>
			{/* include les element qu'on a besoin */}
			<SideBarOption Icon = {PeopleAltIcon}  title= "people add"/>
			{/* <SideBarOption Icon= {ExpandLessIcon} title= "show less"/> */}
			<hr/>
			<SideBarOption Icon = {ExpandMoreIcon} title="Channel"/>
			<hr/>
			<SideBarOption Icon= {AddIcon} addChannelOption title="add Channel"/>
		</SideBarContainer>
	);
}

export default SideBar

const SideBarContainer = styled.div`
	color: white;
	background-color: var(--app-color);
	flex: 0.3;
	border-top: 1px solid #49274b;
	max-width: 240px;
	margin-top: 60px;

	> hr {
		margin-top: 10px;
		margin-bottom: 10px;
		border: 1px solid #49274b;
	}
`;

const SideBarHeader = styled.div`
	display: flex;
	border-top: 1px solid #49274b;
	padding: 13px;

	> .MuiSvgIcon-root {
		padding: 8px;
		color: #49274b;
		font-size: 18px;
		background-color: white;
		border-radius: 999px
	}
`;

const SideBarInfo = styled.div`
	flex: 1px;

	> h2 {
	  font-size: 15px;
	  font-weigth: 900px;
	  margin-botom: 5px;
	}

	> h3 {
		display: flex;
		font-size: 13px;
		font-weigth: 400;
		align-items: center;
	}

	> h3 > .MuiSvgIcon-root{
		font-size: 13px;
		margin-top: 1px;
		maring-rigth: 2px;
		color: green;
	}
`;