import React, {useState} from "react";
import {GetAccount, CreateTokenId, CreateToken, MintToken, TokenPreview} from "@/components";

const Home = () => {
    const [step, setStep] = useState('getAccount');
    const [accountName, setAccountName] = useState('');
    const [createTokenIdData, setCreateTokenIdData] = useState(null);

    const handleSubmitGetAccount = (data) => {
        console.log(data);
        setAccountName(data);
        setStep("createTokenId");
    }

    const handleSubmitCreateTokenId = (data) => {
        console.log(data);
        setCreateTokenIdData(data);
        setStep("createToken");
    }

    const handleSubmitCreateToken = (data) => {
        console.log(data);
        setStep("mintToken");

    }
    const handleSubmitMintToken = (data) => {
        console.log(data);
        setStep("tokenPreview");
    }

    const lookup = {
        getAccount: <GetAccount onSubmit={handleSubmitGetAccount} />,
        createTokenId: (
            <CreateTokenId
                onSubmit={handleSubmitCreateTokenId}
                accountName={accountName}
            />
        ),
        createToken: (
            <CreateToken
                onSubmit={handleSubmitCreateToken}
                createTokenIdData={createTokenIdData}
                accountName={accountName}
            />
        ),
        mintToken: (
            <MintToken
                onSubmit={handleSubmitMintToken}
                createTokenIdData={createTokenIdData}
                accountName={accountName}

            />
        ),
        tokenPreview: <TokenPreview />,
    }

    return (
        <div>{lookup[step]}</div>
    )
}

export default Home;