import React from 'react';
import {getClient, ICommand, literal, Pact, signWithChainweaver} from "@kadena/client";
import {extractPubKey} from "@/utils/stringHelpers";

const CreateToken = ({onSubmit, createTokenIdData, accountName}) => {
    const client = getClient();
    const {url, precision, policies, tokenId} = createTokenIdData;

    const handleCreateToken = async () => {
        const unsignedTransaction = Pact.builder.execution(
            Pact.modules["n_fa5008565e171dca599c6accfd71d6006ddecce0.ledger"]["create-token"](
                tokenId,
                literal(precision),
                url,
                literal(JSON.stringify(policies))
            )
        )
            .addKeyset('nfp-mint-guard', 'keys-all', extractPubKey(accountName))
            .addSigner(extractPubKey(accountName), (withCapability) => [
                withCapability('coin.GAS'), // add necessary coin.GAS capability (this defines who pays the gas)
            ])
            .setMeta({ chainId: '1', sender: accountName })
            .setNetworkId('testnet04')
            .createTransaction();

        console.log(unsignedTransaction)
        const signedTransaction = await signWithChainweaver(unsignedTransaction);
        console.log({signedTransaction})

        const requestKeys = await client.submit(signedTransaction as ICommand);
        console.log({requestKeys})

        const result = await client.pollStatus(requestKeys);
        console.log({result})

        return result[requestKeys].result.data;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await handleCreateToken();

        onSubmit(result)
    }

    return (
        <form onSubmit={handleSubmit}>
            <button type="submit">Submit</button>
        </form>
    )
}

export default CreateToken;