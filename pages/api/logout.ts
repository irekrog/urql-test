import {NextApiRequest, NextApiResponse} from 'next';
import {destroyCookie} from 'nookies';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    destroyCookie({res}, 'myToken', {
        path: '/',
    });

    res.status(200).json({
        code: 200,
        message: 'success',
    });
};
