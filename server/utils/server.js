const express = require('express');
const bodyParser = require('body-parser');
const soap = require('soap');
const redis = require('redis');
const request = require("request");
var responseTime = require('response-time');

const getGroupMembershipListUrl = "http://kpfs-grp-adm-qa.appl.kp.org/HP_CA_Grp_Mbsh_List_WS_V1/GroupMembershipListService/WEB-INF/wsdl/svc/kp/org/hp_admn/mbr_admn/v1/group_membership_list/GroupMembershipList.wsdl";

const memberInfoUrl = "http://kpfs-mbr-adm-qa.appl.kp.org/KPFS_Member_Inquiry_V2m1/MemberInquiryService/WEB-INF/wsdl/MemberInquiry_2.1.wsdl";


if (process.env.VCAP_SERVICES) {
  console.log("inside VCAP Services");
  var redisClient = redis.createClient({host: 'kp1-kaiser-permanente.0.compose.direct', port: 15519, password: 'GIWASYISNHWFUJSZ'});
  console.log("Bluemix redis Client Created: " + redisClient);
} else {
  var redisClient = redis.createClient({host: 'localhost', port: 6379});
  console.log("Local Client Created: " + redisClient);
}

redisClient.on('error', function (err) {
  console.log('Error ' + err);
});

var app = express();

app.use(responseTime());
app.use(bodyParser.json());

app.get("/getgroupmembershiplistrest", function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  //request("http://localhost:8080/groupmembership/list?groupId=1915", function(error, response, body) {
  request("http://ebss-ffb.kpsj001.us-west.mybluemix.net/groupmembership/list?groupId=1915", function(error, response, body) {
    if (error) {
      return error;
      console.log(error);
    }
    return res.status(200).send(JSON.parse(body));
  });
});

app.get("/getmemberinfo", function(req, res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  request("http://ebss-ffb.kpsj001.us-west.mybluemix.net/getmemberinfo", function(error, response, body) {
    if (error) {
      return error;
      console.log(error);
    }
    return res.status(200).send(JSON.parse(body));
  });
});

app.get('/getgroupmembershiplist', function(req, res) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  var groupId = req.query['groupId'];

  redisClient.get(groupId, function(error, result) {

    if(result) {
      console.log('Data received from Redis Cache. Group ID: ' + groupId);
      return res.send(result);
      //res.send({"data received": result, "source": "redis cache"});
    } else {
      var getGroupMembershipListArgs = {
        "header": {
          "head:header": {
            "MessageDateTime": "2014-09-17T11:30:54.583-07:00",
            "SenderTrnsDetails": {
              "Name": "saran",
              "TransactionId": "sa",
              "AdditionalDetails": {
                "AddDetailName": "EnvironmentCode",
                "AddDetailValue": "QA_KPFS_CSET"
              }
            },
            "ReceiverTrnsDetails": {
              "Name": "saran",
              "TransactionId": "sa",
              "AdditionalDetails": {
                "AddDetailName": "EnvironmentCode",
                "AddDetailValue": "QA_KPFS_CSET"
              }
            }
          }
        },
        "region": {
          "regionCode": {
            "code": "NCA"
          }
        },
        "getGroupMembershipListReqMsg": {
          "ser:groupId": {
            "id": `${groupId}`
          }
        }
      };

      var wsdlOptions = {
        "overrideRootElement": {
          "namespace": "elem",
          "xmlnsAttributes":[
            {
              "name" : "xmlns:elem",
              "value" : "http://svc.kp.org/hp_admn/mbr_admn/group_membership_list/v1/Elements/"
            },
            {
              "name": "xmlns:head",
              "value": "http://svc.kp.org/hp_admn/mbr_admn/group_membership_list/v1/Header/"
            },
            {
              "name": "xmlns:ser",
              "value": "http://svc.kp.org/hp_admn/mbr_admn/group_membership_list/v1/ServiceSchemas/"
            }
          ]
        },
        "ignoredNamespaces": true
      };

      soap.createClient (getGroupMembershipListUrl, wsdlOptions, function (err, client) {
        if (err) {
          return console.log(err);
        }
        else {
          var soapHeader = {
            "Username": "KS1077",
            "Password" : "0pp$c!t",
            "Nonce" : "vGnbKL0rRFZx1sf4O+taWQ==",
            "Created" : "2012-07-17T07:08:43.599Z"
          };

          client.setSecurity(new soap.WSSecurity('KS1077', '0pp$c!t','vGnbKL0rRFZx1sf4O+taWQ==', new Date()));

          client.getGroupMembershipList(getGroupMembershipListArgs, function(err, response) {
            if (err) {
              return res.status(400).send(response);
            }
            else {
              console.log('Group list received from RMS. Group ID: ' + groupId);
              redisClient.setex(groupId, 3600, JSON.stringify(response));
              return res.status(200).send(JSON.stringify(response));
              //return res.status(200).send({"data received": JSON.stringify(response), "source": "RMS"});
            }
          });
        }
      });
    }
  });
});

