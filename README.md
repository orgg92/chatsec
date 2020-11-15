Server & Client chat room

Features:
- Basic broadcast chat.
- User DMs, which are end to end encrypted using PKI.
- Seeing current online users upon login.
- Unique session ID and session passwords (user does not actually need to know their password or encryption keys).
- Graceful shutdown of the client notifies server, who notifies clients and ammends their online user list.

To add:
- Data validation to avoid throwing errors/exceptions.
- Specific client commands that can be echoed to the server, for example "!time", "!users" to request the current time from the server, or print the current list of online users.

