import React, {useState} from 'react';
import {getClient, ICommand, literal, Pact, signWithChainweaver} from "@kadena/client";
import {extractPubKey} from "@/utils/stringHelpers";
import {toast} from "react-toastify";

const MintToken = ({onSubmit, createTokenIdData, accountName, onSign, isLoading, setIsLoading}) => {
    const [amount, setAmount] = useState<number>(0)
    const client = getClient();
    const {tokenId} = createTokenIdData;

    const handleMintToken = async () => {
        const unsignedTransaction = Pact.builder.execution(
            Pact.modules["n_fa5008565e171dca599c6accfd71d6006ddecce0.ledger"]["mint"](
                tokenId,
                accountName,
                literal(`(read-keyset "nfp-mint-guard")`),
                {decimal: amount}
            )
        )
            .addKeyset('nfp-mint-guard', 'keys-all', extractPubKey(accountName))
            .addSigner(extractPubKey(accountName), (withCapability) => [
                withCapability('coin.GAS'), // add necessary coin.GAS capability (this defines who pays the gas)
                withCapability('n_fa5008565e171dca599c6accfd71d6006ddecce0.ledger.MINT', tokenId, accountName, {decimal: amount}),
                withCapability('n_fa5008565e171dca599c6accfd71d6006ddecce0.non-fungible-policy-v1.MINT', tokenId),
            ])
            .setMeta({ chainId: '1', sender: accountName })
            .setNetworkId('testnet04')
            .createTransaction();

        let signedTransaction;
        try {
            onSign(true);
            signedTransaction = await signWithChainweaver(unsignedTransaction);
            console.log(signedTransaction)
            onSign(false);
        }
        catch (e){
            console.log(e);
            onSign(false);
            toast.error("Transaction Rejected");
            return;
        }

        let requestKeys;
        try {
            setIsLoading(true)
            requestKeys = await client.submit(signedTransaction as ICommand);
        }
        catch (e){
            console.log(e)
            setIsLoading(false);
            toast.error("Can't submit transaction");
            return;
        }

        let result;
        try {
            result = await client.pollStatus(requestKeys);
            if(result[requestKeys].result.status === "failure") {
                toast.error(result[requestKeys].result.error.message);
                setIsLoading(false);
                return;
            }
        }
        catch (e){
            console.log(e)
            setIsLoading(false);
            toast.error("Can't submit transaction");
            return;
        }

        setIsLoading(false);
        return result[requestKeys].result.data;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await handleMintToken();

        if(result) {
            onSubmit(result)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>Mint Amount</label>
            <input
                placeholder="Enter Amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
            />
            <button disabled={isLoading} type="submit">Submit</button>
        </form>
    )
}

export default MintToken;