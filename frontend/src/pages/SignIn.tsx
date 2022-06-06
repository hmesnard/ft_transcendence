import axios from "axios";
import React, { SyntheticEvent, useState } from "react";
import { Redirect } from "react-router";

const SingIn = () =>
{
    const [redirect, setRedirect] = useState(false);

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        const myWindow = window.open('http://localhost:3000/auth/42');
        
        const interval = setInterval(async () => {
            try {
                await axios.get('user');
                myWindow?.close();
                setRedirect(true);
                clearInterval(interval);
            } catch (e) {}
        }, 1000);
    }

    if (redirect)
    {
        return <Redirect to={'/'} />
    }

    return(
        <div>
            <form onSubmit={submit}>
                <p>42 Sign In</p>
                <button type="submit">signin</button>
            </form>
        </div>
    );
}

export default SingIn;