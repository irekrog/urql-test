import type {GetServerSidePropsContext, NextPage} from 'next'
import styles from '../styles/Home.module.css'
import {cacheExchange, dedupExchange, fetchExchange, ssrExchange, useQuery} from 'urql';
import {USER} from '../query';
import {initUrqlClient, withUrqlClient} from 'next-urql';
import {useRouter} from 'next/router';
import axios from 'axios';
import {GITHUB_TOKEN} from '../github_token';
import nookies from 'nookies';

const Home = ({tokenFromServer, resetUrqlClient}: { tokenFromServer: string }) => {
    const {push} = useRouter();
    const [{data, error}] = useQuery({
        query: USER
    })

    const onLogin = async () => {
        try {
            resetUrqlClient();
            await axios.post('/api/login', {
                token: GITHUB_TOKEN
            })
            await push('/second-page')
        } catch {

        }
    }

    return (
        <div className={styles.container}>
            <div>
                <p>HOME PAGE</p>
                <p>token: {tokenFromServer?.slice(-20)}</p>
                {error ? <p style={{color: 'red'}}>error (no data)</p> : <p>login: {data?.viewer?.login}</p>}
                <button onClick={onLogin}>go to second page (fake login)</button>
            </div>
        </div>
    )
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    const cookies = nookies.get(context, '');

    const token = cookies?.myToken || '';
    const ssrCache = ssrExchange({isClient: false});
    const client = initUrqlClient(
        {
            url: 'https://api.github.com/graphql',
            exchanges: [dedupExchange, cacheExchange, ssrCache, fetchExchange],
            fetchOptions: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        },
        false,
    );

    const res = await client?.query(USER).toPromise();
    console.log('res', res?.data)
    console.log('res error', res?.error)

    if (res?.data) {
        return {
            props: {},
            redirect: {
                destination: '/second-page',
                permanent: false,
            }
        }
    }

    return {
        props: {
            urqlState: ssrCache.extractData(),
            tokenFromServer: token
        }
    }
}

export default withUrqlClient(() => ({
    url: 'https://api.github.com/graphql'
}), {ssr: false})(Home);
