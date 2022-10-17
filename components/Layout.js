import Head from "next/head";
import Image from "next/image";

const Layout = ({children}) => {
    return (
        <div>
            <Head>
                <title>HandCash Connect NextJS</title>
                <meta name="description" content="Getting started with HandCash Connect"/>
                <link rel="icon"
                      href="/Users/rjseibane/Development/handcash-connect-nextjs-example/public/favicon.ico"/>
            </Head>
            <div className="flex flex-col h-screen w-full">
                <a
                    className="flex justify-center items-center h-fit py-1 px-6 bg-darkBackground-800"
                    href="https://handcash.io"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <Image
                        width={246}
                        height={64}
                        src="/handcash_overDark.png"
                        alt="handcash dark logo"
                    ></Image>
                </a>

                <div className="flex-grow flex flex-col justify-center items-center bg-gradient-to-b from-darkBackground-900 to-darkBackground-900">
                    <div
                        className="flex-grow flex justify-center items-center">
                        {children}
                    </div>
                    <footer className="p-4 grow-0">
                        <div className="flex flex-col items-center justify-center w-full mb-6 space-y-3">
                            <p className="text-xs tracking-wider">© HandCash Labs, S.L. 2022</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Layout;
