import React, { Component, useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import io, { Socket } from 'socket.io-client';

const Game = () =>
{
    return(
        <Wrapper>
            <p>This is a mighty pong game page</p>
        </Wrapper>
    );
}

export default Game;
