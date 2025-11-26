/* ========= VARIABLES GLOBALES ========= */
let video = document.getElementById('video');
let overlay = document.getElementById('overlay');
let ctx = overlay.getContext('2d');
let records = [];
let athletes = [];

/* ========= BOTONES ========= */
const startCamBtn = document.getElementById('startCam');
const stopCamBtn = document.getElementById('stopCam');
const manualCaptureBtn = document.getElementById('manualCapture');
const inputName = document.getElementById('inputName');
const saveNameBtn = document.getElementById('saveName');
const printRecordsBtn = document.getElementById('printRecords');
const shareWhatsappBtn = document.getElementById('shareWhatsapp');
const clearRecordsBtn = document.getElementById('clearRecords');
const recordsTable = document.getElementById('recordsTable').querySelector('tbody');

let stream = null;

/* ========= FUNCIONES DE CÁMARA ========= */
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        alert('No se pudo acceder a la cámara: ' + err.message);
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}

function captureManual() {
    if (!video.srcObject) return alert('La cámara no está activa');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    // Guardar registro de ejemplo
    const record = {
        date: new Date().toLocaleString(),
        athlete: inputName.value || 'Desconocido',
        speed: (Math.random() * 5).toFixed(2), // velocidad simulada
        angle: Math.floor(Math.random() * 180), // ángulo simulado
        leg: 'Derecha', // ejemplo
        cadence: Math.floor(Math.random() * 200), // cadencia simulada
        photo: dataUrl
    };
    records.push(record);
    localStorage.setItem('ohhm_records', JSON.stringify(records));
    renderHistory();
}

/* ========= HISTORIAL ========= */
function renderHistory() {
    recordsTable.innerHTML = '';
    records.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.date}</td>
            <td>${r.athlete}</td>
            <td>${r.speed}</td>
            <td>${r.angle}</td>
            <td>${r.leg}</td>
            <td>${r.cadence}</td>
            <td>${r.photo ? `<img src="${r.photo}" width="50">` : '-'}</td>
        `;
        recordsTable.appendChild(tr);
    });
}

/* ========= BOTONES ========= */
startCamBtn.addEventListener('click', startCamera);
stopCamBtn.addEventListener('click', stopCamera);
manualCaptureBtn.addEventListener('click', captureManual);

saveNameBtn.addEventListener('click', () => {
    const name = inputName.value.trim();
    if (!name) return alert('Nombre vacío');
    athletes = athletes || [];
    if (!athletes.includes(name)) athletes.push(name);
    localStorage.setItem('ohhm_atletas', JSON.stringify(athletes));
    showToast('Nombre guardado');
});

printRecordsBtn.addEventListener('click', () => {
    const w = window.open('', '', 'width=800,height=600');
    w.document.write('<h2>Historial de registros OHHM COACH PRO</h2>');
    w.document.write('<table border="1"><tr><th>Fecha</th><th>Atleta</th><th>Vel</th><th>Ángulo</th><th>Pierna</th><th>Cadencia</th></tr>');
    records.forEach(r => {
        w.document.write(`<tr>
            <td>${r.date}</td>
            <td>${r.athlete}</td>
            <td>${r.speed}</td>
            <td>${r.angle}</td>
            <td>${r.leg}</td>
            <td>${r.cadence}</td>
        </tr>`);
    });
    w.document.write('</table>');
    w.document.close();
    w.print();
});

shareWhatsappBtn.addEventListener('click', () => {
    if (!records.length) return alert('No hay registros');
    const last = records[records.length - 1];
    const text = `OHHM - Registro: ${last.date}\nAtleta: ${last.athlete}\nVel: ${last.speed} m/s\nÁngulo: ${last.angle}°\nPierna: ${last.leg}\nCadencia: ${last.cadence} ppm`;
    const encoded = encodeURIComponent(text);
    window.open('https://api.whatsapp.com/send?text=' + encoded, '_blank');
});

clearRecordsBtn.addEventListener('click', () => {
    if (confirm('Borrar todos los registros?')) {
        records = [];
        localStorage.setItem('ohhm_records', JSON.stringify(records));
        renderHistory();
    }
});

/* ========= UTILIDADES ========= */
function showToast(msg, ms = 1800) {
    const d = document.createElement('div');
    d.textContent = msg;
    d.style.position = 'fixed';
    d.style.right = '18px';
    d.style.bottom = '18px';
    d.style.background = '#0b63b9';
    d.style.color = '#fff';
    d.style.padding = '10px 12px';
    d.style.borderRadius = '8px';
    d.style.zIndex = 9999;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), ms);
}

/* ========= INICIALIZACIÓN ========= */
(function init() {
    if (!localStorage.getItem('ohhm_atletas')) localStorage.setItem('ohhm_atletas', JSON.stringify([]));
    if (!localStorage.getItem('ohhm_records')) localStorage.setItem('ohhm_records', JSON.stringify([]));
    records = JSON.parse(localStorage.getItem('ohhm_records') || '[]');
    athletes = JSON.parse(localStorage.getItem('ohhm_atletas') || '[]');
    renderHistory();

    video.addEventListener('loadedmetadata', () => {
        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;
    });
})();
