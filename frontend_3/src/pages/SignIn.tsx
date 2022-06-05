import React, { SyntheticEvent, useState } from "react";
import { Navigate } from "react-router";

// const opener = () => {
//     const myWindow = window.open('http://localhost:3000/auth/42');

//     if myWindow.clo
// }

const SingIn = () =>
{
    const [redirect, setRedirect] = useState(false);

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        const myWindow = window.open('http://localhost:3000/auth/42');
        

        setRedirect(true);
    }

    

    if (redirect)
    {
        return <Navigate to={'/'} />
    }

    return(
        <div>
            <form onSubmit={submit}>
                <button type="submit">signin</button>
            </form>
        </div>
    );
}

export default SingIn;