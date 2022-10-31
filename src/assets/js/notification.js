async function requestPermission() {
    await Notification.requestPermission(function(permission) {
        console.log("Permission to display: " + permission);
    });
}

function isPermissionGranted() {
    return Notification.permission === "granted";
}

function displayNotification(pomodoros) {
    const notification = new Notification("Pomodoros done!", {
        body: `Pomodoro ${pomodoros} is done`,
        icon: "assets/pomodoras_logo_transparent.png"
    });

    notification.onclick = function () { 
        window.parent.parent.focus();
    };
}

function playSound() {
    new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1217-relax.mp3").play();
}