app.get('/getmemberinfo', function (req, res) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  var mrn = req.query['mrn'];
  var idPartition = mrn.slice(0,2);
  var id = mrn.slice(3,10);

  redisClient.get(mrn, function(error, result) {

    if(result) {
      console.log('Data received from Redis Cache. MRN: ' + mrn);
      return res.send(result);
    } else {
      var wsdlOptions = {
        "overrideRootElement": {
          "namespace": "v2m1",
          "xmlnsAttributes": [
            {
              "name": "xmlns:v2m1",
              "value": "http://svc.kp.org/info/hp_admn/mbr_admn/memberinfo/v2m1"
            },
            {
              "name": "xmlns:v2",
              "value": "http://org.kp.svc/schema/commonTypes/TransactionHeaderTypes/v2"
            },
            {
              "name": "xmlns:ns5",
              "value": "http://org.kp.svc/schema/commonTypes/exceptionTypes/v1"
            },
            {
              "name": "xmlns:ns4",
              "value": "http://svc.kp.org/info/foundation/role/v2"
            }
          ]
        },
        "ignoredNamespaces": true
      };

      var memberInfoArgs = {
        "v2m1:header": {
          "v2:MessageDateTime": "2012-11-06T00:00:00.000Z",
          "v2:SenderTrnsDetails": {
            "v2:Name": "DMS",
            "v2:TransactionId": "T123"
          },
          "v2:ReceiverTrnsDetails": {
            "v2:Name": "KPFS",
            "v2:TransactionId": "T123",
            "v2:AdditionalDetails": {
              "v2:AddDetailName": "EnvironmentCode",
              "v2:AddDetailValue": "QA_KPFS_CSET"
            }
          }
        },
        "v2m1:region": { "code": "NCA" },
        "v2m1:needMembershipInfo": "true",
        "v2m1:needContact": "true",
        "v2m1:needComments": "true",
        "v2m1:needMedicaid": "true",
        "v2m1:needMedicare": "true",
        "v2m1:dateOfService": "2017-05-15",
        "v2m1:personId": {
          "assigningOrganization": { "code": "NCA" },
          "id": `${id}`,
          "idPartition": `${idPartition}`
        }
      };

      soap.createClient (memberInfoUrl, wsdlOptions, function(err, client) {
        if (err) {
          return console.log(err);
        }
        else {
          client.getMemberInfo(memberInfoArgs, function(err, response) {
            if (err) {
              console.log(err);
              return res.status(400).send(response);
            } else {
              console.log('Member Info Received from RMS. MRN: ' + mrn);
              redisClient.setex(mrn, 3600, JSON.stringify(response));
              return res.status(200).send(JSON.stringify(response));
              //return res.status(200).send({"data received": JSON.stringify(response), "source": "RMS"});
            }
          });
        }
      });
    }
  });
});

var port = (process.env.VCAP_APP_PORT || 3000);
var server = app.listen(port, function () {
  console.log("Listening on port %s...", server.address().port);
});

module.exports = {app};
