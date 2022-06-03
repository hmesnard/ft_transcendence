import React, { FC, Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { IconContext } from 'react-icons';
import { AiOutlineMenu, AiOutlineClose, AiOutlinePlus, AiOutlineUserAdd } from 'react-icons/ai';
import { SidebarData } from './SidebarData';
import Submenu from './Submenu';
import Popup from 'reactjs-popup';
import './StyledConvBar.css'
import axios from 'axios';

const Nav = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 5rem;
    background-color: black;
`;

const SidebarNav = styled.div<{ sidebar: boolean }>`
	//position: relative;
	z-index: 1;
    width: 20%;
    height: 100vh;
    background-color: black;
    position: fixed;
	overflow-y: scroll;
    top: 0;
    bottom: 0;
    left: ${({ sidebar }) => (sidebar ? '0' : '-100%')};
    transition: 350ms;
`;

const NavIcon = styled(Link)`
	display:inline-block 
    justify-content: flex-start;
    align-items: center;
    height: 5rem;
    font-size: 2rem;
    margin-left: 2rem;
`;

const NavIcon2 = styled(Link)`
	display:inline-block 
    justify-content: flex-start;
    align-items: center;
    height: 5rem;
    font-size: 2rem;
    margin-left: 2rem;
    margin-right: 1rem;
	float:right;
`;

const SidebarWrap = styled.div``;

const Sidebar: FC = () => {
    const [sidebar, setSidebar] = useState(false);
    const showSidebar = () => setSidebar(!sidebar);

    return (
        <IconContext.Provider value={{ color: '#fff' }}>
            <Nav>
                <NavIcon to="#" onClick={showSidebar}>
                    <AiOutlineMenu />
                </NavIcon>
            </Nav>
            <SidebarNav sidebar={sidebar}>
                <SidebarWrap>
                    <NavIcon to="#" onClick={showSidebar}>
                        <AiOutlineClose />
                    </NavIcon>

                    <Popup trigger={<button className="button-plus">
                        <AiOutlinePlus /></button>} modal nested>
						{(close: any) => (
						<div className='modal2'>
							<button className="close" onClick={close}>
							&times;
							</button>
							<div className="header">&nbsp;&nbsp;Create new conversation&nbsp;&nbsp;</div>
							<div className="content">
							{' '}
							<pre>   Invite users :  <Popup
														trigger={<button className="button-add"><AiOutlineUserAdd/></button>}
														modal nested>
														<div className="menu-settings">
															<div className="menu-item-settings"> item 1</div>
															<div className="menu-item-settings"> item 2</div>
															<div className="menu-item-settings"> item 3</div>
														</div>
													</Popup></pre>
							</div>
							<div className="content">
								{' '}
								<pre>Password (optional):</pre>
							</div>
							<div className="actions">
								<input className="input-width" id='new password' maxLength={8}></input>
							</div>
							<div className="actions">
								<button className="button-return"> Create </button>
							</div>
						</div>
				)}
					</Popup>
                    {SidebarData.map((item, index) => {
                        return <Submenu item={item} key={index}/>;
                    })}
                </SidebarWrap>
            </SidebarNav>
        </IconContext.Provider>
    );
};

export default Sidebar;