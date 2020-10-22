import JWT from 'jsonwebtoken'

const auth = async (req, res, next) => {

    // Get token from header
    const token = await req.headers['auth-token']
    if (!token) return res.status(403).send('Access denied!')

    JWT.verify(token, process.env.SECRET_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}


export default auth