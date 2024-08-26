const timers = {};


export function addTimer(name, timeToEnable, callback)
{
    timers[name] = {
        id: setTimeout(() => removeTimer(name), timeToEnable - Date.now()),
        callback
    };
}


export function removeTimer(name) 
{
    if (timers[name]) 
	{
        clearTimeout(timers[name].id);
        timers[name].callback();
        delete timers[name];

        return true;
    }
}

export default timers