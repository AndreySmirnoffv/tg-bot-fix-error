const mongo = require('mongoose');
const chalk = require('chalk');


const userSchema = new mongo.Schema({
    dateRegistrator: String,
    uid: Number,
    id: {
        type: Number,
        unique: true
    },
    userNick: String,
    balance: Number,
    free: Number,
    referalId: Number,
    referalCount: Number,
    referalBalance: Number,
    referalName: String,
    isBanned: Boolean,
    reasonBan: String,
    timeBan: String,
    requestCount: Number,
    subscriptionIndex: Number,
    subscriptionPaymentAmount: Number,
    subscriptionPaymentIndex: Number,
    cachedAutoCode: String
});


const reportSchema = new mongo.Schema({
    senderId: Number,
    date: String,
    requestName: String
});


const autoSchema = new mongo.Schema({
    gosnumber: String,
    vin: String
});


const keySchema = new mongo.Schema({
    key: String
});


const $user = mongo.model("users", userSchema);
const $report =  mongo.model("reports", reportSchema);
const $auto =  mongo.model("autos", autoSchema);
const $key =  mongo.model("key", keySchema);


console.log(chalk.keyword(`yellow`).bold.underline(`[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] [MONGOOSE] > `) + chalk.red.bold.underline(`Идёт подключение к серверу...`))
mongo.connect('mongodb://127.0.0.1:27017/newBot', {
    useNewUrlParser: true,
    authSource: "admin",
    useUnifiedTopology: true
}).then(() => { console.log(chalk.keyword(`yellow`).bold.underline(`[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] [MONGOOSE] > `) + chalk.green.bold.underline(`Подключение успешно установлено!`)) }).catch(err => console.log(err));


$user.prototype.set = function(field, value) 
{
    this[field] = value;
    return this.save();
}


$user.prototype.inc = function(field, value) 
{
    this[field] += value;
    return this.save();
}


$user.prototype.dec = function(field, value) 
{
    this[field] -= value;
    return this.save();
}


module.exports = {
    $user,
    $report,
    $auto,
    $key
};