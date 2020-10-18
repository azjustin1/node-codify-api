export default (io) => {
    io.sockets.on('connection', (socket) => {
        console.log('New socket connection')
    })
    return router
}