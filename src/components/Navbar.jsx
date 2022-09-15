import React, {useEffect, useContext} from 'react';
import WalletContext from '../context/walletContext';
import {Link} from 'react-router-dom';

const Navbar = () => {
    const walletContext = useContext(WalletContext);
    useEffect(() => {
      const {initialiseState} = walletContext;
      const initialise = async () => await initialiseState();
      initialise();
      //eslint-disable-next-line
    }, []);

    const {isOwner, connectedAddress, loading} = walletContext;
    return (
        <div className="navbar">
            <span className="balance-tag">{connectedAddress ? loading ? 'Balance: loading...' : `Balance: ${walletContext.balance/1000000000} ETH` : ''}</span>
            <h2 className="navbar-title">Multisig Wallet<i className="fa-brands fa-ethereum" /></h2>
            {
              connectedAddress &&
              <ul>
              <li><Link className="navbar-link" to="/">Home</Link></li>
              <li><Link className="navbar-link" to="/transaction-submit">Submit-Tx</Link></li>
              <li><Link className="navbar-link" to="/about">About</Link></li>
            </ul>
            }

        </div>
    );
};

export default Navbar;