import React, { Component } from "react";
import Wrapper from "../components/Wrapper";
import { mySocket } from '../pages/SignIn';

export default class Profile extends Component
{
    render()
    {
        return(
            <Wrapper>
                Your data here
            </Wrapper>
        );
    }
}