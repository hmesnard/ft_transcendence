import styled from "styled-components"
import React from "react";


function SideBarOption(props: any){

    const addChannel = () => {
        const ChannelName = prompt("channel name");
        const Channelpassword = prompt("channel pass");
        const channelPrivqte = prompt("channel pass");
    }

    const selectChannel = () => {

    }

    return (<SideBarOptionContainer
        onClick = {props.addChannelOption ? addChannel : selectChannel}>

        {props.Icon && <props.Icon fontSize='small' style={{padding: 10}} /> }
        {props.Icon ? (
            <h3>{props.title} </h3>
        ): (
            <SideBarOptionChannel>
                <span>#</span> {props.title}
            </SideBarOptionChannel>
        )}
    </SideBarOptionContainer>)
}

export default SideBarOption

const SideBarOptionContainer = styled.div`
    display: flex;
    font-size: 12px;
    align-items: center;
    padding-left: 2px;

    .hover{
        opacity: 0.9;
        background-color: #340e36;
    }

    > h3{
        front-weigth: 500;
    }

    > h3 > span{
        padding: 15px;
    }
`;

const SideBarOptionChannel = styled.div``;