import { BigNumber } from 'ethers';
import React, {Fragment, useContext, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import walletContext from '../../context/walletContext';
import Loading from '../Loading';

const SubmitTx = () => {
    const {contract, setLoading, loading, unsetLoading, isOwner} = useContext(walletContext);
    const [tx, setTx] = useState({
        to: '0x',
        amount: '',
        errorMsg: null
    });
    const navigate = useNavigate();
    const handleSubmit = async () => {
        const regex = new RegExp('0x[0-9a-f]{40}', 'gi');
        if(!tx.to.match(regex) || tx.to.length > 42) {
            setTx({...tx, errorMsg: 'Enter a valid account address'});
            setTimeout(() => setTx({...tx, errorMsg: null}), 2000);
            return;
        } 
        let amount = tx.amount;
        while(amount.length > 0 && amount.charAt(0)==='0') {
            amount = amount.substring(1);
        }
        if(amount === '') {
            setTx({...tx, errorMsg: 'Enter amount to send to the address'});
            setTimeout(() => setTx({...tx, errorMsg: null}), 2000);
            return;
        }
        if(!isOwner) {
            alert('Not a wallet owner :(');
            return;
        }
        const gweiAmount = BigNumber.from(String(Number(amount)*1000000000));

        try {
            setLoading();
            const txn = await contract.submitTx(tx.to, gweiAmount.mul('1000000000'));
            console.log('Mining...', txn.hash);
            await txn.wait();
            console.log(`Mined; etherscan link: https://rinkeby.etherscan.io/tx/${txn.hash}`);
            alert('Transaction submitted successfully :)')
            navigate('/');         
        } catch (error) {
            console.log(error);
        }
        unsetLoading();
    };
    const onChange = (e) => {
        const input = e.target.value;
        const target = e.target.name;
        if(target === 'address') {
            setTx({...tx, to: input});
        } else {
            setTx({...tx, amount: input});
        }
    };

    if(loading) return (
        <Loading />
    );

    return (
        <Fragment>
        <Link className="back-link" to="/"><span className="btn active">Back</span></Link>
        {
            tx.errorMsg &&
            <p className="error-msg">{tx.errorMsg}</p>
        }
        <form className="tx-form">
            <h3>Enter transaction details:</h3>
            <label className="form-input" htmlFor="address">Receiver:</label>
            <input className="receiver-address" type="text" name="address" value={tx.to} onChange={onChange} />
            <label className="form-input" htmlFor="amount">Amount:</label>
            <input type="number" name="amount" value={tx.amount} onChange={onChange} placeholder='ETH' />
        </form>
        <span className="btn active tx-submit-btn" onClick={handleSubmit}>Submit Transaction</span>
        </Fragment>
    );
};

export default SubmitTx;