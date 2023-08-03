import React, {useState} from "react";
import {GetAccount, CreateTokenId, CreateToken, MintToken, TokenPreview} from "@/components";
import styles from '@/styles/Home.module.css'
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from "react-toastify";

const Home = () => {
    const [step, setStep] = useState('getAccount');
    const [accountName, setAccountName] = useState('');
    const [createTokenIdData, setCreateTokenIdData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSigning, setIsSigning] = useState(false);

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
                onSign={setIsSigning}
                accountName={accountName}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
            />
        ),
        createToken: (
            <CreateToken
                onSubmit={handleSubmitCreateToken}
                createTokenIdData={createTokenIdData}
                onSign={setIsSigning}
                accountName={accountName}
                setIsLoading={setIsLoading}
                isLoading={isLoading}
            />
        ),
        mintToken: (
            <MintToken
                onSubmit={handleSubmitMintToken}
                createTokenIdData={createTokenIdData}
                onSign={setIsSigning}
                accountName={accountName}
                setIsLoading={setIsLoading}
                isLoading={isLoading}

            />
        ),
        tokenPreview: <TokenPreview tokenId={createTokenIdData.tokenId} />,
    }

    return (
        <div className={styles.main}>
            {lookup[step]}
            {isSigning && <div className={styles.signing}>Please Open Chainweaver and sign the Transaction</div>}
            {isLoading && <div className={styles.signing}>Signing in progress, this might take a few seconds!</div>}

            <ToastContainer />
        </div>
    )
}

export default Home;