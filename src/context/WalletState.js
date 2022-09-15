import React, {useReducer} from 'react';
import WalletContext from './walletContext';
import walletReducer from './walletReducer';
import {LOAD_CONTRACT, SET_CURRENT_ACCOUNT, SET_LOADING, UNSET_LOADING, INITIALISE_STATE, TX_SUBMITTED, TX_APPROVED, TX_REVOKED, TX_EXECUTED, ETH_RECEIVED, OWNER_ADDED, SET_FILTERED} from './types';
import descriptor from '../utils/descriptor.json'
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0xC6FBabc89B9f2E065E3CB814294a45fa4a880aA5';
const NETWORK_NAME = 'rinkeby';

const WalletState = (props) => {
    const initialState = {
        owners: [],
        transactions: [],
        filteredTransactions: [],
        balance: 0,
        loading: false,
        contract: null,
        connectedAddress: null,
        isOwner: false,
        requiredApprovals: 0
    };

    const [state, dispatch] = useReducer(walletReducer, initialState);

    const loadContract = async () => {
        const {ethereum} = window;
        if(!ethereum) {
            alert('Get metamask');
            return;
        }

        try {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const {name} = await provider.getNetwork();
            if(name !== NETWORK_NAME) {
                alert('Please switch to rinkeby network')
                return;
            }
            const signer = provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, descriptor.abi, signer);
            dispatch({type: LOAD_CONTRACT, payload: contract});
            //setting event listeners
            contract.on('TxSubmitted', onSubmitTx);
            contract.on('TxApproved', onApproveTx);
            contract.on('TxRevoked', onRevokeTx);
            contract.on('TxExecuted', onExecuteTx);
            contract.on('Deposit', onDeposit);
            contract.on('OwnerAdded', onOwnerAdded);
        } catch (error) {
            console.log(error.message);
            console.log('could not initialise the contract');
            console.log(CONTRACT_ADDRESS);
        }
    };

    const connectWallet = async () => {
        const {ethereum} = window;
        if(!ethereum) {
            alert('Get metamask');
            return;
        }

        try {
            const accounts = await ethereum.request({method: 'eth_requestAccounts'});
            const account = accounts[0].toLowerCase();
            console.log(`setting current account to ${account}`);
            dispatch({type: SET_CURRENT_ACCOUNT, payload: account});
        } catch (error) {
            console.log(error.message);
            console.log('could not connect to wallet');
        }
    };

    const initialiseState = async () => {
        const {ethereum} = window;
        if(!ethereum) {
            alert('Get metamask');
            return;
        }
        setLoading();
        await loadContract();
        try {
            const accounts = await ethereum.request({method: 'eth_accounts'});
            if(accounts.length === 0) {
                console.log('no authorised account found');
                unsetLoading();
                return;
            }
            const account = accounts[0].toLowerCase();
            console.log(`setting current account to ${account}`);
            dispatch({type: SET_CURRENT_ACCOUNT, payload: account});
            const provider = new ethers.providers.Web3Provider(ethereum);
            const {name} = await provider.getNetwork();
            if(name !== NETWORK_NAME) {
                alert('Please switch to rinkeby network')
                unsetLoading();
                return;
            }
            const signer = provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, descriptor.abi, signer);
            
            let owners, ownersDetails, transactions, balance, requiredApprovals, isOwner = false, transactionApprovals;
            ownersDetails = await contract.getOwners();
            transactions = await contract.getTransactions();
            balance = await contract.getBalance();
            requiredApprovals = await contract.required();
            balance = String(balance.div('1000000000')); //Store balance as Gwei
            console.log('balance', balance);
            requiredApprovals = requiredApprovals.toNumber();
            owners = ownersDetails[0].map((addr) => {
                return {address: addr.toLowerCase()};
            });
            ownersDetails[1].forEach((name, index) => {
                owners[index].name = name;
            });
            transactions = transactions.map((tx, index) => {
                return {id: index,
                        to: tx.to.toLowerCase(), 
                        value: String(tx.value.div('1000000000')), 
                        executed: tx.executed, 
                        approvals: tx.approvals.toNumber(), 
                        submitter: tx.submitter.toLowerCase(), 
                        submittedAt: new Date(tx.submittedAt.toNumber()*1000), 
                        executedAt: new Date(tx.submittedAt.toNumber()*1000),
                        isApproved: false
                       };
            });
            const foundAccount = owners.find((owner) => owner.address === account);
            if(foundAccount) {
                isOwner = true;
                for(let i=0; i<transactions.length; ++i) {
                    if(await contract.isOwnerApproved(account, i)) {
                        transactions[i].isApproved = true;
                    }
                }
            }
            transactionApprovals = transactions.map((tx) => {
                return [];
            });
            dispatch({type: INITIALISE_STATE, payload: {owners, transactions, balance, isOwner, requiredApprovals, transactionApprovals}});

        } catch (error) {
            console.log(error.message);
            console.log('could not initialise the state');
        }
        unsetLoading();
    };

    const setFilteredTxs = (txs) => {
        dispatch({type: SET_FILTERED, payload: txs});
    };

    const setLoading = () => {
        dispatch({type: SET_LOADING});
    };

    const unsetLoading = () => {
        dispatch({type: UNSET_LOADING});
    };

    const onSubmitTx = (txId, to, value, submitter, timestamp) => {
        const newTransaction = {to, value: String(value.div('1000000000')), submitter, submittedAt: new Date(timestamp.toNumber()*1000)};
        dispatch({type: TX_SUBMITTED, payload: {txId: txId.toNumber(), newTransaction}});
        console.log('transaction submitted');
    };

    const onApproveTx = async (txId, owner) => {
        const {ethereum} = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, descriptor.abi, signer);
        const approvals = await contract.getApprovalCount(txId);
        dispatch({type: TX_APPROVED, payload: {txId: txId.toNumber(), owner: owner.toLowerCase(), approvals}});
    };

    const onRevokeTx = async (txId, owner) => {
        const {ethereum} = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, descriptor.abi, signer);
        const approvals = await contract.getApprovalCount(txId);
        dispatch({type: TX_REVOKED, payload: {txId: txId.toNumber(), owner: owner.toLowerCase(), approvals}});
    };

    const onExecuteTx = (txId, timestamp) => {
        console.log('inside onExecute for tx', txId.toNumber());
        dispatch({type: TX_EXECUTED, payload: {txId: txId.toNumber(), executedAt: new Date(timestamp.toNumber()*1000)}});
        console.log('return from dispatch');
    };

    const onDeposit = (amount, sender, newBalance) => {
        dispatch({type: ETH_RECEIVED, payload: String(newBalance.div('1000000000'))}); //store balance as gwei
        console.log('eth deposited');
    };

    const onOwnerAdded = async (address, name) => {
        const owner = {address, name};
        let required = await state.contract.required();
        required = required.toNumber();
        dispatch({type: OWNER_ADDED, payload: {owner, required}});
    }


    return (
        <WalletContext.Provider
         value={{owners: state.owners, transactions: state.transactions, balance: state.balance, loading: state.loading, contract: state.contract, connectedAddress: state.connectedAddress, isOwner: state.isOwner, filteredTransactions: state.filteredTransactions, requiredApprovals: state.requiredApprovals
         , initialiseState, connectWallet, onSubmitTx, onApproveTx, onRevokeTx, onExecuteTx, onDeposit, onOwnerAdded, setFilteredTxs, setLoading, unsetLoading}}>
            {props.children}
        </WalletContext.Provider>
    );
};

export default WalletState;