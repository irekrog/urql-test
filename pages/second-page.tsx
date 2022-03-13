import type {GetServerSidePropsContext} from 'next'
import styles from '../styles/Home.module.css'
import {cacheExchange, dedupExchange, fetchExchange, ssrExchange, useQuery} from 'urql';
import {USER} from '../query';
import {initUrqlClient, withUrqlClient} from 'next-urql';
import {useRouter} from 'next/router';
import nookies from 'nookies';
import axios from 'axios';

const SecondPage = ({tokenFromServer, resetUrqlClient}: { tokenFromServer: string }) => {
    const {replace} = useRouter();
    const [{data, error}] = useQuery({
        query: USER
    })

    const onLogout = async () => {
        try {
            resetUrqlClient()
            await axios.post('/api/login')
            await replace('/')
        } catch {

        }
    }

    return (
        <div className={styles.container}>
            <div>
                <p>SECOND PAGE</p>
                <p>token: {tokenFromServer?.slice(-5)}</p>
                {error ? <p style={{color: 'red'}}>error (no data)</p> : <p>login: {data?.viewer?.login}</p>}
                <button onClick={onLogout}>go to index page (fake logout)</button>
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

    return {
        props: {
            urqlState: ssrCache.extractData(),
            tokenFromServer: token
        }
    }

}

export default withUrqlClient(() => ({
    url: 'https://api.github.com/graphql'
}), {ssr: false})(SecondPage);
