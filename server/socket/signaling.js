module.exports = (io) => {

    io.on('connection', (socket) => {
        console.log('New connection:', socket.id);

        socket.on('create-session', (sessionId) => {
            socket.join(sessionId);
            socket.sessionId = sessionId;
            console.log(`Host created session: ${sessionId}`);
            socket.emit('session-created', sessionId);
        });

        socket.on('join-session', (sessionId) => {
            socket.join(sessionId);
            socket.sessionId = sessionId;
            console.log(`Controller joined session: ${sessionId}`);
            // Notify host that controller joined
            socket.to(sessionId).emit('controller-joined', socket.id);
        });

        socket.on('offer', ({ sessionId, offer }) => {
            console.log('Offer sent to session:', sessionId);
            socket.to(sessionId).emit('offer', { offer, from: socket.id });
        });

        socket.on('answer', ({ sessionId, answer }) => {
            console.log('Answer sent to session:', sessionId);
            socket.to(sessionId).emit('answer', { answer });
        });

        socket.on('ice-candidate', ({ sessionId, candidate }) => {
            socket.to(sessionId).emit('ice-candidate', { candidate });
        });

        socket.on('request-permission', ({ sessionId, level }) => {
            socket.to(sessionId).emit('permission-requested', {
                from: socket.id,
                level
            });
        });

        socket.on('permission-response', ({ sessionId, granted, level }) => {
            socket.to(sessionId).emit('permission-response', { granted, level });
        });

        socket.on('kill-session', (sessionId) => {
            io.to(sessionId).emit('session-killed');
            console.log(`Session killed: ${sessionId}`);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected:', socket.id);
        });
    });

};