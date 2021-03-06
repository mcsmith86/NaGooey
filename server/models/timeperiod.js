'use strict';
/*jslint unparam: true, node: true */

var mongoose = require('mongoose');


/*

Time Periods

[weekday]
sunday		00:00-24:00					Every sunday of every week - all day
monday		00:00-09:00, 17:00-24:00 	Every monday of every week - midnight-9am and 5pm-midnight
tuesday		
wednesday
thursday
friday
saturday


[exception] -- my god...
2014-01-01				00:00-24:00 	Specific Date
monday 3				00:00-24:00 	3rd monday of every month
day 2 					00:00-24:00 	2nd day of every month
february 10				00:00-24:00 	Feb 10 every year
feb -1 					00:00-24:00 	Last day of feb every year
thursday -1 november 	00:00-24:00 	last thursday in november every year
april 10 - may 15 		00:00-24:00 	Apr10 through May15 every year
july 10 - 15 			00:00-24:00 	July 10 through July 15 every year
day 1 - 15				""				1st to 15th each month
july 10 - 15 / 2 		""				Every other day between july10-july15

http://nagios.sourceforge.net/docs/3_0/oncallrotation.html
*/

var timePeriodSchema = new mongoose.Schema({
	
	timeperiod_name: {
		type: String,
		required: true,
		unique: true
	},

	alias: {
		type: String,
		required: true,
		unique: true
	},

	rules: Array,
	exclude: Array,

	monday: Array,
	tuesday: Array,
	wednesday: Array,
	thursday: Array,
	friday: Array,
	saturday: Array,
	sunday: Array,

	// exceptions: [exceptionSchema]

	register: {
		type: Boolean,
		default: true
	},
	use: String,		// use [Template]
	name: String, 		// Template Name

});

timePeriodSchema.statics.getNagiosData = function(cb){
	var i,j,rule,property;
	var doc, docData;
	var returnData = [];
	var objCleanup = function(doc,ret,options){ delete ret._id; delete ret.__v; };

	this.find({}, function(err, docs){

		for (i=0; i<docs.length; i++){
			doc = docs[i].toObject({transform: objCleanup});
			// console.log(doc);

			docData = [];
			for (property in doc){
				if(doc.hasOwnProperty(property)){
					switch(property){
						case 'needs_extra_processing':
							//process some stuff here
							break;
						case 'rules':
							for (j=0; j<doc.rules.length; j++){
								rule = doc.rules[j].split(' ');
								docData.push({directive: rule[0], value: rule[1]});
							}
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

mongoose.model('TimePeriod', timePeriodSchema);