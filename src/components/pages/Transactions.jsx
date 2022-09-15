import React, {useContext, Fragment, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import walletContext from '../../context/walletContext';
import Transaction from '../Transaction';
import TxManipulator from '../TxManipulator';
import Loading from '../Loading';

const Transactions = () => {
    const {filteredTransactions, requiredApprovals, isOwner, loading, connectedAddress} = useContext(walletContext);
    const navigate = useNavigate();

    useEffect(() => {
        if(!connectedAddress) {
            navigate('/about');
        }
    //eslint-disable-next-line
    },[]);

    if(loading) return (
        <Loading />
    );


    return (
        <Fragment>
            <TxManipulator />
            {   
                filteredTransactions.length === 0 ? <h2>No transactions to display :(</h2> :
                filteredTransactions.map((tx, index) => {
                    return <Transaction key={index} tx={tx} isOwner={isOwner} requiredApprovals={requiredApprovals} />
                })
            }
        </Fragment>
    );
};

export default Transactions;