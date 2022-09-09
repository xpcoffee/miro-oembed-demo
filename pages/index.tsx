import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useState } from "react";
import styles from "../styles/Home.module.css";

const miroBoardRegex = /miro.com\/app\/board\/.+/;

const Home: NextPage = () => {
    const [iframeHtml, setIframeHtml] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [oembedData, setOembedData] = useState<any | undefined>();

    const fetchEmbedData = useCallback(async (input: string) => {
        const backendEndpoint = `/api/autodiscover?url=${input}`;
        const result = await (await fetch(backendEndpoint)).json();
        setOembedData(result);
        return result;
    }, []);

    const miroBoardUrlRegexTrigger = useCallback(
        async (input: string): Promise<any | undefined> => {
            if (miroBoardRegex.test(input)) {
                setLoading(true);
                const result = await fetchEmbedData(input);
                setLoading(false);
                return result;
            }
        },
        [setLoading, fetchEmbedData]
    );

    const getEmbedIframeHtml = useCallback(
        async (input: string) => {
            const result = await miroBoardUrlRegexTrigger(input);
            const html = result?.html;
            if (html) {
                setIframeHtml(html);
            }
        },
        [setIframeHtml, miroBoardUrlRegexTrigger]
    );

    return (
        <div className={styles.container}>
            <Head>
                <title>Miro board oEmbed demo</title>
                <meta name="description" content="A demo of embedding Miro boards using the oEmbed standard." />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Miro oEmbed demo</h1>

                <p className={styles.description}>Embed a Miro board using the oEmbed standard!</p>

                {loading && <p>Loading...</p>}

                {!loading && !iframeHtml && (
                    <div className={styles.inputContainer}>
                        <label htmlFor="input-embed-url">Link to a public Miro board</label>
                        <input
                            onInput={(event: any) => getEmbedIframeHtml(event.target.value)}
                            id="input-embed-url"
                            placeholder="https://miro.com/app/board/{boardId}"
                        ></input>
                    </div>
                )}

                {iframeHtml ? (
                    <div className={styles.embedContainer} dangerouslySetInnerHTML={{ __html: iframeHtml }}></div>
                ) : (
                    <div className={styles.embedContainer}></div>
                )}

                {oembedData && <pre>{JSON.stringify(oembedData, undefined, 4)}</pre>}
            </main>
        </div>
    );
};

export default Home;
