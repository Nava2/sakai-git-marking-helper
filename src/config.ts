
import moment from "moment";
const config = require('../config');

require('any-promise/register/bluebird');

config.dueDate = moment(config.dueDate, [moment.ISO_8601, "DD-MMM-YYYY hh:mm"]);

export default config;
