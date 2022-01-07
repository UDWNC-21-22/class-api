const mongoose = require('mongoose');

class Notification {
    constructor({
        id=null,
        senders=null,
        receivers=null,
        notification=null,
        notificationCode=null,
    }) {
        this.id = id;
        this.senders = senders;
        this.receivers = receivers;
        this.notification = notification;
        this.notificationCode = notificationCode;
    }
}

const notificationSchema = new mongoose.Schema({
    id: String,
    notification: String,
    senders: String,
    receivers: Array,
    notificationCode: Number,
});

const notificationModel = mongoose.model('notification', notificationSchema);

module.exports = {
    Notification,
    notificationModel
}