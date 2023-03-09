function Stopwatch(callback) {
    var isStopped = false;
    var startDate = null;
    var self = this;

    var onAnimationFrame = function(){
        if(isStopped){
            return;
        }
        callback(Date.now() - startDate);
        requestAnimationFrame(onAnimationFrame);
    };

    this.stop = function() {
        isStopped = true;
    }

    startDate = Date.now();
    requestAnimationFrame(onAnimationFrame);
}
