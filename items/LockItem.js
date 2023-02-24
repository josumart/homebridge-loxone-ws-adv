const request = require("request");

const LockItem = function(widget,platform,homebridge) {

    this.platform = platform;
    this.uuidAction = widget.uuidAction; //to control a switch, use the uuidAction
    this.currentState = undefined; //will be 0 or 1 for Switch

    LockItem.super_.call(this, widget,platform,homebridge);
};

// Register a listener to be notified of changes in this items value
LockItem.prototype.initListener = function() {
    //this.platform.ws.registerListenerForUUID(this.stateUuid, this.callBack.bind(this));
    this.platform.ws.registerListenerForUUID(this.uuidAction, this.callBack.bind(this));
};

LockItem.prototype.callBack = function(value) {
    //function that gets called by the registered ws listener
    if (value == -1) {
        //console.log("Got new state for Timed Switch: On");
    } else if (value == 0) {
        //console.log("Got new state for Timed Switch: Off");
    } else if (value > 0) {
        //console.log("Got new state for Timed Switch: Countdown " + value + "s");
    }
    
    this.currentState = (value !== 0);

    //console.log('set currentState to: ' + this.currentState)

    this.otherService
        .getCharacteristic(this.homebridge.hap.Characteristic.LockCurrentState.SECURED)
        .updateValue(this.currentState);
};

LockItem.prototype.getOtherServices = function() {
    const otherService = new this.homebridge.hap.Service.LockMechanism();

   otherService.setCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED);
    otherService.setCharacteristic(Characteristic.LockTargetState, Characteristic.LockTargetState.SECURED);

    otherService.getCharacteristic(Characteristic.LockTargetState)
        .on('set', this.setItemState.bind(this))
    return otherService;
};

LockItem.prototype.getItemState = function(callback) {
    //returns true if currentState is 1
    callback(undefined, this.currentState);
};

LockItem.prototype.setItemState = function(value, callback) {

    //sending new state to loxone
    //added some logic to prevent a loop when the change because of external event captured by callback



    let command = 0;
    if (value == true) {
        //this.log('perm on ***');
        command = 'Pulse';//-1; // perm on
    } else {
        //this.log('off ***');
        command = 'Off';//0; // off
    }

    //this.log('setItemState value: ' + value);
    //this.log('setItemState command: ' + command);

    this.log(`[timedswitch] iOS - send message to ${this.name}: ${command}`);
    this.platform.ws.sendCommand(this.uuidAction, command);
    callback();

};

module.exports = LockItem;

