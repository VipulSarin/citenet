/**
 * Created by Dhruvraj on 11/11/2016.
 */
var http = require("http");

exports.getSubjAreaConn = function(req, res){

    console.log("Inside getSubjectArea controller");
    console.log(req.query.entitytype);

    var options={
        port:7474,
        path:'/db/data/transaction/commit',
        method:'POST',
        auth:'neo4j:Dhruvra!591'
    };
    var dataRet;
    var start_entity=req.query.subjectArea1;
    var end_entity=req.query.subjectArea2;
    var entityType=req.query.entitytype;
    var req = http.request(options, function(res1) {
        console.log('STATUS: ' + res1.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res1.headers));
        res1.setEncoding('utf8');
        res1.on('data', function (chunk) {
            //console.log('BODY result: ' + chunk);
            console.log("res1 on called ");
            if(chunk != undefined)
            {
                dataRet = dataRet + chunk;
            }
            else{
  //              console.log("chunk is "+chunk)
            }
        });

        res1.on('end', function(){
            dataRet = dataRet.replace("undefined","");
 //           console.log("In end ========> dataRet ======>"+dataRet);
            var res1 = JSON.parse(dataRet);
            var nodes = [];
            var rels = [];
            var labels = [];
            var count=0;
            var clusterID=0;
            //console.log('BODY result: ' + JSON.stringify(res1["results"]));
            res1.results[0].data.forEach(function(row) {
                row.graph.nodes.forEach(function(n) {
                    var found = nodes.filter(function (m) { return m.id == n.id; }).length > 0;
                    if (!found) {
                        var node = n.properties||{}; node.id=n.id;node.type=n.labels[0];
                        node.caption=n.properties.title||n.properties.text||n.properties.name||n.properties.affilname;
                        nodes.push(node);
                        if (labels.indexOf(node.type) == -1) labels.push(node.type);
                    }
                });
                rels = rels.concat(row.graph.relationships.map(function(r) { return { source:r.startNode, target:r.endNode, caption:r.type} }));
            });
            var returned = [{graph:{nodes:nodes, edges:rels},labels:labels}];
            return res.json(returned);

        })
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    var qTest = "MATCH (s:subject_area{code:'"+start_entity+"'})<-[a:associated_to]-(p:Paper)-[c:CITES*0..3]->(p1:Paper)-[b:associated_to*0..3]->(e:subject_area{code:'"+end_entity+"'}) RETURN COLLECT(distinct p1) as pw,s,a,p,c,b,e"
    var authTest = "MATCH (s:author{name:'"+start_entity+"'})<-[a:written_by]-(p:Paper)-[c:CITES*0..3]->(p1:Paper)-[b:written_by*0..3]->(e:author{name:'"+end_entity+"'}) RETURN COLLECT(distinct p1) as pw,s,a,p,c,b,e"
    var affTest = "MATCH (s:affiliation{affilname:'"+start_entity+"'})<-[a:affiliated_to]-(p:Paper)-[c:CITES*0..3]->(p1:Paper)-[b:affiliated_to*0..3]->(e:affiliation{affilname:'"+end_entity+"'}) RETURN COLLECT(distinct p1) as pw,s,a,p,c,b,e"
    if(entityType.toString()=="Author"){
        qTest = authTest;
    }else if (entityType.toString()=="Affiliation") {
        qTest=affTest
    }
    var queryTest="{\"statements\" : [ { \"statement\" : \" "+ qTest +"\", \"resultDataContents\" : [ \"graph\" ] } ] }"

    req.write(queryTest);
    req.end();
};