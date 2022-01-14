const mongoose = require('mongoose');

class Notification {
    constructor({
        id=null,
        senders=null,
        receivers=null,
        notification=null,
        notificationCode=null,
        isForAdmin=false,
        elementIds=null,
    }) {
        this.id = id;
        this.senders = senders;
        this.receivers = receivers;
        this.notification = notification;
        this.notificationCode = notificationCode;
        this.isForAdmin = isForAdmin;
        this.elementIds = elementIds;
    }
}

const notificationSchema = new mongoose.Schema({
    id: String,
    notification: String,
    senders: String,
    receivers: Array,
    notificationCode: Number,
    isForAdmin: Boolean,
    elementIds: Object,
});

const notificationModel = mongoose.model('notification', notificationSchema);

module.exports = {
    Notification,
    notificationModel
}