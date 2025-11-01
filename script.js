const editor = document.getElementById('editor');
const previewFrame = document.getElementById('previewFrame');
const feedback = document.getElementById('feedback');
const hintArea = document.getElementById('hintArea');
const helpArea = document.getElementById('helpArea');
const progressBar = document.getElementById('progressBar');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const canvas = document.getElementById('celebrationCanvas');
const ctx = canvas.getContext('2d');

let exercises = [];
let currentExercise = null;
let score = 0;
let timer = 0;
let timerInterval = null;
let completed = new Set();

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

loadExercises();
startTimer();

// ✅ Charger la liste des exercices
function loadExercises() {
    exercises = [
        {
            id: 1,
            title: "Créer une page avec un titre principal <h1> 'Mon Portfolio'.",
            rules: [{ selector: 'h1', requiredText: 'Mon Portfolio' }],
            hint: "<h1>Mon Portfolio</h1>",
            solution: "<h1>Mon Portfolio</h1>"
        },
        {
            id: 2,
            title: "Créer un paragraphe centré contenant une courte description.",
            rules: [{ selector: 'p', cssCheck: style => style.textAlign === 'center' }],
            hint: "<p style='text-align:center;'>Un court texte ici</p>",
            solution: "<p style='text-align:center;'>Bienvenue sur ma page</p>"
        },
        {
            id: 3,
            title: "Ajouter une image (<img>) avec un attribut alt défini.",
            rules: [{ selector: 'img', requireAttrs: ['alt'] }],
            hint: "<img src='photo.jpg' alt='Une photo'>",
            solution: "<img src='photo.jpg' alt='Une image descriptive'>"
        }
    ];
    updateProgress();
}

function generateExercise() {
    currentExercise = exercises[Math.floor(Math.random() * exercises.length)];
    document.getElementById('task').innerHTML = `<b>Consigne :</b> ${currentExercise.title}`;
    feedback.style.display = "none";
    hintArea.style.display = "none";
    helpArea.style.display = "none";
    editor.value = "";
    previewFrame.srcdoc = "";
    document.getElementById('solutionBtn').disabled = false;
}

function runCode() {
    previewFrame.srcdoc = DOMPurify.sanitize(editor.value);
}

// ✅ Vérification robuste du code
function checkCode() {
    if (!currentExercise) return alert("Commence par générer un exercice !");

    const code = DOMPurify.sanitize(editor.value);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = code;

    const results = [];
    currentExercise.rules.forEach(rule => {
        const elements = tempDiv.querySelectorAll(rule.selector);
        if (!elements.length) {
            results.push(`❌ Élément manquant : ${rule.selector}`);
            return;
        }
        elements.forEach(el => {
            if (rule.requiredText) {
                const text = el.textContent.trim();
                results.push(text.includes(rule.requiredText) ? `✅ Texte correct` : `❌ Texte attendu : "${rule.requiredText}"`);
            }
            if (rule.requireAttrs) {
                rule.requireAttrs.forEach(attr => results.push(el.hasAttribute(attr) ? `✅ Attribut "${attr}" présent` : `❌ Attribut manquant : ${attr}`));
            }
            if (rule.cssCheck) {
                const style = window.getComputedStyle(el);
                results.push(rule.cssCheck(style) ? `✅ Style correct` : `❌ Style non conforme`);
            }
        });
    });

    const success = results.every(r => r.startsWith("✅"));
    feedback.innerHTML = results.join("<br>");
    feedback.className = success ? "success" : "error";
    feedback.style.display = "block";

    if (success) {
        if (!completed.has(currentExercise.id)) {
            score++;
            completed.add(currentExercise.id);
        }
        updateProgress();
        launchConfetti();
    }
}

function showHint() {
    if (!currentExercise) return alert("Aucun exercice actif !");
    hintArea.innerHTML = "💡 Indice : " + currentExercise.hint;
    hintArea.style.display = "block";
}

function showSolution() {
    if (!currentExercise) return alert("Aucun exercice actif !");
    hintArea.innerHTML = "🧠 Solution :<pre><code>" + currentExercise.solution.replace(/</g,"&lt;").replace(/>/g,"&gt;") + "</code></pre>";
    hintArea.style.display = "block";
}

function toggleHelp() {
    helpArea.style.display = helpArea.style.display === "block" ? "none" : "block";
    if (helpArea.style.display === "block") {
        helpArea.innerHTML = "<strong>📘 Ressources utiles :</strong><br><ul>" +
        "<li><code><h1></h1></code> — Créer un titre</li>" +
        "<li><code><p></p></code> — Créer un paragraphe</li>" +
        "<li><code><img src='' alt=''></code> — Ajouter une image</li></ul>";
    }
}

function toggleTheme() { document.body.classList.toggle("dark"); }

function updateProgress() {
    scoreDisplay.innerText = `Score : ${score}/${exercises.length}`;
    progressBar.style.width = `${(score / exercises.length) * 100}%`;
}

// ⏱ Timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerDisplay.innerText = `⏱ Temps : ${timer}s`;
    }, 1000);
}

// 🎆 Confettis simples
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function launchConfetti() {
    const count = 100;
    const colors = ['#007bff','#28a745','#ffc107','#dc3545'];
    for (let i=0;i<count;i++){
        const x = Math.random()*canvas.width;
        const y = Math.random()*canvas.height/2;
        const size = Math.random()*8+4;
        const color = colors[Math.floor(Math.random()*colors.length)];
        ctx.fillStyle = color;
        ctx.fillRect(x,y,size,size);
    }
    setTimeout(()=>ctx.clearRect(0,0,canvas.width,canvas.height),2000);
}

// 🔒 Détection d'environnement
(function detectEnvChange() {
    const key = btoa(navigator.userAgent + screen.width + screen.height);
    const oldKey = localStorage.getItem('envKey');
    if(oldKey && oldKey !== key) alert("⚠️ Changement d’environnement détecté !");
    else localStorage.setItem('envKey', key);
})();

// 💾 Sauvegarde automatique
editor.addEventListener('input',()=>localStorage.setItem('userCode',editor.value));
window.addEventListener('load',()=>{
    const saved = localStorage.getItem('userCode');
    if(saved) editor.value = saved;
});
