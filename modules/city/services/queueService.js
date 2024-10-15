const QUEUE_STATUS = require('../constants/queueStatus');

// this service will not work for multiple instances og this program running
// you'll need database integration to support horizontal scaling but for this demo it should do it
class QueueService {

  #queue;
  #cleanupInterval;
  #queueTTL;
  #intervalRef;
  
    constructor(cleanupInterval, queueTTL) {
      this.#queue = {};
      this.#cleanupInterval = cleanupInterval;
      this.#queueTTL = queueTTL;
    }

    push(id) {
      this.#queue[id] = { status: QUEUE_STATUS.PENDING, timestamp: Date.now() };
      // log info
    }
  
    updateCompleted(id, cities) {
        if(!this.#queue[id]) {
            // log error
            throw new Error(`Queue ${id} could not be updated`);
        }
        // log info
        this.#queue[id] = { cities, status: QUEUE_STATUS.SUCCESS, timestamp: Date.now() };
    }

    updateRejected(id, errorMessage = '') {
        if(!this.#queue[id]) {
            // log error
            throw new Error(`Queue ${id} could not be updated`);
        }
        // log info
        this.#queue[id] = { status: QUEUE_STATUS.REJECTED, timestamp: Date.now(), errorMessage };
    }

    getResultDataById(id) {
        return this.#queue[id];
    }

    runCleanup() {
        // log start of job
      const maxAge = new Date(Date.now() - this.#queueTTL);
      this.queue = Object.entries(this.#queue).forEach(([key, item]) => {
        if(item.timestamp < maxAge) {
            delete this.#queue[key];
        }
      });
      // could aggregate all deleted items and add a total log or log for each entry
    }
  
    runAutoCleanup() {
      if(this.#intervalRef) {
        return;
      }
      this.#intervalRef = setInterval(() => this.runCleanup(), this.#cleanupInterval); 
    }

    stopAutoCleanup() {
      if (this.#intervalRef) {
        clearInterval(this.#intervalRef);
        this.#intervalRef = null; 
      }
    }
  }

module.exports = QueueService;