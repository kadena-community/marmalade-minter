import React, {useState} from 'react';

const GetAccount = ({onSubmit}) => {
    const [accountName, setAccountName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        onSubmit(accountName)
    }

    return (
        <form onSubmit={handleSubmit}>
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
