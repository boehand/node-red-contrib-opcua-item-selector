module.exports = function(RED) {
    "use strict";

    RED.httpAdmin.get(`/opcua`, (req, res) => {
    	//console.log("opcua");
        //console.log(req.query);
        req.query.endpoint=RED.nodes.getNode(req.query.endpoint);
        var parentList=req.query.parents||{};
        var typeList=req.query.typs||{};
        var labelList=req.query.labels||{};
        var valueList=req.query.values||{};
        //console.log(req.query.endpoint);

        const endpointUrl = req.query.endpoint.endpoint;
        const opcua = require("node-opcua");
        var userIdentity = {};
        const AttributeIds = opcua.AttributeIds;
        const OPCUAClient = opcua.OPCUAClient;
        
        const opcuaDataType=opcua.DataType

        // Test DatenType zu DatenType-Name
        const typeId = 5;
        const typeName = opcuaDataType[typeId];
        console.log(`Datentyp ID ${typeId} ist: ${typeName}`);
        
        (async function main(){
        
            const client = OPCUAClient.create({ endpointMustExist: false });
            await client.connect(endpointUrl);
            if (req.query.endpoint.login) {
                userIdentity.userName = req.query.endpoint.credentials.user;
                userIdentity.password = req.query.endpoint.credentials.password;
                userIdentity.type = client.UserTokenType.UserName; // New TypeScript API parameter
            }
            const session = await client.createSession(userIdentity);
            // console.log("session",session);
            const browseResult  = await session.browse(req.query.item); //"ns=0;i=85"
            // console.log(`Browse result is ${browseResult.references}.`);
            // console.log(browseResult.references.length)
            
            var itemList=[];
            if(browseResult.references.length==0)
            {
                //console.log("use old list");
                itemList=req.query.oldItems;
                res.end(JSON.stringify(newItemList));
                await client.closeSession(session,true);
                await client.disconnect();
                return
            }else
            {
                itemList=[req.query.item];
                itemList.push("---------");
                for(const reference of browseResult.references)
                {
                    // console.log("name",reference.browseName.name)
                    var item=reference.nodeId.toString();
                    if(typeof labelList[item]=="undefined"){
                        labelList[item]=reference.browseName.name;
                    }  

                    // console.log("Now check if it is a variable");
                    // console.log("node",reference);
                    if(reference.nodeClass=="2" && typeof typeList[item]=="undefined")  //  2...Variable nodeClass.key
                    {
                        const dataValue = await session.read({nodeId: item,attributeId: AttributeIds.Value})
                        // console.log("read item",dataValue);
                        console.log("dataValue.value.dataType",dataValue.value.dataType)
                        typeList[item]={type: dataValue.value.dataType, key: reference.nodeClass, typeName: opcuaDataType[dataValue.value.dataType]};
                        valueList[item]=dataValue.value.value;
                        // console.log("VALUES");
                        // console.log(dataValue);
                    }
                    
                    itemList.push(item);
                }
            }

            // ---
            var itemListaddionals1=[];
            for(const item of itemList)
            {
                if(typeof parentList[item]=="undefined" && item!="---------")
                {
                    // save parents
                    if(item!=req.query.item)
                    {
                        parentList[item]=req.query.item;
                    }      
                }

                if(typeof parentList[item]!="undefined" && itemListaddionals1.indexOf(parentList[item])==-1 && itemList.indexOf(parentList[item])==-1 && item!="---------")
                {
                    // create addional list based on parentList
                    itemListaddionals1.push(parentList[item]);
                    
                }
            }
            if(itemListaddionals1.length!=0){itemListaddionals1.push("---------")};
            var newItemList=itemListaddionals1.concat(itemList);
            //

            // ---
            var itemListaddionals2=[];
            for(const item of newItemList)
            {
                //console.log("create itemListaddionals2-list check "+item);
                if(typeof parentList[item]!="undefined" && itemListaddionals2.indexOf(parentList[item])==-1 && newItemList.indexOf(parentList[item])==-1 && item!="---------")
                {
                    // create addional list based on parentList
                    //console.log("for item "+item+" the parent "+parentList[item]+" is now added");
                    itemListaddionals2.push(parentList[item]);
                    
                }
            }
            if(itemListaddionals2.length!=0){itemListaddionals2.push("---------")};
            //console.log("itemListaddionals2: ",itemListaddionals2);
            var finalItemList=itemListaddionals2.concat(newItemList);
            var sendList={items:finalItemList, parents:parentList, typs: typeList, labels: labelList, values: valueList}; //endpoint: endpointUrl
            console.log("sendList",sendList);
            res.end(JSON.stringify(sendList));
            await client.closeSession(session,true);
            await client.disconnect();
        
        })();

    });
    

    function OpcuaItemSelector(config) {
        const opcua = require("node-opcua");
        const opcuaDataType=opcua.DataType

        RED.nodes.createNode(this,config);
        var node = this;
        // console.log("node",node);
        node.context().flow.set(node.id,config.browseSelect);

        node.on('input', function(msg) {

            //console.log("config",config);
            var endpoint=RED.nodes.getNode(config.endpoint);
            // see undefined credentials
            if(typeof endpoint.credentials=="undefinded")
            {
                endpoint["credentials"]={user: undefined, password: undefined};
            }
            //

            // prepare msg
            msg.topic=config.browseSelect||"ns=0;i=85";
            if(typeof config.typs[config.browseSelect]!="undefined")
            {
                let itemDataType=opcuaDataType[config.typs[config.browseSelect].type];
                msg.topic=msg.topic+";datatype="+itemDataType;
                msg.dataType=itemDataType;
                console.log("itemDataType",itemDataType);
            }
            if(typeof config.labels[config.browseSelect]!="undefined")
            {
                msg.label=config.labels[config.browseSelect];
            }
            //
            
            node.send(msg);
        });

    } // end-OpcuaItemSelector
    RED.nodes.registerType("OpcUa-ItemSelector",OpcuaItemSelector);

}  // end-modul-export