const popupOverlay = document.getElementById('popupOverlay');
const popup = document.getElementById('popup');
const exit = document.getElementById('exit');


function closePopup() {
    popupOverlay.style.display = 'none';
}

function openPopup() {
    popupOverlay.style.display = 'flex';

    popupOverlay.onclick = function (event) {
        if (event.target == popupOverlay) {
            closePopup();
        }
    }

}

exit.addEventListener('click', closePopup);