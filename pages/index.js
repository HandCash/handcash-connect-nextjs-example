import {Environments, HandCashConnect} from '@handcash/handcash-connect';
import {useEffect, useState} from "react";
import HandCashService from "../src/services/HandCashService";
import SessionTokenRepository from "../src/repositories/SessionTokenRepository";
import CodeSnippet from "../components/CodeSnippet";


export function getServerSideProps({query}) {
    const {sessionToken} = query;
    const redirectionUrl = new HandCashService().getRedirectionUrl();
    try {
        return {
            props: {
                redirectionUrl,
                sessionToken: sessionToken || false,
                user: sessionToken ? SessionTokenRepository.decode(sessionToken).user : false,
            },
        };
    } catch (error) {
        console.log(error);
        return {
            props: {
                redirectionUrl,
                sessionToken: false,
                user: false,
            },
        };
    }
}

const codeExample =
    '// Pay 0.05 USD to yourself\n' +
    'const {HandCashConnect} = require(\'@handcash/handcash-connect\');\n' +
    'const handCashConnect = new HandCashConnect({\n' +
    '\tappId: \'<app-id>\',\n' +
    '\tappSecret: \'<secret>\',\n' +
    '});\n' +
    '\n' +
    'const paymentParameters = {\n' +
    `\tpayments: [{ destination: \'your-handle', currencyCode: \'USD\', sendAmount: 0.05 }]\n` +
    '};\n' +
    'await account.wallet.pay(paymentParameters);\n';

export default function Home({redirectionUrl, sessionToken, user}) {
    const [paymentResult, setPaymentResult] = useState({status: 'none'});

    const pay = async () => {
        setPaymentResult({status: 'pending'});
        const response = await fetch(
            `/api/pay`,
            {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                },
            }
        );
        setPaymentResult(await response.json());
    };

    const onDisconnect = async () => {
        window.location.href = "/";
    };

    if (!sessionToken) {
        return (
            <div className="flex flex-grow flex-col items-center justify-end self-start p-6">
                <h1 className="text-5xl mb-12">
                    Welcome to <a className="text-brandLight hover:text-brandLight/90"
                                  target="_blank"
                                  rel="noreferrer"
                                  href="https://docs.handcash.io/docs/overview-1">HandCash Connect</a>
                </h1>

                <a href={redirectionUrl}
                   className="group flex w-full m-6 border p-4 rounded-xl bg-darkBackground-900 gap-x-6 items-center hover:border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    </svg>

                    <div className="grow">
                        <p className="text-lg text-brandLight font-bold">Run this code</p>
                        <p className="text-base">Connect your HandCash account to this app to run the code below</p>
                    </div>
                </a>


                <CodeSnippet code={codeExample}/>
            </div>
        )
    }

    return (
        <div className="flex flex-grow flex-col items-center justify-end self-start p-6">
            <div className="w-full mb-4 flex justify-between items-end">
                <div className="flex items-center gap-x-1 group">
                    <div className="bg-darkBackground-900 rounded-full border m-0 hover:bg-white/5">
                        <div className="flex gap-x-3 pr-6">
                            <img src={user.avatarUrl}
                                 className="inline-block w-8 h-8 border-white/50 rounded-full border-r border-t border-b"/>
                            <div className="flex flex-col justify-center items-start gap-y-0.5">
                                <span className="font-bold text-white/90 leading-4">${user.handle}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        className="rounded-lg px-3 py-1.5 text-xs bg-white/20 shadow-sm shadow-white/20 invisible group-hover:visible font-semibold text-red-400 hover:text-red-500 border border-transparent hover:border-red-500/30"
                        onClick={onDisconnect}>Disconnect
                    </button>
                </div>
                <div
                    className={"flex px-4 h-8 items-center rounded-full border bg-gradient-to-r from-brandNormal to-brandDark hover:opacity-90 text-sm font-semibold hover:cursor-pointer" + (paymentResult?.status === 'pending' ? 'animate-pulse' : '')}
                    onClick={paymentResult?.status === 'pending' ? null : pay}>
                    <p>Run this code</p>
                </div>
            </div>
            <CodeSnippet code={codeExample.replace('your-handle', user.handle)}/>

            {paymentResult.status === 'sent' &&
                <div
                    className="w-full flex m-6 border border-brandLight p-4 rounded-xl bg-darkBackground-900 gap-x-6 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="currentColor" className="w-10 h-10 text-brandLight">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div>
                        <p className="text-lg text-white font-bold">Payment sent!</p>
                        <a className="text-white/70"
                           target="_blank"
                           rel="noreferrer"
                           href={`https://whatsonchain.com/tx/${paymentResult.transactionId}`}>Check on the
                            blockchain</a>
                    </div>
                </div>
            }
            {paymentResult.status === 'error' &&
                <div
                    className="flex w-full  m-6 border border-red-400 p-4 rounded-xl bg-darkBackground-900 gap-x-6 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                         stroke="currentColor" className="w-10 h-10 text-red-400">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>

                    <div>
                        <p className="text-lg text-white font-bold">Payment failed</p>
                        <a className="text-white/70"
                           target="_blank"
                           rel="noreferrer"
                           href={`https://whatsonchain.com/tx/${paymentResult.transactionId}`}>{paymentResult.error}</a>
                    </div>
                </div>
            }
        </div>
    )
}
