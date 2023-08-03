import React, {useState} from 'react';
import {toast} from "react-toastify";

const GetAccount = ({onSubmit}) => {
    const [accountName, setAccountName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!accountName){
            toast.error("Account name is required");
            return;
        }
        onSubmit(accountName)
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>Account Name</label>
            <input
                placeholder="Enter your account name"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
            />
            <button type="submit">Submit</button>
        </form>
    )
}

export default GetAccount;
