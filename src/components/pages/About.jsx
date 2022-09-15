import { ethers } from 'ethers';
import React, {useContext, Fragment, useState} from 'react';
import walletContext from '../../context/walletContext';
import {useNavigate} from 'react-router-dom';
import Loading from '../Loading';

const CONTRACT_ADDRESS = '0xC6FBabc89B9f2E065E3CB814294a45fa4a880aA5';
const NETWORK_NAME = 'rinkeby';

const About = () => {
    const {owners, loading, setLoading, unsetLoading, connectedAddress, connectWallet, initialiseState} = useContext(walletContext);
    const [amount, setAmount] = useState('');
    const navigate = useNavigate();

    const connectHandler = async () => {
        setLoading();
        await connectWallet();
        await initialiseState();
        navigate('/');
    };
    const onChange = (e) => setAmount(e.target.value);
    const onSubmit = async (e) => {
        e.preventDefault();
        if(amount === '') {
            alert('enter value to send');
            return;
        }
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
            setLoading();
            const txn = await signer.sendTransaction({
                to: CONTRACT_ADDRESS,
                value: ethers.utils.parseEther(String(amount))
            });
            console.log('mining...', txn.hash);
            await txn.wait();
            alert('ETH send successful');
            setAmount('');
            
        } catch (error) {
            console.log(error.message);
        }
        unsetLoading();

    }

    if(loading) return (
        <Loading />
    )
    
    return (
        <Fragment>
        <div className="info-box">
            <p>Multisig wallet allows a convient method for a group of people (owners of the wallet) to collectively manage the funds in the wallet.</p>
            <p>Anyone can deposit funds to the wallet, and only owners are capable of adding new wallet owners</p>
            <p>Any request to withdraw funds from the wallet has to be submitted as a transaction, each transaction requires approval of more than half of the owners to be executed</p>
            <p>Wallet address: 0xC6FBabc89B9f2E065E3CB814294a45fa4a880aA5<a href="https://rinkeby.etherscan.io/address/0xC6FBabc89B9f2E065E3CB814294a45fa4a880aA5#code" target="_blank" rel="noopener noreferrer"> (wallet source code on etherscan)</a></p>
            {
                connectedAddress &&
                <Fragment>
                    <h3>Wallet owners: </h3>
            {
                loading ? <p>Loading...</p> : 
                <Fragment>
                {
                    owners.map((owner, index) => {
                        return <p key={index}>{`${owner.address} (${owner.name})`}</p>
                    })
                }
                </Fragment>

            }
                </Fragment>
            }
            <p>Version: 1.0.0</p>
            <p>Made with <i className="fa fa-heart" /> by <a href="https://github.com/Altar12" target="_blank" rel="noopener noreferrer">Altar12</a></p>
            <p>0xa854ed2813c5a428EF74823490Ae05546151c8e0 (feel free to send some eth <i className="fa-solid fa-face-smile-wink" />)</p>
        </div>
        {
            connectedAddress ? 
            <form onSubmit={onSubmit} className="deposit-form">
                <h3>Deposit to wallet</h3>
                <input type="text" placeholder="ETH" value={amount} onChange={onChange} />
                <input type="submit" value="Send ETH" className="btn active" />
            </form> : <span className="btn active connect-btn" onClick={connectHandler}>Connect Wallet</span>


        }

        </Fragment>
    );
};

export default About;