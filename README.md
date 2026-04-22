
# OPC UA Item Selector (for node-red-contrib-opcua)

This repository contains the code base for `OPC UA Item Selector`, a third-party node for [node-red-contrib-opcua](https://flows.nodered.org/node/node-red-contrib-opcua).

## Configuration Options

The `OpcUa-ItemSelector` node has the following configuration options:

### General

- **Name**: The `name of the node` within the context of the Node-RED editor.
- **Endpoint**: The `OPC UA server` that should be browsed.
- **Item**: The selected item that is also `used for browsing`.
- **Browse-Button**: Button for `browsing` the OPC UA server.
- **Icon Fork**: Copy item-id to clipboard for `relative bindings`. These bindings are made with a flow-variable that you can use after the opcua-client for instance in the switch-node with the statement flow.copiedID for msg.topic.
- **Icon Clipboard**: Copy item-id to clipboard for `absolute bindings`. You can use it for instance in the switch-node after the opcua-client for msg.topic.
- **Node-Output**: msg.topic with namespace-index (ns), string-identifier (s) and dataype like `ns=1;s=MyVariable2;datatype=Double`
- **Node-Input**: Nothing. It overwrites the `msg.topic`.

### Video of the functionalities

<iframe width="560" height="315" src="https://www.youtube.com/embed/cqTjIsY-A-0?si=Ved0od0Foj_BufoN" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
