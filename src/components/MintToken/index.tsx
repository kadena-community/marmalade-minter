import React, {useState} from 'react';
import {getClient, ICommand, literal, Pact, signWithChainweaver} from "@kadena/client";
import {extractPubKey} from "@/utils/stringHelpers";

const MintToken = ({onSubmit, createTokenIdData, accountName}) => {
    const [amount, setAmount] = useState<number>(0)
    const client = getClient();
    const {tokenId} = createTokenIdData;

    const handleMintToken = async () => {
        const unsignedTransaction = Pact.builder.execution(
            Pact.modules["n_fa5008565e171dca599c6accfd71d6006ddecce0.ledger"]["mint"](
                tokenId,
                accountName,
                literal(`(read-keyset "nfp-mint-guard")`),
                literal(amount)
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

        console.log({unsignedTransaction})
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

        const result = await handleMintToken();

        onSubmit(result)
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Enter Amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
            />
            <button type="submit">Submit</button>
        </form>
    )
}

export default MintToken;