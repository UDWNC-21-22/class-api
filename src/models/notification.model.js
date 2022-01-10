const mongoose = require('mongoose');

class Notification {
    constructor({
        id=null,
        senders=null,
        receivers=null,
        notification=null,
        notificationCode=null,
        isForAdmin=false,
    }) {
        this.id = id;
        this.senders = senders;
        this.receivers = receivers;
        this.notification = notification;
        this.notificationCode = notificationCode;
        this.isForAdmin = isForAdmin;
    }
}

const notificationSchema = new mongoose.Schema({
    id: String,
    notification: String,
    senders: String,
    receivers: Array,
    notificationCode: Number,
    isForAdmin: Boolean,
});

const notificationModel = mongoose.model('notification', notificationSchema);

module.exports = {
    Notification,
    notificationModel
}