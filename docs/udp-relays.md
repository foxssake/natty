# UDP relays

In case there's no player in a lobby that everyone can connect to, Natty will
jump in as a relay server. Doing this, Natty will send its own address and a
designated port to each player to connect to. Whenever data arrives on the
given port, it will be forwarded to the lobby's host.

As simple as it sounds, there are multiple constraints that necessitate a
documented plan for this feature.

## Constraints

1. The relay must be **transparent**
    1. Neither of the connected nodes should be able to detect the relay
    1. This includes not modifying the data in any way
1. The relay must be **consistently addressed**
    1. For every host, the same client must always appear to have the same,
       unique address
    1. For every client, the host must always appear to have the same address
    1. This address must be unique only in the context of a single lobby
    1. The address includes the IP address *and* port

## Proposed solutions

### Naive mapping

The idea is to reserve a port for every relay link.

Take an example of a lobby starting with 3 players: host, client 1 and client 2

1. Natty reserves the relay bindings:
    1. Port 10001 is reserved for Host
    1. Port 10002 is reserved for Client 1
    1. Port 10003 is reserved for Client 2
1. Natty instructs the clients to connect to the host
    1. Client 1 is instructed to connect to Natty:10001
    1. Client 2 is instructed to connect to Natty:10001
1. For any incoming traffic
    1. If it's on port 10001, forward it to Host
    1. If it's on port 10002, forward it to Client 1
    1. If it's on port 10003, forward it to Client 2

This could leave us with something strongly resembling a NAT table:

| Incoming port | Outgoing address |
| ------------- | ---------------- |
| 10001         | Host             |
| 10002         | Client 1         |
| 10003         | Client 2         |

Which works perfectly, because:

1. Client 1 and Client 2 think the Host is at Natty:10001
    1. Natty will forward any traffic on 10001 to the Host
1. Host thinks the Clients are at Natty:10002 and Natty:10003
    1. Natty will forward any traffic on 10002 to Client 1
    1. Natty will forward any traffic on 10003 to Client 2

**Verdict:**
* pro: Simple to implement and reason about
* con: Easy to run out of available ports
  * The theoretical max is 65535 players on a single Natty server
  * Ports 0-1023 are well-known ports
  * Ports 1024-49151 are registered ports
  * So this leaves us with at most 16384 to 64512 ports depending on other
    things running on the server

### Conservative mapping

Based on the naive approach. However, to allocate ports slower, it uses the
fact that dedicated addresses must be unique *only* in the context of a lobby.

Let's take an example with two lobbies starting, each with 1 host and 2 clients:
* Lobby 1: Host 1, Client 11, Client 12
* Lobby 2: Host 2, Client 21, Client 22

When the lobbies start:
1. Natty reserves the relay bindings
    1. Port 10001 is reserved for Host 1 and Host 2
    1. Port 10002 is reserved for Client 11 and Client 21
    1. Port 10003 is reserved for Client 12 and Client 22
1. Natty instructs the clients to connect to their hosts
    1. Client 11 is instructed to connect to Natty:10001
    1. Client 12 is instructed to connect to Natty:10001
    1. Client 21 is instructed to connect to Natty:10001
    1. Client 22 is instructed to connect to Natty:10001
1. For any incoming traffic
    1. If it's from Client 11 on port 10001, forward it to Host 1
    1. If it's from Client 21 on port 10001, forward it to Host 2
    1. If it's from Client 12 on port 10001, forward it to Host 1
    1. If it's from Client 22 on port 10001, forward it to Host 2
    1. If it's from Host 1 on port 10002, forward it to Client 11
    1. If it's from Host 2 on port 10002, forward it to Client 21
    1. If it's from Host 1 on port 10003, forward it to Client 12
    1. If it's from Host 2 on port 10003, forward it to Client 22

This leaves us with the following translation table:

| Incoming address | Incoming port | Outgoing address |
| ---------------- | ------------- | ---------------- |
| Client 11        | 10001         | Host 1           |
| Client 21        | 10001         | Host 2           |
| Client 12        | 10001         | Host 1           |
| Client 22        | 10001         | Host 2           |
| Host 1           | 10002         | Client 11        |
| Host 2           | 10002         | Client 21        |
| Host 1           | 10003         | Client 12        |
| Host 2           | 10003         | Client 22        |

The above could raise concerns, for example:
* What happens if two clients are behind the same router?
* What happens if multiple games are hosted on the same server?
* What happens if multiple clients are joining from the same machine?

These can be managed by expanding our translation entries to the following columns:
* Remote address
  * The address originating the message
  * e.g. Client 11's IP address: 87.148.31.109
* Remote port
  * The port originating the message
  * e.g. Client 11's port 48735
* Incoming port
  * The port on which we've received the message
  * e.g. 10001 as Client 11 is trying to talk to Host 1
* Outgoing address
* Outgoing port

While this approach might seem quite more complex than the naive mapping, in
essence we just track the allocated ports *per lobby* to add entries to the
translation table. The relaying part is the same - find entry with matching
data, relay traffic to entry's outgoing address.

**Verdict:**
* pro: Way more efficient with ports
* pro: Boils down to simple table population similar to Naive mapping
* con: Slightly more complex
