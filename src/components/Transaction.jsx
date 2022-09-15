import React, {useContext} from 'react';
import walletContext from '../context/walletContext';
import {Link} from 'react-router-dom';

const Transaction = (props) => {
    const {tx, isOwner, requiredApprovals} = props;
    const executable = !tx.executed && tx.approvals > requiredApprovals;
    const {contract, setLoading} = useContext(walletContext);

    const handleApprove = async () => {
        try {
            setLoading();
            const txn = await contract.approveTx(tx.id);
            console.log('Mining...', txn.hash);
            await txn.wait();
            console.log(`Mined; etherscan link: https://rinkeby.etherscan.io/tx/${txn.hash}`);
            alert('Transaction approved successfully ;)');
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleExecute = async () => {
        try {
            setLoading();
            const txn = await contract.executeTx(tx.id);
            console.log('Mining...', txn.hash);
            await txn.wait();
            console.log(`Mined; etherscan link: https://rinkeby.etherscan.io/tx/${txn.hash}`);
            alert('Transaction executed successfully');
        } catch (error) {
            console.log(error.message);
        }       
    };

    const handleRevoke = async () => {
        try {
            setLoading();
            const txn = await contract.revokeTx(tx.id);
            console.log('Mining...', txn.hash);
            await txn.wait();
            console.log(`Mined; etherscan link: https://rinkeby.etherscan.io/tx/${txn.hash}`);
            alert('Transaction revoked successfully :)');
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div className="tx-box">
            <p><i className="fa fa-paper-plane tx-icon" />{tx.to}</p>
            <p><i className="fa-brands fa-ethereum tx-icon" />{`${tx.value} Gwei`}</p>
            {
                !tx.executed && isOwner &&
                (tx.isApproved? <span className="btn active" onClick={handleRevoke}>Revoke</span>: <span className="btn active" onClick={handleApprove}>Approve</span>)
            }
            <span className={'btn ' + (executable ? 'active':'passive')} onClick={executable? handleExecute: null}>Execute</span>
            <Link className="tx-page-link" to={`/transaction/${tx.id}`}><span className="btn active">Know more</span></Link>
        </div>
    );
};

export default Transaction;