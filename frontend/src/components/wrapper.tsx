import React, { useEffect, useState } from "react";
import Header from "./header";
import styled from 'styled-components';
import SideBar from './Sidebar';
import { Redirect } from "react-router-dom";

type Props = {
    children: JSX.Element | JSX.Element[] | string,
};

const Wrapper = ({children}: Props) =>
{
    // const [redirect, setRedirect] = useState(false);

    // useEffect(() => {
    //     (
    //         async () => {
    //             try {
    //                 const response = await axios.get('user');
    //             } catch (e) {
    //                 setRedirect(true);
    //             }
    //         }
    //     )();
    // }, []);

    // if (redirect)
    // {
    //     return <Redirect to={'/signin'} />;
    // }

    return (
        <>
            <Header/>
            <AppBody>
                < SideBar />
                {children}
            </AppBody>
        </>
    )
}



const AppBody = styled.div`
 display: flex;
 height: 100vh;
`;

export default Wrapper;