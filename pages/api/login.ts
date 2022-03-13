import type {NextApiRequest, NextApiResponse} from 'next';
import {setCookie} from 'nookies';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    setCookie({res}, 'myToken', req.body.token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        path: '/',
        maxAge: 24 * 60 * 60,
    });
    res.status(200).json({
        code: 200,
        message: 'success',
    });
};
