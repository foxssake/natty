# Connection orchestration

Natty's primary purpose is to establish connectivity between participants in
online games.

The unit of orchestration is a lobby - participants gather into a lobby, and at
a player-triggered point in time, Natty will coordinate connections between the
players.

Supported games are assumed to work in a server-client model. Whenever possible,
Natty will try to designate one of the participants as server. Otherwise, Natty
will act as a UDP relay between players.

## Hosting methods

### Self-hosting

*Self-hosting* is *only* viable if there's at least one player to whom everyone
can connect. If there's more than one such player, a selection process must be
used to determine who will host.

### UDP relay

*UDP relaying* is used when there's no player capable of hosting. Limits are
configured so the application won't be overloaded with too many concurrently
running relays.

## Diagnostic process

Before the lobby starts, Natty needs to figure out which hosting method will
work for the given lobby.

1. When a new lobby is created
    1. Create a bookkeeping entry for the lobby
    1. Each entry stores a set of connection attempts
        1. The connection attempt has a state - `pending`, `running`, `done`
        1. The connection attempt has an outcome - success or fail
        1. The connection attempt has a pair of user id's
1. When someone joins a lobby
    1. Generate a new connection attempt for each missing link with a state of
         `pending`
        1. If there's now n+1 players in the lobby, this step will result in n new
            items
        1. Example:
            1. Lobby has players A, B and C
            1. Player D joins
            1. The new entries will be:
                1. [A-D, B-D, C-D, D-A, D-B, D-C]
1. When someone leaves a lobby
    1. Delete all connection attempts that affect the leaving player
1. When a new connection attempt is added
    1. Ask both participants to do a [handshake](./handshake.md)
    1. Once both participants ack'd, set attempt state to `running`
    1. Wait for both participants to respond
        1. Set attempt to success *only if* both participants respond with success
    1. Error: if either participant takes too long to ack, fail the attempt

## Orchestration

Once the lobby starts, Natty needs to designate a host and orchestrate
connection for everyone to the host.

Firstly, the hosting method is determined:
1. If there's at least one player to whom anyone can connect, use self-hosting
1. Else if the config limit isn't reached, use UDP relay
1. Otherwise fail lobby

### Self-hosting

1. Designate a host
    1. If the lobby owner is viable, designate them
    1. Otherwise pick an arbitrary viable participant
1. Notify designated host, wait for them to ack
    1. The host should prepare for incoming connections and ack
    1. Error: if the host takes too long to ack, fail lobby
1. Wait for participants to report
    1. Each participant reports whether they managed to connect
    1. For each participant failing to connect
        1. If the config limit isn't reached, create a UDP relay
            1. Participant should report again
        1. Else fail the lobby
    1. If all participants succeeded, revel in success
    1. If there's participants that failed even with UDP relay, fail lobby

### UDP relay

1. Designate a host
    1. This will be the lobby owner
1. Notify designated host, wait for them to ack
    1. The host should prepare for incoming connections and ack
    1. Error: if the host takes too long to ack, fail lobby
1. Create a UDP relay for each client
1. Wait for participants to report
    1. If a client fails, fail the lobby
        1. Rationale: we are already using UDP relays, if someone can't connect,
             there's nothing more Natty can do

## Failing the lobby

By now, lobbies will need to have a state which can be one of the following:

1. Gathering
    1. Lobby is open for players to join
    1. Diagnostic process is running in the background
1. Starting
    1. Lobby is closed for new joiners
    1. Natty is orchestrating connection
1. Active
    1. Lobby is closed for new joiners
    1. Connection has been successfully orchestrated

If a lobby fails for whatever reason, the lobby state is returned to Gathering.
This is to make it more convenient for players to retry connection in case
something goes wrong in the process.
