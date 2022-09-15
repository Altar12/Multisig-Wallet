import React, {useState, useContext, useEffect} from 'react';
import walletContext from '../context/walletContext';

const TxManipulator = () => {
    const [formState, setFormState] = useState({
        btn1: 'showing Old to New',
        btn2: 'showing all Tx',
        filterText: ''
    });
    const {setFilteredTxs, transactions, filteredTransactions} = useContext(walletContext);

    useEffect(() => {
        let newTransactions = transactions.filter((tx) => tx.to.includes(formState.filterText.toLowerCase()));
        if(formState.btn1 === 'showing New to Old') {
            newTransactions.reverse();
        }
        if(formState.btn2 === 'showing pending Tx') {
            newTransactions = newTransactions.filter((tx) => !tx.executed);
        }
        setFilteredTxs(newTransactions);
    //eslint-disable-next-line
    }, [transactions]);
    
    const onChange = (e) => {
        const input = e.target.value;
        setFormState({...formState, filterText: input});
        let newTransactions = transactions.filter((tx) => tx.to.includes(input.toLowerCase()));
        if(formState.btn1 === 'showing New to Old') {
            newTransactions.reverse();
        }
        if(formState.btn2 === 'showing pending Tx') {
            newTransactions = newTransactions.filter((tx) => !tx.executed);
        }
        setFilteredTxs(newTransactions);
    };
    const clickHandler = (e) => {
        e.preventDefault();
        let newText;
        console.log('hi');
        console.log(e.target.name);
        //eslint-disable-next-line
        switch(e.target.name) {
            case 'btn1':
                newText = (formState.btn1 === 'showing Old to New'? 'showing New to Old':'showing Old to New');
                setFormState({...formState, btn1: newText});
                setFilteredTxs(filteredTransactions.reverse());
                console.log('hi1');
                break;
            case 'btn2':
                newText = (formState.btn2 === 'showing all Tx'? 'showing pending Tx':'showing all Tx');
                setFormState({...formState, btn2: newText});
                let newTransactions = transactions.filter((tx) => tx.to.includes(formState.filterText.toLowerCase()));
                if(newText === 'showing pending Tx') {
                    newTransactions = newTransactions.filter((tx) => !tx.executed)
                }
                setFilteredTxs(newTransactions);
                break;
        }
        console.log('hi2')

    }

    return (
        <form>
            <span className="form-btns">
            <input type="button" className="btn active" name="btn1" value={formState.btn1} onClick={clickHandler} />
            <input type="button" className="btn active" name="btn2" value={formState.btn2} onClick={clickHandler} />
            </span>
            <input type="text" className="filter-txt" value={formState.filterText} onChange={onChange} placeholder="receiver address..."/>
        </form>
    );
};

export default TxManipulator;