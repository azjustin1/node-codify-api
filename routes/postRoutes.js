import express from 'express'
import verify from '../verifyToken'

const router = express.Router()

router.get('/', verify, (req, res) => {
    res.status(200).send('This is your post')
})

export default router