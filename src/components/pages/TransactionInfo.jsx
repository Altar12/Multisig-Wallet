import React, {useContext, Fragment} from 'react';
import walletContext from '../../context/walletContext';
import {Link} from 'react-router-dom';

const TransactionInfo = () => {
    const txId = Number(window.location.pathname.split('/')[2]);
    const {transactions, requiredApprovals, isOwner} = useContext(walletContext);

    const tx = transactions.find((t) => {
        return t.id === txId;
    });

    return (
        <Fragment>
        <Link className="back-link" to="/"><span className="btn active">Back</span></Link>
        <div className="info-box">
            <p><span className="tx-attr">Receiver: </span>{tx.to}</p>
            <p><span className="tx-attr">Amount to transfer: </span>{`${tx.value} Gwei`}</p>
            <p><span className="tx-attr">Submitted by: </span>{tx.submitter}</p>
            <p><span className="tx-attr">Submitted time: </span>{`${tx.submittedAt}`}</p>
            <p><span className="tx-attr">Total approvals: </span>{tx.approvals}</p>
            {
                tx.executed && <p><span className="tx-attr">Executed time: </span>{`${tx.executedAt}`}</p>
            }
            {
                !tx.executed && isOwner &&
                (tx.isApproved? <span className="btn active">Revoke</span>: <span className="btn active">Approve</span>)
            }
            {
                !tx.executed && tx.approvals > requiredApprovals &&
                <span className="btn active">Execute</span>
            }
        </div>
        </Fragment>
    );

};

export default TransactionInfo;