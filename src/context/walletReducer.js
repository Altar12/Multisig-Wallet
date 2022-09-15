import 
{LOAD_CONTRACT, SET_LOADING, SET_CURRENT_ACCOUNT, INITIALISE_STATE, TX_SUBMITTED, TX_APPROVED, TX_REVOKED, TX_EXECUTED, ETH_RECEIVED, OWNER_ADDED, SET_FILTERED, UNSET_LOADING}
from './types';

const walletReducer = (state, action) => {
    switch(action.type) {
        case LOAD_CONTRACT:
            return {
                ...state,
                contract: action.payload,
            };
        case SET_LOADING:
            return {
                ...state,
                loading: true
            };
        case UNSET_LOADING:
            return {
                ...state,
                loading: false
            }
        case SET_CURRENT_ACCOUNT:
            return {
                ...state,
                connectedAddress: action.payload,
            };
        case INITIALISE_STATE:
            const {owners, transactions, balance, isOwner, requiredApprovals, transactionApprovals} = action.payload;
            return {
                ...state,
                owners, transactions, balance, requiredApprovals, isOwner, transactionApprovals,
                filteredTransactions: transactions,
                loading: false
            };
        case TX_SUBMITTED:
            const {txId, newTransaction} = action.payload;
            return txId < state.transactions.length? state : 
            {
                ...state,
                transactions: [...state.transactions, {...newTransaction, executed: false, executedAt: null, isApproved: false, id: txId, approvals: 0}],
                transactionApprovals: [...state.transactionApprovals, []],
                loading: false
            };
        case TX_APPROVED: {
            const {txId, owner, approvals} = action.payload;
            const newStatus = state.transactions[txId].isApproved || owner===state.connectedAddress;
            return {
                ...state,
                transactions: state.transactions.map((tx, index) => {
                    if(index !== txId)
                        return tx;
                    return {...tx, approvals, isApproved: newStatus};
                }),
                filteredTransactions: state.filteredTransactions.map((tx, index) => {
                    if(index !== txId)
                        return tx;
                    return {...tx, approvals, isApproved: newStatus};
                }),
                loading: false
            };
        }
        case TX_REVOKED: {
            const {txId, owner, approvals} = action.payload;      
            const newStatus = state.transactions[txId].isApproved && owner!==state.connectedAddress;
            console.log('revoking tx', txId);
            return {
                ...state,
                transactions: state.transactions.map((tx, index) => {
                    if(index !== txId)
                        return tx;
                    return {...tx, approvals, isApproved: newStatus};
                }),
                filteredTransactions: state.filteredTransactions.map((tx, index) => {
                    if(index !== txId)
                        return tx;
                    return {...tx, approvals, isApproved: newStatus};
                }),
                loading: false
            };            
        }
        case TX_EXECUTED: {
            const {txId, executedAt} = action.payload;
            return {
                ...state,
                transactions: state.transactions.map((tx, index) => {
                    if(index !== txId)
                        return tx;
                    return {...tx, executed: true, executedAt}
                }),
                filteredTransactions: state.filteredTransactions.map((tx, index) => {
                    if(index !== txId)
                        return tx;
                    return {...tx, executed: true, executedAt}
                }),
                loading: false
            };
        }
        case ETH_RECEIVED:
            return {
                ...state,
                balance: action.payload, //Storing balance as gwei
                loading: false
            };
        case OWNER_ADDED: {
            const {owner, required} = action.payload;
            return {
                ...state,
                owners: [...owners, owner],
                requiredApprovals: required,
                loading: false
            };
        }
        case SET_FILTERED:
            return {
                ...state,
                filteredTransactions: action.payload
            };
        default:
            return state;
    }
};

export default walletReducer;