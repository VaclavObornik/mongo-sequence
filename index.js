module.exports = function (db, name, opts) {
  var seq = {
    db: db,
    name: name,
    opts: opts
  };
  var collection = db.collection(seq.opts && seq.opts.collname ? seq.opts.collname : 'counters');
  seq.getNext = function (cb) {
    collection.findAndModify(
      { _id: name },
      [['_id', 'asc']],
      { $inc: { sequence: 1 } },
      { new: true, upsert: true },
      function (err, obj) {
        if (err) {
          cb(err)
        } else {
          cb(null, obj.sequence)
        }
      });
  };
  collection.insert({_id: name, sequence: 0 }, function (err) {
    if (err && (err.code >= 11000 && err.code <= 11001)) {
      // this should be ok according to http://docs.mongodb.org/manual/tutorial/create-an-auto-incrementing-field/
    }
    else if (err) {
      throw err;
    }
  });

  return seq;
}
