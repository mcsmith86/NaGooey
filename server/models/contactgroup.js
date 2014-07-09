'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');


var contactGroupSchema = new mongoose.Schema({
	contactgroup_name: {
		type: String,
		required: true,
		unique: true
	},

	alias: {
		type: String,
		required: true
	},

	members: Array,					// contacts
	contactgroup_members: Array,	//contact_groups

	register: {
		type: Boolean,
		default: true
	},
	use: String,		// use [Template]
	name: String 		// Template Name
});


contactGroupSchema.statics.getNagiosData = function(cb){
	
	var i,property;
	var doc, docData;
	var returnData = [];
	var objCleanup = function(doc,ret,options){ delete ret._id; delete ret.__v; };

	this.find({}, function(err, docs){

		for (i=0; i<docs.length; i++){
			doc = docs[i].toObject({transform: objCleanup});

			docData = [];
			for (property in doc){
				if(doc.hasOwnProperty(property)){
					switch(property){
						case 'special_processing_needed':
							// processing
							break;
						default:
							if(doc[property] instanceof Array){
								if(doc[property].length > 0){
									docData.push({directive: property, value: doc[property].join(',')});
								}
							}
							else if (doc[property] === true){ 
									docData.push({directive: property, value: '1'});
							}
							else if (doc[property] === false){
									docData.push({directive: property, value: '0'});
							}
							else {
								docData.push({directive: property, value: doc[property]});
							}
							break;
					}
				}
			}

			returnData.push(docData);
		}

		cb(err,returnData);
	});
};

contactGroupSchema.statics.createFromConfig = function(obj,cb){
	var query;
	if(obj.name){ query = {name: obj.name}; }			// Template
	else { query = {contactgroup_name: obj.contactgroup_name}; }	// Object

	this.removeThenSave(query,obj,cb);
};

contactGroupSchema.statics.removeThenSave = function(query,obj,cb){
	var Model = this;
	console.log(obj);
	Model.remove(query, function(err){
		if(err){ console.log(err); }
		var doc = new Model(obj);
		doc.save(cb);
	});
};
contactGroupSchema.statics.getTemplates = function(done){
	this.find({$and: [{name: {$exists:true}}, {register: "0"}]}, done);
};

contactGroupSchema.statics.getRegisteredObjects = function(done){
	this.find({$and: [{name: {$exists:false}}, {register: {$exists:false}}]}, done);
};

mongoose.model('ContactGroup', contactGroupSchema);