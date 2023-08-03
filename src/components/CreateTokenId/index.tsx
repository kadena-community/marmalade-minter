import React, {useState} from 'react';
import {getClient, ICommand, literal, Pact, signWithChainweaver} from "@kadena/client";
import {extractPubKey} from "@/utils/stringHelpers";
import {toast} from "react-toastify";

const CreateTokenId = ({onSubmit, accountName, onSign, isLoading, setIsLoading}) => {
    const client = getClient();
    const defaultPolicies = {
        "concrete-policies": {
            "quote-policy": false,
            "non-fungible-policy": true,
            "royalty-policy": false,
            "collection-policy": false
        },
        "immutable-policies": [],
        "adjustable-policies": []
    };

    const [url, setUrl] = useState('')
    const [precision, setPrecision] = useState<number>(0)
    const [policies, setPolicies] = useState(JSON.stringify(defaultPolicies, null, 2));

    const handleCreateTokenId = async () => {
        const unsignedTransaction  = Pact.builder.execution(
            Pact.modules["n_fa5008565e171dca599c6accfd71d6006ddecce0.ledger"]["create-token-id"](
                literal(JSON.stringify({
                    "uri": url,
                    "precision": parseFloat(precision.toString()),
                    "policies": JSON.parse(policies)
                }))
            )
        )
            .addSigner(extractPubKey(accountName), (withCapability) => [
                withCapability('coin.GAS'), // add necessary coin.GAS capability (this defines who pays the gas)
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
        if(!url || precision === undefined || !policies){
            toast.error("All fields are required!");
            return;
        }

        const result = await handleCreateTokenId();

        if(result) {
            onSubmit({
                url,
                precision,
                policies: JSON.parse(policies),
                tokenId: result
            })
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label>Token URL</label>
            <input
                placeholder="Enter URL"
                value={url}
                onChange={e => setUrl(e.target.value)}
            />
            <label>Token Precision</label>
            <input
                placeholder="Enter Precision"
                value={precision}
                onChange={e => setPrecision(e.target.value)}
            />
            <label>Token Policies</label>
            <textarea
                placeholder="Enter Policies"
                value={policies}
                onChange={e => setPolicies(e.target.value)}
            />
            <button disabled={isLoading} type="submit">Submit</button>
        </form>
    )
}

export default CreateTokenId;