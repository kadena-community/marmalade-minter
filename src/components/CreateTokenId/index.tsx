import React, {useState} from 'react';
import {getClient, ICommand, literal, Pact, signWithChainweaver} from "@kadena/client";
import {extractPubKey} from "@/utils/stringHelpers";

const CreateTokenId = ({onSubmit, accountName}) => {
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

        const unsignedTransaction = Pact.builder.execution(
            Pact.modules["n_fa5008565e171dca599c6accfd71d6006ddecce0.ledger"]["create-token-id"](
                literal(JSON.stringify({
                    "uri": url,
                    "precision": precision,
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

        const signedTransaction = await signWithChainweaver(unsignedTransaction);
        console.log(signedTransaction)

        const requestKeys = await client.submit(signedTransaction as ICommand);

        const result = await client.pollStatus(requestKeys);

        return result[requestKeys].result.data;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const tokenId = await handleCreateTokenId();

        onSubmit({
            url,
            precision,
            policies: JSON.parse(policies),
            tokenId
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Enter URL"
                value={url}
                onChange={e => setUrl(e.target.value)}
            />
            <input
                placeholder="Enter Precision"
                value={precision}
                onChange={e => setPrecision(e.target.value)}
            />
            <textarea
                placeholder="Enter Policies"
                value={policies}
                onChange={e => setPolicies(e.target.value)}
            />
            <button type="submit">Submit</button>
        </form>
    )
}

export default CreateTokenId;