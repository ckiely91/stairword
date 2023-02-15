import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleLeft,
  faCircleQuestion,
} from "@fortawesome/free-regular-svg-icons";
import { Open_Sans, Cutive_Mono } from "@next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
});

const cutiveMono = Cutive_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cutivemono",
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>StairWord</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${openSans.variable} ${cutiveMono.variable} font-sans flex justify-center flex-auto bg-slate-900 text-slate-50`}
      >
        <div className="w-full max-w-lg flex flex-col">
          <header className="flex justify-between items-center px-3 border-b-2 border-gray-200">
            <div className="w-5">
              {router.pathname !== "/" && (
                <Link href="/">
                  <FontAwesomeIcon
                    icon={faCircleLeft}
                    className="w-5 cursor-pointer"
                  />
                </Link>
              )}
            </div>
            <h1 className="text-4xl font-mono tracking-wide text-center my-1 flex-auto text-slate-300">
              stairword
            </h1>
            <div className="w-5">
              {router.pathname !== "/howtoplay" && (
                <Link href="/howtoplay">
                  <FontAwesomeIcon
                    icon={faCircleQuestion}
                    className="w-5 cursor-pointer"
                  />
                </Link>
              )}
            </div>
          </header>
          <div className="flex flex-grow flex-col relative">
            <Component {...pageProps} />
          </div>
        </div>
      </div>
    </>
  );
}

export default MyApp;
