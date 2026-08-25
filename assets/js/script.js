// Smart City Cleanliness Reporting System - client-side helpers

document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('useLocationBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
        var status = document.getElementById('locStatus');
        if (!navigator.geolocation) {
            status.textContent = 'Geolocation is not supported by your browser.';
            return;
        }
        status.textContent = 'Fetching location...';
        navigator.geolocation.getCurrentPosition(function (pos) {
            document.getElementById('latitude').value = pos.coords.latitude;
            document.getElementById('longitude').value = pos.coords.longitude;
            status.textContent = '✅ Location captured (' + pos.coords.latitude.toFixed(4) + ', ' + pos.coords.longitude.toFixed(4) + ')';
        }, function (err) {
            status.textContent = 'Could not fetch location: ' + err.message;
        });
    });
});
