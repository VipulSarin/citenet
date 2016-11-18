/**
 * Created by sarin on 11/8/16.
 */

var http = require("http");

exports.getShortestPath = function(req, res){

    console.log("Inside getShortestPath controller");

    var options={
        port:7474,
        path:'/db/data/transaction/commit',
        method:'POST',
        auth:'neo4j:Dhruvra!591'
    };
    var dataRet;
    var startPaper=req.query.paper1;
    var endPaper=req.query.paper2;
    var allPath=req.query.all_paths;
    var intermediate_nodes=req.query.all_paths;
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
                console.log("chunk is "+chunk)
            }
            /*var res1 = JSON.parse(chunk);
            var nodes = [];
            var rels = [];
            var labels = [];
            //console.log('BODY result: ' + JSON.stringify(res1["results"]));
            res1.results[0].data.forEach(function(row) {
                row.graph.nodes.forEach(function(n) {
                    var found = nodes.filter(function (m) { return m.id == n.id; }).length > 0;
                    if (!found) {
                        var node = n.properties||{}; node.id=n.id;node.type=n.labels[0];
                        nodes.push(node);
                        if (labels.indexOf(node.type) == -1) labels.push(node.type);
                    }
                });
                rels = rels.concat(row.graph.relationships.map(function(r) { return { source:r.startNode, target:r.endNode, caption:r.type} }));
            });
            var returned = [{graph:{nodes:nodes, edges:rels},labels:labels}];
            //console.log("rels == "+JSON.stringify(returned));
            return res.json(returned);*/
        });

        res1.on('end', function(){
            dataRet = dataRet.replace("undefined","");
            console.log("In end ========> dataRet ======>"+dataRet);
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
                        node.caption=n.properties.title||n.properties.text;
                        nodes.push(node);
                        if (labels.indexOf(node.type) == -1) labels.push(node.type);
                    }
                });
                rels = rels.concat(row.graph.relationships.map(function(r) { return { source:r.startNode, target:r.endNode, caption:r.type} }));
            });
            var returned = [{graph:{nodes:nodes, edges:rels},labels:labels}];
            //console.log("rels == "+JSON.stringify(returned));
            return res.json(returned);

        })
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    console.log(allPath);
    var qTest="MATCH p=shortestPath((a:Paper{scopus_id:'"+startPaper+"'})-[c:CITES*]-(b:Paper{scopus_id:'"+endPaper+"'})) UNWIND NODES(p) as PNODE RETURN PNODE,c"
//    var qTest = "MATCH (s:subject_area{code:'2500'})<-[a:associated_to]-(p:Paper)-[c:CITES*0..10]->(p1:Paper)-[b:associated_to*0..3]->(e:subject_area{code:'2504'}) RETURN COLLECT(distinct p1) as pw,s,a,p,c,b,e"
    if(allPath.toString()=="true"){
        qTest="MATCH (a:Paper{scopus_id:'"+startPaper+"'})-[c:CITES*0..10]-(b:Paper{scopus_id:'"+endPaper+"'}) WITH a,b,c" +
            " MATCH (a)-[as:associated_to]->(s:subject_area)<-[bs:associated_to]-(b) WITH a,b,c,as,bs,s" +
            " MATCH (a)<-[aw:written_by]-(au:author)-[bw:written_by]->(b) RETURN a,b,c,as,bs,s,au,bw";
    }
    console.log("Query is"+qTest);
    var queryTest="{\"statements\" : [ { \"statement\" : \" "+ qTest +"\", \"resultDataContents\" : [ \"graph\" ] } ] }"

    req.write(queryTest);
    req.end();
};