# Handshake

The handshake procedure is used to find out whether two peers can communicate
bidirectionally - that is, both of them can send and receive data from the
other.

This is done by continuously sending packets to eachother, and change the
packet's content based on the handshake's state. After a given interval, the
handshake is either successful or times out.

Each peer can be in one of the following states during handshake:

1. Empty
    1. Nothing is known about the other peer
1. Received
    1. Data has been received from the other peer
    1. This means that we know their packets arrive
1. Bidirectional
    1. Data has been received from the other peer, indicating they can read us
    1. This means that we know their packets arrive
    1. This also means that our packets arrive
1. Waiting for handshake
    1. We already know that they can read us and we can read them
    1. We are waiting for the other peer to respond with a Bidirectional packet
    1. Receiving the bidirectional packet means that the handshake is complete,
      since both peers indicated connectivity

