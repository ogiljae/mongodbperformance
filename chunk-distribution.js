print_chunk_sizes = function(ns) {

	// get basic namespace info

	let c = db.getSiblingDB('config').collections.findOne({'_id':ns});
	let key = c.key;
	let uuid = c.uuid;

	// look up chunks

	let lookup = {'ns': ns} // legacy way (before MongoDB 5.0)
	if (db.version().split('.')[0] >= '5') {
		lookup = {'uuid': uuid} // new way (MongoDB 5.0+)
	}

	// print out chunk size distribution stats

	print(ns)
	db.getSiblingDB('config').chunks.find(lookup, {_id:1, max:1, min:1, shard:1}).toArray().forEach(function(ch) {
		let cstat = db.adminCommand({ dataSize: ns, keyPattern: key, min: ch.min, max: ch.max, estimate:'true'});
		delete cstat['$clusterTime']
		delete cstat['operationTime']
		cstat['chunk_id'] = ch._id
		cstat['chunk_min'] = ch.min
		cstat['chunk_max'] = ch.max
		cstat['shard'] = ch.shard
		printjson(cstat)
	})
}
