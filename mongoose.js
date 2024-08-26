import mongo from 'mongoose'
import chalk from 'chalk'


export const userSchema = new mongo.Schema({
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


export const reportSchema = new mongo.Schema({
    senderId: Number,
    date: String,
    requestName: String
});


export const autoSchema = new mongo.Schema({
    gosnumber: String,
    vin: String
});


export const keySchema = new mongo.Schema({
    key: String
});


export const $user = mongo.model("users", userSchema);
export const $report =  mongo.model("reports", reportSchema);
export const $auto =  mongo.model("autos", autoSchema);
export const $key =  mongo.model("key", keySchema);


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


