import EventEmitter from "events";

const emitter = new EventEmitter();
emitter.setMaxListeners(100);

export default emitter;